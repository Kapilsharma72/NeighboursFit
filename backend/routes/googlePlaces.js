// backend/routes/googlePlaces.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// GET /places?city=Jaipur&type=hospital&radius=5000
router.get('/', async (req, res) => {
  const { city, type, radius = 5000 } = req.query;

  try {
    // Step 1: Geocode city → lat/lng
    const geoRes = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address: city,
          key: GOOGLE_API_KEY
        }
      }
    );

    const location = geoRes.data.results[0]?.geometry.location;

    if (!location) {
      return res.status(404).json({ error: 'City not found' });
    }

    // Step 2: Use Places API to get nearby places
    const placesRes = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
      {
        params: {
          location: `${location.lat},${location.lng}`,
          radius,
          type,
          key: GOOGLE_API_KEY
        }
      }
    );

    const results = placesRes.data.results.map(place => ({
      name: place.name,
      address: place.vicinity,
      location: place.geometry.location,
      rating: place.rating || null
    }));

    res.json({ center: location, results });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

module.exports = router;
