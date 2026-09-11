const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const logger = require('./utils/logger');

dotenv.config();

const app = express();

// ─── Sécurité : En-têtes HTTP avec Helmet & masque Express ────────
app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permet le chargement d'images statiques et Cloudinary
}));

// ─── CORS restreint aux domaines officiels ────────────────────────
const allowedOrigins = [
  'https://site-tifaout-auto-4wtk.vercel.app',
  'https://tifaoutauto.ma',
  'http://localhost:5173',
  'http://localhost:8443',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`Requête rejetée par politique CORS : origine [${origin}] non autorisée.`);
      callback(new Error('Origine non autorisée par la politique CORS.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// ─── Journalisation structurée des requêtes entrantes ──────────────
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, { ip: req.ip });
  next();
});

// Dossier d'uploads local (fallback d'images si nécessaire)
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// ─── Routes de l'API ───────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/quotes', require('./routes/quoteRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Contrôles de santé
app.get('/', (req, res) => res.json({ status: 'OK', message: 'TIFAOUT AUTO API running' }));
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'TIFAOUT AUTO API running' }));

// ─── Middleware global de gestion des erreurs Express ──────────────
// Doit être enregistré EN DERNIER, après toutes les routes.
app.use(require('./middleware/errorHandler'));

// ─── Démarrage immédiat du serveur HTTP (compatible Railway / Cloud) 
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Serveur actif et en écoute sur le port ${PORT}`);
});

// ─── Connexion MongoDB Atlas ───────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  logger.warn('⚠️ MONGO_URI non défini dans les variables d\'environnement.');
} else {
  mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  })
    .then(() => {
      logger.info('✅ MongoDB Atlas connecté avec succès.');
    })
    .catch((err) => {
      logger.error(`❌ Erreur de connexion MongoDB: ${err.message}`, { stack: err.stack });
    });
}
