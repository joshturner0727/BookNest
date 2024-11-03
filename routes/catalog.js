
// routes/catalog.js
const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../models/db');

// View Catalog
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT Books.*, Libraries.Name AS LibraryName
                FROM Books
                INNER JOIN Libraries ON Books.LibraryID = Libraries.LibraryID
            `);
        res.render('catalog', { books: result.recordset });
    } catch (err) {
        console.error(err);
        res.render('catalog', { books: [] });
    }
});

// Reserve a Book
router.post('/reserve', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const { bookId } = req.body;
    try {
        const pool = await poolPromise;
        // Check if book is available
        const bookResult = await pool.request()
            .input('BookID', sql.Int, bookId)
            .query('SELECT * FROM Books WHERE BookID = @BookID');
        const book = bookResult.recordset[0];
        if (!book || !book.IsAvailable) {
            return res.redirect('/catalog');
        }
        // Reserve the book
        await pool.request()
            .input('UserID', sql.Int, req.session.user.id)
            .input('BookID', sql.Int, bookId)
            .query('INSERT INTO Reservations (UserID, BookID) VALUES (@UserID, @BookID)');
        // Update book availability
        await pool.request()
            .input('BookID', sql.Int, bookId)
            .query('UPDATE Books SET IsAvailable = 0 WHERE BookID = @BookID');
        res.redirect('/catalog');
    } catch (err) {
        console.error(err);
        res.redirect('/catalog');
    }
});

module.exports = router;
