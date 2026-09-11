const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

// ── Helper pour extraire les URLs Cloudinary / Locales des fichiers uploadés ──
const getUploadedUrls = (req) => {
  const urls = [];
  if (req.file) {
    urls.push(req.file.path || req.file.secure_url || `/uploads/${req.file.filename}`);
  }
  if (req.files) {
    if (Array.isArray(req.files)) {
      req.files.forEach(f => {
        urls.push(f.path || f.secure_url || `/uploads/${f.filename}`);
      });
    } else if (typeof req.files === 'object') {
      Object.values(req.files).forEach(fileArray => {
        if (Array.isArray(fileArray)) {
          fileArray.forEach(f => {
            urls.push(f.path || f.secure_url || `/uploads/${f.filename}`);
          });
        }
      });
    }
  }
  return urls;
};

// ── Helper pour supprimer une image (Cloudinary ou Locale) ───────────────
const deleteFileOrCloudinary = async (fileUrl) => {
  if (!fileUrl) return;
  try {
    if (fileUrl.includes('cloudinary.com') || fileUrl.includes('res.cloudinary.com')) {
      const matches = fileUrl.match(/\/tifaout-auto-produits\/([^.]+)/);
      if (matches && matches[1]) {
        const publicId = `tifaout-auto-produits/${matches[1]}`;
        await cloudinary.uploader.destroy(publicId);
      }
    } else {
      const localPath = path.join(__dirname, '..', '..', 'public', fileUrl);
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    }
  } catch (err) {
    logger.warn('Erreur lors de la suppression de l\'ancienne image:', { error: err.message });
  }
};


