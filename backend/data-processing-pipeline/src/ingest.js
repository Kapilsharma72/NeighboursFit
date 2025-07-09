const fs = require('fs');
const csv = require('csv-parser');
const xml2js = require('xml2js');
const axios = require('axios');

async function loadJSON(path) {
  const data = fs.readFileSync(path, 'utf-8');
  return JSON.parse(data);
}

function loadCSV(path) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

function loadXML(path) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser();
    fs.readFile(path, (err, data) => {
      if (err) reject(err);
      parser.parseString(data, (err, result) => {
        if (err) reject(err);
        else resolve(result.neighborhoods.neighborhood || []);
      });
    });
  });
}

async function fetchAPI(url) {
  const res = await axios.get(url);
  return res.data;
}

module.exports = {
  loadJSON,
  loadCSV,
  loadXML,
  fetchAPI
};
