const express = require('express');
const router = express.Router();
const Loan = require('../models/loan');
const Book = require('../models/book');
const Member = require('../models/member');

router.get('/', (req, res) => {
    const loanModel = new Loan(req.app.locals.db);
    
    loanModel.updateOverdueStatus();
    
    const filter = req.query.filter || 'active';
    const loans = filter === 'all' ? loanModel.findAll() : loanModel.findAll(filter);
    const stats = loanModel.getStatistics();
    
    res.render('loans/index', { 
        title: 'Book Loans',
        loans,
        filter,
        stats
    });
});

router.get('/checkout', (req, res) => {
    const bookModel = new Book(req.app.locals.db);
    const memberModel = new Member(req.app.locals.db);
    
    const books = bookModel.findAll().filter(b => b.available_copies > 0);
    const members = memberModel.findAll();
    
    res.render('loans/checkout', { 
        title: 'Checkout Book',
        books,
        members
    });
});

router.post('/checkout', (req, res) => {
    const loanModel = new Loan(req.app.locals.db);
    
    try {
        loanModel.create({
            book_id: parseInt(req.body.book_id),
            member_id: parseInt(req.body.member_id),
            due_date: req.body.due_date || loanModel.calculateDueDate(14)
        });
        res.redirect('/loans');
    } catch (error) {
        res.status(400).send(`Error checking out book: ${error.message}`);
    }
});

router.post('/:id/return', (req, res) => {
    const loanModel = new Loan(req.app.locals.db);
    
    try {
        loanModel.returnBook(req.params.id);
        res.redirect('/loans');
    } catch (error) {
        res.status(400).send(`Error returning book: ${error.message}`);
    }
});

module.exports = router;
