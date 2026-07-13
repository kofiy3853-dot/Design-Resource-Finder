const pool = require('../config/database');
const errorFormatter = require('../utils/errorFormatter');
const validators = require('../utils/validators');
const jobQueue = require('../utils/jobQueue');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

exports.uploadFile = async (req, res) => {
  try {
    console.log(`[Upload] Starting file upload for user ${req.user.id}`);

    // Validate file
    if (!req.file) {
      console.log('[Upload] No file provided');
      return res.status(400).json(errorFormatter.createErrorResponse('NO_FILE_SELECTED'));
    }

    console.log(`[Upload] File received: ${req.file.originalname} (${req.file.size} bytes)`);

    // Validate using file validation middleware logic
    const fileValidation = validators.validateFile(req.file);
    if (!fileValidation.valid) {
      console.log(`[Upload] File validation failed: ${fileValidation.error}`);
      return res
        .status(400)
        .json(errorFormatter.createErrorResponse('UNSUPPORTED_TYPE', fileValidation.error));
    }

    const { filename, originalname, mimetype, size } = req.file;
    const filePath = `/uploads/${filename}`;
    const absolutePath = path.join(__dirname, '..', 'public', filePath);

    // Compute file hash for caching
    let fileHash = null;
    try {
      const buffer = fs.readFileSync(absolutePath);
      fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
      console.log(`[Upload] File hash: ${fileHash}`);
    } catch (err) {
      console.warn('[Upload] Could not compute file hash:', err.message);
    }

    // Check for cached analysis
    let cachedAnalysisId = null;
    if (fileHash) {
      const [cached] = await pool.query(
        'SELECT analysis_id FROM upload_hashes WHERE file_hash = ? LIMIT 1',
        [fileHash]
      );
      if (cached.length > 0) {
        cachedAnalysisId = cached[0].analysis_id;
        console.log(`[Upload] Found cached analysis: ${cachedAnalysisId}`);
      }
    }

    console.log(`[Upload] Saving upload record: ${filename}`);

    // Save upload record to database
    const [result] = await pool.query(
      'INSERT INTO uploads (user_id, filename, original_name, mime_type, size, path, file_hash) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, filename, originalname, mimetype, size, filePath, fileHash]
    );

    console.log(`[Upload] Upload record created with ID: ${result.insertId}`);

    // If we have a cached analysis, copy results
    let analysisId;
    if (cachedAnalysisId) {
      const [cachedAnalysis] = await pool.query('SELECT * FROM analyses WHERE id = ?', [cachedAnalysisId]);
      if (cachedAnalysis.length > 0) {
        const ca = cachedAnalysis[0];
        const [result2] = await pool.query(
          'INSERT INTO analyses (user_id, upload_id, title, status, fonts, colors, typography, layout, background, shapes, objects, design_style, accessibility, ai_explanation, resource_recommendations, prompts, recreation_guides, confidence_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [req.user.id, result.insertId, ca.title, 'completed', ca.fonts, ca.colors, ca.typography, ca.layout, ca.background, ca.shapes, ca.objects, ca.design_style, ca.accessibility, ca.ai_explanation, ca.resource_recommendations, ca.prompts, ca.recreation_guides, ca.confidence_score]
        );
        analysisId = result2.insertId;
        console.log(`[Upload] Created analysis from cache: ${analysisId}`);
      }
    }

    if (!analysisId) {
      // Create new analysis record
      analysisId = await createAnalysis(req.user.id, result.insertId, originalname);
    }
    console.log(`[Upload] Analysis record created with ID: ${analysisId}`);

    // Store hash mapping if we computed one
    if (fileHash && analysisId) {
      await pool.query(
        'INSERT IGNORE INTO upload_hashes (file_hash, analysis_id, created_at) VALUES (?, ?, NOW())',
        [fileHash, analysisId]
      );
    }

    // Enqueue analysis processing via persistent job queue
    console.log(`[Upload] Enqueuing analysis ${analysisId}`);
    await jobQueue.enqueue('process_analysis', { analysisId });

    // Return success response
    const response = errorFormatter.createSuccessResponse(
      {
        upload: {
          id: result.insertId,
          filename,
          originalname,
          path: filePath,
          size,
          sizeMB: (size / (1024 * 1024)).toFixed(2),
          uploadTime: new Date(),
          cached: !!cachedAnalysisId,
        },
        analysisId,
        status: cachedAnalysisId ? 'completed' : 'processing',
      },
      cachedAnalysisId ? 'File uploaded - using cached analysis' : 'File uploaded successfully'
    );

    console.log(`[Upload] Sending response with analysisId: ${analysisId}`);
    res.json(response);
  } catch (err) {
    console.error(`[Upload] Error: ${err.message}`, err);

    // Handle database errors
    if (
      err.code === 'PROTOCOL_CONNECTION_LOST' ||
      err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR'
    ) {
      return res
        .status(503)
        .json(
          errorFormatter.createErrorResponse(
            'DATABASE_ERROR',
            'Database connection lost. Please try again.'
          )
        );
    }

    res.status(500).json(errorFormatter.createErrorResponse('UPLOAD_FAILED', err.message));
  }
};

