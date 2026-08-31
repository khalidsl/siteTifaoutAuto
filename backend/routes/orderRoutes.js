const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, getMyOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', createOrder);                           // Public: guest or logged-in
router.get('/', protect, adminOnly, getAllOrders);        // Admin only
router.get('/my', protect, getMyOrders);                 // Logged-in user
router.put('/:id/status', protect, adminOnly, updateOrderStatus); // Admin only

module.exports = router;
