const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');

// @desc    Create / Issue digital prescription for an appointment
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
exports.createPrescription = async (req, res, next) => {
  try {
    const { appointmentId, diagnosis, vitals, medications, clinicalNotes, followUpDate } = req.body;

    if (!appointmentId || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID and clinical diagnosis are required.'
      });
    }

    const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });
    if (!doctorProfile) {
      return res.status(403).json({
        success: false,
        message: 'Only registered doctors can issue prescriptions.'
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    // Verify doctor ownership
    if (appointment.doctor.toString() !== doctorProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only issue prescriptions for your own patient appointments.'
      });
    }

    // Check if prescription already exists
    let prescription = await Prescription.findOne({ appointment: appointmentId });
    if (prescription) {
      // Update existing
      prescription.diagnosis = diagnosis;
      prescription.vitals = vitals || prescription.vitals;
      prescription.medications = medications || prescription.medications;
      prescription.clinicalNotes = clinicalNotes || prescription.clinicalNotes;
      prescription.followUpDate = followUpDate || prescription.followUpDate;
      await prescription.save();
    } else {
      prescription = await Prescription.create({
        appointment: appointmentId,
        patient: appointment.patient,
        doctor: doctorProfile._id,
        diagnosis,
        vitals: vitals || {},
        medications: medications || [],
        clinicalNotes: clinicalNotes || '',
        followUpDate: followUpDate || null
      });
    }

    // Automatically transition appointment status to COMPLETED
    appointment.status = 'COMPLETED';
    await appointment.save();

    await prescription.populate([
      { path: 'patient', select: 'name email phone bloodGroup' },
      { path: 'doctor', populate: { path: 'user', select: 'name email' } }
    ]);

    res.status(201).json({
      success: true,
      message: 'Digital prescription issued and appointment marked COMPLETED.',
      prescription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all prescriptions for the logged-in patient
// @route   GET /api/prescriptions/my
// @access  Private
exports.getMyPrescriptions = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });
      if (doctorProfile) {
        query.doctor = doctorProfile._id;
      }
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name email phone bloodGroup')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('appointment', 'referenceCode appointmentDate timeSlot triage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescription by appointment ID
// @route   GET /api/prescriptions/appointment/:appointmentId
// @access  Private
exports.getPrescriptionByAppointmentId = async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({ appointment: req.params.appointmentId })
      .populate('patient', 'name email phone bloodGroup')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('appointment', 'referenceCode appointmentDate timeSlot triage');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'No prescription found for this appointment.'
      });
    }

    res.status(200).json({
      success: true,
      prescription
    });
  } catch (error) {
    next(error);
  }
};
