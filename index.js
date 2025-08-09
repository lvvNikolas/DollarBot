// index.js
const TelegramBot = require('node-telegram-bot-api');

const { loadSubscribers } = require('./bot/subscribers');
const { loadPrefs } = require('./bot/userPrefs');

const { handleStart } = require('./bot/commands/start');
const { handleRate } = require('./bot/commands/rate');
const { handleStop } = require('./bot/commands/stop');
const { handleChart } = require('./bot/commands/chart');
const { handleButtons } = require('./bot/commands/handleButtons');
const { handleSchedule } = require('./bot/commands/schedule');
const { setupScheduler } = require('./bot/scheduler');

// 🔐 токен бота (вписан прямо в код)
const token = '8256297651:AAGenxqZT8jGooa1-Vf1MJqXUuvgbDkgUa8';

// запуск бота
const bot = new TelegramBot(token, { polling: true });

// данные
let subscribers = loadSubscribers(); // массив chatId
let prefs = loadPrefs(); // объект предпочтений по chatId

// лог
console.log('✅ Bot starting…');
console.log('👥 Subscribers:', subscribers.length);

// команды и обработчики
handleStart(bot, subscribers, prefs);
handleRate(bot, prefs);
handleStop(bot, subscribers);
handleChart(bot, prefs);
handleButtons(bot, subscribers, prefs);
handleSchedule(bot, prefs);

// планировщик авторассылки
setupScheduler(bot, subscribers, prefs);

// обработка ошибок polling
bot.on('polling_error', (err) => {
  console.error('❌ polling_error:', err?.code || err?.message || err);
});