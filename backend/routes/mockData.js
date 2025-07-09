// backend/routes/mockData.js
const express = require('express');
const router = express.Router();
const mockData = require('../data/mockLocations.json');

router.get('/:location', (req, res) => {
  const locationName = req.params.location.toLowerCase();
  const result = mockData.find(item => item.name.toLowerCase() === locationName);

  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ error: 'Location not found in mock data' });
  }
});

module.exports = router;
