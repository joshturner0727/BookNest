
// models/Return.js
const mongoose = require('mongoose');

const ReturnSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    returnDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Return', ReturnSchema);
