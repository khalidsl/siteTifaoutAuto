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

    // ── Decrement stock for each item ──────────────────────────────
    for (const item of items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.qty } },
          { returnDocument: 'after' }
        ).catch(err => console.warn('Stock update failed for', item.productId, err.message));
      }
    }

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
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande introuvable.' });
    order.status = req.body.status || order.status;
    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
