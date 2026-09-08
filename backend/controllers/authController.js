const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
exports.register = async (req, res) => {
  const { firstName, lastName, email, phone, vehicleBrand, password } = req.body;
  try {
    const cleanEmail = email ? email.toLowerCase().trim() : '';
    if (!cleanEmail) {
      return res.status(400).json({ message: 'Une adresse email est requise.' });
    }

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser un autre email.' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email: cleanEmail,
      phone,
      vehicleBrand,
      password,
    });

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser un autre email.' });
    }
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription.' });
  }
};

// @desc   Login user (email or phone) + admin check
// @route  POST /api/auth/login
// @access Public
exports.login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const cleanIdentifier = identifier ? identifier.trim() : '';
    // Check if identifier is email or phone
    const user = await User.findOne({
      $or: [{ email: cleanIdentifier.toLowerCase() }, { phone: cleanIdentifier }]
    });

    if (!user) return res.status(401).json({ message: 'Identifiant ou mot de passe incorrect.' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Identifiant ou mot de passe incorrect.' });

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      vehicleBrand: user.vehicleBrand,
      role: user.role,
      discountRate: user.discountRate,
      loyaltyPoints: user.loyaltyPoints,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// @desc   Get current user profile (verify token)
// @route  GET /api/auth/me
// @access Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      vehicleBrand: user.vehicleBrand,
      role: user.role,
      discountRate: user.discountRate,
      loyaltyPoints: user.loyaltyPoints,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
