const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

// ─── Middleware d'upload flexible (supporte 'image' unique et 'images' multiple) ─
const handleUpload = (req, res, next) => {
  const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 3 },
  ]);

  uploadFields(req, res, (err) => {
    if (err) {
      logger.error('Erreur Upload Cloudinary / Multer:', { error: err.message });
      return res.status(400).json({
        message: err.message || 'Erreur lors du téléchargement de l\'image vers Cloudinary.',
      });
    }
    next();
  });
};

// ─── Routes Publiques ──────────────────────────────────────────────
router.route('/').get(getProducts);
router.route('/:id').get(getProductById);

// ─── Routes Protégées Administrateur ──────────────────────────────
router.route('/')
  .post(protect, adminOnly, handleUpload, createProduct);

router.route('/:id')
  .put(protect, adminOnly, handleUpload, updateProduct)
  .patch(protect, adminOnly, handleUpload, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

module.exports = router;

