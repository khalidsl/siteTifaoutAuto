const User = require('../models/User');

// @desc   Create the default admin account (run once)
// @route  POST /api/admin/seed
// @access Public (to be removed after first use)
exports.seedAdmin = async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    if (existingAdmin) {
      return res.json({ message: 'Admin already exists.' });
    }

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'TIFAOUT',
      email: 'admin@gmail.com',
      phone: '0525200665',
      password: 'admin2026',
      role: 'admin',
    });

    res.status(201).json({ message: 'Admin account created!', email: admin.email });
  } catch (error) {
    console.error('seedAdmin error:', error);
    res.status(500).json({ message: 'Error seeding admin.' });
  }
};

// @desc   Get all registered users (admin)
// @route  GET /api/admin/users
// @access Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ message: 'Erreur serveur lors du chargement des comptes.' });
  }
};

// @desc   Update user role, discount rate, loyalty points (admin)
// @route  PUT /api/admin/users/:id
// @access Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    if (req.body.role) user.role = req.body.role;
    if (req.body.discountRate !== undefined) user.discountRate = Number(req.body.discountRate);
    if (req.body.loyaltyPoints !== undefined) user.loyaltyPoints = Number(req.body.loyaltyPoints);

    const updated = await user.save();
    res.json({
      _id: updated._id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      discountRate: updated.discountRate,
      loyaltyPoints: updated.loyaltyPoints,
    });
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du compte.' });
  }
};

// @desc   Delete a user (admin)
// @route  DELETE /api/admin/users/:id
// @access Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
    if (user.role === 'admin' && user.email === 'admin@gmail.com') {
      return res.status(400).json({ message: 'Impossible de supprimer le compte administrateur principal.' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Compte supprimé avec succès.' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
