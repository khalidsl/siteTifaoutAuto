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

// ─── CORS configuration ──────────────────────────────────────────
const corsOptions = {
  origin: true, // Reflect request origin to allow Vercel, localhost, and custom domains
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
};

app.use(cors(corsOptions));

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
app.get('/', (req, res) => res.json({ status: 'OK', message: 'TIFAOUT AUTO API running' }));
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'TIFAOUT AUTO API running' }));

// ─── Start HTTP Server immediately for Railway / Cloud hosts ─────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ─── Connexion à MongoDB Atlas ───────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.warn('⚠️ MONGO_URI non défini dans les variables d\'environnement.');
} else {
  mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  })
    .then(() => {
      console.log('✅ MongoDB Atlas Connected successfully');
    })
    .catch((err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
      console.error('⚠️ Veuillez vérifier votre URI MongoDB Atlas et l\'accès IP (0.0.0.0/0).');
    });
}
