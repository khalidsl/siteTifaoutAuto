const User = require('../models/User');
const logger = require('../utils/logger');

// @desc   Get all registered users (admin)
// @route  GET /api/admin/users
// @access Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    logger.error('getAllUsers error:', { error: error.message });
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

    if (req.body.role) {
      const allowedRoles = ['client', 'admin'];
      if (!allowedRoles.includes(req.body.role)) {
        return res.status(400).json({ message: 'Rôle invalide. Rôles autorisés: client, admin.' });
      }
      user.role = req.body.role;
    }

    if (req.body.discountRate !== undefined) {
      const parsedRate = Number(req.body.discountRate);
      if (Number.isFinite(parsedRate) && parsedRate >= 0 && parsedRate <= 100) {
        user.discountRate = parsedRate;
      }
    }

    if (req.body.loyaltyPoints !== undefined) {
      const parsedPoints = Number(req.body.loyaltyPoints);
      if (Number.isFinite(parsedPoints) && parsedPoints >= 0) {
        user.loyaltyPoints = Math.floor(parsedPoints);
      }
    }

    const updated = await user.save();
    logger.info(`Compte mis à jour par admin: ${updated.email} (rôle: ${updated.role})`);
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
    logger.error('updateUser error:', { error: error.message });
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
    if (req.user && req.user._id && req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Impossible de supprimer votre propre compte administrateur en cours d\'utilisation.' });
    }
    await User.findByIdAndDelete(req.params.id);
    logger.info(`Compte supprimé par admin: ${user.email} (${user._id})`);
    res.json({ message: 'Compte supprimé avec succès.' });
  } catch (error) {
    logger.error('deleteUser error:', { error: error.message });
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

