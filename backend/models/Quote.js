const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  quoteNumber: { type: String, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, default: '' },
  email: { type: String, default: '' },
  customerType: {
    type: String,
    enum: ['Particulier', 'Garagiste Pro', 'Transporteur'],
    default: 'Particulier'
  },
  vehicleBrand: { type: String, default: '' },
  vehicleModel: { type: String, default: '' },
  vehicleYear: { type: String, default: '' },
  partCategory: { type: String, default: 'injecteur' },
  partRef: { type: String, default: '' },
  serviceNeeded: {
    type: String,
    enum: ['Réparation / Reconditionnement', 'Achat pièce', 'Test sur banc'],
    default: 'Réparation / Reconditionnement'
  },
  description: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  status: {
    type: String,
    enum: ['En attente', 'En cours de chiffrage', 'Devis envoyé', 'Accepté', 'Refusé'],
    default: 'En attente'
  },
  estimatedPrice: { type: Number, default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

// Auto-generate quote number before save (Mongoose 9: no next() in async hooks)
quoteSchema.pre('save', async function () {
  if (!this.quoteNumber) {
    const count = await this.constructor.countDocuments();
    this.quoteNumber = `DEV-2026-${String(count + 1).padStart(3, '0')}`;
  }
});

module.exports = mongoose.model('Quote', quoteSchema);
