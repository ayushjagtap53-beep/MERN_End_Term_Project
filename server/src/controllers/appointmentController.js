const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const Prescription = require('../models/Prescription');
const { calculateTriageScore } = require('../utils/triageEngine');

// Helper to generate human-readable reference code
const generateReferenceCode = () => {
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const year = new Date().getFullYear();
  return `MDF-${year}-${randomSuffix}`;
};

// @desc    Book a new appointment with automated clinical triage scoring
// @route   POST /api/appointments
// @access  Private (Patient or Admin)
exports.createAppointment = async (req, res, next) => {
  try {
    const {
      doctorId,
      appointmentDate,
      timeSlot,
      chiefComplaint,
      symptomSeverity,
      durationDays,
      preExistingConditions,
      temperatureF,
      patientAge
    } = req.body;

    // 1. Basic validation
    if (!doctorId || !appointmentDate || !timeSlot || !timeSlot.start || !timeSlot.end) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking details (doctor, date, time slot).'
      });
    }

    if (!chiefComplaint || chiefComplaint.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a clear chief complaint or symptoms description.'
      });
    }

    // 2. Doctor verification
    const doctor = await DoctorProfile.findById(doctorId).populate('user', 'name email');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found.'
      });
    }

    // 3. Concurrency / Double-booking prevention check
    const existingConflict = await Appointment.findOne({
      doctor: doctor._id,
      appointmentDate,
      'timeSlot.start': timeSlot.start,
      status: { $nin: ['CANCELLED'] }
    });

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        message: 'This time slot was just booked by another patient. Please select an alternate slot.'
      });
    }

    // 4. Clinical Triage Assessment Algorithm
    const triageEvaluation = calculateTriageScore({
      chiefComplaint,
      symptomSeverity: symptomSeverity || 5,
      durationDays: durationDays || 1,
      preExistingConditions: preExistingConditions || [],
      temperatureF: temperatureF || 98.6,
      patientAge: patientAge || 30
    });

    // 5. Generate Reference Code and Create Appointment
    const referenceCode = generateReferenceCode();

    const appointment = await Appointment.create({
      referenceCode,
      patient: req.user._id,
      doctor: doctor._id,
      appointmentDate,
      timeSlot,
      status: 'CONFIRMED',
      consultationFee: doctor.consultationFee,
      paymentStatus: 'PAID',
      triage: {
        chiefComplaint,
        symptomSeverity: symptomSeverity || 5,
        durationDays: durationDays || 1,
        preExistingConditions: preExistingConditions || [],
        temperatureF: temperatureF || 98.6,
        urgencyScore: triageEvaluation.urgencyScore,
        triageLevel: triageEvaluation.triageLevel,
        triageColor: triageEvaluation.triageColor,
        flaggedConcerns: triageEvaluation.flaggedConcerns,
        recommendedAction: triageEvaluation.recommendedAction
      }
    });

    // Populate for response
    await appointment.populate([
      { path: 'patient', select: 'name email phone bloodGroup' },
      { path: 'doctor', populate: { path: 'user', select: 'name email' } }
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment booked and clinical triage scored successfully.',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user appointments (Patient gets their bookings, Doctor gets their schedule)
// @route   GET /api/appointments
// @access  Private
exports.getMyAppointments = async (req, res, next) => {
  try {
    const { status, triageLevel, date } = req.query;
    let query = {};

    if (req.user.role === 'doctor') {
      const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });
      if (!doctorProfile) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile record not found for current user.'
        });
      }
      query.doctor = doctorProfile._id;
    } else {
      // Patient
      query.patient = req.user._id;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (triageLevel && triageLevel !== 'ALL') {
      query['triage.triageLevel'] = triageLevel;
    }
    if (date) {
      query.appointmentDate = date;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone bloodGroup')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ appointmentDate: -1, 'timeSlot.start': 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment details
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone bloodGroup')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' }
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    // Check authorization: must be either the patient, doctor, or admin
    const isPatient = appointment.patient._id.toString() === req.user._id.toString();
    const isDoctor = req.user.role === 'doctor';
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment.'
      });
    }

    // Check if prescription exists for this appointment
    const prescription = await Prescription.findOne({ appointment: appointment._id });

    res.status(200).json({
      success: true,
      appointment,
      prescription: prescription || null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (e.g. CHECKED_IN, IN_CONSULTATION, COMPLETED, CANCELLED)
// @route   PATCH /api/appointments/:id/status
// @access  Private
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;
    const validStatuses = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    appointment.status = status;
    if (status === 'CANCELLED' && cancellationReason) {
      appointment.cancellationReason = cancellationReason;
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}.`,
      appointment
    });
  } catch (error) {
    next(error);
  }
};
