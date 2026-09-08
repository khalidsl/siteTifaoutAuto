const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  reference: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['injecteur', 'pompe', 'capteur', 'joint', 'regulateur', 'valve', 'durite', 'autre'],
  },
  brand: {
    type: String,
    default: '',
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  compatibleVehicles: {
    type: [String],
    default: [],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  oldPrice: {
    type: Number,
    default: null,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  images: {
    type: [String],
    default: [],
  },
  isReconditioned: {
    type: Boolean,
    default: false,
  },
  isNewPart: {
    type: Boolean,
    default: false,
  },
  remarque: {
    type: String,
    default: '',
  },
}, { timestamps: true });

// Text index for search
productSchema.index({ name: 'text', reference: 'text', brand: 'text', description: 'text' });
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);

