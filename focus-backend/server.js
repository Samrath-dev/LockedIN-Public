require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1) JSON body parser with 10 KB limit
app.use(express.json({ limit: '10kb' }));

// 2) CORS – our dashboards + chrome extension
const allowedOrigins = [
  'http://localhost:5173',          // local dashboard
  'https://focus.yourdomain.com'    // not done yet
];

app.use(
  cors({
    origin: (origin, callback) => {
      // no origin == same-origin / direct curl => allow
      if (!origin) return callback(null, true);

      // allow our web dashboards
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // allow any chrome-extension://<your-ext-id> origin
      if (origin.startsWith('chrome-extension://')) return callback(null, true);

      // everything else is blocked
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET','POST'],
  })
);
// 3) Simple request logger
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// 4) Health-check endpoint
app.get('/health', (_req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'ok' : 'down';
  res.json({
    uptime: process.uptime(),
    db: dbState,
    timestamp: Date.now()
  });
});

// 5) Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✔ Connected to MongoDB'))
  .catch(err => console.error('✖ MongoDB connection error:', err));

// 6) Main API routes
app.use('/api/sessions', require('./routes/sessions'));

// 7) 404 for unknown routes
app.use((req, res, next) => {
  const err = new Error(`Not found: ${req.method} ${req.originalUrl}`);
  err.status = 404;
  next(err);
});

// 8) Central error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

// 9) Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});