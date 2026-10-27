const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    referenceCode: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: true,
      index: true
    },
    appointmentDate: {
      type: String, // Stored as "YYYY-MM-DD" for unambiguous timezone-safe slot querying
      required: true,
      index: true
    },
    timeSlot: {
      start: { type: String, required: true }, // e.g., "09:30"
      end: { type: String, required: true }    // e.g., "10:00"
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED'],
      default: 'CONFIRMED',
      index: true
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    triage: {
      chiefComplaint: { type: String, required: true },
      symptomSeverity: { type: Number, min: 1, max: 10, default: 5 },
      durationDays: { type: Number, default: 1 },
      preExistingConditions: { type: [String], default: [] },
      temperatureF: { type: Number, default: 98.6 },
      urgencyScore: { type: Number, default: 20 },
      triageLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'URGENT'],
        default: 'LOW'
      },
      triageColor: { type: String, default: 'green' },
      flaggedConcerns: { type: [String], default: [] },
      recommendedAction: { type: String, default: 'Standard outpatient consultation.' }
    },
    consultationFee: {
      type: Number,
      required: true,
      default: 50
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PENDING', 'REFUNDED'],
      default: 'PAID'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to help enforce uniqueness on active slots for a doctor on a specific date & time
appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, 'timeSlot.start': 1, status: 1 },
  { name: 'doctor_schedule_idx' }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
