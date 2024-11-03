// models/user.js
const db = require('./db'); // SQLite connection
const bcrypt = require('bcrypt');

class User {
    static async create(username, hashedPassword, isLibrarian = 0) {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO Users (Username, Password, IsLibrarian) VALUES (?, ?, ?)`;
            db.run(query, [username, hashedPassword, isLibrarian], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ UserID: this.lastID });
                }
            });
        });
    }

    // Method to find user by username
    static async findByUsername(username) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM Users WHERE Username = ?`;
            db.get(query, [username], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }


    // Update the user's password
    static async updatePassword(userID, newPassword) {
        return new Promise((resolve, reject) => {
            const query = `UPDATE Users SET Password = ? WHERE UserID = ?`;
            db.run(query, [newPassword, userID], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }
}

module.exports = User;
