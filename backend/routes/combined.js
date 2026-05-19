const express = require('express');
const axios = require('axios');
const router = express.Router();
const mockData = require('../data/mockLocations.json');
const { scoreMatch, filterLocationsByCity } = require('../utils/matchAlgorithm');
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const fetchNearbyPlacesCount = async (type, location, radius) => {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json`, {
      params: {
        location: `${location.lat},${location.lng}`,
        radius,
        type,
        key: GOOGLE_API_KEY
      }
    });
    return response.data.results.length; // Count of places found
  } catch (err) {
    console.error(`Failed to fetch places for type ${type}`, err.message);
    return 0;
  }
};

// Test endpoint to verify algorithm with location filtering
router.get('/test', (req, res) => {
  const testUserPrefs = {
    location: 'Mumbai',
    rangeKm: 20,
    petFriendly: true,
    preferences: {
      school: true,
      hospital: true,
      mall: true,
      gym: true,
      garden: true,
      train: true,
      bus: true
    },
    environment: {
      lowTraffic: true,
      goodRoads: true,
      greenArea: true
    },
    behavior: {
      remoteWork: true,
      hasChildren: true,
      ownsPet: true,
      elderlyFamily: false,
      socialCommunity: true,
      startupProfessional: false,
      frequentTraveler: false
    },
    userProfile: {
      isStudent: false,
      livesWithFamily: true,
      propertyPurpose: 'rent',
      mobilityNeeds: false,
      carOwner: true,
      multilingualArea: true
    }
  };

  const mockAmenities = {
    school: 5,
    hospital: 3,
    mall: 2,
    gym: 4,
    garden: 3,
    train: 2,
    bus: 8
  };

  // Filter locations by city first
  const filteredLocations = filterLocationsByCity(mockData, testUserPrefs.location, testUserPrefs.rangeKm);
  
  console.log(`Filtered ${mockData.length} total locations to ${filteredLocations.length} locations in ${testUserPrefs.location}`);

  const scoredAreas = filteredLocations.map(area => {
    const { score, reasons } = scoreMatch(testUserPrefs, area, mockAmenities);
    return { 
      ...area, 
      score, 
      reasons: reasons.slice(0, 5) // Show top 5 reasons
    };
  });

  scoredAreas.sort((a, b) => b.score - a.score);

  res.json({
    testUserPrefs,
    topMatches: scoredAreas.slice(0, 5),
    totalLocationsFiltered: filteredLocations.length,
    originalTotalLocations: mockData.length,
    algorithmVersion: '2.1 - Location-Aware Matching'
  });
});

// Specific test endpoint for Jaipur to verify the fix
router.get('/test-jaipur', (req, res) => {
  const testUserPrefs = {
    location: 'Jaipur',
    rangeKm: 30,
    petFriendly: true,
    preferences: {
      school: true,
      hospital: true,
      mall: true,
      gym: true,
      garden: true
    },
    environment: {
      lowTraffic: true,
      goodRoads: true,
      greenArea: true
    },
    behavior: {
      remoteWork: true,
      hasChildren: true,
      ownsPet: true,
      elderlyFamily: false,
      socialCommunity: true,
      startupProfessional: false,
      frequentTraveler: false
    },
    userProfile: {
      isStudent: false,
      livesWithFamily: true,
      propertyPurpose: 'rent',
      mobilityNeeds: false,
      carOwner: true,
      multilingualArea: true
    }
  };

  const mockAmenities = {
    school: 4,
    hospital: 2,
    mall: 3,
    gym: 3,
    garden: 5
  };

  // Filter locations by city first
  const filteredLocations = filterLocationsByCity(mockData, testUserPrefs.location, testUserPrefs.rangeKm);
  
  console.log(`Jaipur Test: Filtered ${mockData.length} total locations to ${filteredLocations.length} locations in ${testUserPrefs.location}`);
  console.log('Filtered locations:', filteredLocations.map(loc => loc.name));

  const scoredAreas = filteredLocations.map(area => {
    const { score, reasons } = scoreMatch(testUserPrefs, area, mockAmenities);
    return { 
      ...area, 
      score, 
      reasons: reasons.slice(0, 5)
    };
  });

  scoredAreas.sort((a, b) => b.score - a.score);

  res.json({
    testUserPrefs,
    topMatches: scoredAreas.slice(0, 5),
    totalLocationsFiltered: filteredLocations.length,
    originalTotalLocations: mockData.length,
    filteredLocationNames: filteredLocations.map(loc => loc.name),
    algorithmVersion: '2.2 - Fixed Location Filtering'
  });
});

router.post('/', async (req, res) => {
  const { location, rangeKm = 10, ...userPrefs } = req.body;

  if (!location) {
    return res.status(400).json({ error: 'Location is required' });
  }

  try {
    // 1. Guard: skip geocoding entirely if API key is absent
    let cityLatLng = null;

    if (!GOOGLE_API_KEY) {
      console.log('GOOGLE_API_KEY is not set — skipping geocoding, using city-name filter fallback');
    } else {
      // 2. Wrap geocoding call in its own try/catch
      try {
        const geoRes = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
          params: {
            address: location,
            key: GOOGLE_API_KEY
          }
        });

        // 3. Check status before reading results[0]
        if (geoRes.data.status === 'OK') {
          cityLatLng = geoRes.data.results[0]?.geometry.location || null;
        } else {
          console.log(`Geocoding returned non-OK status: ${geoRes.data.status} — falling back to city-name filter`);
          cityLatLng = null;
        }
      } catch (geoError) {
        console.error('Geocoding call failed:', geoError.message);
        cityLatLng = null;
      }
    }

    // 4. Filter locations by city unconditionally (regardless of geocoding outcome)
    const filteredLocations = filterLocationsByCity(mockData, location, rangeKm);

    // 4. Empty-results check runs unconditionally too
    if (filteredLocations.length === 0) {
      const supportedCities = [
        'Mumbai', 'Delhi', 'Bangalore / Bengaluru', 'Hyderabad', 'Pune',
        'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow',
        'Indore', 'Kochi', 'Chandigarh / Mohali / Panchkula',
        'Amritsar', 'Ludhiana', 'Jalandhar', 'Surat', 'Nagpur',
        'Bhopal', 'Visakhapatnam / Vizag'
      ];
      return res.status(404).json({
        error: `No neighborhoods found for "${location}". We currently have data for the following cities.`,
        suggestion: 'Please try one of the supported cities listed below.',
        supportedCities,
        searchLocation: location,
        searchRadius: rangeKm
      });
    }

    const radiusInMeters = rangeKm * 1000;

    // Get Google amenity counts for user's preferred amenities
    const amenityScores = {};
    const amenityTypes = Object.keys(userPrefs.preferences || {});

    // 5. Skip amenity enrichment loop when cityLatLng is null
    if (cityLatLng) {
      // Only fetch amenities that user actually wants (checked = true)
      for (const type of amenityTypes) {
        if (userPrefs.preferences[type] === true) {
          try {
            const count = await fetchNearbyPlacesCount(type, cityLatLng, radiusInMeters);
            amenityScores[type] = count;
          } catch (error) {
            console.error(`Error fetching ${type} amenities:`, error.message);
            amenityScores[type] = 0;
          }
        }
      }
    }

    // Score each filtered location using the improved matching algorithm
    let scoredAreas = filteredLocations.map(area => {
      const { score, reasons } = scoreMatch(userPrefs, area, amenityScores);
      return { 
        ...area, 
        score, 
        reasons,
        nearbyAmenities: amenityScores
      };
    });

    // Sort by highest score and get top 5
    scoredAreas.sort((a, b) => b.score - a.score);
    const topMatches = scoredAreas.slice(0, 5);

    // --- Attach detailed places data to each top match ---
    // Categories to search for (same as in search.js)
    const CATEGORIES = [
      { type: 'school', label: 'schools' },
      { type: 'hospital', label: 'hospitals' },
      { type: 'gym', label: 'gyms' },
      { type: 'park', label: 'gardens' },
      { type: 'shopping_mall', label: 'malls' },
      { type: 'supermarket', label: 'markets' },
      { type: 'university', label: 'universities' },
      { type: 'college', label: 'colleges' },
      { type: 'transit_station', label: 'transport_connectivity' }
    ];

    // Helper to fetch places for a given category and location
    async function fetchPlacesForCategory(type, lat, lng, radius) {
      try {
        const placesRes = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
          params: {
            location: `${lat},${lng}`,
            radius,
            type,
            key: GOOGLE_API_KEY
          }
        });
        return (placesRes.data.results || []).map(place => ({
          name: place.name,
          address: place.vicinity,
          distance_km: getDistanceFromLatLonInKm(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
          rating: place.rating || null
        }));
      } catch (err) {
        console.error(`Failed to fetch places for type ${type}`, err.message);
        return [];
      }
    }

    // Helper to calculate distance (copied from search.js)
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        0.5 - Math.cos(dLat)/2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        (1 - Math.cos(dLon))/2;
      return R * 2 * Math.asin(Math.sqrt(a));
    }

    // 5. Skip places-enrichment loop when cityLatLng is null
    if (cityLatLng) {
      // Attach places to each top match (serially to avoid API quota issues)
      for (const match of topMatches) {
        match.places = {};
        for (const { type, label } of CATEGORIES) {
          match.places[label] = await fetchPlacesForCategory(type, match.lat, match.lng, radiusInMeters);
        }
      }
    }

    // 6. Build response — include geocodingUnavailable flag and omit center when fallback was used
    const responseBody = {
      topMatches,
      searchLocation: location,
      searchRadius: rangeKm,
      totalAreasEvaluated: filteredLocations.length,
      totalAreasAvailable: mockData.length,
      locationFilterApplied: true
    };

    if (cityLatLng) {
      responseBody.center = cityLatLng;
    } else {
      responseBody.geocodingUnavailable = true;
    }

    res.json(responseBody);
  } catch (error) {
    // 7. Last-resort handler — returns HTTP 500
    console.error('Error in /combined:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
