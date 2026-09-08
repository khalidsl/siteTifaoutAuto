const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Guest or registered user
  isGuest: { type: Boolean, default: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  guestInfo: {
    firstName: { type: String, required: true, maxlength: 60, trim: true },
    lastName: { type: String, required: true, maxlength: 60, trim: true },
    email: { type: String, default: '', maxlength: 120, trim: true },
    phone: { type: String, required: true, maxlength: 30, trim: true },
    address: { type: String, required: true, maxlength: 250, trim: true },
    city: { type: String, required: true, maxlength: 60, trim: true },
    paymentMethod: { type: String, enum: ['especes', 'virement'], default: 'especes' },
  },

  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productName: { type: String, maxlength: 200 },
      productRef: { type: String, maxlength: 100 },
      qty: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
    }
  ],
  total: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['En attente', 'En préparation', 'Payée', 'Expédié', 'Livré', 'Retour', 'Annulé'],
    default: 'En attente'
  },
  stockAdjusted: { type: Boolean, default: false },
  orderNumber: { type: String, unique: true },
}, { timestamps: true });

// Indexation pour optimiser les requêtes fréquentes
orderSchema.index({ user: 1 });
orderSchema.index({ 'guestInfo.email': 1 });
orderSchema.index({ 'guestInfo.phone': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Auto-generate unique order number before save
orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const currentYear = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    const seq = String(count + 1).padStart(4, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `CMD-${currentYear}-${seq}-${random}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);

