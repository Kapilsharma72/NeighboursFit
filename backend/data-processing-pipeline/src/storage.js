const fs = require('fs');
const path = require('path');

function saveToFile(filename, data) {
  const filepath = path.join(__dirname, '..', 'data', filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

function loadFromFile(filename) {
  const filepath = path.join(__dirname, '..', 'data', filename);
  const content = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(content);
}

module.exports = {
  saveToFile,
  loadFromFile
};
