const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true }, // e.g. "500 mg"
  frequency: { type: String, required: true }, // e.g. "1-0-1 (Twice Daily)"
  duration: { type: String, required: true }, // e.g. "5 Days"
  instructions: { type: String, default: 'Take with food and water' }
});

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true
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
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required']
    },
    vitals: {
      bloodPressure: { type: String, default: '120/80' },
      heartRate: { type: Number, default: 72 },
      temperatureF: { type: Number, default: 98.6 },
      spO2: { type: Number, default: 99 }
    },
    medications: [medicationSchema],
    clinicalNotes: {
      type: String,
      default: ''
    },
    followUpDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
