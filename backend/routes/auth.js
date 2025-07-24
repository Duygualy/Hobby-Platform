const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'gizlisir';


// REGISTER
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Bu email zaten kayıtlı.' });

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: 'Kayıt başarılı!' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});


// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Kullanıcı bulunamadı' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Şifre hatalı' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});

module.exports = router;
