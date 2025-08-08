const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs');

const token = process.env.BOT_TOKEN || '8256297651:AAGenxqZT8jGooa1-Vf1MJqXUuvgbDkgUa8';
const bot = new TelegramBot(token, { polling: true });

const SUBSCRIBERS_FILE = './subscribers.json';

// Загрузка подписчиков из файла
function loadSubscribers() {
  try {
    const data = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('❌ Не удалось загрузить подписчиков:', err.message);
    return [];
  }
}

// Сохранение подписчиков в файл
function saveSubscribers(subs) {
  try {
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subs, null, 2));
  } catch (err) {
    console.error('❌ Не удалось сохранить подписчиков:', err.message);
  }
}

let subscribers = loadSubscribers();

// Получение курса доллара
async function getDollarRate() {
  try {
    const response = await axios.get('https://open.er-api.com/v6/latest/USD');
    return response.data.rates.RUB.toFixed(2);
  } catch (error) {
    console.error('❌ Ошибка при получении курса доллара:', error.message);
    return null;
  }
}

// /start — подписка
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  if (!subscribers.includes(chatId)) {
    subscribers.push(chatId);
    saveSubscribers(subscribers);
    console.log('✅ Новый подписчик сохранён:', chatId);
  }

  bot.sendMessage(chatId, '👋 Подписка активирована. Я буду присылать курс доллара к рублю каждые 30 секунд для теста.\nНапиши /rate чтобы узнать курс сейчас.\nНапиши /stop чтобы отписаться.');

  const rate = await getDollarRate();
  if (rate) {
    bot.sendMessage(chatId, `💵 Прямо сейчас: 1 USD = ${rate} RUB`);
  }
});

// /rate — мгновенный курс
bot.onText(/\/rate/, async (msg) => {
  const chatId = msg.chat.id;
  const rate = await getDollarRate();
  if (rate) {
    bot.sendMessage(chatId, `💵 1 USD = ${rate} RUB`);
  } else {
    bot.sendMessage(chatId, '❌ Не удалось получить курс.');
  }
});

// /stop — отписка
bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  subscribers = subscribers.filter((id) => id !== chatId);
  saveSubscribers(subscribers);
  console.log('❌ Пользователь отписался:', chatId);
  bot.sendMessage(chatId, '❌ Вы отписались от рассылки.');
});

// Рассылка каждые 30 секунд
cron.schedule('*/60 * * * * *', async () => {
  const time = new Date().toLocaleTimeString();
  console.log(`⏰ Cron сработал: ${time}, подписчиков: ${subscribers.length}`);

  const rate = await getDollarRate();
  if (!rate) return;

  subscribers.forEach((chatId) => {
    bot.sendMessage(chatId, `⏰ ${time} — 1 USD = ${rate} RUB`);
  });
});
