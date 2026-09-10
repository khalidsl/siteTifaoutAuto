const express = require('express');
const router = express.Router();
const { register, login, googleLogin, getMe, refreshToken, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleLogin);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;

