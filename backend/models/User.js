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
  },

  password: {
  type: String,
  required: true,
  validate: {
    validator: function (value) {
      // En az 8 karakter, en az bir sayı ve özel karakter içermeli
      return /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/.test(value);
    },
    message:
      'Şifre en az 8 karakter, bir sayı ve bir özel karakter içermelidir.',
  },
}

});

// Şifreyi kaydetmeden önce hash'leyelim
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);
