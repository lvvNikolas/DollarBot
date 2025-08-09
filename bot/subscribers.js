const fs = require('fs');
const path = require('path');

const SUBSCRIBERS_FILE = path.resolve(__dirname, '../subscribers.json');

function loadSubscribers() {
  try {
    if (!fs.existsSync(SUBSCRIBERS_FILE)) {
      console.warn('⚠ subscribers.json не найден, создаю новый файл...');
      fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('❌ Ошибка при загрузке subscribers.json:', err.message);
    return [];
  }
}

function saveSubscribers(subscribers) {
  try {
    // удаляем дубликаты
    const uniqueSubscribers = [...new Set(subscribers)];
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(uniqueSubscribers, null, 2));
  } catch (err) {
    console.error('❌ Ошибка при сохранении subscribers.json:', err.message);
  }
}

module.exports = { loadSubscribers, saveSubscribers };