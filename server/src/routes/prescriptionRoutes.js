const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getMyPrescriptions,
  getPrescriptionByAppointmentId
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('doctor', 'admin'), createPrescription);
router.get('/my', protect, getMyPrescriptions);
router.get('/appointment/:appointmentId', protect, getPrescriptionByAppointmentId);

module.exports = router;
