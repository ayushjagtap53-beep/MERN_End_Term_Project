const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const Prescription = require('../models/Prescription');

// @desc    Get dashboard metrics & clinical statistics
// @route   GET /api/stats/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    let appointmentFilter = {};

    if (req.user.role === 'doctor') {
      const docProfile = await DoctorProfile.findOne({ user: req.user._id });
      if (docProfile) {
        appointmentFilter.doctor = docProfile._id;
      }
    } else if (req.user.role === 'patient') {
      appointmentFilter.patient = req.user._id;
    }

    const [totalAppointments, completedCount, cancelledCount, urgentCount, mediumCount, lowCount] = await Promise.all([
      Appointment.countDocuments(appointmentFilter),
      Appointment.countDocuments({ ...appointmentFilter, status: 'COMPLETED' }),
      Appointment.countDocuments({ ...appointmentFilter, status: 'CANCELLED' }),
      Appointment.countDocuments({ ...appointmentFilter, 'triage.triageLevel': 'URGENT' }),
      Appointment.countDocuments({ ...appointmentFilter, 'triage.triageLevel': 'MEDIUM' }),
      Appointment.countDocuments({ ...appointmentFilter, 'triage.triageLevel': 'LOW' })
    ]);

    const activeCount = totalAppointments - (completedCount + cancelledCount);

    res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        activeCount,
        completedCount,
        cancelledCount,
        triageBreakdown: {
          urgent: urgentCount,
          medium: mediumCount,
          low: lowCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
