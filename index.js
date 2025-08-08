const TelegramBot = require('node-telegram-bot-api');
const { loadSubscribers } = require('./bot/subscribers');
const { handleStart } = require('./bot/commands/start');
const { handleRate } = require('./bot/commands/rate');
const { handleStop } = require('./bot/commands/stop');
const { handleChart } = require('./bot/commands/chart');
const { setupScheduler } = require('./bot/scheduler');

// 🔐 ТВОЙ АКТУАЛЬНЫЙ ТОКЕН
const token = '8256297651:AAGenxqZT8jGooa1-Vf1MJqXUuvgbDkgUa8';

const bot = new TelegramBot(token, { polling: true });

let subscribers = loadSubscribers();

handleStart(bot, subscribers);
handleRate(bot);
handleStop(bot, subscribers);
handleChart(bot);
setupScheduler(bot, subscribers);
