const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../models/db'); // Import your SQLite database connection
const User = require('../models/user');

// Librarian Login
router.get('/login', (req, res) => {
    res.render('librarian', { message: null });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findByUsername(username);
        if (user && user.IsLibrarian && await bcrypt.compare(password, user.Password)) {
            req.session.user = {
                id: user.UserID,
                username: user.Username,
                isLibrarian: user.IsLibrarian
            };
            res.redirect('/librarian/dashboard');
        } else {
            res.render('librarian', { message: 'Invalid credentials.' });
        }
    } catch (err) {
        console.error(err);
        res.render('librarian', { message: 'An error occurred. Please try again.' });
    }
});

// Librarian Dashboard
router.get('/dashboard', (req, res) => {
    if (!req.session.user || !req.session.user.isLibrarian) {
        return res.redirect('/librarian/login');
    }
    try {
        // Query books with library names
        db.all(`
            SELECT Books.BookID, Books.Title, Books.Author, Libraries.Name AS LibraryName
            FROM Books
            INNER JOIN Libraries ON Books.LibraryID = Libraries.LibraryID
        `, [], (err, books) => {
            if (err) {
                console.error("Error retrieving books:", err);
                return res.render('librarian_dashboard', { books: [], libraries: [], message: 'An error occurred.' });
            }

            // Query libraries for the dropdown
            db.all(`SELECT * FROM Libraries`, [], (err, libraries) => {
                if (err) {
                    console.error("Error retrieving libraries:", err);
                    return res.render('librarian_dashboard', { books: [], libraries: [], message: 'An error occurred.' });
                }

                // Render the dashboard with books and libraries
                res.render('librarian_dashboard', {
                    books: books,
                    libraries: libraries,
                    message: null
                });
            });
        });
    } catch (err) {
        console.error(err);
        res.render('librarian_dashboard', { books: [], libraries: [], message: 'An error occurred.' });
    }
});

// Add/Update/Delete Books
router.post('/update', (req, res) => {
    if (!req.session.user || !req.session.user.isLibrarian) {
        return res.redirect('/librarian/login');
    }
    const { action, bookId, title, author, libraryId } = req.body;

    try {
        if (action === 'add') {
            db.run(
                `INSERT INTO Books (Title, Author, LibraryID) VALUES (?, ?, ?)`,
                [title, author, libraryId],
                function (err) {
                    if (err) {
                        console.error("Error adding book:", err);
                        return res.render('librarian_dashboard', { books: [], message: 'An error occurred.' });
                    }
                    res.redirect('/librarian/dashboard');
                }
            );
        } else if (action === 'update') {
            db.run(
                `UPDATE Books SET Title = ?, Author = ?, LibraryID = ? WHERE BookID = ?`,
                [title, author, libraryId, bookId],
                function (err) {
                    if (err) {
                        console.error("Error updating book:", err);
                        return res.render('librarian_dashboard', { books: [], message: 'An error occurred.' });
                    }
                    res.redirect('/librarian/dashboard');
                }
            );
        } else if (action === 'delete') {
            db.run(
                `DELETE FROM Books WHERE BookID = ?`,
                [bookId],
                function (err) {
                    if (err) {
                        console.error("Error deleting book:", err);
                        return res.render('librarian_dashboard', { books: [], message: 'An error occurred.' });
                    }
                    res.redirect('/librarian/dashboard');
                }
            );
        }
    } catch (err) {
        console.error(err);
        res.render('librarian_dashboard', { books: [], message: 'An error occurred.' });
    }
});

module.exports = router;
