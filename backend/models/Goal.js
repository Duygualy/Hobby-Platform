const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hobbySlug: { type: String, required: true },
  weeklyTarget: { type: Number, default: 3 }
}, { timestamps: true });

goalSchema.index({ user: 1, hobbySlug: 1 }, { unique: true });

module.exports = mongoose.model('Goal', goalSchema);
