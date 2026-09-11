const mongoose = require("mongoose");

/**
 * RefreshToken - liste des sessions actives.
 * Chaque connexion reussie cree une entree.
 * A la deconnexion ou au refresh, l entree est revoquee.
 * L index TTL supprime automatiquement les sessions expirees.
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    revoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

refreshTokenSchema.statics.hashToken = function (token) {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(token).digest("hex");
};

refreshTokenSchema.statics.createSession = async function (userId, token, ttlMs) {
  const hash = this.hashToken(token);
  const expiresAt = new Date(Date.now() + ttlMs);
  await this.findOneAndUpdate(
    { tokenHash: hash },
    { userId, tokenHash: hash, expiresAt, revoked: false },
    { upsert: true, new: true }
  );
};

refreshTokenSchema.statics.revokeSession = async function (token) {
  const hash = this.hashToken(token);
  await this.findOneAndUpdate({ tokenHash: hash }, { revoked: true });
};

refreshTokenSchema.statics.revokeAllSessions = async function (userId) {
  await this.updateMany({ userId, revoked: false }, { revoked: true });
};

refreshTokenSchema.statics.isValid = async function (token) {
  const hash = this.hashToken(token);
  const session = await this.findOne({ tokenHash: hash });
  if (!session) return false;
  if (session.revoked) return false;
  if (session.expiresAt < new Date()) return false;
  return true;
};

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
