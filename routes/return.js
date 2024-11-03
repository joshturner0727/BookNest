// routes/return.js
const express = require('express');
const router = express.Router();
const db = require('../models/db'); 

// Return a Book
router.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('return', { message: null });
});

router.post('/', async (req, res) => {
    const { username } = req.body;

    try {
        // Get the user ID from the username
        const getUserQuery = `SELECT UserID FROM Users WHERE Username = ?`;
        db.get(getUserQuery, [username], (err, user) => {
            if (err) {
                console.error("Error fetching user:", err);
                return res.render('return', { message: 'An error occurred while retrieving user data.' });
            }

            if (!user) {
                return res.render('return', { message: 'User not found.' });
            }

            const userId = user.UserID;

            // Check for an active reservation by this user
            const getReservationQuery = `
                SELECT Reservations.ReservationID, Books.BookID, Books.Title
                FROM Reservations
                INNER JOIN Books ON Reservations.BookID = Books.BookID
                WHERE Reservations.UserID = ? AND Books.IsAvailable = 0
            `;
            db.get(getReservationQuery, [userId], (err, reservation) => {
                if (err) {
                    console.error("Error fetching reservation:", err);
                    return res.render('return', { message: 'An error occurred while retrieving reservation data.' });
                }

                if (!reservation) {
                    return res.render('return', { message: 'No active reservations found for this user.' });
                }

                // Begin transaction to delete the reservation and update book availability
                db.serialize(() => {
                    db.run("BEGIN TRANSACTION");

                    // Delete the reservation
                    const deleteReservationQuery = `DELETE FROM Reservations WHERE ReservationID = ?`;
                    db.run(deleteReservationQuery, [reservation.ReservationID], (err) => {
                        if (err) {
                            console.error("Error deleting reservation:", err);
                            db.run("ROLLBACK");
                            return res.render('return', { message: 'An error occurred while deleting reservation.' });
                        }

                        // Update book availability
                        const updateBookQuery = `UPDATE Books SET IsAvailable = 1 WHERE BookID = ?`;
                        db.run(updateBookQuery, [reservation.BookID], (err) => {
                            if (err) {
                                console.error("Error updating book availability:", err);
                                db.run("ROLLBACK");
                                return res.render('return', { message: 'An error occurred while updating book availability.' });
                            }

                            // Commit the transaction and confirm the return
                            db.run("COMMIT", (err) => {
                                if (err) {
                                    console.error("Error committing transaction:", err);
                                    return res.render('return', { message: 'An error occurred.' });
                                }
                                res.render('return', { message: `Book '${reservation.Title}' has been successfully returned.` });
                            });
                        });
                    });
                });
            });
        });
    } catch (err) {
        console.error(err);
        res.render('return', { message: 'An error occurred. Please try again.' });
    }
});

module.exports = router;
