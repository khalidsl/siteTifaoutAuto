const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware: protect routes requiring login
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Compte introuvable ou désactivé.' });
      }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Non autorisé, token invalide.' });
    }
  } else {
    res.status(401).json({ message: 'Non autorisé, pas de token.' });
  }
};

// Middleware: optional auth (parses user if token is present, does not reject guests)
exports.optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      req.user = null;
    }
  }
  next();
};

// Middleware: admin only
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé : Administrateur uniquement.' });
  }
};
