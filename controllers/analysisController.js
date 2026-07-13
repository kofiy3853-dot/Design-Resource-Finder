const pool = require('../config/database');
const Analysis = require('../models/Analysis');
const Gamification = require('../models/Gamification');
const colorAnalyzer = require('../utils/colorAnalyzer');
const aiService = require('../utils/aiService');
const path = require('path');

exports.processAnalysis = async (analysisId, reportProgress = null) => {
  try {
    console.log(`[Analysis] Processing analysis ${analysisId}`);

    const analysis = await Analysis.findById(analysisId);
    if (!analysis || analysis.status !== 'processing') {
      console.log(`[Analysis] Analysis ${analysisId} not in processing state`);
      return;
    }

    const [upload] = await pool.query('SELECT * FROM uploads WHERE id = ?', [analysis.upload_id]);
    if (!upload[0]) {
      console.log(`[Analysis] Upload not found for analysis ${analysisId}`);
      await Analysis.update(analysisId, { status: 'failed' });
      return;
    }

    const filePath = path.join(__dirname, '..', 'public', upload[0].path);
    console.log(`[Analysis] Analyzing file: ${filePath}`);
    console.log(`[Analysis] Upload path from DB: ${upload[0].path}`);

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      console.error(`[Analysis] File not found: ${filePath}`);
      await Analysis.update(analysisId, { status: 'failed' });
      return;
    }
    console.log(`[Analysis] File exists, size: ${fs.statSync(filePath).size} bytes`);

    // Report progress: starting color analysis
    if (reportProgress) reportProgress(20, 'color_analysis');

    // Run color + AI in parallel
    console.log(`[Analysis] Starting color and AI analysis...`);
    const [colorResult, aiResult] = await Promise.allSettled([
      colorAnalyzer.extractColors(filePath),
      aiService.analyzeDesign(filePath).then((result) => {
        if (reportProgress) reportProgress(70, 'ai_analysis');
        return result;
      }),
    ]);

    const colors =
      colorResult.status === 'fulfilled' ? colorResult.value : { colors: [], palette: {} };
    const ai = aiResult.status === 'fulfilled' ? aiResult.value : null;

    console.log(`[Analysis] Color analysis completed for ${analysisId}`);
    console.log(`[Analysis] Colors extracted: ${colors?.colors?.length || 0}`);
    console.log(`[Analysis] AI analysis ${ai ? 'completed' : 'unavailable'} for ${analysisId}`);
    if (ai) {
      console.log(`[Analysis] AI fonts: ${ai.fonts?.length || 0}`);
      console.log(`[Analysis] AI objects: ${ai.objects?.length || 0}`);
      console.log(`[Analysis] AI shapes: ${ai.shapes?.length || 0}`);
      console.log(`[Analysis] AI design_style: ${JSON.stringify(ai.design_style)}`);
    }
    if (colorResult.status === 'rejected') {
      console.error(`[Analysis] Color analysis error:`, colorResult.reason);
    }
    if (aiResult.status === 'rejected') {
      console.error(`[Analysis] AI analysis error:`, aiResult.reason);
    }

    // Build update data - use whatever we have
    const updatedData = {
      status: 'completed',
      colors: {
        extracted: colors?.colors || [],
        palette: colors?.palette || {},
      },
    };

    // Report progress: saving results
    if (reportProgress) reportProgress(85, 'saving_results');

    // Only add AI fields if we got results
    if (ai) {
      updatedData.fonts = ai.fonts || null;
      updatedData.typography = ai.typography || null;
      updatedData.layout = ai.layout || null;
      updatedData.background = ai.background || null;
      updatedData.shapes = ai.shapes || null;
      updatedData.objects = ai.objects || null;
      updatedData.design_style = ai.design_style || null;
      updatedData.accessibility = ai.accessibility || null;
      updatedData.ai_explanation = ai.ai_explanation || null;
      updatedData.resource_recommendations = ai.resource_recommendations || null;
      updatedData.prompts = ai.prompts || null;
      updatedData.recreation_guides = ai.recreation_guides || null;
      updatedData.confidence_score = ai.confidence_score || null;
    } else {
      // AI unavailable - set minimal placeholders
      updatedData.fonts = null;
      updatedData.typography = null;
      updatedData.layout = null;
      updatedData.background = null;
      updatedData.shapes = null;
      updatedData.objects = null;
      updatedData.design_style = null;
      updatedData.accessibility = null;
      updatedData.ai_explanation =
        'AI analysis unavailable - showing color analysis only. Configure OpenRouter or OpenAI API keys for full analysis.';
      updatedData.resource_recommendations = null;
      updatedData.prompts = null;
      updatedData.recreation_guides = null;
      updatedData.confidence_score = null;
    }

    await Analysis.update(analysisId, updatedData);
    console.log(`[Analysis] Analysis ${analysisId} marked as completed`);
    console.log(`[Analysis] Saved data summary:`);
    console.log(`  - fonts: ${updatedData.fonts?.length || 0} items`);
    console.log(`  - colors: ${updatedData.colors?.extracted?.length || 0} items`);
    console.log(`  - objects: ${updatedData.objects?.length || 0} items`);
    console.log(`  - shapes: ${updatedData.shapes?.length || 0} items`);
    console.log(`  - design_style: ${JSON.stringify(updatedData.design_style)}`);
    console.log(`  - confidence_score: ${updatedData.confidence_score}`);

    await pool.query(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
      [
        analysis.user_id,
        'analysis_complete',
        'Analysis Complete',
        `Your design "${analysis.title}" has been analyzed. View the results now.`,
      ]
    );

    // Update gamification
    await Gamification.updateStreak(analysis.user_id);
    await Gamification.updateUserStats(analysis.user_id);
    const newAchievements = await Gamification.checkAndAwardAchievements(analysis.user_id);

    if (newAchievements.length > 0) {
      for (const achievementId of newAchievements) {
        const achievement = Gamification.ACHIEVEMENTS[achievementId];
        await pool.query(
          'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
          [
            analysis.user_id,
            'achievement_earned',
            'Achievement Unlocked!',
            `You earned: ${achievement.name}`,
          ]
        );
      }
    }

    return updatedData;
  } catch (err) {
    console.error(`[Analysis] Error processing analysis ${analysisId}:`, err);
    try {
      await Analysis.update(analysisId, { status: 'failed' });
    } catch (_) {
      /* ignore cleanup failure */
    }
    return null;
  }
};

exports.triggerAnalysis = async (req, res) => {
  try {
    const { analysisId } = req.body;
    if (!analysisId) return res.status(400).json({ error: 'analysisId required' });

    const analysis = await Analysis.findById(analysisId);
    if (!analysis) return res.status(404).json({ error: 'Analysis not found' });

    const jobQueue = require('../utils/jobQueue');
    await jobQueue.enqueue('process_analysis', { analysisId });

    res.json({ message: 'Analysis started', analysisId });
  } catch (err) {
    console.error('Trigger analysis error:', err);
    res.status(500).json({ error: 'Failed to start analysis' });
  }
};

exports.getAnalysisStatus = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) return res.status(404).json({ error: 'Not found' });

    await pool.query('INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)', [
      req.user.id,
      'view_analysis',
      JSON.stringify({ analysisId: analysis.id }),
    ]);

    res.json({
      id: analysis.id,
      status: analysis.status,
      title: analysis.title,
      created_at: analysis.created_at,
      hasResults: !!(analysis.fonts || analysis.colors || analysis.ai_explanation),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get status' });
  }
};
