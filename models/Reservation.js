
// models/Reservation.js
const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    reservationDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', ReservationSchema);
