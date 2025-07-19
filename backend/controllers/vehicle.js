const Vehicle = require('../models/Vehicle.js');
const Booking = require('../models/Booking.js');
const { calculateRideDuration } = require('../utils/rideDurationCalculator.js');
const ApiError = require('../utils/error.js');

async function createVehicle(req, res, next) {
  try {
    const vehicle = new Vehicle(req.body);
    const savedVehicle = await vehicle.save();
    res.status(201).json(savedVehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    next(error);
  }
}

async function getAvailableVehicles(req, res, next) {
  try {
    const { capacityRequired, fromPincode, toPincode, startTime } = req.query;

    // Validate query parameters
    if (!capacityRequired || !fromPincode || !toPincode || !startTime) {
      throw new ApiError(400, 'Missing required query parameters');
    }

    const startDate = new Date(startTime);
    if (isNaN(startDate)) {
      throw new ApiError(400, 'Invalid startTime format');
    }

    const capacity = parseInt(capacityRequired);
    if (isNaN(capacity) || capacity <= 0) {
      throw new ApiError(400, 'Capacity must be a positive number');
    }

    // Calculate duration and end time
    const duration = calculateRideDuration(fromPincode, toPincode);
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);

    // Log query for debugging
    console.log('Searching vehicles with params:', { capacity, fromPincode, toPincode, startTime });

    // Find vehicles with sufficient capacity
    const vehicles = await Vehicle.find({ capacityKg: { $gte: capacity } });

    // Log found vehicles
    console.log('Found vehicles:', vehicles);

    // Filter out vehicles with conflicting bookings
    const availableVehicles = [];
    for (const vehicle of vehicles) {
      const conflictingBookings = await Booking.find({
        vehicleId: vehicle._id,
        $or: [
          { startTime: { $lte: endDate }, endTime: { $gte: startDate } },
        ],
      });

      if (conflictingBookings.length === 0) {
        availableVehicles.push(vehicle);
      }
    }

    // Log available vehicles
    console.log('Available vehicles:', availableVehicles);

    res.status(200).json({
      vehicles: availableVehicles,
      estimatedRideDurationHours: duration,
    });
  } catch (error) {
    console.error('Error fetching available vehicles:', error);
    next(new ApiError(error.statusCode || 500, error.message || 'Failed to fetch available vehicles'));
  }
}


module.exports = {
  createVehicle,
  getAvailableVehicles,
};