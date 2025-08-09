// bot/userPrefs.js
const fs = require('fs');
const path = require('path');

const PREFS_FILE = path.resolve(__dirname, '../prefs.json');

function loadPrefs() {
  try {
    const data = fs.readFileSync(PREFS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}
function savePrefs(prefs) {
  try {
    fs.writeFileSync(PREFS_FILE, JSON.stringify(prefs, null, 2));
  } catch (err) {
    console.error('❌ Не удалось сохранить prefs:', err.message);
  }
}

function ensureObj(prefs, chatId) {
  if (!prefs[chatId]) prefs[chatId] = {};
  if (typeof prefs[chatId] === 'string') {
    // бэк-компат: было просто 'USD'
    prefs[chatId] = { currency: prefs[chatId] };
  }
  if (!prefs[chatId].currency) prefs[chatId].currency = 'USD';
  if (!prefs[chatId].schedule) prefs[chatId].schedule = 'hourly'; // 'hourly' | '09:00' | '18:00' | 'twice' | 'off'
  if (typeof prefs[chatId].quietNight !== 'boolean') prefs[chatId].quietNight = true; // 23:00–07:00 молчать
}

function getUserCurrency(prefs, chatId) {
  ensureObj(prefs, chatId);
  return prefs[chatId].currency;
}
function setUserCurrency(prefs, chatId, currency) {
  ensureObj(prefs, chatId);
  prefs[chatId].currency = currency;
  savePrefs(prefs);
}

function getUserSchedule(prefs, chatId) {
  ensureObj(prefs, chatId);
  return prefs[chatId].schedule;
}
function setUserSchedule(prefs, chatId, schedule) {
  ensureObj(prefs, chatId);
  prefs[chatId].schedule = schedule; // 'hourly' | '09:00' | '18:00' | 'twice' | 'off'
  savePrefs(prefs);
}

function getQuietNight(prefs, chatId) {
  ensureObj(prefs, chatId);
  return prefs[chatId].quietNight;
}
function toggleQuietNight(prefs, chatId) {
  ensureObj(prefs, chatId);
  prefs[chatId].quietNight = !prefs[chatId].quietNight;
  savePrefs(prefs);
  return prefs[chatId].quietNight;
}

module.exports = {
  loadPrefs,
  savePrefs,
  getUserCurrency,
  setUserCurrency,
  getUserSchedule,
  setUserSchedule,
  getQuietNight,
  toggleQuietNight,
};