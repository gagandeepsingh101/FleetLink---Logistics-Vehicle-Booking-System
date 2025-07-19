import { useEffect, useState } from 'react';
import { cancelBooking, getBookings, updateBooking } from '../api';
import LoadingSpinner from './LoadingSpinner';
import Notification from './Notification';

export default function BookedVehicles() {
  const [bookings, setBookings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await getBookings();
      console.log('Fetched bookings:', response.data);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setNotification({ type: 'error', message: 'Failed to fetch bookings' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (booking) => {
    setEditingId(booking._id);
    setEditData({
      fromPincode: booking.fromPincode,
      toPincode: booking.toPincode,
      startTime: new Date(booking.startTime).toISOString().slice(0, 16), // Format for datetime-local
      customerId: booking.customerId,
    });
  };

  const handleSave = async (id) => {
    setLoading(true);
    try {
      const currentTime = new Date('2025-07-19T13:17:00+05:30');
      const newStartTime = new Date(editData.startTime);
      if (newStartTime <= currentTime) {
        throw new Error('Cannot edit past or current bookings');
      }
      const response = await updateBooking(id, editData);
      console.log('Updated booking:', response.data);
      setBookings(bookings.map(b => b._id === id ? response.data : b));
      setEditingId(null);
      setNotification({ type: 'success', message: 'Booking updated successfully' });
    } catch (error) {
      console.error('Error updating booking:', error);
      setNotification({ type: 'error', message: error.response?.data?.error?.message || 'Failed to update booking' });
    } finally {
      fetchBookings();
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setLoading(true);
    try {
      const currentTime = new Date('2025-07-19T13:17:00+05:30');
      const booking = bookings.find(b => b._id === id);
      if (new Date(booking.startTime) <= currentTime) {
        throw new Error('Cannot cancel past or current bookings');
      }
      const response = await cancelBooking(id);
      console.log('Cancelled booking:', response.data);
      setBookings(bookings.map(b => b._id === id ? response.data : b));
      setNotification({ type: 'success', message: 'Booking cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setNotification({ type: 'error', message: error.response?.data?.error?.message || 'Failed to cancel booking' });
    } finally {
      fetchBookings();
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Booked Vehicles</h2>
      {notification && <Notification type={notification.type} message={notification.message} />}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <LoadingSpinner />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {booking.vehicleId.name} ({booking.vehicleId.capacityKg} KG, {booking.vehicleId.tyres} tyres)
                </td>
                <td className="px-6 py-4">
                  <p className={"w-fit p-2 px-4 bg-gray-200 rounded-full font-bold " + (booking.status === 'active' ? 'text-green-500' : 'text-red-500')}>
                    {booking.status.toUpperCase()}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.fromPincode}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.toPincode}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === booking._id ? (
                    <input
                      type="datetime-local"
                      value={editData.startTime}
                      onChange={(e) => setEditData({ ...editData, startTime: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring focus:border-blue-500"
                      min="2025-07-19T13:17" // Current time formatted for datetime-local
                      required
                    />
                  ) : (
                    new Date(booking.startTime).toLocaleString()
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(booking.endTime).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === booking._id ? (
                    <>
                      <button
                        onClick={() => handleSave(booking._id)}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                        }}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 mr-2"
                      >
                        close
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(booking)}
                      className="bg-yellow-600 text-white p-2 rounded-lg hover:bg-yellow-700 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={booking.status === 'cancelled'}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleCancel(booking._id)}
                    className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={booking.status === 'cancelled'}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && bookings.length === 0 && <p className="mt-6 text-gray-600 text-center">No active bookings found.</p>}
    </div>
  );
}