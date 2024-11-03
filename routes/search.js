// routes/search.js
const express = require('express');
const router = express.Router();
const db = require('../models/db'); 

// Search Route
router.get('/', (req, res) => {
    const searchQuery = req.query.query;
    const searchTerm = `%${searchQuery}%`;

    const query = `
        SELECT Books.BookID, Books.Title, Books.Author, Libraries.Name AS LibraryName
        FROM Books
        INNER JOIN Libraries ON Books.LibraryID = Libraries.LibraryID
        WHERE Books.Title LIKE ? OR Books.Author LIKE ?
    `;
    db.all(query, [searchTerm, searchTerm], (err, rows) => {
        if (err) {
            console.error("Error during search:", err);
            res.render('search_results', { books: [], message: 'An error occurred. Please try again.' });
        } else {
            res.render('search_results', { books: rows, message: rows.length > 0 ? null : 'No results found.' });
        }
    });
});

module.exports = router;
