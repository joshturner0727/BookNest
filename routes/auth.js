// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

// Function to validate password complexity
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar
    );
}

// Register
router.get('/register', (req, res) => {
    res.render('register', { message: null });
});

router.post('/register', async (req, res) => {
    const { username, password, isLibrarian } = req.body;
    const librarianStatus = isLibrarian ? 1 : 0; // Convert to 1 if checked, else 0
    console.log("Converted librarian status:", librarianStatus); // Log to verify

    // Validate password complexity
    if (!validatePassword(password)) {
        return res.render('register', {
            message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'
        });
    }

    try {
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.render('register', { message: 'Username already exists.' });
        }

        // Hash the password and create the user
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create(username, hashedPassword, librarianStatus);
        res.redirect('/login');
    } catch (err) {
        console.error("Error during user registration:", err);
        res.render('register', { message: 'An error occurred. Please try again.' });
    }
});

// Login
router.get('/login', (req, res) => {
    res.render('login', { message: null });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find user by username
        const user = await User.findByUsername(username);
        console.log("Retrieved user:", user); // Log to check user data

        // If user exists, compare the provided password with the stored hashed password
        if (user && await bcrypt.compare(password, user.Password)) {
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
        console.error("Login error:", err);
        res.render('login', { message: 'An error occurred. Please try again.' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;