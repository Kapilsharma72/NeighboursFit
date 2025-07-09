function transformEntry(entry) {
  return {
    name: entry.name || entry.location || 'Unknown',
    schools: parseInt(entry.schools || entry.school_count || 0),
    hospitals: parseInt(entry.hospitals || entry.health_centers || 0),
    gyms: parseInt(entry.gyms || 0),
    parks: parseInt(entry.parks || 0),
    traffic: entry.traffic || 'unknown',
    lat: parseFloat(entry.lat || entry.latitude || 0),
    lng: parseFloat(entry.lng || entry.longitude || 0)
  };
}

function transformData(rawArray) {
  return rawArray.map(transformEntry);
}

module.exports = {
  transformData
};
