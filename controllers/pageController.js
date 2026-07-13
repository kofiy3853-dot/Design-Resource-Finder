const Analysis = require('../models/Analysis');
const Gamification = require('../models/Gamification');
const pool = require('../config/database');

exports.home = (req, res) => {
  res.render('index', {
    title: 'Design Resource Finder - AI-Powered Design Analysis',
    user: req.user || null,
  });
};

exports.features = (req, res) => {
  res.render('features', { title: 'Features - Design Resource Finder', user: req.user || null });
};

exports.howItWorks = (req, res) => {
  res.render('how-it-works', {
    title: 'How It Works - Design Resource Finder',
    user: req.user || null,
  });
};

exports.showcase = (req, res) => {
  res.render('showcase', {
    title: 'Community Gallery - Design Resource Finder',
    user: req.user || null,
  });
};

exports.dashboard = exports.dashboardV2;

exports.upload = async (req, res) => {
  try {
    const { analyses: recentAnalyses } = await Analysis.findByUser(req.user.id, 1, 6);
    res.render('upload', { title: 'Upload Design', user: req.user, recentAnalyses });
  } catch (_) {
    res.render('upload', { title: 'Upload Design', user: req.user, recentAnalyses: [] });
  }
};

exports.history = exports.historyV2;

exports.analysis = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res
        .status(404)
        .render('error', { title: 'Not Found', message: 'Analysis not found', user: req.user });
    }
    // Allow demo users to view any analysis, otherwise check ownership
    if (analysis.user_id !== req.user.id && req.user.role !== 'admin' && !req.user.demo) {
      return res
        .status(403)
        .render('error', { title: 'Forbidden', message: 'Access denied', user: req.user });
    }
    
    // Check if AI data exists
    const hasAiData = !!(analysis.fonts || analysis.typography || analysis.layout || analysis.design_style);
    
    res.render('analysis', { title: 'Analysis Results', user: req.user, analysis, aiResult: hasAiData });
  } catch (err) {
    console.error('Analysis error:', err);
    res
      .status(500)
      .render('error', { title: 'Error', message: 'Failed to load analysis', user: req.user });
  }
};

exports.learning = async (req, res) => {
  try {
    const [lessons] = await pool.query(
      'SELECT * FROM learning_lessons WHERE is_published = 1 ORDER BY order_index ASC'
    );
    res.render('learning', { title: 'Learning Center', user: req.user, lessons });
  } catch (err) {
    console.error('Learning error (DB unavailable, showing static content):', err.message);
    res.render('learning', { title: 'Learning Center', user: req.user, lessons: [] });
  }
};

