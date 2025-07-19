const express = require('express');
const router = express.Router();
const { createBooking, getBookings, updateBooking, deleteBooking, cancelBooking } = require('../controllers/booking.js');

router.get('/', getBookings);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);
router.put('/:id/cancel', cancelBooking);
module.exports = router;