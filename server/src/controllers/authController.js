const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_dev_key_change_in_production_12345', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register a new user (Patient or Doctor)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, specialty, consultationFee, qualification, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const assignedRole = role === 'doctor' ? 'doctor' : 'patient';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      phone: phone || ''
    });

    let doctorProfile = null;
    if (assignedRole === 'doctor') {
      doctorProfile = await DoctorProfile.create({
        user: user._id,
        specialty: specialty || 'General Medicine',
        qualification: qualification || 'MBBS, MD',
        consultationFee: consultationFee || 50,
        bio: bio || `Specialist in ${specialty || 'General Medicine'}.`
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        doctorProfileId: doctorProfile ? doctorProfile._id : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & return JWT token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.'
      });
    }

    const token = generateToken(user._id);

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await DoctorProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        doctorProfile: doctorProfile || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await DoctorProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        address: user.address,
        doctorProfile: doctorProfile || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile details
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, bloodGroup, address } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (address !== undefined) user.address = address;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};