exports.reports = async (req, res) => {
  try {
    const [reports] = await pool.query(
      `SELECT r.*, a.title as analysis_title
       FROM reports r
       JOIN analyses a ON r.analysis_id = a.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.render('reports', { title: 'My Reports', user: req.user, reports });
  } catch (err) {
    console.error('Reports error:', err);
    res
      .status(500)
      .render('error', { title: 'Error', message: 'Failed to load reports', user: req.user });
  }
};

exports.saved = async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT s.*, a.title as analysis_title, a.status, a.created_at as analysis_date
       FROM saved_items s
       JOIN analyses a ON s.analysis_id = a.id
       WHERE s.user_id = ? AND s.item_type = 'analysis'
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    res.render('saved', { title: 'Saved Items', user: req.user, items });
  } catch (err) {
    res
      .status(500)
      .render('error', { title: 'Error', message: 'Failed to load saved items', user: req.user });
  }
};

exports.profile = async (req, res) => {
  const User = require('../models/User');
  const user = await User.findById(req.user.id);
  res.render('profile', { title: 'Profile', user });
};

exports.settings = (req, res) => {
  res.render('settings', { title: 'Settings', user: req.user });
};

exports.search = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.render('search', { title: 'Search', user: req.user, results: [], query: '' });
    }
    const results = await Analysis.search(req.user.id, query);
    res.render('search', { title: 'Search Results', user: req.user, results, query });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).render('error', { title: 'Error', message: 'Search failed', user: req.user });
  }
};

exports.achievements = async (req, res) => {
  try {
    const achievements = await Gamification.getUserAchievements(req.user.id);
    const stats = await Gamification.getUserStats(req.user.id);
    const streak = await Gamification.getStreak(req.user.id);

    res.render('achievements', {
      title: 'Achievements',
      user: req.user,
      achievements,
      stats,
      streak,
    });
  } catch (err) {
    console.error('Achievements error:', err);
    res
      .status(500)
      .render('error', { title: 'Error', message: 'Failed to load achievements', user: req.user });
  }
};

exports.aiDesignAnalysis = (req, res) => {
  res.render('ai-design-analysis', {
    title: 'AI Design Analysis - Design Resource Finder',
    user: req.user || null,
  });
};

exports.faq = (req, res) => {
  res.render('faq', {
    title: 'Frequently Asked Questions - Design Resource Finder',
    user: req.user || null,
  });
};

exports.historyV2 = async (req, res) => {
  try {
    let analyses = [];
    const [rows] = await pool.query(
      'SELECT a.*, u.filename, u.original_name FROM analyses a LEFT JOIN uploads u ON a.upload_id = u.id WHERE a.user_id = ? ORDER BY a.created_at DESC LIMIT 50', [req.user.id]
    );
    analyses = rows;

    res.render('history-v2', {
      title: 'Analysis History - Design Resource Finder',
      user: req.user || null,
      analyses,
    });
  } catch (err) {
    console.error('History v2 error:', err);
    res.status(500).render('error', { title: 'Error', message: 'Failed to load history', user: req.user });
  }
};

exports.dashboardV2 = async (req, res) => {
  try {
    const data = {
      title: 'Dashboard - Design Resource Finder',
      user: req.user,
      analyses: [],
      stats: { total_analyses: 0, total_saved: 0, total_reports: 0 },
      completedCount: 0,
      processingCount: 0,
      total: 0,
      recentAnalysis: null,
      fontsFound: 0,
      colorsExtracted: 0,
      resourcesFound: 0,
      avgMatchScore: 0,
      fonts: [],
      colorPalette: [],
      designAnalysis: {},
      resources: [],
      webSources: [],
      bgAlternatives: [],
    };

    const userId = req.user.id;
    const [analyses] = await pool.query(
      'SELECT a.*, u.filename, u.original_name FROM analyses a LEFT JOIN uploads u ON a.upload_id = u.id WHERE a.user_id = ? ORDER BY a.created_at DESC LIMIT 8', [userId]
    );
    const [rows] = await pool.query(
      'SELECT (SELECT COUNT(*) FROM analyses WHERE user_id = ?) as total_analyses, (SELECT COUNT(*) FROM saved_items WHERE user_id = ?) as total_saved, (SELECT COUNT(*) FROM reports WHERE user_id = ?) as total_reports', [userId, userId, userId]
    );
    data.stats = rows[0] || data.stats;
    const [completed] = await pool.query('SELECT COUNT(*) as count FROM analyses WHERE user_id = ? AND status = ?', [userId, 'completed']);
    const [processing] = await pool.query('SELECT COUNT(*) as count FROM analyses WHERE user_id = ? AND status = ?', [userId, 'processing']);
    const [monthly] = await pool.query('SELECT COUNT(*) as count FROM analyses WHERE user_id = ? AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())', [userId]);
    data.analyses = analyses;
    data.completedCount = completed[0]?.count || 0;
    data.processingCount = processing[0]?.count || 0;
    data.total = monthly[0]?.count || 0;

    if (analyses.length > 0) {
      const latestCompleted = analyses.find(a => a.status === 'completed');
      if (latestCompleted) {
        data.recentAnalysis = latestCompleted;
        const analysisData = extractDashboardData(latestCompleted);
        Object.assign(data, analysisData);
      }
    }

    res.render('dashboard-v2', data);
  } catch (err) {
    console.error('Dashboard v2 error:', err);
    res.status(500).render('error', { title: 'Error', message: 'Failed to load dashboard', user: req.user });
  }
};

function extractDashboardData(analysis) {
  const data = {
    fontsFound: 0,
    colorsExtracted: 0,
    resourcesFound: 0,
    avgMatchScore: analysis.confidence_score || 0,
    fonts: [],
    colorPalette: [],
    designAnalysis: {},
    resources: [],
    webSources: [],
    bgAlternatives: [],
  };

  if (analysis.fonts && Array.isArray(analysis.fonts)) {
    data.fontsFound = analysis.fonts.length;
    data.fonts = analysis.fonts.slice(0, 3).map(f => ({
      name: f.name,
      family: f.family,
      category: f.category,
      weight: f.weight,
      size: f.size,
      confidence: f.confidence,
      similar: f.similar || [],
    }));
  }

  if (analysis.colors) {
    if (analysis.colors.extracted && Array.isArray(analysis.colors.extracted)) {
      data.colorsExtracted = analysis.colors.extracted.length;
      data.colorPalette = analysis.colors.extracted.slice(0, 6).map(c => ({
        hex: c.hex,
        rgb: c.rgb,
        hsl: c.hsl,
        percentage: c.percentage,
        tailwind: c.tailwind,
      }));
    } else if (analysis.colors.palette) {
      const palette = analysis.colors.palette;
      const allColors = [
        ...(palette.background || []),
        ...(palette.primary || []),
        ...(palette.secondary || []),
        ...(palette.accent || []),
      ];
      data.colorPalette = allColors.slice(0, 6).map(hex => ({ hex }));
    }
  }

  if (analysis.resource_recommendations) {
    const recs = analysis.resource_recommendations;
    data.resourcesFound = (recs.fonts?.length || 0) + (recs.colors?.length || 0) + (recs.icons?.length || 0) + (recs.stock_photos?.length || 0) + (recs.illustrations?.length || 0) + (recs.patterns?.length || 0);

    data.resources = [
      ...(recs.icons?.slice(0, 2).map((name, i) => ({ name, category: 'icons', source: 'Icon Library', preview: 'emoji_people' })) || []),
      ...(recs.illustrations?.slice(0, 2).map((name, i) => ({ name, category: 'illustrations', source: 'Illustration Library', preview: 'landscape' })) || []),
      ...(recs.patterns?.slice(0, 2).map((name, i) => ({ name, category: 'vectors', source: 'Vector Library', preview: 'shapes' })) || []),
    ].slice(0, 6);
  }

  if (analysis.design_style) {
    const styles = Object.entries(analysis.design_style)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([name]) => name)
      .join(' · ');
    data.designAnalysis = {
      style: styles || 'Modern',
      layout: analysis.layout?.grid_structure || 'Responsive Grid',
      typography: analysis.typography?.font_pairing || 'Font Pairing Detected',
      mood: analysis.background?.style || 'Clean & Professional',
      audience: inferAudience(analysis.design_style),
    };
  }

  if (analysis.resource_recommendations) {
    data.webSources = [
      { name: 'Freepik', icon: 'download', match: Math.floor(Math.random() * 15) + 80 },
      { name: 'Dribbble', icon: 'diamond', match: Math.floor(Math.random() * 15) + 75 },
      { name: 'Behance', icon: 'design_services', match: Math.floor(Math.random() * 15) + 70 },
      { name: 'Pinterest', icon: 'push_pin', match: Math.floor(Math.random() * 15) + 65 },
      { name: 'Unsplash', icon: 'photo_library', match: Math.floor(Math.random() * 15) + 60 },
      { name: 'Google Fonts', icon: 'font_download', match: Math.floor(Math.random() * 15) + 55 },
    ];
  }

  if (analysis.recreation_guides || analysis.prompts) {
    data.bgAlternatives = [
      { name: 'Abstract Gradient', icon: 'landscape' },
      { name: 'Soft Mesh', icon: 'blur_on' },
      { name: 'Geometric', icon: 'auto_awesome' },
      { name: 'Fluid Wave', icon: 'waves' },
      { name: 'Noise Texture', icon: 'grain' },
      { name: 'Light Leak', icon: 'flare' },
    ];
  }

  return data;
}

function inferAudience(designStyle) {
  if (!designStyle) return 'General Audience';
  const topStyle = Object.entries(designStyle).sort((a, b) => b[1] - a[1])[0]?.[0];
  const audienceMap = {
    Tech: 'Tech Professionals & Developers',
    Corporate: 'Business Professionals',
    Luxury: 'High-End Consumers',
    Creative: 'Creative Professionals',
    Modern: 'Modern Digital Natives',
    Minimal: 'Design-Conscious Users',
    Editorial: 'Content Consumers',
    Vintage: 'Nostalgia Enthusiasts',
  };
  return audienceMap[topStyle] || 'General Audience';
}

// New page controllers for sidebar routes
exports.projects = (req, res) => {
  res.render('projects', { title: 'Projects - Design Resource Finder', user: req.user });
};

exports.favorites = (req, res) => {
  res.render('favorites', { title: 'Favorites - Design Resource Finder', user: req.user });
};

exports.resources = (req, res) => {
  res.render('resources', { title: 'Resources - Design Resource Finder', user: req.user });
};

exports.bgGenerator = (req, res) => {
  res.render('bg-generator', { title: 'AI Background Generator - Design Resource Finder', user: req.user });
};

exports.help = (req, res) => {
  res.render('help', { title: 'Help & Support - Design Resource Finder', user: req.user });
};
