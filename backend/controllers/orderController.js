const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc   Create a new order (guest or logged-in)
// @route  POST /api/orders
// @access Public
exports.createOrder = async (req, res) => {
  try {
    const { isGuest, guestInfo, items } = req.body;

    // 1. ─── Vérification et authentification du compte ───────────────
    let verifiedUserId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) verifiedUserId = user._id;
      } catch (err) {
        logger.warn('Token fourni invalide lors de la création de commande', { error: err.message });
      }
    }

    const orderIsGuest = isGuest !== false;
    if (!orderIsGuest && !verifiedUserId) {
      return res.status(401).json({
        message: 'Authentification requise pour passer une commande avec votre compte client.',
      });
    }

    // 2. ─── Validation des articles et recalcul strict des prix ───────
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Votre panier ne contient aucun article.' });
    }

    const verifiedItems = [];
    let computedSubtotal = 0;

    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({ message: 'Identifiant de produit manquant.' });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          message: `Produit introuvable en base de données : ${item.productName || item.productId}`,
        });
      }

      const qty = Math.max(1, parseInt(item.qty, 10) || 1);
      const realPrice = Number(product.price);
      if (!Number.isFinite(realPrice) || realPrice < 0) {
        return res.status(400).json({ message: `Prix invalide pour le produit ${product.name}.` });
      }

      verifiedItems.push({
        productId: product._id,
        productName: product.name,
        productRef: product.reference || '',
        qty,
        price: realPrice,
      });

      computedSubtotal += realPrice * qty;
    }

    // Calcul des frais de livraison : gratuit au-delà de 2000 MAD, sinon 50 MAD
    const shipping = computedSubtotal > 2000 ? 0 : 50;
    const computedTotal = computedSubtotal + shipping;

    // 3. ─── Enregistrement de la commande avec prix vérifiés ──────────
    const order = new Order({
      isGuest: orderIsGuest,
      user: orderIsGuest ? null : verifiedUserId,
      guestInfo,
      items: verifiedItems,
      total: computedTotal,
    });

    const created = await order.save();
    logger.info(`Commande créée avec succès : ${created.orderNumber || created._id}`, {
      orderId: created._id,
      total: computedTotal,
      isGuest: orderIsGuest,
    });

    // 4. ─── Points de fidélité pour les utilisateurs enregistrés ──────
    if (!orderIsGuest && verifiedUserId) {
      const pointsEarned = Math.floor(computedTotal / 100);
      if (pointsEarned > 0) {
        await User.findByIdAndUpdate(
          verifiedUserId,
          { $inc: { loyaltyPoints: pointsEarned } }
        ).catch(err => logger.warn('Échec mise à jour points fidélité:', { error: err.message }));
      }
    }

    res.status(201).json(created);
  } catch (error) {
    logger.error('Erreur createOrder:', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Erreur lors de la création de la commande.' });
  }
};

// @desc   Get all orders (admin)
// @route  GET /api/orders
// @access Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    logger.error('Erreur getAllOrders:', { error: error.message });
    res.status(500).json({ message: 'Erreur serveur lors du chargement des commandes.' });
  }
};

