const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cron = require('node-cron');

const token = '8256297651:AAGenxqZT8jGooa1-Vf1MJqXUuvgbDkgUa8';
const bot = new TelegramBot(token, { polling: true });

let subscribers = [];

// Функция получения курса доллара
async function getDollarRate() {
  try {
    const response = await axios.get('https://open.er-api.com/v6/latest/USD');
    return response.data.rates.RUB.toFixed(2);
  } catch (error) {
    console.error('❌ Ошибка при получении курса доллара:', error.message);
    return null;
  }
}

// ✅ Тестовое сообщение при запуске
(async () => {
  const rate = await getDollarRate();
  console.log('🚀 Бот запущен! Текущий курс USD/RUB:', rate);
})();

// Команда /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  if (!subscribers.includes(chatId)) {
    subscribers.push(chatId);
    console.log('✅ Новый подписчик:', chatId);
  }

  bot.sendMessage(
    chatId,
    '👋 Привет! Я буду присылать курс доллара к рублю каждые 60 секунд для теста.\n' +
    'Напиши /rate чтобы узнать курс прямо сейчас.\n' +
    'Напиши /stop чтобы отписаться.'
  );

  // Отправляем курс сразу при подписке
  const rate = await getDollarRate();
  if (rate) {
    bot.sendMessage(chatId, `💵 Прямо сейчас: 1 USD = ${rate} RUB`);
  }
});

// Команда /rate
bot.onText(/\/rate/, async (msg) => {
  const chatId = msg.chat.id;
  const rate = await getDollarRate();
  if (rate) {
    bot.sendMessage(chatId, `💵 1 USD = ${rate} RUB`);
  } else {
    bot.sendMessage(chatId, '❌ Не удалось получить курс.');
  }
});

// Команда /stop для отписки
bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  subscribers = subscribers.filter((id) => id !== chatId);
  console.log('❌ Пользователь отписался:', chatId);
  bot.sendMessage(chatId, '❌ Вы отписались от рассылки курса.');
});

// 🔄 Рассылка каждые 60 секунд
cron.schedule('*/60 * * * * *', async () => {
  const time = new Date().toLocaleTimeString();
  console.log(`⏰ Cron сработал: ${time}, подписчиков: ${subscribers.length}`);

  const rate = await getDollarRate();
  if (!rate) return;

  subscribers.forEach((chatId) => {
    bot.sendMessage(chatId, `⏰ ${time} — 1 USD = ${rate} RUB`);
  });
});