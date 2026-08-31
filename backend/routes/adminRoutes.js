const express = require('express');
const router = express.Router();
const { seedAdmin, getAllUsers, updateUser, deleteUser } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Seed the initial admin account
router.post('/seed', seedAdmin);

// User management routes (admin only)
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id', protect, adminOnly, updateUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;
