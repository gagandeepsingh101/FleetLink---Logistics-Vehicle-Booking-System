const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const { calculateRideDuration } = require('../utils/rideDurationCalculator');
jest.mock('../models/Vehicle');
jest.mock('../models/Booking');
jest.mock('../utils/rideDurationCalculator');

describe('VehicleController', () => {
  afterEach(() => jest.clearAllMocks());

  const mockVehicle = { _id: '1', name: 'Truck', capacityKg: 1000, tyres: 4 };

  describe('createVehicle', () => {
    test('should return 201 with vehicle data', async () => {
      Vehicle.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(mockVehicle) }));

      const req = { body: { name: 'Truck', capacityKg: 1000, tyres: 4 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const { createVehicle } = require('../controllers/vehicle.js');
      await createVehicle(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockVehicle);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('getAvailableVehicles', () => {
    test('should return 200 with available vehicles', async () => {
      Vehicle.find.mockResolvedValue([mockVehicle]);
      Booking.find.mockResolvedValue([]);
      calculateRideDuration.mockResolvedValue(2);

      const req = {
        query: {
          capacityRequired: '500',
          fromPincode: '123456',
          toPincode: '654321',
          startTime: '2025-07-20T10:00:00+05:30',
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const { getAvailableVehicles } = require('../controllers/vehicle.js');
      await getAvailableVehicles(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ vehicles: [mockVehicle], estimatedRideDurationHours: 2 });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 200 with empty vehicles array if none available', async () => {
      Vehicle.find.mockResolvedValue([{ ...mockVehicle, capacityKg: 100 }]);
      Booking.find.mockResolvedValue([]);
      calculateRideDuration.mockResolvedValue(2);

      const req = {
        query: {
          capacityRequired: '500',
          fromPincode: '123456',
          toPincode: '654321',
          startTime: '2025-07-20T10:00:00+05:30',
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const { getAvailableVehicles } = require('../controllers/vehicle.js');
      await getAvailableVehicles(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ vehicles: [], estimatedRideDurationHours: 2 });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle invalid startTime with 400', async () => {
      const req = {
        query: {
          capacityRequired: '500',
          fromPincode: '123456',
          toPincode: '654321',
          startTime: 'invalid-date',
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const { getAvailableVehicles } = require('../controllers/vehicle.js');
      await getAvailableVehicles(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toBe('Invalid startTime format');
    });
  });
});