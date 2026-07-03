require('dotenv').config();
require('express-async-errors');

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { initSocket } = require('./socket/index');
const errorHandler = require('./middleware/errorHandler');

// ── Route imports ──────────────────────────────────────────
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const listingRoutes = require('./routes/listings');
const requestRoutes = require('./routes/requests');
const ratingRoutes = require('./routes/ratings');
const impactRoutes = require('./routes/impact');
const adminRoutes = require('./routes/admin');

const app = express();
const httpServer = http.createServer(app);

// ── DB ─────────────────────────────────────────────────────
connectDB();

// ── Socket.IO ──────────────────────────────────────────────
initSocket(httpServer);

// ── Global middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ──────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/admin', adminRoutes);

// ── Health check ───────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', env: process.env.NODE_ENV })
);

// ── Error handler (must be last) ───────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`🌱 ReVora server running on port ${PORT}`)
);
