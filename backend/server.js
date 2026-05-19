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

const corsOptions = process.env.NODE_ENV === 'production'
  ? { origin: process.env.ALLOWED_ORIGIN }
  : { origin: '*' };
app.use(cors(corsOptions));
app.use(express.json());

app.use('/mockdata', mockDataRoute);
app.use('/places', placesRoute);
app.use('/combined', combinedRoute);
app.use('/search', searchRoute);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
