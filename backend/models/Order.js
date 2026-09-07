const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Guest or registered user
  isGuest: { type: Boolean, default: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  guestInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    paymentMethod: { type: String, enum: ['especes', 'virement'], default: 'especes' },
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productName: { type: String },
      productRef: { type: String },
      qty: { type: Number, required: true },
      price: { type: Number, required: true },
    }
  ],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['En attente', 'En préparation', 'Payée', 'Expédié', 'Livré', 'Retour', 'Annulé'],
    default: 'En attente'
  },
  stockAdjusted: { type: Boolean, default: false },
  orderNumber: { type: String, unique: true },
}, { timestamps: true });

// Auto-generate order number before save (Mongoose 9: no next() in async hooks)


orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    
    const currentYear = new Date().getFullYear();
    this.orderNumber = `CMD-${currentYear}-${String(count + 1).padStart(3, '0')}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);
