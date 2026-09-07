const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc   Create a new order (guest or logged-in)
// @route  POST /api/orders
// @access Public
exports.createOrder = async (req, res) => {
  try {
    const { isGuest, user, guestInfo, items, total } = req.body;
    const order = new Order({ isGuest, user: user || null, guestInfo, items, total });
    const created = await order.save();

    // ── Award loyalty points to registered users (1 pt per 100 MAD) ─
    if (!isGuest && user) {
      const pointsEarned = Math.floor((total || 0) / 100);
      if (pointsEarned > 0) {
        await User.findByIdAndUpdate(
          user,
          { $inc: { loyaltyPoints: pointsEarned } }
        ).catch(err => console.warn('Loyalty points update failed:', err.message));
      }
    }

    res.status(201).json(created);
  } catch (error) {
    console.error(error);
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
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// @desc   Get orders for logged-in user
// @route  GET /api/orders/my
// @access Private
exports.getMyOrders = async (req, res) => {
  try {
    // Cherche les commandes par user ID, email ou téléphone (inclut les commandes invitées)
    const orders = await Order.find({
      $or: [
        { user: req.user._id },
        { 'guestInfo.email': req.user.email },
        { 'guestInfo.phone': req.user.phone },
      ]
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// @desc   Update order status (admin)
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

    // Old orders were already deducted at creation time before stockAdjusted existed.
    const stockAdjusted = existingOrder.stockAdjusted !== undefined ? existingOrder.stockAdjusted : true;
    const shouldDeductStock = nextStatus === 'Payée' && !stockAdjusted;
    const shouldRestoreStock = nextStatus === 'Retour' && stockAdjusted;

    if (shouldDeductStock || shouldRestoreStock) {
      const stockDelta = shouldDeductStock ? -1 : 1;
      if (shouldDeductStock) {
        for (const item of existingOrder.items || []) {
          if (!item.productId || !Number.isFinite(Number(item.qty)) || Number(item.qty) <= 0) continue;
          const product = await Product.findById(item.productId).select('stock').lean();
          if (!product || Number(product.stock) < Number(item.qty)) {
            return res.status(409).json({ message: `Stock insuffisant pour ${item.productName || 'un produit'}.` });
          }
        }
      }

      for (const item of existingOrder.items || []) {
        if (!item.productId || !Number.isFinite(Number(item.qty)) || Number(item.qty) <= 0) continue;
        const product = await Product.findOneAndUpdate(
          { _id: item.productId, ...(shouldDeductStock ? { stock: { $gte: Number(item.qty) } } : {}) },
          { $inc: { stock: stockDelta * Number(item.qty) } },
          { new: true }
        );
        if (!product && shouldDeductStock) {
          return res.status(409).json({ message: `Stock insuffisant pour ${item.productName || 'un produit'}.` });
        }
      }
    }

    const nextStockAdjusted = shouldRestoreStock ? false : shouldDeductStock ? true : stockAdjusted;

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { $set: { status: nextStatus, stockAdjusted: nextStockAdjusted } },
      { returnDocument: 'after', runValidators: false }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }

    return res.json(updated);
  } catch (error) {
    console.error('updateOrderStatus error:', error.message);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};
