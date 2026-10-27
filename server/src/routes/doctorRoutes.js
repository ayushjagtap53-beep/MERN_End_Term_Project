const express = require('express');
const router = express.Router();
const { getAllDoctors, getDoctorById, getAvailableSlots } = require('../controllers/doctorController');

router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/available-slots', getAvailableSlots);

module.exports = router;
