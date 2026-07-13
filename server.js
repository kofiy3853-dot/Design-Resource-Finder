const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { errorHandler, notFound } = require('./middleware/errorHandler');
const { optionalAuth } = require('./middleware/auth');
const config = require('./config');
const jobQueue = require('./utils/jobQueue');
const analysisCtrl = require('./controllers/analysisController');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security headers with CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({ origin: config.siteUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(optionalAuth);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Stricter rate limit for uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { error: 'Upload limit reached. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/generated', express.static(path.join(__dirname, 'public', 'generated')));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} [${req.method}] ${req.path}`);
    next();
  });
}

app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));
app.use('/api/collections', require('./routes/collections'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/admin', require('./routes/admin'));

// Progress API endpoint for analysis
app.get('/api/analysis/:id/progress', async (req, res) => {
  try {
    const jobQueue = require('./utils/jobQueue');
    const Analysis = require('./models/Analysis');

    // First check if analysis is already completed
    const analysis = await Analysis.findById(req.params.id);
    if (analysis && analysis.status === 'completed') {
      return res.json({
        id: req.params.id,
        status: 'completed',
        progress: 100,
        currentStep: 'completed',
      });
    }

    // Find job by analysis ID
    const job = await jobQueue.getJobByAnalysisId(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    res.json({
      id: job.id,
      status: job.status,
      progress: job.progress || 0,
      currentStep: job.current_step,
      lastError: job.last_error,
      createdAt: job.created_at,
      startedAt: job.started_at,
      completedAt: job.completed_at,
    });
  } catch (err) {
    console.error('Progress API error:', err);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

jobQueue.register('process_analysis', async (job, reportProgress) => {
  const payload = typeof job.payload === 'string' ? JSON.parse(job.payload) : job.payload;
  await analysisCtrl.processAnalysis(payload.analysisId, reportProgress);
});

jobQueue.startPolling(1000);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Design Resource Finder running on http://localhost:${config.port}`);
});
