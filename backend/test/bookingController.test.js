const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { calculateRideDuration } = require('../utils/rideDurationCalculator');
jest.mock('../models/Booking');
jest.mock('../models/Vehicle');
jest.mock('../utils/rideDurationCalculator');

describe('BookingController', () => {
  afterEach(() => jest.clearAllMocks());

  const mockVehicle = { _id: '1', name: 'Truck', capacityKg: 1000, tyres: 4 };
  const mockBooking = {
    _id: '2',
    vehicleId: '1',
    fromPincode: '123456',
    toPincode: '654321',
    startTime: new Date('2025-07-20T10:00:00+05:30'),
    endTime: new Date('2025-07-20T12:00:00+05:30'),
    customerId: 'cust123',
    status: 'active',
  };

  describe('createBooking', () => {
    test('should return 201 with booking data', async () => {
      Vehicle.findById.mockResolvedValue(mockVehicle);
      Booking.find.mockResolvedValue([]);
      Booking.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(mockBooking) }));
      calculateRideDuration.mockResolvedValue(2);

      const req = {
        body: {
          vehicleId: '1',
          fromPincode: '123456',
          toPincode: '654321',
          startTime: '2025-07-20T10:00:00+05:30',
          customerId: 'cust123',
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const { createBooking } = require('../controllers/booking.js');
      await createBooking(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockBooking);
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle missing fields with 400', async () => {
      const req = { body: { vehicleId: '1', fromPincode: '123456' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const { createBooking } = require('../controllers/booking.js');
      await createBooking(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toBe('Missing required fields');
    });

    test('should handle conflicting bookings with 409', async () => {
      Vehicle.findById.mockResolvedValue(mockVehicle);
      Booking.find.mockResolvedValue([mockBooking]);
      calculateRideDuration.mockResolvedValue(2);

      const req = {
        body: {
          vehicleId: '1',
          fromPincode: '123456',
          toPincode: '654321',
          startTime: '2025-07-20T11:00:00+05:30',
          customerId: 'cust123',
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const { createBooking } = require('../controllers/booking.js');
      await createBooking(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].statusCode).toBe(409);
      expect(next.mock.calls[0][0].message).toBe('Vehicle is already booked for this time slot');
    });
  });

  describe('getBookings', () => {
    test('should return 200 with all bookings', async () => {
      Booking.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockBooking]),
      });

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const { getBookings } = require('../controllers/booking.js');
      await getBookings(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockBooking]);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('updateBooking', () => {
    test('should return 200 with updated booking', async () => {
      const updatedBooking = { ...mockBooking, fromPincode: '987654' };
      Booking.findById.mockResolvedValue(mockBooking);
      Booking.findByIdAndUpdate.mockResolvedValue(updatedBooking);
      calculateRideDuration.mockResolvedValue(2);

      const req = {
        params: { id: '2' },
        body: {
          fromPincode: '987654',
          toPincode: '456789',
          startTime: '2025-07-20T10:00:00+05:30',
          customerId: 'cust456',
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const { updateBooking } = require('../controllers/booking.js');
      await updateBooking(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedBooking);
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle past bookings with 400', async () => {
      const pastBooking = { ...mockBooking, startTime: new Date('2025-07-19T10:00:00+05:30') };
      Booking.findById.mockResolvedValue(pastBooking);

      const req = { params: { id: '2' }, body: { fromPincode: '987654' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const { updateBooking } = require('../controllers/booking.js');
      await updateBooking(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toBe('Cannot edit past or current bookings');
    });
  });

  describe('deleteBooking', () => {
    test('should return 200 with success message', async () => {
      Booking.findById.mockResolvedValue(mockBooking);
      Booking.findByIdAndDelete.mockResolvedValue(mockBooking);

      const req = { params: { id: '2' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const { deleteBooking } = require('../controllers/booking.js');
      await deleteBooking(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Booking deleted successfully' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('cancelBooking', () => {
    test('should return 200 with cancelled booking', async () => {
      const cancelledBooking = { ...mockBooking, status: 'cancelled' };
      Booking.findById.mockResolvedValue(mockBooking);
      Booking.findByIdAndUpdate.mockResolvedValue(cancelledBooking);

      const req = { params: { id: '2' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const { cancelBooking } = require('../controllers/booking.js');
      await cancelBooking(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(cancelledBooking);
      expect(next).not.toHaveBeenCalled();
    });
  });
});