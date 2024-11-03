
// models/Library.js
const mongoose = require('mongoose');

const LibrarySchema = new mongoose.Schema({
    name: String,
    address: String,
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
});

module.exports = mongoose.model('Library', LibrarySchema);
