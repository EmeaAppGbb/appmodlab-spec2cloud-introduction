class Loan {
    constructor(db) {
        this.db = db;
    }

    findAll(status = null) {
        if (status) {
            return this.db.prepare(`
                SELECT l.*, b.title, b.author, m.name as member_name, m.email
                FROM loans l
                JOIN books b ON l.book_id = b.id
                JOIN members m ON l.member_id = m.id
                WHERE l.status = ?
                ORDER BY l.loan_date DESC
            `).all(status);
        }
        return this.db.prepare(`
            SELECT l.*, b.title, b.author, m.name as member_name, m.email
            FROM loans l
            JOIN books b ON l.book_id = b.id
            JOIN members m ON l.member_id = m.id
            ORDER BY l.loan_date DESC
        `).all();
    }

    findById(id) {
        return this.db.prepare(`
            SELECT l.*, b.title, b.author, m.name as member_name, m.email
            FROM loans l
            JOIN books b ON l.book_id = b.id
            JOIN members m ON l.member_id = m.id
            WHERE l.id = ?
        `).get(id);
    }

    findActiveByMember(memberId) {
        return this.db.prepare(`
            SELECT l.*, b.title, b.author
            FROM loans l
            JOIN books b ON l.book_id = b.id
            WHERE l.member_id = ? AND l.status = ?
            ORDER BY l.due_date
        `).all(memberId, 'active');
    }

    create(loan) {
        const book = this.db.prepare('SELECT * FROM books WHERE id = ?').get(loan.book_id);
        
        if (!book || book.available_copies <= 0) {
            throw new Error('Book not available for checkout');
        }

        const dueDate = loan.due_date || this.calculateDueDate(14);

        const stmt = this.db.prepare(`
            INSERT INTO loans (book_id, member_id, loan_date, due_date, status)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            loan.book_id,
            loan.member_id,
            loan.loan_date || new Date().toISOString().split('T')[0],
            dueDate,
            'active'
        );

        this.db.prepare('UPDATE books SET available_copies = available_copies - 1 WHERE id = ?').run(loan.book_id);

        return result.lastInsertRowid;
    }

    returnBook(id) {
        const loan = this.findById(id);
        
        if (!loan) {
            throw new Error('Loan not found');
        }

        if (loan.status === 'returned') {
            throw new Error('Book already returned');
        }

        const returnDate = new Date().toISOString().split('T')[0];

        this.db.prepare(`
            UPDATE loans 
            SET return_date = ?, status = ?
            WHERE id = ?
        `).run(returnDate, 'returned', id);

        this.db.prepare('UPDATE books SET available_copies = available_copies + 1 WHERE id = ?').run(loan.book_id);

        return true;
    }

    updateOverdueStatus() {
        const today = new Date().toISOString().split('T')[0];
        
        return this.db.prepare(`
            UPDATE loans 
            SET status = 'overdue'
            WHERE status = 'active' AND due_date < ? AND return_date IS NULL
        `).run(today);
    }

    calculateDueDate(days = 14) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }

    getStatistics() {
        return {
            active: this.db.prepare('SELECT COUNT(*) as count FROM loans WHERE status = ?').get('active').count,
            overdue: this.db.prepare('SELECT COUNT(*) as count FROM loans WHERE status = ?').get('overdue').count,
            returned: this.db.prepare('SELECT COUNT(*) as count FROM loans WHERE status = ?').get('returned').count
        };
    }
}

module.exports = Loan;