// @desc    Get all products (with optional category & search filters)
// @route   GET /api/products?category=injecteur&search=bosch&page=1&limit=20
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 100 } = req.query;
    const query = {};
    const safePage = Math.max(1, Number.parseInt(String(page), 10) || 1);
    const safeLimit = Math.min(200, Math.max(1, Number.parseInt(String(limit), 10) || 100));

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      // Utilise l index de texte MongoDB pour la recherche (plus performant que les RegExp)
      // Champs indexés : name, reference, brand, description (voir Product.js)
      query.$text = { $search: String(search) };
    }

    const skip = (safePage - 1) * safeLimit;
    // Tri par pertinence si recherche texte active, sinon par date de création
    const sortOption = search
      ? { score: { $meta: 'textScore' }, createdAt: -1 }
      : { createdAt: -1 };
    const projection = search ? { score: { $meta: 'textScore' } } : {};

    const [products, total] = await Promise.all([
      Product.find(query, projection).sort(sortOption).skip(skip).limit(safeLimit),
      Product.countDocuments(query),
    ]);

    res.json({ products, total, page: safePage, pages: Math.ceil(total / safeLimit) });
  } catch (error) {
    logger.error('getProducts error:', { error: error.message });
    res.status(500).json({ message: 'Erreur serveur lors du chargement des produits.' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Produit introuvable.' });
    }
  } catch (error) {
    logger.error('getProductById error:', { error: error.message });
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// @desc    Create a product (supporte upload d'image Cloudinary via req.file ou req.files)
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const {
      name, reference, category, brand, description,
      compatibleVehicles, price, oldPrice, stock,
      isReconditioned, isNewPart, remarque, imageUrl: manualImageUrl
    } = req.body;

    // Validation des champs obligatoires
    if (!name || !reference || !category || price === undefined) {
      return res.status(400).json({ message: 'Nom, référence, catégorie et prix sont requis.' });
    }

    // Récupération des URLs d'images Cloudinary
    const uploadedUrls = getUploadedUrls(req);
    let images = uploadedUrls;
    let imageUrl = '';

    if (uploadedUrls.length > 0) {
      imageUrl = uploadedUrls[0];
    } else if (manualImageUrl) {
      imageUrl = manualImageUrl;
      images = [manualImageUrl];
    }

    // Parse compatibleVehicles — format JSON ou chaîne séparée par virgules
    let compatible = [];
    if (compatibleVehicles) {
      try {
        compatible = typeof compatibleVehicles === 'string'
          ? JSON.parse(compatibleVehicles)
          : compatibleVehicles;
      } catch {
        compatible = compatibleVehicles.split(',').map(v => v.trim()).filter(Boolean);
      }
    }

    const product = new Product({
      name,
      reference,
      category,
      brand: brand || '',
      description: description || '',
      compatibleVehicles: compatible,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      stock: Number(stock) || 0,
      imageUrl,
      images,
      isReconditioned: isReconditioned === 'true' || isReconditioned === true,
      isNewPart: isNewPart === 'true' || isNewPart === true,
      remarque: remarque || '',
    });

    const created = await product.save();
    logger.info(`Produit créé avec succès: ${created.name} (${created.reference})`);
    res.status(201).json(created);
  } catch (error) {
    logger.error('createProduct error:', { error: error.message });
    if (error.code === 11000) {
      return res.status(400).json({ message: `La référence "${error.keyValue?.reference}" existe déjà.` });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la création du produit.' });
  }
};


// @desc    Update a product / Replace image (PUT / PATCH)
// @route   PUT /api/products/:id ou PATCH /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit introuvable.' });
    const fields = ['name', 'reference', 'category', 'brand', 'description',
      'price', 'oldPrice', 'stock', 'isReconditioned', 'isNewPart', 'remarque'];

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        if (f === 'isReconditioned' || f === 'isNewPart') {
          product[f] = req.body[f] === 'true' || req.body[f] === true;
        } else if (f === 'price' || f === 'stock' || f === 'oldPrice') {
          product[f] = req.body[f] !== '' ? Number(req.body[f]) : null;
        } else {
          product[f] = req.body[f];
        }
      }
    });

    if (req.body.compatibleVehicles) {
      try {
        product.compatibleVehicles = typeof req.body.compatibleVehicles === 'string'
          ? JSON.parse(req.body.compatibleVehicles)
          : req.body.compatibleVehicles;
      } catch {
        product.compatibleVehicles = req.body.compatibleVehicles.split(',').map(v => v.trim());
      }
    }

    // Gestion des images existantes à conserver (galerie)
    let retainedImages = product.images || (product.imageUrl ? [product.imageUrl] : []);
    if (req.body.retainedImages !== undefined) {
      try {
        const parsedRetained = JSON.parse(req.body.retainedImages);
        // Suppression des images retirées
        retainedImages.forEach(img => {
          if (!parsedRetained.includes(img)) {
            deleteFileOrCloudinary(img);
          }
        });
        retainedImages = parsedRetained;
      } catch (e) {
        logger.error('Erreur parsing retainedImages:', { error: e.message });
      }
    }

    // Récupération des nouvelles images uploadées vers Cloudinary
    const newUploadedUrls = getUploadedUrls(req);
    if (newUploadedUrls.length > 0) {
      // Si une seule image est envoyée et qu'on ne gère pas retainedImages explicitement, remplacer l'ancienne
      if (req.body.retainedImages === undefined && product.imageUrl) {
        deleteFileOrCloudinary(product.imageUrl);
        retainedImages = [];
      }
      retainedImages = [...retainedImages, ...newUploadedUrls].slice(0, 3);
    } else if (req.body.imageUrl !== undefined) {
      // Mise à jour manuelle de l'URL textuelle
      product.imageUrl = req.body.imageUrl;
      if (!retainedImages.includes(req.body.imageUrl)) {
        retainedImages = [req.body.imageUrl];
      }
    }

    product.images = retainedImages;
    product.imageUrl = retainedImages.length > 0 ? retainedImages[0] : '';

    const updated = await product.save();
    logger.info(`Produit mis à jour: ${updated.name} (${updated.reference})`);
    res.json(updated);
  } catch (error) {
    logger.error('updateProduct error:', { error: error.message });
    if (error.code === 11000) {
      return res.status(400).json({ message: `La référence "${error.keyValue?.reference}" existe déjà.` });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour.' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit introuvable.' });

    // Nettoyage des images associées (Cloudinary ou locales)
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        await deleteFileOrCloudinary(img);
      }
    } else if (product.imageUrl) {
      await deleteFileOrCloudinary(product.imageUrl);
    }

    await Product.deleteOne({ _id: product._id });
    logger.info(`Produit supprimé: ${product.name} (${product.reference})`);
    res.json({ message: 'Produit supprimé avec succès.' });
  } catch (error) {
    logger.error('deleteProduct error:', { error: error.message });
    res.status(500).json({ message: 'Erreur serveur lors de la suppression.' });
  }
};


