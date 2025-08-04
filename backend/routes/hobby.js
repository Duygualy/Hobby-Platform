const express = require('express');
const router = express.Router();
const Hobby = require('../models/Hobby');
const verifyToken = require('../middleware/verifyToken');

router.post('/saveHobby', verifyToken, async (req, res) => {
  const { hobbies } = req.body;

  if (!Array.isArray(hobbies)) {
    return res.status(400).json({ message: 'Hobiler should be array' });
  }

  try {
    let existing = await Hobby.findOne({ user: req.userId });

    if (existing) {
      existing.hobbies = hobbies; 
      await existing.save();
      return res.status(200).json({ message: 'Hobbies updated' });
    } else {
      const newHobby = new Hobby({ user: req.userId, hobbies });
      await newHobby.save();
      return res.status(200).json({ message: 'Hobby list created' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/myHobby', verifyToken, async (req, res) => {
  try {
    const hobby = await Hobby.findOne({ user: req.userId });
    if (!hobby) return res.status(404).json({ message: 'Hobby could not find' });

    res.status(200).json(hobby);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
