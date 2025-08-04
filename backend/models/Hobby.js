const mongoose = require('mongoose');

const HobbySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  hobbies: {
    type: [String], 
    default: [],
  },
});

module.exports = mongoose.model('Hobby', HobbySchema);
