function matchNeighborhoods(userPrefs, data) {
  return data.map(n => {
    let score = 0;
    if (userPrefs.includes('schools') && n.schools > 3) score += 20;
    if (userPrefs.includes('hospitals') && n.hospitals > 2) score += 15;
    if (userPrefs.includes('parks') && n.parks >= 2) score += 10;
    if (userPrefs.includes('gyms') && n.gyms >= 1) score += 5;
    if (n.traffic === 'low') score += 10;
    return { name: n.name, score };
  }).sort((a, b) => b.score - a.score);
}

module.exports = {
  matchNeighborhoods
};
