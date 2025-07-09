// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const mockDataRoute = require('./routes/mockData');
const placesRoute = require('./routes/googlePlaces');
const combinedRoute = require('./routes/combined');
const searchRoute = require('./routes/search');
// const connectDB = require('./utils/mongoClient');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/mockdata', mockDataRoute);
app.use('/places', placesRoute);
app.use('/combined', combinedRoute);
app.use('/search', searchRoute);

// Test MongoDB connection route
app.get('/api/mongo-test', async (req, res) => {
  try {
    const db = await connectDB();
    // List collections as a test
    const collections = await db.listCollections().toArray();
    res.json({ collections });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
