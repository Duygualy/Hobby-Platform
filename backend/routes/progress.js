const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken); 

router.get('/:hobbySlug', async (req, res) => {
  try {
    const { hobbySlug } = req.params;
    const progress = await Progress.find({ user: req.userId, hobbySlug });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:hobbySlug/:date', async (req, res) => {
  try {
    const { hobbySlug, date } = req.params;
    const record = await Progress.findOne({ user: req.userId, hobbySlug, date });
    res.json({ completed: !!record });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:hobbySlug', async (req, res) => {
  try {
    const { hobbySlug } = req.params;
    const { date } = req.body;

    const exists = await Progress.findOne({ user: req.userId, hobbySlug, date });
    if (!exists) {
      await Progress.create({ user: req.userId, hobbySlug, date });
    }

    res.status(200).json({ message: 'Progress saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

router.delete('/:hobbySlug', async (req, res) => {
  try {
    const { hobbySlug } = req.params;
    const { date } = req.body;

    await Progress.deleteOne({ user: req.userId, hobbySlug, date });
    res.status(200).json({ message: 'Progress removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove progress' });
  }
});

router.get('/:hobbySlug/level', async (req, res) => {
  try {
    const { hobbySlug } = req.params;
    const count = await Progress.countDocuments({ user: req.userId, hobbySlug });

    let level = 1;
    if (count >= 5) level = 2;
    if (count >= 15) level = 3;
    if (count >= 30) level = 4;
    if (count >= 45) level = 5;
    if (count >= 60) level = 6;

    res.json({ level, totalDays: count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate level' });
  }
});

module.exports = router;