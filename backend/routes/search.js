

const express = require('express');
const axios = require('axios');
const router = express.Router();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  throw new Error('Google API key is missing. Set GOOGLE_API_KEY in your environment.');
}

// Categories to search for
const CATEGORIES = [
  { type: 'school', label: 'schools' },
  { type: 'hospital', label: 'hospitals' },
  { type: 'gym', label: 'gyms' },
  { type: 'park', label: 'gardens' },
  { type: 'shopping_mall', label: 'malls' },
  { type: 'supermarket', label: 'markets' },
  { type: 'university', label: 'universities' },
  { type: 'college', label: 'colleges' },
  { type: 'transit_station', label: 'transport_connectivity' },
  // Add more categories as needed
];

// Helper: Haversine formula to calculate distance in KM
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    0.5 - Math.cos(dLat) / 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    (1 - Math.cos(dLon)) / 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

router.post('/', async (req, res) => {
  const { address, radius = 10000 } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  try {
    // 1. Geocode the address
    const geoRes = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { address, key: GOOGLE_API_KEY }
    });

    if (!geoRes.data.results || geoRes.data.results.length === 0) {
      return res.status(404).json({ error: 'Address not found or invalid' });
    }

    const location = geoRes.data.results[0].geometry.location;

    // 2. Fetch places per category
    const results = {};

    await Promise.all(CATEGORIES.map(async ({ type, label }) => {
      try {
        const placesRes = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
          params: {
            location: `${location.lat},${location.lng}`,
            radius,
            type,
            key: GOOGLE_API_KEY
          }
        });

        const places = (placesRes.data.results || []).map(place => ({
          name: place.name,
          address: place.vicinity,
          distance_km: getDistanceFromLatLonInKm(
            location.lat, location.lng,
            place.geometry.location.lat,
            place.geometry.location.lng
          ),
          rating: place.rating || null
        }));

        // Optional: sort by distance and limit to top 10
        results[label] = places.sort((a, b) => a.distance_km - b.distance_km).slice(0, 10);
      } catch (err) {
        console.error(`Failed to fetch ${label}:`, err.message);
        results[label] = [];
      }
    }));

    // 3. Return response
    res.json({
      location: {
        address,
        latitude: location.lat,
        longitude: location.lng
      },
      results
    });

  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ error: 'Failed to process request', details: error.message });
  }
});

module.exports = router;



// const express = require('express');
// const axios = require('axios');
// const router = express.Router();

// const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// // Categories to search for
// const CATEGORIES = [
//   { type: 'school', label: 'schools' },
//   { type: 'hospital', label: 'hospitals' },
//   { type: 'gym', label: 'gyms' },
//   { type: 'park', label: 'gardens' },
//   { type: 'shopping_mall', label: 'malls' },
//   { type: 'supermarket', label: 'markets' },
//   { type: 'university', label: 'universities' },
//   { type: 'college', label: 'colleges' },
//   { type: 'transit_station', label: 'transport_connectivity' },
//   // Add more types as needed
// ];

// // Helper to calculate distance between two lat/lng points (Haversine formula)
// function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
//   const R = 6371; // Radius of the earth in km
//   const dLat = (lat2 - lat1) * Math.PI / 180;
//   const dLon = (lon2 - lon1) * Math.PI / 180;
//   const a =
//     0.5 - Math.cos(dLat)/2 +
//     Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//     (1 - Math.cos(dLon))/2;
//   return R * 2 * Math.asin(Math.sqrt(a));
// }

// router.post('/', async (req, res) => {
//   const { address, radius = 10000 } = req.body;
//   if (!address) {
//     return res.status(400).json({ error: 'Address is required' });
//   }

//   try {
//     // 1. Geocode the address
//     const geoRes = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
//       params: { address, key: GOOGLE_API_KEY }
//     });
//     const location = geoRes.data.results[0]?.geometry.location;
//     if (!location) {
//       return res.status(404).json({ error: 'Address not found' });
//     }

//     // 2. For each category, fetch places
//     const results = {};
//     await Promise.all(CATEGORIES.map(async ({ type, label }) => {
//       const placesRes = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
//         params: {
//           location: `${location.lat},${location.lng}`,
//           radius,
//           type,
//           key: GOOGLE_API_KEY
//         }
//       });
//       results[label] = (placesRes.data.results || []).map(place => ({
//         name: place.name,
//         address: place.vicinity,
//         distance_km: getDistanceFromLatLonInKm(location.lat, location.lng, place.geometry.location.lat, place.geometry.location.lng),
//         rating: place.rating || null
//       }));
//     }));

//     res.json({
//       location: {
//         address,
//         latitude: location.lat,
//         longitude: location.lng
//       },
//       results
//     });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ error: 'Failed to fetch data', details: error.message });
//   }
// });

// module.exports = router; 

