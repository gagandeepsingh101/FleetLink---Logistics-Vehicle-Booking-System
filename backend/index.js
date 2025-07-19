const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler.js');
const vehicleRoutes = require('./routes/vehicle.js');
const bookingRoutes = require('./routes/booking.js');
const cors = require('cors');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);

app.use(errorHandler);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server running on port ${process.env.PORT || 8000}`);
        });
    })
    .catch((error) => console.error('Database connection error:', error));

module.exports = app;