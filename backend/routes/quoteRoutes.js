const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  createQuote,
  getAllQuotes,
  getMyQuotes,
  updateQuoteStatus
} = require('../controllers/quoteController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Middleware d'upload Cloudinary pour la photo du devis (gestion d'erreur incluse)
const handleQuoteUpload = (req, res, next) => {
  const singleUpload = upload.single('photo');
  singleUpload(req, res, (err) => {
    if (err) {
      console.error('Erreur Upload Photo Devis:', err.message);
      return res.status(400).json({
        message: err.message || 'Erreur lors du téléchargement de la photo.',
      });
    }
    next();
  });
};

// Route publique pour soumettre une demande de devis (avec photo optionnelle)
router.route('/').post(handleQuoteUpload, createQuote);

// Route admin pour récupérer tous les devis
router.route('/').get(protect, adminOnly, getAllQuotes);

// Route utilisateur pour récupérer ses devis personnels
router.route('/my').get(protect, getMyQuotes);

// Route admin pour mettre à jour le statut et le prix estimé d'un devis
router.route('/:id/status').put(protect, adminOnly, updateQuoteStatus);

module.exports = router;

