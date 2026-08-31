const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// ─── Security headers ────────────────────────────────────────────
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// ─── CORS — whitelist Vite dev + production ─────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:8443',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8443',
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile, server-to-server)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Ensure uploads folder exists in the frontend public directory
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded images as static files
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/quotes', require('./routes/quoteRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'TIFAOUT AUTO API running' }));

// Connexion à MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  family: 4, // Force IPv4 to prevent Windows DNS resolution issues
})
  .then(() => {
    console.log('✅ MongoDB Atlas Connected successfully');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📦 API Products: http://localhost:${PORT}/api/products`);
    });
  })
  .catch((err) => {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    console.error('⚠️  Veuillez configurer votre URI MongoDB Atlas dans le fichier backend/.env');
    process.exit(1);
  });
