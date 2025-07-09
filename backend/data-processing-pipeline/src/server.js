require('dotenv').config();
const express = require('express');
const { loadFromFile } = require('./storage');
const { matchNeighborhoods } = require('./matcher');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/recommendations', (req, res) => {
  const prefs = req.query.prefs ? req.query.prefs.split(',') : [];
  const data = loadFromFile('mockData.json');
  const results = matchNeighborhoods(prefs, data);
  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
