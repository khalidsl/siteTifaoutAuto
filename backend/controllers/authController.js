const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const logger = require('../utils/logger');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getRefreshTokenSecret = () => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret || secret === process.env.JWT_SECRET) {
    throw new Error('REFRESH_TOKEN_SECRET doit être défini et différent de JWT_SECRET.');
  }
  return secret;
};

const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, getRefreshTokenSecret(), { expiresIn: '2d' });
};

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 jours
  });
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

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    setRefreshTokenCookie(res, refreshToken);

    logger.info(`Nouvel utilisateur inscrit: ${user.email} (${user.role})`);
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints,
      token: accessToken,
    });
  } catch (error) {
    logger.error('REGISTER ERROR:', { error: error.message });

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

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    setRefreshTokenCookie(res, refreshToken);

    logger.info(`Connexion réussie: ${user.email} (${user.role})`);
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
      token: accessToken,
    });
  } catch (error) {
    logger.error('LOGIN ERROR:', { error: error.message });
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// @desc   Login or register with Google Identity Services
// @route  POST /api/auth/google
// @access Public
exports.googleLogin = async (req, res) => {
  try {
    const credential = typeof req.body?.credential === 'string' ? req.body.credential : '';
    if (!credential || !process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ message: 'La connexion Google n’est pas configurée.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      return res.status(401).json({ message: 'Compte Google non vérifié.' });
    }

    const email = payload.email.toLowerCase().trim();
    let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email }] });
    if (!user) {
      user = await User.create({
        firstName: payload.given_name || payload.name?.split(' ')[0] || 'Client',
        lastName: payload.family_name || payload.name?.split(' ').slice(1).join(' ') || 'Google',
        email,
        phone: '',
        password: crypto.randomBytes(32).toString('hex'),
        googleId: payload.sub,
        authProvider: 'google',
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      user.authProvider = 'google';
      await user.save();
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    setRefreshTokenCookie(res, refreshToken);
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      discountRate: user.discountRate,
      loyaltyPoints: user.loyaltyPoints,
      token: accessToken,
    });
  } catch (error) {
    logger.error('GOOGLE LOGIN ERROR:', { error: error.message });
    res.status(401).json({ message: 'Connexion Google impossible. Veuillez réessayer.' });
  }
};


// @desc   Refresh access token
// @route  POST /api/auth/refresh
// @access Public (via Cookie or Body)
exports.refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) return res.status(401).json({ message: 'Aucun jeton de rafraîchissement fourni.' });

  try {
    const decoded = jwt.verify(token, getRefreshTokenSecret());
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Compte introuvable ou désactivé.' });

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);
    setRefreshTokenCookie(res, newRefreshToken);

    res.json({
      token: newAccessToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        discountRate: user.discountRate,
        loyaltyPoints: user.loyaltyPoints,
      },
    });
  } catch (error) {
    res.status(401).json({ message: 'Session expirée. Veuillez vous reconnecter.' });
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
    logger.error('getMe error:', { error: error.message });
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// @desc   Logout user & clear refresh token cookie
// @route  POST /api/auth/logout
// @access Public
exports.logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ message: 'Déconnexion réussie.' });
};

