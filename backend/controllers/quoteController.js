const Quote = require('../models/Quote');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Create new quote request
// @route   POST /api/quotes
// @access  Public
exports.createQuote = async (req, res) => {
  try {
    const {
      name,
      phone,
      city,
      email,
      customerType,
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      partCategory,
      partRef,
      serviceNeeded,
      description,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Le nom et le numéro de téléphone sont obligatoires.' });
    }

    // Authentification facultative mais sécurisée : ignore tout userId passé dans le body
    let verifiedUserId = null;
    if (req.user && req.user._id) {
      verifiedUserId = req.user._id;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) verifiedUserId = user._id;
      } catch {
        // Token invalide ou expiré, la demande reste enregistrée en mode invité
      }
    }

    let photoUrl = '';
    if (req.file) {
      // Cloudinary retourne l'URL dans req.file.path
      photoUrl = req.file.path || req.file.secure_url || `/uploads/${req.file.filename}`;
    } else if (req.body.photoUrl) {
      photoUrl = req.body.photoUrl;
    }

    const quote = new Quote({
      name,
      phone,
      city: city || '',
      email: email || '',
      customerType: customerType || 'Particulier',
      vehicleBrand: vehicleBrand || '',
      vehicleModel: vehicleModel || '',
      vehicleYear: vehicleYear || '',
      partCategory: partCategory || 'injecteur',
      partRef: partRef || '',
      serviceNeeded: serviceNeeded || 'Réparation / Reconditionnement',
      description: description || '',
      photoUrl,
      user: verifiedUserId,
    });

    const created = await quote.save();
    logger.info(`Devis créé avec succès: ${created.quoteNumber || created._id}`, { quoteId: created._id });
    res.status(201).json(created);
  } catch (error) {
    logger.error('createQuote error:', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Erreur lors de la création de la demande de devis.' });
  }
};

// @desc    Get all quote requests (admin)
// @route   GET /api/quotes
// @access  Private/Admin
exports.getAllQuotes = async (req, res) => {
  try {
    const { page, limit } = req.query;
    if (page || limit) {
      const safePage = Math.max(1, parseInt(page, 10) || 1);
      const safeLimit = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
      const skip = (safePage - 1) * safeLimit;
      const [quotes, total] = await Promise.all([
        Quote.find({}).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
        Quote.countDocuments(),
      ]);
      return res.json({ quotes, total, page: safePage, pages: Math.ceil(total / safeLimit) });
    }
    const quotes = await Quote.find({}).sort({ createdAt: -1 });
    res.json(quotes);
  } catch (error) {
    logger.error('getAllQuotes error:', { error: error.message });
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// @desc    Get quotes for logged-in user
// @route   GET /api/quotes/my
// @access  Private
exports.getMyQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find({
      $or: [
        { user: req.user._id },
        { email: req.user.email },
        { phone: req.user.phone }
      ]
    }).sort({ createdAt: -1 });
    res.json(quotes);
  } catch (error) {
    logger.error('getMyQuotes error:', { error: error.message });
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// @desc    Update quote status & estimated price (admin)
// @route   PUT /api/quotes/:id/status
// @access  Private/Admin
exports.updateQuoteStatus = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Demande de devis introuvable.' });
    }

    if (req.body.status) quote.status = req.body.status;
    if (req.body.estimatedPrice !== undefined) {
      quote.estimatedPrice = req.body.estimatedPrice !== '' ? Number(req.body.estimatedPrice) : null;
    }

    const updated = await quote.save();
    logger.info(`Statut devis mis à jour: ${quote._id} -> ${quote.status}`);
    res.json(updated);
  } catch (error) {
    logger.error('updateQuoteStatus error:', { error: error.message });
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

