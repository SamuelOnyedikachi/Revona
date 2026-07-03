const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/AppError');

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
exports.register = async (req, res) => {
  const { name, email, password, role, phone, consentGiven } = req.body;

  if (!consentGiven) {
    throw new AppError('You must accept the data consent terms (NDPR)', 400);
  }

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 409);

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    consentGiven,
    consentDate: new Date(),
  });

  const token = signToken(user._id);

  res.status(201).json({
    status: 'success',
    token,
    data: { user },
  });
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account has been deactivated', 403);
  }

  const token = signToken(user._id);

  res.json({
    status: 'success',
    token,
    data: { user },
  });
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ status: 'success', data: { user } });
};
