// app.js
const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const db = require('./models/db'); 
const User = require('./models/user');
const librarianRoutes = require('./routes/librarian');
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const returnRoutes = require('./routes/return');
const passwordRoutes = require('./routes/password');
require('dotenv').config();

app.get('/test', (req, res) => {
    console.log("Test route accessed");
    res.send("Server is running and responding to requests.");
});

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.use(session({
    secret: 'qwerasdfzxcv', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// Middleware for passing user info to templates
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// Routes
app.use('/', authRoutes);
console.log("Auth routes mounted");

app.use('/', passwordRoutes);

app.use('/search', searchRoutes);

app.use('/return', returnRoutes);

app.get('/', (req, res) => {
    res.render('index');
});

app.use('/librarian', librarianRoutes);

// User Registration
app.get('/register', (req, res) => {
    res.render('register', { message: null });
});

app.post('/register', async (req, res) => {
    console.log("Register route accessed"); // Log to verify route is accessed
    const { username, password } = req.body;

    // Convert isLibrarian to 1 if checked, 0 if not
    const librarianStatus = req.body.isLibrarian ? 1 : 0;
    console.log("Converted librarian status:", librarianStatus); // Log to verify

    try {
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.render('register', { message: 'Username already exists.' });
        }

        await User.create(username, password, librarianStatus);
        res.redirect('/login');
    } catch (err) {
        console.error("Error during user registration:", err);
        res.render('register', { message: 'An error occurred. Please try again.' });
    }
});

// User Login
app.get('/login', (req, res) => {
    res.render('login', { message: null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findByUsername(username);
        if (user && user.Password === password) { // Plaintext password comparison
            req.session.user = {
                id: user.UserID,
                username: user.Username,
                isLibrarian: user.IsLibrarian
            };
            res.redirect('/');
        } else {
            res.render('login', { message: 'Invalid username or password.' });
        }
    } catch (err) {
        console.error(err);
        res.render('login', { message: 'An error occurred. Please try again.' });
    }
});

// User Logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.redirect('/');
        }
        res.redirect('/');
    });
});

// Catalog Page
app.get('/catalog', async (req, res) => {
    const query = `
        SELECT Books.*, Libraries.Name AS LibraryName
        FROM Books
        INNER JOIN Libraries ON Books.LibraryID = Libraries.LibraryID
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err);
            res.render('catalog', { books: [] });
        } else {
            res.render('catalog', { books: rows });
        }
    });
});

// Reserve a Book
app.post('/reserve', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const { bookId } = req.body;

    // Begin Transaction
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // Check if book is available
        const checkQuery = `SELECT * FROM Books WHERE BookID = ?`;
        db.get(checkQuery, [bookId], (err, book) => {
            if (err) {
                console.error(err);
                db.run("ROLLBACK");
                return res.redirect('/catalog');
            }

            if (!book || !book.IsAvailable) {
                db.run("ROLLBACK");
                return res.redirect('/catalog');
            }

            // Insert reservation
            const insertReservation = `INSERT INTO Reservations (UserID, BookID) VALUES (?, ?)`;
            db.run(insertReservation, [req.session.user.id, bookId], function (err) {
                if (err) {
                    console.error(err);
                    db.run("ROLLBACK");
                    return res.redirect('/catalog');
                }

                // Update book availability
                const updateBook = `UPDATE Books SET IsAvailable = 0 WHERE BookID = ?`;
                db.run(updateBook, [bookId], function (err) {
                    if (err) {
                        console.error(err);
                        db.run("ROLLBACK");
                        return res.redirect('/catalog');
                    }

                    // Commit Transaction
                    db.run("COMMIT");
                    res.redirect('/catalog');
                });
            });
        });
    });
});

// Catalog Route with Promise-based Implementation (Optional)
app.get('/catalog-promise', async (req, res) => {
    try {
        const books = await new Promise((resolve, reject) => {
            const query = `
                SELECT Books.*, Libraries.Name AS LibraryName
                FROM Books
                INNER JOIN Libraries ON Books.LibraryID = Libraries.LibraryID
            `;
            db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
        res.render('catalog', { books });
    } catch (err) {
        console.error(err);
        res.render('catalog', { books: [] });
    }
});

// GET /libraries - Display all libraries
app.get('/libraries', (req, res) => {
    const query = `SELECT * FROM Libraries`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Error fetching libraries:", err.message);
            res.render('libraries', { libraries: [], message: 'An error occurred while fetching libraries.' });
        } else {
            res.render('libraries', { libraries: rows, message: null });
        }
    });
});

// GET /return - Display the return form
app.get('/return', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const userId = req.session.user.id;
    const query = `
        SELECT Reservations.ReservationID, Books.BookID, Books.Title, Books.Author
        FROM Reservations
        INNER JOIN Books ON Reservations.BookID = Books.BookID
        WHERE Reservations.UserID = ? AND Books.IsAvailable = 0
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error("Error fetching reservations:", err.message);
            res.render('return', { reservations: [], message: 'An error occurred while fetching your reservations.' });
        } else {
            res.render('return', { reservations: rows, message: null });
        }
    });
});

// POST /return - Handle the book return
app.post('/return', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { reservationId } = req.body;
    const userId = req.session.user.id;

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // Get the reservation details
        const getReservationQuery = `
            SELECT * FROM Reservations
            WHERE ReservationID = ? AND UserID = ?
        `;
        db.get(getReservationQuery, [reservationId, userId], (err, reservation) => {
            if (err) {
                console.error("Error fetching reservation:", err.message);
                db.run("ROLLBACK");
                return res.render('return', { reservations: [], message: 'An error occurred.' });
            }

            if (!reservation) {
                console.error("Reservation not found or does not belong to the user.");
                db.run("ROLLBACK");
                return res.render('return', { reservations: [], message: 'Invalid reservation.' });
            }

            const bookId = reservation.BookID;

            // Update the Books table to set IsAvailable to 1
            const updateBookQuery = `
                UPDATE Books
                SET IsAvailable = 1
                WHERE BookID = ?
            `;
            db.run(updateBookQuery, [bookId], function(err) {
                if (err) {
                    console.error("Error updating book availability:", err.message);
                    db.run("ROLLBACK");
                    return res.render('return', { reservations: [], message: 'An error occurred.' });
                }

                // Insert into Returns table
                const insertReturnQuery = `
                    INSERT INTO Returns (UserID, BookID) VALUES (?, ?)
                `;
                db.run(insertReturnQuery, [userId, bookId], function(err) {
                    if (err) {
                        console.error("Error inserting into Returns table:", err.message);
                        db.run("ROLLBACK");
                        return res.render('return', { reservations: [], message: 'An error occurred.' });
                    }

                    // Delete the reservation
                    const deleteReservationQuery = `
                        DELETE FROM Reservations
                        WHERE ReservationID = ?
                    `;
                    db.run(deleteReservationQuery, [reservationId], function(err) {
                        if (err) {
                            console.error("Error deleting reservation:", err.message);
                            db.run("ROLLBACK");
                            return res.render('return', { reservations: [], message: 'An error occurred.' });
                        }

                        // Commit the transaction
                        db.run("COMMIT", (err) => {
                            if (err) {
                                console.error("Error committing transaction:", err.message);
                                return res.render('return', { reservations: [], message: 'An error occurred.' });
                            }

                            res.render('return', { reservations: [], message: 'Book returned successfully.' });
                        });
                    });
                });
            });
        });
    });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
