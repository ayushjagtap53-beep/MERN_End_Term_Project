const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Helper to format time "09:00"
const padZero = (n) => (n < 10 ? `0${n}` : `${n}`);

// @desc    Get all doctors with search, specialty filter, and sorting
// @route   GET /api/doctors
// @access  Public
exports.getAllDoctors = async (req, res, next) => {
  try {
    const { specialty, search, sortBy } = req.query;
    let query = { isActive: true };

    if (specialty && specialty !== 'All') {
      query.specialty = specialty;
    }

    let doctors = await DoctorProfile.find(query).populate('user', 'name email phone');

    // Filter by text search if provided
    if (search) {
      const q = search.toLowerCase();
      doctors = doctors.filter(doc => {
        const docName = doc.user?.name?.toLowerCase() || '';
        const specialtyMatch = doc.specialty?.toLowerCase() || '';
        const hospitalMatch = doc.clinicAddress?.hospitalName?.toLowerCase() || '';
        return docName.includes(q) || specialtyMatch.includes(q) || hospitalMatch.includes(q);
      });
    }

    // Sort
    if (sortBy === 'fee_asc') {
      doctors.sort((a, b) => a.consultationFee - b.consultationFee);
    } else if (sortBy === 'fee_desc') {
      doctors.sort((a, b) => b.consultationFee - a.consultationFee);
    } else if (sortBy === 'experience') {
      doctors.sort((a, b) => b.experienceYears - a.experienceYears);
    } else {
      // Default: Highest rating
      doctors.sort((a, b) => b.averageRating - a.averageRating);
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor profile by ID
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await DoctorProfile.findById(req.params.id).populate('user', 'name email phone');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found.'
      });
    }

    res.status(200).json({
      success: true,
      doctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get real-time dynamic conflict-free available slots for a doctor on a specific date
// @route   GET /api/doctors/:id/available-slots?date=YYYY-MM-DD
// @access  Public
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date query parameter (YYYY-MM-DD).'
      });
    }

    const doctor = await DoctorProfile.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found.'
      });
    }

    // Check if the doctor works on this day of the week
    const requestedDateObj = new Date(date + 'T00:00:00');
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[requestedDateObj.getDay()];

    if (doctor.workingDays && !doctor.workingDays.includes(dayName)) {
      return res.status(200).json({
        success: true,
        date,
        dayName,
        isWorkingDay: false,
        message: `Doctor is not scheduled to consult on ${dayName}s.`,
        slots: []
      });
    }

    // Generate standard 30-minute time slots from working hours
    const startHour = parseInt(doctor.workingHours.start.split(':')[0], 10) || 9;
    const endHour = parseInt(doctor.workingHours.end.split(':')[0], 10) || 17;
    const duration = doctor.workingHours.slotDurationMinutes || 30;

    const allSlots = [];
    let currentMinutes = startHour * 60;
    const endMinutes = endHour * 60;

    while (currentMinutes + duration <= endMinutes) {
      const sh = Math.floor(currentMinutes / 60);
      const sm = currentMinutes % 60;
      const eh = Math.floor((currentMinutes + duration) / 60);
      const em = (currentMinutes + duration) % 60;

      const slotStart = `${padZero(sh)}:${padZero(sm)}`;
      const slotEnd = `${padZero(eh)}:${padZero(em)}`;

      allSlots.push({
        start: slotStart,
        end: slotEnd
      });

      currentMinutes += duration;
    }

    // Query active booked appointments for this doctor on this specific date
    const bookedAppointments = await Appointment.find({
      doctor: doctor._id,
      appointmentDate: date,
      status: { $ne: 'CANCELLED' }
    }).select('timeSlot status referenceCode');

    const bookedSlotStarts = new Set(bookedAppointments.map(app => app.timeSlot.start));

    // Also check if date is today, slots in the past are marked unavailable
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const isToday = (date === todayStr);
    const nowMinutes = today.getHours() * 60 + today.getMinutes();

    const slotsWithAvailability = allSlots.map(slot => {
      const isAlreadyBooked = bookedSlotStarts.has(slot.start);
      const [sh, sm] = slot.start.split(':').map(Number);
      const slotTotalMinutes = sh * 60 + sm;
      const isPast = isToday && slotTotalMinutes <= nowMinutes;

      const isAvailable = !isAlreadyBooked && !isPast;

      return {
        start: slot.start,
        end: slot.end,
        isAvailable,
        reason: isAlreadyBooked ? 'Booked' : isPast ? 'Past slot' : 'Available'
      };
    });

    res.status(200).json({
      success: true,
      date,
      dayName,
      isWorkingDay: true,
      totalSlots: slotsWithAvailability.length,
      availableSlotsCount: slotsWithAvailability.filter(s => s.isAvailable).length,
      slots: slotsWithAvailability
    });
  } catch (error) {
    next(error);
  }
};
