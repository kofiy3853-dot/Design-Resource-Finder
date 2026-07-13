const { Router } = require('express');
const Gamification = require('../models/Gamification');
const { authenticate } = require('../middleware/auth');

const router = Router();

// Get user achievements
router.get('/', authenticate, async (req, res) => {
  try {
    const achievements = await Gamification.getUserAchievements(req.user.id);
    const stats = await Gamification.getUserStats(req.user.id);
    const streak = await Gamification.getStreak(req.user.id);

    res.json({
      success: true,
      achievements,
      stats,
      streak,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

// Get all available achievements
router.get('/all', (req, res) => {
  try {
    const allAchievements = Object.entries(Gamification.ACHIEVEMENTS).map(([id, data]) => ({
      id,
      ...data,
    }));
    res.json({ success: true, achievements: allAchievements });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

module.exports = router;
