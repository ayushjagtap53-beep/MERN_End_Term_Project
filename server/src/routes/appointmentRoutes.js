const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createAppointment);
router.get('/', protect, getMyAppointments);
router.get('/:id', protect, getAppointmentById);
router.patch('/:id/status', protect, updateAppointmentStatus);

module.exports = router;
