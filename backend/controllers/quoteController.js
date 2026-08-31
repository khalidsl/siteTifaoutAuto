const Quote = require('../models/Quote');

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
      userId
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Le nom et le numéro de téléphone sont obligatoires.' });
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
      user: userId || (req.user ? req.user._id : null),
    });

    const created = await quote.save();
    res.status(201).json(created);
  } catch (error) {
    console.error('createQuote error:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la demande de devis.' });
  }
};

// @desc    Get all quote requests (admin)
// @route   GET /api/quotes
// @access  Private/Admin
exports.getAllQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find({}).sort({ createdAt: -1 });
    res.json(quotes);
  } catch (error) {
    console.error('getAllQuotes error:', error);
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
    console.error('getMyQuotes error:', error);
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
    res.json(updated);
  } catch (error) {
    console.error('updateQuoteStatus error:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
