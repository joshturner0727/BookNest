// routes/password.js
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

// Display the password update form
router.get('/update-password', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('update_password', { message: null });
});

// Handle the password update
router.post('/update-password', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { currentPassword, newPassword } = req.body;
    const username = req.session.user.username;

    // Validate new password complexity
    if (!validatePassword(newPassword)) {
        return res.render('update_password', {
            message: 'Password must be at least 8 characters long, and include uppercase, lowercase, number, and special character.'
        });
    }

    try {
        // Retrieve the user's current hashed password by username
        const user = await User.findByUsername(username);
        if (!user) {
            return res.render('update_password', { message: 'User not found.' });
        }

        // Verify the current password
        const isMatch = await bcrypt.compare(currentPassword, user.Password);
        if (!isMatch) {
            return res.render('update_password', { message: 'Incorrect current password.' });
        }

        // Hash the new password and update it in the database
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await User.updatePassword(user.UserID, hashedNewPassword);

        res.render('update_password', { message: 'Password updated successfully!' });
    } catch (err) {
        console.error("Error updating password:", err);
        res.render('update_password', { message: 'An error occurred. Please try again.' });
    }
});

module.exports = router;