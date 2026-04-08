const express = require('express');
const router = express.Router();
const Book = require('../models/book');

router.get('/', (req, res) => {
    const bookModel = new Book(req.app.locals.db);
    const search = req.query.search || '';
    const books = bookModel.findAll(search);
    
    res.render('books/index', { 
        title: 'Book Catalog',
        books,
        search
    });
});

router.get('/new', (req, res) => {
    res.render('books/form', { 
        title: 'Add New Book',
        book: null,
        action: '/books'
    });
});

router.get('/:id/edit', (req, res) => {
    const bookModel = new Book(req.app.locals.db);
    const book = bookModel.findById(req.params.id);
    
    if (!book) {
        return res.status(404).send('Book not found');
    }

    res.render('books/form', { 
        title: 'Edit Book',
        book,
        action: `/books/${book.id}`
    });
});

router.post('/', (req, res) => {
    const bookModel = new Book(req.app.locals.db);
    
    try {
        bookModel.create({
            title: req.body.title,
            author: req.body.author,
            isbn: req.body.isbn,
            genre: req.body.genre,
            published_year: parseInt(req.body.published_year) || null,
            total_copies: parseInt(req.body.total_copies) || 1
        });
        res.redirect('/books');
    } catch (error) {
        res.status(400).send(`Error creating book: ${error.message}`);
    }
});

router.post('/:id', (req, res) => {
    const bookModel = new Book(req.app.locals.db);
    
    try {
        bookModel.update(req.params.id, {
            title: req.body.title,
            author: req.body.author,
            isbn: req.body.isbn,
            genre: req.body.genre,
            published_year: parseInt(req.body.published_year) || null,
            total_copies: parseInt(req.body.total_copies) || 1
        });
        res.redirect('/books');
    } catch (error) {
        res.status(400).send(`Error updating book: ${error.message}`);
    }
});

router.post('/:id/delete', (req, res) => {
    const bookModel = new Book(req.app.locals.db);
    
    try {
        bookModel.delete(req.params.id);
        res.redirect('/books');
    } catch (error) {
        res.status(400).send(`Error deleting book: ${error.message}`);
    }
});

module.exports = router;
