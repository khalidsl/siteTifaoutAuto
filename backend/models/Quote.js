const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  quoteNumber: { type: String, unique: true },
  name: { type: String, required: true, maxlength: 100, trim: true },
  phone: { type: String, required: true, maxlength: 30, trim: true },
  city: { type: String, default: '', maxlength: 100, trim: true },
  email: { type: String, default: '', maxlength: 120, trim: true },
  customerType: {
    type: String,
    enum: ['Particulier', 'Garagiste Pro', 'Transporteur'],
    default: 'Particulier'
  },
  vehicleBrand: { type: String, default: '', maxlength: 100, trim: true },
  vehicleModel: { type: String, default: '', maxlength: 100, trim: true },
  vehicleYear: { type: String, default: '', maxlength: 10, trim: true },
  partCategory: { type: String, default: 'injecteur', maxlength: 50 },
  partRef: { type: String, default: '', maxlength: 100, trim: true },
  serviceNeeded: {
    type: String,
    enum: ['Réparation / Reconditionnement', 'Achat pièce', 'Test sur banc'],
    default: 'Réparation / Reconditionnement'
  },
  description: { type: String, default: '', maxlength: 2000, trim: true },
  photoUrl: { type: String, default: '', maxlength: 1000 },
  status: {
    type: String,
    enum: ['En attente', 'En cours de chiffrage', 'Devis envoyé', 'Accepté', 'Refusé'],
    default: 'En attente'
  },
  estimatedPrice: { type: Number, default: null, min: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

// Indexation pour optimiser les filtres et recherches
quoteSchema.index({ user: 1 });
quoteSchema.index({ email: 1 });
quoteSchema.index({ phone: 1 });
quoteSchema.index({ status: 1 });
quoteSchema.index({ createdAt: -1 });

// Auto-generate quote number before save (Mongoose 9: no next() in async hooks)
quoteSchema.pre('save', async function () {
  if (!this.quoteNumber) {
    const currentYear = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    const seq = String(count + 1).padStart(4, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.quoteNumber = `DEV-${currentYear}-${seq}-${random}`;
  }
});

module.exports = mongoose.model('Quote', quoteSchema);

