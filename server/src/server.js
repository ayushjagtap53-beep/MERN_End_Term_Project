const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const statsRoutes = require('./routes/statsRoutes');

const DoctorProfile = require('./models/DoctorProfile');
const { seedData } = require('./utils/seedData');

const app = express();

// Database Connection with Auto-seed if empty
connectDB().then(async (conn) => {
  if (conn) {
    try {
      const count = await DoctorProfile.countDocuments();
      if (count === 0) {
        console.log('\x1b[33m🌱 Database empty. Auto-seeding specialist doctors and demo accounts...\x1b[0m');
        await seedData(false);
      }
    } catch (e) {
      console.warn('Auto-seed check failed:', e.message);
    }
  }
});

// Core Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStateMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };
  const dbStatus = dbStateMap[mongoose.connection.readyState] || 'Unknown';

  res.status(200).json({
    status: 'healthy',
    product: 'MediFlow Clinical API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      connected: mongoose.connection.readyState === 1,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    }
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/stats', statsRoutes);

// Fallback 404 for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\x1b[36m====================================================\x1b[0m`);
  console.log(`\x1b[32m🚀 MediFlow Clinical API running on port ${PORT}\x1b[0m`);
  console.log(`\x1b[34m🩺 Environment: ${process.env.NODE_ENV || 'development'}\x1b[0m`);
  console.log(`\x1b[35m📡 Health Check: http://localhost:${PORT}/api/health\x1b[0m`);
  console.log(`\x1b[36m====================================================\x1b[0m`);
});

module.exports = app;
