import { useState, useEffect } from 'react';
import { getAvailableVehicles } from '../api';
import VehicleList from './VehicleList';
import Notification from './Notification';
import LoadingSpinner from './LoadingSpinner';

export default function SearchBookForm() {
  const [formData, setFormData] = useState({
    capacityRequired: '',
    fromPincode: '',
    toPincode: '',
    startTime: new Date(),
  });
  const [errors, setErrors] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [duration, setDuration] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  // Log formData changes for debugging
  useEffect(() => {
    console.log('Current formData:', {
      ...formData,
      startTime: formData.startTime ? formData.startTime.toISOString() : null,
    });
  }, [formData]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleDateChange = (e) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    setFormData({ ...formData, startTime: date });
    setErrors({ ...errors, startTime: '' });
  };

  const formatDateForInput = (date) => {
    if (!date || isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:mm
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);
    setVehicles([]);
    setDuration(null);
    try {
      const query = {
        capacityRequired: parseInt(formData.capacityRequired, 10),
        fromPincode: formData.fromPincode.trim(),
        toPincode: formData.toPincode.trim(),
        startTime: formData.startTime.toISOString(),
      };
      console.log('Sending search request:', query);
      const response = await getAvailableVehicles(query);
      console.log('Search response:', response.data);
      const vehiclesData = response.data.vehicles || [];
      setVehicles(vehiclesData);
      setDuration(response.data.estimatedRideDurationHours);
      setNotification({
        type: 'success',
        message: vehiclesData.length > 0
          ? 'Vehicles found!'
          : 'No vehicles available for the selected criteria.',
      });
    } catch (error) {
      console.error('Search error:', error.response?.data || error.message);
      setVehicles([]);
      setDuration(null);
      setNotification({
        type: 'error',
        message: error.response?.data?.error?.message || 'Failed to fetch available vehicles. Please check your inputs or try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Search & Book Vehicle</h2>
      {notification && <Notification type={notification.type} message={notification.message} />}
      <form onSubmit={handleSubmit} className="space-y-6" aria-label="Search vehicles form">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="capacityRequired" className="block text-sm font-medium text-gray-700">
              Capacity Required (KG)
            </label>
            <input
              id="capacityRequired"
              type="number"
              name="capacityRequired"
              value={formData.capacityRequired}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.capacityRequired ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., 500"
              required
              min="1"
              aria-invalid={errors.capacityRequired ? 'true' : 'false'}
              aria-describedby={errors.capacityRequired ? 'capacity-error' : undefined}
            />
            {errors.capacityRequired && (
              <p id="capacity-error" className="mt-1 text-sm text-red-600">{errors.capacityRequired}</p>
            )}
          </div>
          <div>
            <label htmlFor="fromPincode" className="block text-sm font-medium text-gray-700">
              From Pincode
              <span className="ml-1 text-gray-500 text-xs">(6-digit numeric)</span>
            </label>
            <input
              id="fromPincode"
              type="text"
              name="fromPincode"
              value={formData.fromPincode}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fromPincode ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., 123456"
              required
              maxLength="6"
              inputMode="numeric"
              pattern="\d{6}"
              aria-invalid={errors.fromPincode ? 'true' : 'false'}
              aria-describedby={errors.fromPincode ? 'fromPincode-error' : undefined}
            />
            {errors.fromPincode && (
              <p id="fromPincode-error" className="mt-1 text-sm text-red-600">{errors.fromPincode}</p>
            )}
          </div>
          <div>
            <label htmlFor="toPincode" className="block text-sm font-medium text-gray-700">
              To Pincode
              <span className="ml-1 text-gray-500 text-xs">(6-digit numeric)</span>
            </label>
            <input
              id="toPincode"
              type="text"
              name="toPincode"
              value={formData.toPincode}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.toPincode ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., 123461"
              required
              maxLength="6"
              inputMode="numeric"
              pattern="\d{6}"
              aria-invalid={errors.toPincode ? 'true' : 'false'}
              aria-describedby={errors.toPincode ? 'toPincode-error' : undefined}
            />
            {errors.toPincode && (
              <p id="toPincode-error" className="mt-1 text-sm text-red-600">{errors.toPincode}</p>
            )}
          </div>
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
              Start Date & Time
            </label>
            <input
              id="startTime"
              type="datetime-local"
              name="startTime"
              value={formatDateForInput(formData.startTime)}
              onChange={handleDateChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startTime ? 'border-red-500' : 'border-gray-300'}`}
              required
              aria-invalid={errors.startTime ? 'true' : 'false'}
              aria-describedby={errors.startTime ? 'startTime-error' : undefined}
            />
            {errors.startTime && (
              <p id="startTime-error" className="mt-1 text-sm text-red-600">{errors.startTime}</p>
            )}
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
          aria-label="Search available vehicles"
        >
          {loading ? 'Searching...' : 'Search Availability'}
        </button>
      </form>
      {vehicles.length > 0 ? (
        <VehicleList
          vehicles={vehicles}
          duration={duration}
          bookingData={{
            fromPincode: formData.fromPincode,
            toPincode: formData.toPincode,
            startTime: formData.startTime ? formData.startTime.toISOString() : null,
            customerId: 'cust123',
          }}
          setNotification={setNotification}
        />
      ) : (
        vehicles.length === 0 && duration !== null && (
          <p className="mt-6 text-gray-600 text-center">No vehicles available for the selected criteria.</p>
        )
      )}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}