const logger = require("../utils/logger");

/**
 * Middleware Express de gestion des erreurs centralise.
 * A enregistrer EN DERNIER dans server.js : app.use(errorHandler)
 *
 * Normalise toutes les erreurs non gerees en reponse JSON structuree :
 *   { error: true, status: <code>, message: <msg> }
 *
 * En production : message generique (pas de fuite de stack).
 * En developpement : message + stack complets.
 */
const errorHandler = (err, req, res, next) => {
  // Determiner le code HTTP
  const status =
    typeof err.status === "number" ? err.status :
    typeof err.statusCode === "number" ? err.statusCode :
    err.message?.toLowerCase().includes("cors") ? 403 :
    500;

  logger.error("Erreur interceptee par errorHandler:", {
    status,
    message: err.message,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.status(status).json({
    error: true,
    status,
    message: isProduction
      ? "Une erreur interne est survenue sur le serveur."
      : (err.message || "Erreur interne du serveur."),
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = errorHandler;
