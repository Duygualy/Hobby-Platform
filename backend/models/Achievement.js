const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hobbySlug: { type: String, required: true },
  code: { type: String, required: true }, // e.g., "DAYS_5", "DAYS_15", ...
  earnedAt: { type: Date, default: Date.now }
});
achievementSchema.index({ user: 1, hobbySlug: 1, code: 1 }, { unique: true });
module.exports = mongoose.model('Achievement', achievementSchema);
