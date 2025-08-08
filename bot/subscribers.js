const fs = require('fs');
const path = require('path');

const SUBSCRIBERS_FILE = path.resolve(__dirname, '../subscribers.json');

function loadSubscribers() {
  try {
    const data = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function saveSubscribers(subscribers) {
  try {
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
  } catch (err) {
    console.error('Ошибка при сохранении:', err.message);
  }
}

module.exports = { loadSubscribers, saveSubscribers };
