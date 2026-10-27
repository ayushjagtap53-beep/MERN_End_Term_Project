const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const sampleDoctors = [
  {
    name: 'Dr. Sarah Jenkins, MD',
    email: 'sarah.jenkins@mediflow.com',
    phone: '+1 (555) 234-5678',
    specialty: 'Cardiology',
    qualification: 'MD (Harvard Medical), FACC',
    experienceYears: 14,
    consultationFee: 75,
    bio: 'Board-certified cardiologist specializing in preventive cardiovascular health, arrhythmia management, and hypertension control.',
    clinicAddress: {
      hospitalName: 'MediFlow Metro Heart Center',
      roomNumber: 'Suite 412',
      city: 'Metro Medical District'
    },
    workingHours: { start: '09:00', end: '17:00', slotDurationMinutes: 30 },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    averageRating: 4.9,
    reviewCount: 38
  },
  {
    name: 'Dr. Marcus Vance, MD',
    email: 'marcus.vance@mediflow.com',
    phone: '+1 (555) 345-6789',
    specialty: 'Neurology',
    qualification: 'MD, PhD (Johns Hopkins)',
    experienceYears: 11,
    consultationFee: 85,
    bio: 'Specialist in neurological disorders, migraine treatments, sleep medicine, and neuromuscular evaluation.',
    clinicAddress: {
      hospitalName: 'NeuroScience Institute at MediFlow',
      roomNumber: 'Suite 205',
      city: 'Metro Medical District'
    },
    workingHours: { start: '10:00', end: '18:00', slotDurationMinutes: 30 },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    averageRating: 4.8,
    reviewCount: 29
  },
  {
    name: 'Dr. Elena Rostova, MD',
    email: 'elena.rostova@mediflow.com',
    phone: '+1 (555) 456-7890',
    specialty: 'Dermatology',
    qualification: 'MD, FAAD (Columbia University)',
    experienceYears: 8,
    consultationFee: 65,
    bio: 'Clinical and cosmetic dermatologist focusing on acute dermatological conditions, eczema, acne therapies, and skin biopsies.',
    clinicAddress: {
      hospitalName: 'MediFlow Skin & Aesthetics Clinic',
      roomNumber: 'Suite 108',
      city: 'Metro Medical District'
    },
    workingHours: { start: '09:00', end: '16:00', slotDurationMinutes: 30 },
    workingDays: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    averageRating: 4.9,
    reviewCount: 45
  },
  {
    name: 'Dr. David Chen, MD',
    email: 'david.chen@mediflow.com',
    phone: '+1 (555) 567-8901',
    specialty: 'Pediatrics',
    qualification: 'MD, FAAP (Stanford Medicine)',
    experienceYears: 12,
    consultationFee: 60,
    bio: 'Compassionate pediatric specialist providing child wellness checkups, developmental assessments, and acute illness treatment.',
    clinicAddress: {
      hospitalName: 'Children & Family Pavilion',
      roomNumber: 'Suite 310',
      city: 'Metro Medical District'
    },
    workingHours: { start: '08:30', end: '16:30', slotDurationMinutes: 30 },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    averageRating: 4.9,
    reviewCount: 52
  },
  {
    name: 'Dr. Rachel Adams, MD',
    email: 'doctor@mediflow.com', // Primary demo doctor
    phone: '+1 (555) 678-9012',
    specialty: 'General Medicine',
    qualification: 'MD (Internal Medicine, Yale)',
    experienceYears: 10,
    consultationFee: 50,
    bio: 'Primary care physician committed to comprehensive health screenings, preventative diagnostics, and personalized chronic disease management.',
    clinicAddress: {
      hospitalName: 'MediFlow Central Ambulatory Care',
      roomNumber: 'Suite 101',
      city: 'Metro Medical District'
    },
    workingHours: { start: '09:00', end: '17:00', slotDurationMinutes: 30 },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    averageRating: 4.8,
    reviewCount: 64
  }
];

