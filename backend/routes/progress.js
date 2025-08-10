const express = require('express');
const router = express.Router();

const Progress = require('../models/Progress');       // { user, hobbySlug, date: 'YYYY-MM-DD', isGolden?: Boolean }
const Goal = require('../models/Goal');               // { user, hobbySlug, weeklyTarget?: Number }
const Achievement = require('../models/Achievement'); // { user, hobbySlug, code: 'DAYS_5' | 'DAYS_15' ... }

const verifyToken = require('../middlewares/verifyToken');
router.use(verifyToken);

/* ---------- Helpers ---------- */
function startOfISOWeek(date) {
  const x = new Date(date);
  const day = (x.getDay() + 6) % 7; // Monday=0
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}
function endOfISOWeek(date) {
  const s = startOfISOWeek(date);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}
function parseYMD(dStr) {
  const [Y, M, D] = dStr.split('-').map(Number);
  // JS month index: 0-based
  return new Date(Y, M - 1, D, 12, 0, 0, 0); // 12:00 → TZ kaymalarını minimize etmek için
}

/* ---------- List all progress for a hobby ---------- */
// GET /api/progress/:hobbySlug
router.get('/:hobbySlug', async (req, res) => {
  try {
    const { hobbySlug } = req.params;
    const items = await Progress.find(
      { user: req.userId, hobbySlug },
      'date isGolden'
    ).sort({ date: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Listeleme başarısız' });
  }
});

/* ---------- Check specific date ---------- */
// GET /api/progress/:hobbySlug/:date
router.get('/:hobbySlug/:date', async (req, res) => {
  try {
    const { hobbySlug, date } = req.params;
    const doc = await Progress.findOne({ user: req.userId, hobbySlug, date });
    res.json({ completed: !!doc, isGolden: doc?.isGolden === true });
  } catch (err) {
    res.status(500).json({ error: 'Kayıt sorgulama başarısız' });
  }
});

/* ---------- Create (mark completed) ---------- */
// POST /api/progress/:hobbySlug  body: { date: 'YYYY-MM-DD' }
router.post('/:hobbySlug', async (req, res) => {
  try {
    const { hobbySlug } = req.params;
    const { date } = req.body;
    if (!date) return res.status(400).json({ error: 'date zorunlu' });

    let created = false;
    const exists = await Progress.findOne({ user: req.userId, hobbySlug, date });
    if (!exists) {
      await Progress.create({ user: req.userId, hobbySlug, date, isGolden: false });
      created = true;
    }

    // Achievements sadece ilk kez gün eklendiğinde
    if (created) {
      const count = await Progress.countDocuments({ user: req.userId, hobbySlug });
      const thresholds = [5, 15, 30, 45, 60];
      for (const t of thresholds) {
        if (count >= t) {
          const code = `DAYS_${t}`;
          await Achievement.updateOne(
            { user: req.userId, hobbySlug, code },
            { $setOnInsert: { user: req.userId, hobbySlug, code } },
            { upsert: true }
          );
        }
      }
    }

    res.json({ ok: true, created });
  } catch (err) {
    res.status(500).json({ error: 'Kayıt oluşturma başarısız' });
  }
});

/* ---------- Toggle/set golden day ---------- */
// PATCH /api/progress/:hobbySlug/golden  body: { date: 'YYYY-MM-DD', isGolden: true|false }
router.patch('/:hobbySlug/golden', async (req, res) => {
  try {
    const { hobbySlug } = req.params;
    const { date, isGolden } = req.body;
    if (!date || typeof isGolden !== 'boolean') {
      return res.status(400).json({ error: 'date ve isGolden zorunlu' });
    }

    const doc = await Progress.findOneAndUpdate(
      { user: req.userId, hobbySlug, date },
      { $set: { isGolden } },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ error: 'Gün bulunamadı' });
    }
    res.json({ ok: true, isGolden: doc.isGolden });
  } catch (err) {
    res.status(500).json({ error: 'Golden gün güncelleme başarısız' });
  }
});

/* ---------- Weekly summary ---------- */
// GET /api/progress/:hobbySlug/weekly
router.get('/:hobbySlug/weekly', async (req, res) => {
  try {
    const { hobbySlug } = req.params;
    const all = await Progress.find(
      { user: req.userId, hobbySlug },
      'date'
    );

    const now = new Date();
    const start = startOfISOWeek(now);
    const end = endOfISOWeek(now);

    const completedThisWeek = all.reduce((acc, x) => {
      const d = parseYMD(x.date);
      return acc + (d >= start && d <= end ? 1 : 0);
    }, 0);

    const g = await Goal.findOne({ user: req.userId, hobbySlug });
    const weeklyTarget = typeof g?.weeklyTarget === 'number' ? g.weeklyTarget : 3;

    res.json({ weeklyTarget, completedThisWeek });
  } catch (err) {
    res.status(500).json({ error: 'Haftalık özet başarısız' });
  }
});

/* ---------- List achievements ---------- */
// GET /api/progress/:hobbySlug/achievements
router.get('/:hobbySlug/achievements', async (req, res) => {
  try {
    const { hobbySlug } = req.params;
    const items = await Achievement.find({ user: req.userId, hobbySlug }).sort({ code: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Başarımlar listelenemedi' });
  }
});

module.exports = router;
