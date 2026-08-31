const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// ── Configuration du stockage Cloudinary pour les images produits ──────────
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tifaout-auto-produits',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
  },
});

// ── Middleware d'upload Multer avec validation et limite de taille ────────
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite : 5 Mo max
  fileFilter: (req, file, cb) => {
    const filetypes = /jpg|jpeg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error('Format de fichier non supporté. Formats autorisés : jpg, jpeg, png, webp.'));
  },
});

module.exports = upload;
