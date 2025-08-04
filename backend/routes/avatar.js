const express = require('express');
const router = express.Router();
const Avatar = require('../models/Avatar');
const verifyToken = require('../middleware/verifyToken');

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
      avatar = new Avatar({ user: req.userId, hair, eyes, lips, top, bottom, skintone });
      await avatar.save();
    }

    res.status(200).json({ message: 'Avatar saved', avatar });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const avatar = await Avatar.findOne({ user: req.userId });
    if (!avatar) return res.status(404).json({ message: 'Avatar could not find' });

    res.status(200).json(avatar);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
