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

module.exports = {
  authLimiter,
};
