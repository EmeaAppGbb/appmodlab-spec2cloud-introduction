class Book {
    constructor(db) {
        this.db = db;
    }

    findAll(search = '') {
        if (search) {
            return this.db.prepare(`
                SELECT * FROM books 
                WHERE title LIKE ? OR author LIKE ? OR genre LIKE ?
                ORDER BY title
            `).all(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        return this.db.prepare('SELECT * FROM books ORDER BY title').all();
    }

    findById(id) {
        return this.db.prepare('SELECT * FROM books WHERE id = ?').get(id);
    }

    create(book) {
        const stmt = this.db.prepare(`
            INSERT INTO books (title, author, isbn, genre, published_year, available_copies, total_copies)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            book.title,
            book.author,
            book.isbn,
            book.genre,
            book.published_year,
            book.total_copies,
            book.total_copies
        );
        return result.lastInsertRowid;
    }

    update(id, book) {
        const current = this.findById(id);
        const copyDiff = book.total_copies - current.total_copies;
        const newAvailable = current.available_copies + copyDiff;

        const stmt = this.db.prepare(`
            UPDATE books 
            SET title = ?, author = ?, isbn = ?, genre = ?, published_year = ?, 
                total_copies = ?, available_copies = ?
            WHERE id = ?
        `);
        return stmt.run(
            book.title,
            book.author,
            book.isbn,
            book.genre,
            book.published_year,
            book.total_copies,
            newAvailable >= 0 ? newAvailable : 0,
            id
        );
    }

    delete(id) {
        const hasLoans = this.db.prepare('SELECT COUNT(*) as count FROM loans WHERE book_id = ? AND status = ?')
            .get(id, 'active').count;
        
        if (hasLoans > 0) {
            throw new Error('Cannot delete book with active loans');
        }

        return this.db.prepare('DELETE FROM books WHERE id = ?').run(id);
    }

    decrementAvailable(id) {
        return this.db.prepare('UPDATE books SET available_copies = available_copies - 1 WHERE id = ?').run(id);
    }

    incrementAvailable(id) {
        return this.db.prepare('UPDATE books SET available_copies = available_copies + 1 WHERE id = ?').run(id);
    }
}

module.exports = Book;
