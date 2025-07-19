import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL||'http://localhost:8000/api';

// Create a vehicle
export const addVehicle = async (vehicleData) => {
    return await axios.post(`${API_BASE_URL}/vehicles`, vehicleData);
};

// Get available vehicles
export const getAvailableVehicles = async (params) => {
    return await axios.get(`${API_BASE_URL}/vehicles/available`, { params });
};

// Book a vehicle
export const bookVehicle = async (data) => {
    return await axios.post(`${API_BASE_URL}/bookings`, data);
};

// Get all bookings
export const getBookings = async () => {
    return await axios.get(`${API_BASE_URL}/bookings`);
};

// Update a booking
export const updateBooking = async (id, data) => {
    return await axios.put(`${API_BASE_URL}/bookings/${id}`, data);
};

// Delete a booking
export const deleteBooking = async (id) => {
    return await axios.delete(`${API_BASE_URL}/bookings/${id}`);
};

// Cancel a booking
export const cancelBooking = async (id) => {
    return await axios.put(`${API_BASE_URL}/bookings/${id}/cancel`);
};