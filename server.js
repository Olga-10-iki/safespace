// server.js — SafeSpace Backend Entry Point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const storiesRoutes = require('./routes/stories');
const commentsRoutes = require('./routes/comments');
const reportsRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
    },
  },
}));

// FIX Bug #7: Removed 'null' from allowed origins.
// Allowing 'null' permits requests from local file:// pages — a security risk.
// Only include it in development mode if truly needed for local file testing.
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...(isDev ? ['null'] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ──────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts. Please try again later.' },
});

// FIX Bug #6: submitLimiter was never applied to story submissions — only to reports.
// Stories are the most content-generating endpoint and need this protection too.
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Submission limit reached. Please wait before posting again.' },
});

app.use(globalLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Serve static frontend ──────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);

// FIX: Mount comment routes BEFORE the stories submitLimiter so that comment
// requests to /api/stories/:storyId/comments are NOT throttled by the story
// submission rate limiter (1 comment limiter is applied inside commentsRoutes).
app.use('/api/stories/:storyId/comments', commentsRoutes);

// FIX Bug #6: submitLimiter now applied to /api/stories (POST path rate-limited)
app.use('/api/stories', submitLimiter, storiesRoutes);

// FIX note: submitLimiter already on stories; reports keep their own limiter too
app.use('/api/reports', submitLimiter, reportsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'SafeSpace API',
    version: '1.0.1',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// ─── SPA Fallback — serve frontend for all non-API routes ───────────────────
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found.' });
  }
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: isDev ? err.message : 'An internal error occurred.',
  });
});

// ─── Start Server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║         SafeSpace API Server              ║
║  🌿 Running on http://localhost:${PORT}      ║
║  📡 API Base: http://localhost:${PORT}/api   ║
║  🌍 Environment: ${process.env.NODE_ENV || 'development'}            ║
╚═══════════════════════════════════════════╝
  `);
});

module.exports = app;
