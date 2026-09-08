const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, maxlength: 60, trim: true },
  lastName: { type: String, required: true, maxlength: 60, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, maxlength: 120, trim: true },
  phone: { type: String, required: true, maxlength: 30, trim: true },
  vehicleBrand: { type: String, default: '', maxlength: 100, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
  loyaltyPoints: { type: Number, default: 0, min: 0 },
  discountRate: { type: Number, default: 5, min: 0, max: 100 },
}, { timestamps: true });

userSchema.index({ phone: 1 });


// Hash password before saving (Mongoose 9 async middleware — do NOT call next())
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
