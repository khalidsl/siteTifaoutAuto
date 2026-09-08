const rateLimit = require('express-rate-limit');

// Limiteur de requêtes pour les tentatives d'authentification (Brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requêtes max par IP par fenêtre de 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Trop de tentatives de connexion ou d'inscription depuis cette adresse IP. Veuillez réessayer après 15 minutes.",
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
});

// Limiteur pour la création de commandes (ex: max 20 commandes / 15 min par IP)
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Trop de commandes passées récemment depuis cette adresse IP. Veuillez patienter quelques minutes.",
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
});

// Limiteur pour les demandes de devis (ex: max 15 devis / 15 min par IP)
const quoteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Trop de demandes de devis envoyées depuis cette adresse IP. Veuillez patienter quelques minutes.",
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
});

module.exports = {
  authLimiter,
  orderLimiter,
  quoteLimiter,
};

