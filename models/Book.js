
// models/Book.js
const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: String,
    author: String,
    library: { type: mongoose.Schema.Types.ObjectId, ref: 'Library' },
    isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Book', BookSchema);
