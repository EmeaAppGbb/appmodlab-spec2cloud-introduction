const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Database initialization
const dbPath = path.join(__dirname, '..', 'database', 'library.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbExists = fs.existsSync(dbPath);
const db = new Database(dbPath);

// Initialize database if it doesn't exist
if (!dbExists) {
    console.log('Initializing database...');
    const schema = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8');
    db.exec(schema);
    
    const seed = fs.readFileSync(path.join(__dirname, '..', 'database', 'seed.sql'), 'utf8');
    db.exec(seed);
    console.log('Database initialized with seed data.');
}

// Make database available to routes
app.locals.db = db;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.get('/', (req, res) => {
    const stats = {
        totalBooks: db.prepare('SELECT COUNT(*) as count FROM books').get().count,
        totalMembers: db.prepare('SELECT COUNT(*) as count FROM members WHERE status = ?').get('active').count,
        activeLoans: db.prepare('SELECT COUNT(*) as count FROM loans WHERE status = ?').get('active').count,
        overdueLoans: db.prepare('SELECT COUNT(*) as count FROM loans WHERE status = ?').get('overdue').count
    };
    res.render('layout', { 
        page: 'home', 
        title: 'OpenShelf Library',
        body: `
            <div class="jumbotron">
                <h1 class="display-4">Welcome to OpenShelf Library</h1>
                <p class="lead">Your community library management system</p>
                <hr class="my-4">
                <div class="row mt-4">
                    <div class="col-md-3">
                        <div class="card text-white bg-primary mb-3">
                            <div class="card-body">
                                <h5 class="card-title">${stats.totalBooks}</h5>
                                <p class="card-text">Total Books</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-white bg-success mb-3">
                            <div class="card-body">
                                <h5 class="card-title">${stats.totalMembers}</h5>
                                <p class="card-text">Active Members</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-white bg-info mb-3">
                            <div class="card-body">
                                <h5 class="card-title">${stats.activeLoans}</h5>
                                <p class="card-text">Active Loans</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-white bg-danger mb-3">
                            <div class="card-body">
                                <h5 class="card-title">${stats.overdueLoans}</h5>
                                <p class="card-text">Overdue Loans</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    });
});

app.use('/books', require('./routes/books'));
app.use('/members', require('./routes/members'));
app.use('/loans', require('./routes/loans'));

// Graceful shutdown
process.on('SIGINT', () => {
    db.close();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`OpenShelf Library running at http://localhost:${PORT}`);
});