// @desc   Get orders for logged-in user
// @route  GET /api/orders/my
// @access Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { user: req.user._id },
        { 'guestInfo.email': req.user.email },
        { 'guestInfo.phone': req.user.phone },
      ]
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    logger.error('Erreur getMyOrders:', { error: error.message });
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// @desc   Update order status (admin) avec gestion atomique / transactionnelle du stock
// @route  PUT /api/orders/:id/status
// @access Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const bodyStatus = typeof req.body === 'string' ? req.body : req.body?.status;
    const rawStatus = bodyStatus ?? req.query?.status;
    const nextStatus = typeof rawStatus === 'string' ? rawStatus.trim() : '';

    const allowedStatuses = ['En attente', 'En préparation', 'Payée', 'Expédié', 'Livré', 'Retour', 'Annulé'];
    if (!allowedStatuses.includes(nextStatus)) {
      return res.status(400).json({ message: 'Statut de commande invalide.' });
    }

    const existingOrder = await Order.findById(orderId).lean();
    if (!existingOrder) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }

    const stockAdjusted = existingOrder.stockAdjusted !== undefined ? existingOrder.stockAdjusted : true;
    const shouldDeductStock = nextStatus === 'Payée' && !stockAdjusted;
    const shouldRestoreStock = nextStatus === 'Retour' && stockAdjusted;

    // Déduction / Restauration atomique avec support de transaction Mongoose
    if (shouldDeductStock || shouldRestoreStock) {
      const stockDelta = shouldDeductStock ? -1 : 1;

      // Vérification préalable des stocks disponibles
      if (shouldDeductStock) {
        for (const item of existingOrder.items || []) {
          if (!item.productId || !Number.isFinite(Number(item.qty)) || Number(item.qty) <= 0) continue;
          const product = await Product.findById(item.productId).select('stock name').lean();
          if (!product || Number(product.stock) < Number(item.qty)) {
            return res.status(409).json({
              message: `Stock insuffisant pour ${product?.name || item.productName || 'un produit'}.`,
            });
          }
        }
      }

      // Tentative de transaction Mongoose (idéal pour MongoDB Atlas replica set)
      let transactionSupported = true;
      let session = null;
      try {
        session = await mongoose.startSession();
        await session.withTransaction(async () => {
          for (const item of existingOrder.items || []) {
            if (!item.productId || !Number.isFinite(Number(item.qty)) || Number(item.qty) <= 0) continue;
            const updatedProduct = await Product.findOneAndUpdate(
              {
                _id: item.productId,
                ...(shouldDeductStock ? { stock: { $gte: Number(item.qty) } } : {}),
              },
              { $inc: { stock: stockDelta * Number(item.qty) } },
              { session, new: true }
            );

            if (!updatedProduct && shouldDeductStock) {
              throw new Error(`Stock insuffisant en cours de transaction pour ${item.productName || 'un article'}.`);
            }
          }

          const nextStockAdjusted = shouldRestoreStock ? false : shouldDeductStock ? true : stockAdjusted;
          await Order.findByIdAndUpdate(
            orderId,
            { $set: { status: nextStatus, stockAdjusted: nextStockAdjusted } },
            { session }
          );
        });
      } catch (transErr) {
        // Détecte si le moteur ne supporte pas les transactions (ex: standalone local)
        if (transErr.message?.includes('Transaction numbers are only allowed') || transErr.message?.includes('replica set')) {
          transactionSupported = false;
        } else {
          logger.error('Erreur transactionnelle:', { error: transErr.message });
          return res.status(409).json({ message: transErr.message || 'Erreur lors de la mise à jour des stocks.' });
        }
      } finally {
        if (session) session.endSession();
      }

      // Fallback robuste pour standalone sans replica set
      if (!transactionSupported) {
        const rollbackActions = [];
        try {
          for (const item of existingOrder.items || []) {
            if (!item.productId || !Number.isFinite(Number(item.qty)) || Number(item.qty) <= 0) continue;
            const updated = await Product.findOneAndUpdate(
              {
                _id: item.productId,
                ...(shouldDeductStock ? { stock: { $gte: Number(item.qty) } } : {}),
              },
              { $inc: { stock: stockDelta * Number(item.qty) } },
              { new: true }
            );

            if (!updated && shouldDeductStock) {
              // Rollback des éléments déjà décrémentés
              for (const rb of rollbackActions) {
                await Product.findByIdAndUpdate(rb.productId, { $inc: { stock: -rb.qty } });
              }
              return res.status(409).json({
                message: `Stock insuffisant pour ${item.productName || 'un produit'}.`,
              });
            }
            rollbackActions.push({ productId: item.productId, qty: stockDelta * Number(item.qty) });
          }

          const nextStockAdjusted = shouldRestoreStock ? false : shouldDeductStock ? true : stockAdjusted;
          const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { $set: { status: nextStatus, stockAdjusted: nextStockAdjusted } },
            { returnDocument: 'after', runValidators: false }
          );
          return res.json(updatedOrder);
        } catch (fbErr) {
          logger.error('Erreur mise à jour stock fallback:', { error: fbErr.message });
          return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour des stocks.' });
        }
      }
    } else {
      // Simple mise à jour de statut (sans impact sur les stocks)
      await Order.findByIdAndUpdate(
        orderId,
        { $set: { status: nextStatus } },
        { runValidators: false }
      );
    }

    const updated = await Order.findById(orderId);
    if (!updated) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }

    logger.info(`Statut commande mis à jour: ${orderId} -> ${nextStatus}`);
    return res.json(updated);
  } catch (error) {
    logger.error('updateOrderStatus error:', { error: error.message });
    return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du statut.' });
  }
};
