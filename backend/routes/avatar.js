const express = require('express');
const router = express.Router();
const Avatar = require('../models/Avatar');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gizlisir';

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: 'Token eksik' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token geçersiz' });
  }
}

router.post('/save', verifyToken, async (req, res) => {
  const { hair, eyes, lips, top, bottom, skintone } = req.body;

  try {
    let avatar = await Avatar.findOne({ user: req.userId });

    if (avatar) {
      avatar.hair = hair;
      avatar.eyes = eyes;
      avatar.lips= lips;
      avatar.top = top;
      avatar.bottom = bottom;
      avatar.skintone = skintone;
      await avatar.save();
    } else {
      // Yeni oluştur
      avatar = new Avatar({ user: req.userId, hair, eyes, lips, top, bottom, skintone });
      await avatar.save();
    }

    res.status(200).json({ message: 'Avatar kaydedildi', avatar });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const avatar = await Avatar.findOne({ user: req.userId });
    if (!avatar) return res.status(404).json({ message: 'Avatar bulunamadı' });

    res.status(200).json(avatar);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
});

module.exports = router;
