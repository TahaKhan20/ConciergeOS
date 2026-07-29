/**
 * ConciergeOS Backend Server
 * - Serves the frontend from ../client/
 * - Proxies /api/chat/* to SecondBrainOS (DOMAIN_KEY injected server-side)
 * - Rate limiting, CORS, and structured logging
 */

require('dotenv').config();

const path    = require('path');
const express = require('express');
const cors    = require('cors');

const logger         = require('./utils/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const chatRoutes     = require('./routes/chat');

const app  = express();
const PORT = process.env.PORT || 3001;

/* ---- Environment validation ---- */
const { DOMAIN_KEY, SECONDBRAIN_API_URL, ALLOWED_ORIGINS } = process.env;

if (!DOMAIN_KEY || !SECONDBRAIN_API_URL) {
  logger.error('Missing required env vars. Copy .env.example to .env and fill in values.');
  process.exit(1);
}

/* ---- CORS — restrict to your frontend origins ---- */
const origins = (ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: origins.length ? origins : '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

/* ---- Rate limiting ---- */
app.use(apiLimiter);

/* ---- Body parsing ---- */
app.use(express.json({ limit: '100kb' }));

/* ---- Serve frontend static files from client/ ---- */
const STATIC_ROOT = path.join(__dirname, '..', 'client');
app.use(express.static(STATIC_ROOT));

/* ---- API Routes ---- */
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/api/config', (_req, res) => {
  res.json({
    apiUrl:          '/api/chat',
    calendlyBaseUrl: 'https://calendly.com/mohammadtahakhan20/30min',
  });
});

app.use('/api/chat', chatRoutes);

/* ---- SPA fallback: serve index.html for any non-API route ---- */
app.get('*', (_req, res) => {
  res.sendFile(path.join(STATIC_ROOT, 'index.html'));
});

/* ---- Start ---- */
app.listen(PORT, () => {
  logger.info(`ConciergeOS running on http://localhost:${PORT}`);
  logger.info(`Frontend: ${STATIC_ROOT}`);
  logger.info(`API proxy: /api/chat/* \u2192 ${SECONDBRAIN_API_URL}`);
});