const seedData = async (purge = false) => {
  try {
    if (purge) {
      console.log('\x1b[33mPurging existing MediFlow test data...\x1b[0m');
      await Promise.all([
        User.deleteMany({}),
        DoctorProfile.deleteMany({}),
        Appointment.deleteMany({}),
        Prescription.deleteMany({})
      ]);
    }

    // 1. Create Demo Patient
    console.log('\x1b[33mCreating Demo Patient account...\x1b[0m');
    const demoPatient = await User.create({
      name: 'Alex Morgan',
      email: 'patient@mediflow.com',
      password: 'password123',
      role: 'patient',
      phone: '+1 (555) 123-4567',
      bloodGroup: 'O+',
      dateOfBirth: new Date('1994-05-18'),
      address: '742 Evergreen Terrace, Springfield'
    });

    // 2. Create Doctors & Profiles
    console.log('\x1b[33mCreating Specialist Doctors & Profiles...\x1b[0m');
    const createdDoctorProfiles = [];

    for (const doc of sampleDoctors) {
      const user = await User.create({
        name: doc.name,
        email: doc.email,
        password: 'password123',
        role: 'doctor',
        phone: doc.phone
      });

      const profile = await DoctorProfile.create({
        user: user._id,
        specialty: doc.specialty,
        qualification: doc.qualification,
        experienceYears: doc.experienceYears,
        consultationFee: doc.consultationFee,
        bio: doc.bio,
        clinicAddress: doc.clinicAddress,
        workingHours: doc.workingHours,
        workingDays: doc.workingDays,
        averageRating: doc.averageRating,
        reviewCount: doc.reviewCount
      });

      createdDoctorProfiles.push(profile);
    }

    // 3. Create sample appointments for demo doctor (Rachel Adams)
    console.log('\x1b[33mCreating realistic sample appointments with triage telemetry...\x1b[0m');
    const demoDocProfile = createdDoctorProfiles.find((d) => d.specialty === 'General Medicine');

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // High urgency sample appointment
    await Appointment.create({
      referenceCode: 'MDF-2026-URG01',
      patient: demoPatient._id,
      doctor: demoDocProfile._id,
      appointmentDate: todayStr,
      timeSlot: { start: '14:00', end: '14:30' },
      status: 'CONFIRMED',
      consultationFee: demoDocProfile.consultationFee,
      triage: {
        chiefComplaint: 'Acute chest tightness and shortness of breath since morning',
        symptomSeverity: 8,
        durationDays: 1,
        preExistingConditions: ['Hypertension'],
        temperatureF: 99.1,
        urgencyScore: 88,
        triageLevel: 'URGENT',
        triageColor: 'red',
        flaggedConcerns: [
          'High-Risk Clinical Indicator: "chest pain / shortness of breath" detected in chief complaint',
          'Acute onset (< 48h) with high reported distress'
        ],
        recommendedAction: 'High priority clinical queue. Doctor alerted for immediate review.'
      }
    });

    // Completed past appointment with digital prescription
    const pastApp = await Appointment.create({
      referenceCode: 'MDF-2026-CMP02',
      patient: demoPatient._id,
      doctor: demoDocProfile._id,
      appointmentDate: '2026-10-20',
      timeSlot: { start: '10:00', end: '10:30' },
      status: 'COMPLETED',
      consultationFee: demoDocProfile.consultationFee,
      triage: {
        chiefComplaint: 'Persistent dry cough and mild seasonal allergy symptoms',
        symptomSeverity: 4,
        durationDays: 5,
        preExistingConditions: ['Mild Asthma'],
        temperatureF: 98.4,
        urgencyScore: 28,
        triageLevel: 'LOW',
        triageColor: 'green',
        flaggedConcerns: [],
        recommendedAction: 'Standard outpatient consultation.'
      }
    });

    // Create prescription for completed appointment
    await Prescription.create({
      appointment: pastApp._id,
      patient: demoPatient._id,
      doctor: demoDocProfile._id,
      diagnosis: 'Acute Upper Respiratory Allergic Bronchitis',
      vitals: {
        bloodPressure: '118/76',
        heartRate: 72,
        temperatureF: 98.4,
        spO2: 99
      },
      medications: [
        {
          name: 'Levocetirizine',
          dosage: '5 mg',
          frequency: 'Once Daily (at bedtime)',
          duration: '7 Days',
          instructions: 'Take with plenty of water. May cause mild drowsiness.'
        },
        {
          name: 'Fluticasone Propionate Nasal Spray',
          dosage: '50 mcg/spray',
          frequency: '1 spray per nostril daily',
          duration: '14 Days',
          instructions: 'Administer in the morning after gentle nose blow.'
        }
      ],
      clinicalNotes: 'Patient showed clear lungs upon auscultation. Advised to avoid dust and allergen triggers.',
      followUpDate: new Date('2026-11-15')
    });

    console.log('\x1b[32m✔ Database Seeded Successfully!\x1b[0m');
    console.log(`\n\x1b[36m=== DEMO CREDENTIALS ===\x1b[0m`);
    console.log(`\x1b[32mPatient Login: patient@mediflow.com  | Password: password123\x1b[0m`);
    console.log(`\x1b[32mDoctor Login:  doctor@mediflow.com   | Password: password123\x1b[0m`);
    console.log(`\x1b[36m========================\x1b[0m\n`);
  } catch (error) {
    console.error('\x1b[31m✖ Seed error:\x1b[0m', error);
    throw error;
  }
};

// Standalone execution
if (require.main === module) {
  (async () => {
    try {
      const uri = process.env.MONGODB_URI;
      const { sanitizeMongoUri } = require('../config/db');
      const sanitized = sanitizeMongoUri(uri);

      console.log('\x1b[33mConnecting to MongoDB for standalone seed...\x1b[0m');
      await mongoose.connect(sanitized);
      console.log('\x1b[32m✔ Connected to MongoDB successfully.\x1b[0m');

      await seedData(true);
      process.exit(0);
    } catch (err) {
      console.error('CLI Seed failed:', err.message);
      process.exit(1);
    }
  })();
}

module.exports = { seedData };
