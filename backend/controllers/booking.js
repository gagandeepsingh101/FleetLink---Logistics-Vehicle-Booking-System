const Booking = require('../models/Booking.js');
const Vehicle = require('../models/Vehicle.js');
const ApiError = require('../utils/error.js');
const { calculateRideDuration } = require('../utils/rideDurationCalculator');
async function createBooking(req, res, next) {
  try {
    const { vehicleId, fromPincode, toPincode, startTime, customerId } = req.body;

    if (!vehicleId || !fromPincode || !toPincode || !startTime || !customerId) {
      throw new ApiError(400, 'Missing required fields');
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }

    const startDate = new Date(startTime);
    if (isNaN(startDate)) {
      throw new ApiError(400, 'Invalid startTime format');
    }

    const duration = await calculateRideDuration(fromPincode, toPincode);
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);

    console.log('Attempting booking for vehicle:', { vehicleId, fromPincode, toPincode, startTime, duration });

    const conflictingBookings = await Booking.find({
      vehicleId,
      status: 'active',
      $or: [
        { startTime: { $lte: endDate }, endTime: { $gte: startDate } },
      ],
    });

    if (conflictingBookings.length > 0) {
      console.log('Conflicting bookings found:', conflictingBookings);
      throw new ApiError(409, 'Vehicle is already booked for this time slot');
    }

    const booking = new Booking({
      vehicleId,
      fromPincode,
      toPincode,
      startTime: startDate,
      endTime: endDate,
      customerId,
    });

    const savedBooking = await booking.save();
    console.log('Booking created:', savedBooking);

    res.status(201).json(savedBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    next(new ApiError(error.statusCode || 500, error.message || 'Failed to create booking'));
  }
}

async function getBookings(req, res, next) {
  try {
    const bookings = await Booking.find().populate('vehicleId', 'name capacityKg tyres');
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    next(new ApiError(500, 'Failed to fetch bookings'));
  }
}

async function updateBooking(req, res, next) {
  try {
    const { id } = req.params;
    const { fromPincode, toPincode, startTime, customerId } = req.body;

    const booking = await Booking.findById(id);
    if (!booking || booking.status === 'cancelled') {
      throw new ApiError(404, 'Booking not found or already cancelled');
    }

    const currentTime = new Date('2025-07-19T12:35:00+05:30');
    if (new Date(booking.startTime) <= currentTime) {
      throw new ApiError(400, 'Cannot edit past or current bookings');
    }

    const startDate = new Date(startTime);
    if (isNaN(startDate)) {
      throw new ApiError(400, 'Invalid startTime format');
    }

    const duration = await calculateRideDuration(fromPincode, toPincode);
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { fromPincode, toPincode, startTime: startDate, endTime: endDate, customerId },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    next(new ApiError(error.statusCode || 500, error.message || 'Failed to update booking'));
  }
}

async function deleteBooking(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking || booking.status === 'cancelled') {
      throw new ApiError(404, 'Booking not found or already cancelled');
    }

    const currentTime = new Date('2025-07-19T12:35:00+05:30');
    if (new Date(booking.startTime) <= currentTime) {
      throw new ApiError(400, 'Cannot delete past or current bookings');
    }

    await Booking.findByIdAndDelete(id);
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    next(new ApiError(error.statusCode || 500, error.message || 'Failed to delete booking'));
  }
}

async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking || booking.status === 'cancelled') {
      throw new ApiError(404, 'Booking not found or already cancelled');
    }

    const currentTime = new Date('2025-07-19T12:35:00+05:30');
    if (new Date(booking.startTime) <= currentTime) {
      throw new ApiError(400, 'Cannot cancel past or current bookings');
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    next(new ApiError(error.statusCode || 500, error.message || 'Failed to cancel booking'));
  }
}

module.exports = {
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking,
  cancelBooking,
};