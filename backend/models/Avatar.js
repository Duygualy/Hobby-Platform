const mongoose = require('mongoose');

const AvatarSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  skintone: {
    type: String,
  },

  hair: {
    type: String,
  },

  eyes: {
    type: String,
  },

  lips: {
    type: String,
    },

  top: {
    type: String,
  },

  bottom: {
    type: String,
  },
});

module.exports = mongoose.model('Avatar', AvatarSchema);
