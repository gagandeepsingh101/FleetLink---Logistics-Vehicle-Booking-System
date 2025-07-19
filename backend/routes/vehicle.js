const express = require('express');
const router = express.Router();
const { createVehicle, getAvailableVehicles } = require('../controllers/vehicle.js');

router.post('/', createVehicle);
router.get('/available', getAvailableVehicles);

module.exports = router;