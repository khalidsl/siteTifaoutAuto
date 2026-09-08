const mongoose = require('mongoose');
const Sequence = require('./Sequence');

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

// Generate the sequence atomically so concurrent orders cannot share a number.
orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const currentYear = new Date().getFullYear();
    const sequence = await Sequence.findOneAndUpdate(
      { _id: `order:${currentYear}` },
      { $inc: { value: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    this.orderNumber = `CMD-${currentYear}-${String(sequence.value).padStart(6, '0')}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);