/**
 * Handle batch file uploads
 */
exports.uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(errorFormatter.createErrorResponse('NO_FILES_SELECTED'));
    }

    const uploads = [];
    const analyses = [];
    const errors = [];

    for (let i = 0; i < req.files.length; i++) {
      try {
        const file = req.files[i];

        // Validate each file
        const fileValidation = validators.validateFile(file);
        if (!fileValidation.valid) {
          errors.push({
            filename: file.originalname,
            error: fileValidation.error,
          });
          continue;
        }

        const { filename, originalname, mimetype, size } = file;
        const filePath = `/uploads/${filename}`;

        // Save upload record
        const [result] = await pool.query(
          'INSERT INTO uploads (user_id, filename, original_name, mime_type, size, path) VALUES (?, ?, ?, ?, ?, ?)',
          [req.user.id, filename, originalname, mimetype, size, filePath]
        );

        // Create analysis
        const analysisId = await createAnalysis(req.user.id, result.insertId, originalname);
        analyses.push(analysisId);

        uploads.push({
          id: result.insertId,
          filename,
          originalname,
          path: filePath,
          size,
          sizeMB: (size / (1024 * 1024)).toFixed(2),
          analysisId,
        });

        // Enqueue analysis processing via persistent job queue
        await jobQueue.enqueue('process_analysis', { analysisId });
      } catch (fileErr) {
        errors.push({
          filename: req.files[i].originalname,
          error: fileErr.message,
        });
      }
    }

    res.json({
      success: true,
      message: `${uploads.length} file(s) uploaded successfully`,
      uploads,
      analyses,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: req.files.length,
        successful: uploads.length,
        failed: errors.length,
      },
    });
  } catch (err) {
    console.error('Batch upload error:', err);
    res
      .status(500)
      .json(errorFormatter.createErrorResponse('UPLOAD_FAILED', 'Batch upload failed'));
  }
};

/**
 * Get upload history
 */
exports.getUploadHistory = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 10;
    const offset = (page - 1) * limit;

    const [uploads] = await pool.query(
      'SELECT * FROM uploads WHERE user_id = ? ORDER BY created_at DESC LIMIT ?, ?',
      [req.user.id, offset, limit]
    );

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM uploads WHERE user_id = ?',
      [req.user.id]
    );

    res.json(
      errorFormatter.createSuccessResponse({
        uploads,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    );
  } catch (err) {
    console.error('Get upload history error:', err);
    res.status(500).json(errorFormatter.createErrorResponse('SERVER_ERROR'));
  }
};

/**
 * Delete upload
 */
exports.deleteUpload = async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const [[upload]] = await pool.query('SELECT user_id FROM uploads WHERE id = ?', [id]);

    if (!upload || upload.user_id !== req.user.id) {
      return res.status(403).json(errorFormatter.createErrorResponse('PERMISSION_DENIED'));
    }

    // Delete upload
    await pool.query('DELETE FROM uploads WHERE id = ?', [id]);

    res.json(errorFormatter.createSuccessResponse(null, 'Upload deleted successfully'));
  } catch (err) {
    console.error('Delete upload error:', err);
    res.status(500).json(errorFormatter.createErrorResponse('SERVER_ERROR'));
  }
};

/**
 * Helper function to create analysis record
 */
async function createAnalysis(userId, uploadId, title) {
  const [result] = await pool.query(
    'INSERT INTO analyses (user_id, upload_id, title, status) VALUES (?, ?, ?, ?)',
    [userId, uploadId, title.replace(/\.[^/.]+$/, ''), 'processing']
  );
  return result.insertId;
}
