const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hobbySlug: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

progressSchema.index({ user: 1, hobbySlug: 1, date: 1 }, { unique: true }); 

module.exports = mongoose.model('Progress', progressSchema);
