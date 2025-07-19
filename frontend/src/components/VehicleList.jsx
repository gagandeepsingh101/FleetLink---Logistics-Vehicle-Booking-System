import { useState } from 'react';
import { bookVehicle } from '../api';
import LoadingSpinner from './LoadingSpinner';

export default function VehicleList({ vehicles, duration, bookingData, setNotification }) {
  const [loading, setLoading] = useState({});

  const handleBook = async (vehicleId) => {
    setLoading((prev) => ({ ...prev, [vehicleId]: true }));
    setNotification(null);
    try {
      await bookVehicle({ ...bookingData, vehicleId });
      setNotification({ type: 'success', message: 'Booking successful!' });
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.error?.message || 'Failed to book vehicle',
      });
    } finally {
      setLoading((prev) => ({ ...prev, [vehicleId]: false }));
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Available Vehicles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((vehicle) => (
          <div key={vehicle._id} className="border p-4 rounded shadow">
            <h4 className="text-lg font-semibold">{vehicle.name}</h4>
            <p>Capacity: {vehicle.capacityKg} KG</p>
            <p>Tyres: {vehicle.tyres}</p>
            <p>Estimated Ride Duration: {duration} hours</p>
            <button
              onClick={() => handleBook(vehicle._id)}
              className="mt-2 bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              disabled={loading[vehicle._id]}
            >
              {loading[vehicle._id] ? <LoadingSpinner /> : 'Book Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}