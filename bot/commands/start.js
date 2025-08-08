const { getDollarRate } = require('../../utils/getRate');
const { saveSubscribers } = require('../subscribers');

function handleStart(bot, subscribers) {
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    if (!subscribers.includes(chatId)) {
      subscribers.push(chatId);
      saveSubscribers(subscribers);
      console.log('✅ Подписан:', chatId);
    }

    bot.sendMessage(chatId, 
      '👋 Подписка активирована.\n\n' +
      '📈 /rate — курс USD\n' +
      '🖼 /chart — график за 7 дней\n' +
      '❌ /stop — отписаться'
    );

    const rate = await getDollarRate();
    if (rate) {
      bot.sendMessage(chatId, `💵 Прямо сейчас: 1 USD = ${rate} RUB`);
    }
  });
}

module.exports = { handleStart };
