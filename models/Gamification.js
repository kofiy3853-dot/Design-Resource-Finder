const pool = require('../config/database');

const Gamification = {
  // Achievement definitions
  ACHIEVEMENTS: {
    first_analysis: {
      name: 'First Step',
      description: 'Complete your first analysis',
      icon: 'play_circle',
    },
    five_analyses: {
      name: 'Getting Started',
      description: 'Complete 5 analyses',
      icon: 'trending_up',
    },
    ten_analyses: { name: 'Design Explorer', description: 'Complete 10 analyses', icon: 'explore' },
    fifty_analyses: { name: 'Design Master', description: 'Complete 50 analyses', icon: 'star' },
    hundred_analyses: { name: 'Legend', description: 'Complete 100 analyses', icon: 'verified' },
    seven_day_streak: {
      name: 'Week Warrior',
      description: 'Analyze for 7 days in a row',
      icon: 'local_fire_department',
    },
    high_accuracy: {
      name: 'Precision Expert',
      description: 'Get 90%+ confidence score',
      icon: 'check_circle',
    },
    collector: { name: 'Collector', description: 'Save 10 analyses', icon: 'bookmark' },
    sharer: { name: 'Sharer', description: 'Share 5 analyses', icon: 'share' },
  },

  async awardAchievement(userId, achievementId) {
    try {
      const achievement = this.ACHIEVEMENTS[achievementId];
      if (!achievement) return null;

      const [existing] = await pool.query(
        'SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
        [userId, achievementId]
      );

      if (existing.length > 0) return null;

      const [result] = await pool.query(
        'INSERT INTO user_achievements (user_id, achievement_id, achievement_name, description, icon_name) VALUES (?, ?, ?, ?, ?)',
        [userId, achievementId, achievement.name, achievement.description, achievement.icon]
      );

      return result.insertId;
    } catch (err) {
      console.error('Award achievement error:', err);
      return null;
    }
  },

  async getUserAchievements(userId) {
    try {
      const [achievements] = await pool.query(
        'SELECT * FROM user_achievements WHERE user_id = ? ORDER BY earned_at DESC',
        [userId]
      );
      return achievements;
    } catch (err) {
      console.error('Get achievements error:', err);
      return [];
    }
  },

  async updateStreak(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [streaks] = await pool.query('SELECT * FROM user_streaks WHERE user_id = ?', [userId]);

      const lastDate = streaks[0]?.last_analysis_date;
      const today_obj = new Date(today);
      const lastDate_obj = lastDate ? new Date(lastDate) : null;
      const yesterday = new Date(today_obj);
      yesterday.setDate(yesterday.getDate() - 1);

      let newStreak = 1;
      if (lastDate_obj) {
        if (lastDate === today) {
          newStreak = streaks[0].current_streak;
        } else if (
          lastDate_obj.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]
        ) {
          newStreak = streaks[0].current_streak + 1;
        }
      }

      const longestStreak = Math.max(streaks[0]?.longest_streak || 0, newStreak);

      if (streaks.length > 0) {
        await pool.query(
          'UPDATE user_streaks SET current_streak = ?, longest_streak = ?, last_analysis_date = ? WHERE user_id = ?',
          [newStreak, longestStreak, today, userId]
        );
      } else {
        await pool.query(
          'INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_analysis_date) VALUES (?, ?, ?, ?)',
          [userId, newStreak, longestStreak, today]
        );
      }

      return { current_streak: newStreak, longest_streak: longestStreak };
    } catch (err) {
      console.error('Update streak error:', err);
      return null;
    }
  },

  async getStreak(userId) {
    try {
      const [streaks] = await pool.query('SELECT * FROM user_streaks WHERE user_id = ?', [userId]);
      return streaks[0] || { current_streak: 0, longest_streak: 0, last_analysis_date: null };
    } catch (err) {
      console.error('Get streak error:', err);
      return { current_streak: 0, longest_streak: 0 };
    }
  },

  async updateUserStats(userId) {
    try {
      const [[stats]] = await pool.query(
        `SELECT 
          COUNT(*) as total_analyses,
          AVG(confidence_score) as avg_confidence_score
         FROM analyses WHERE user_id = ? AND status = 'completed'`,
        [userId]
      );

      const [saved] = await pool.query(
        'SELECT COUNT(*) as count FROM saved_items WHERE user_id = ?',
        [userId]
      );

      const existing = await pool.query('SELECT id FROM user_stats WHERE user_id = ?', [userId]);

      const updateData = {
        total_analyses: stats.total_analyses || 0,
        total_favorites: saved[0].count || 0,
        avg_confidence_score: stats.avg_confidence_score || null,
      };

      if (existing[0].length > 0) {
        await pool.query(
          'UPDATE user_stats SET total_analyses = ?, total_favorites = ?, avg_confidence_score = ?, updated_at = NOW() WHERE user_id = ?',
          [
            updateData.total_analyses,
            updateData.total_favorites,
            updateData.avg_confidence_score,
            userId,
          ]
        );
      } else {
        await pool.query(
          'INSERT INTO user_stats (user_id, total_analyses, total_favorites, avg_confidence_score) VALUES (?, ?, ?, ?)',
          [
            userId,
            updateData.total_analyses,
            updateData.total_favorites,
            updateData.avg_confidence_score,
          ]
        );
      }

      return updateData;
    } catch (err) {
      console.error('Update stats error:', err);
      return null;
    }
  },

  async getUserStats(userId) {
    try {
      const [stats] = await pool.query('SELECT * FROM user_stats WHERE user_id = ?', [userId]);
      return stats[0] || { total_analyses: 0, total_favorites: 0, avg_confidence_score: 0 };
    } catch (err) {
      console.error('Get stats error:', err);
      return { total_analyses: 0, total_favorites: 0 };
    }
  },

  async checkAndAwardAchievements(userId) {
    try {
      const stats = await this.getUserStats(userId);
      const achievements = [];

      // Check achievement criteria
      if (stats.total_analyses === 1) achievements.push('first_analysis');
      if (stats.total_analyses === 5) achievements.push('five_analyses');
      if (stats.total_analyses === 10) achievements.push('ten_analyses');
      if (stats.total_analyses === 50) achievements.push('fifty_analyses');
      if (stats.total_analyses === 100) achievements.push('hundred_analyses');
      if (stats.total_favorites === 10) achievements.push('collector');

      const streak = await this.getStreak(userId);
      if (streak.current_streak === 7) achievements.push('seven_day_streak');

      // Award new achievements
      const awarded = [];
      for (const achievementId of achievements) {
        const result = await this.awardAchievement(userId, achievementId);
        if (result) awarded.push(achievementId);
      }

      return awarded;
    } catch (err) {
      console.error('Check achievements error:', err);
      return [];
    }
  },
};

module.exports = Gamification;
