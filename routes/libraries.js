
// routes/libraries.js
const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../models/db');

// List Libraries
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM Libraries');
        res.render('libraries', { libraries: result.recordset });
    } catch (err) {
        console.error(err);
        res.render('libraries', { libraries: [] });
    }
});

module.exports = router;
