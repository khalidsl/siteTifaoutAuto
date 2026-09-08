const express = require('express');
const router = express.Router();
const { register, login, getMe, refreshToken } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);

module.exports = router;
