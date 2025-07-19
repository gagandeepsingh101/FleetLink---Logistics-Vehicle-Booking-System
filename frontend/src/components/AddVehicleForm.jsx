import { useState } from 'react';
import { addVehicle } from '../api';
import Notification from './Notification';
import LoadingSpinner from './LoadingSpinner';

export default function AddVehicleForm() {
  const [formData, setFormData] = useState({
    name: '',
    capacityKg: '',
    tyres: '',
  });
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);
    try {
      await addVehicle({
        name: formData.name,
        capacityKg: parseInt(formData.capacityKg),
        tyres: parseInt(formData.tyres),
      });
      setNotification({ type: 'success', message: 'Vehicle added successfully!' });
      setFormData({ name: '', capacityKg: '', tyres: '' });
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.error?.message || 'Failed to add vehicle',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Add Vehicle</h2>
      {notification && <Notification type={notification.type} message={notification.message} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Capacity (KG)</label>
          <input
            type="number"
            name="capacityKg"
            value={formData.capacityKg}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Tyres</label>
          <input
            type="number"
            name="tyres"
            value={formData.tyres}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            min="1"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : 'Add Vehicle'}
        </button>
      </form>
    </div>
  );
}