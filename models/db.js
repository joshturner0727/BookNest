// models/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Failed to connect to SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    // Use serialize to ensure sequential execution of statements
    db.serialize(() => {
        // Create the Users Table
        db.run(`
            CREATE TABLE IF NOT EXISTS Users (
                UserID INTEGER PRIMARY KEY AUTOINCREMENT,
                Username TEXT NOT NULL UNIQUE,
                Password TEXT NOT NULL,
                IsLibrarian INTEGER NOT NULL DEFAULT 0
            );
        `, (err) => {
            if (err) console.error("Error creating Users table:", err.message);
        });

        // Create the Libraries Table
        db.run(`
            CREATE TABLE IF NOT EXISTS Libraries (
                LibraryID INTEGER PRIMARY KEY AUTOINCREMENT,
                Name TEXT NOT NULL,
                Address TEXT NOT NULL
            );
        `, (err) => {
            if (err) console.error("Error creating Libraries table:", err.message);
        });

        // Create the Books Table
        db.run(`
            CREATE TABLE IF NOT EXISTS Books (
                BookID INTEGER PRIMARY KEY AUTOINCREMENT,
                Title TEXT NOT NULL,
                Author TEXT NOT NULL,
                LibraryID INTEGER NOT NULL,
                IsAvailable INTEGER NOT NULL DEFAULT 1,
                FOREIGN KEY (LibraryID) REFERENCES Libraries(LibraryID)
            );
        `, (err) => {
            if (err) console.error("Error creating Books table:", err.message);
        });

        // Create the Reservations Table
        db.run(`
            CREATE TABLE IF NOT EXISTS Reservations (
                ReservationID INTEGER PRIMARY KEY AUTOINCREMENT,
                UserID INTEGER NOT NULL,
                BookID INTEGER NOT NULL,
                ReservationDate TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (UserID) REFERENCES Users(UserID),
                FOREIGN KEY (BookID) REFERENCES Books(BookID)
            );
        `, (err) => {
            if (err) console.error("Error creating Reservations table:", err.message);
        });

        // Create the Returns Table
        db.run(`
            CREATE TABLE IF NOT EXISTS Returns (
                ReturnID INTEGER PRIMARY KEY AUTOINCREMENT,
                UserID INTEGER NOT NULL,
                BookID INTEGER NOT NULL,
                ReturnDate TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (UserID) REFERENCES Users(UserID),
                FOREIGN KEY (BookID) REFERENCES Books(BookID)
            );
        `, (err) => {
            if (err) console.error("Error creating Returns table:", err.message);
        });

        console.log('Database initialized with tables and sample data.');
    });
}

module.exports = db;
