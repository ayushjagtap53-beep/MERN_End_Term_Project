const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      enum: [
        'Cardiology',
        'Dermatology',
        'General Medicine',
        'Pediatrics',
        'Neurology',
        'Orthopedics',
        'Psychiatry',
        'ENT',
        'Ophthalmology'
      ]
    },
    qualification: {
      type: String,
      required: true,
      default: 'MD, MBBS'
    },
    experienceYears: {
      type: Number,
      required: true,
      default: 5
    },
    consultationFee: {
      type: Number,
      required: true,
      default: 50
    },
    bio: {
      type: String,
      default: 'Dedicated healthcare specialist committed to patient wellness and evidenced-based care.'
    },
    clinicAddress: {
      hospitalName: { type: String, default: 'MediFlow Central Medical Hub' },
      roomNumber: { type: String, default: 'Suite 304' },
      city: { type: String, default: 'Metro Health District' }
    },
    workingHours: {
      start: { type: String, default: '09:00' }, // 24hr "HH:mm"
      end: { type: String, default: '17:00' },
      slotDurationMinutes: { type: Number, default: 30 }
    },
    workingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    averageRating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 12
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
