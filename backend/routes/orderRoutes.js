const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, getMyOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { orderLimiter } = require('../middleware/rateLimiter');

router.post('/', orderLimiter, createOrder);              // Public: guest or logged-in + rate limit
router.get('/', protect, adminOnly, getAllOrders);        // Admin only
router.get('/my', protect, getMyOrders);                 // Logged-in user
router.put('/:id/status', protect, adminOnly, updateOrderStatus); // Admin only

module.exports = router;

