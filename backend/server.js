// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

if (process.env.NODE_ENV === 'production' && !process.env.ALLOWED_ORIGIN) {
  console.error('ALLOWED_ORIGIN must be set in production');
  process.exit(1);
}

const mockDataRoute = require('./routes/mockData');
const placesRoute = require('./routes/googlePlaces');
const combinedRoute = require('./routes/combined');
const searchRoute = require('./routes/search');

const app = express();

// Support multiple allowed origins (comma-separated in ALLOWED_ORIGIN env var)
// e.g. ALLOWED_ORIGIN=https://neighboursfit.vercel.app,https://neighboursfit-git-main.vercel.app
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV !== 'production') return ['*'];
  return (process.env.ALLOWED_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean);
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = getAllowedOrigins();
    if (allowed.includes('*') || !origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/mockdata', mockDataRoute);
app.use('/places', placesRoute);
app.use('/combined', combinedRoute);
app.use('/search', searchRoute);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
