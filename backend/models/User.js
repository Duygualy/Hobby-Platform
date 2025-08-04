const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address.'],
  },

  password: {
  type: String,
  required: true,
  validate: {
    validator: function (value) {
      return /^(?=.*[0-9])(?=.*[!@#$%^&*._,;:-])(?=.{8,})/.test(value);
    },
    message:
      '+8 characters, numbers and special characters.',
  },
}

});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);
