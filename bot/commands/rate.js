const { getExchangeRate } = require('../../utils/getRate');
const { getUserCurrency } = require('../userPrefs');

function handleRate(bot, prefs) {
  bot.onText(/\/rate/, async (msg) => {
    const chatId = msg.chat.id;

    const currency = getUserCurrency(prefs, chatId);
    const rate = await getExchangeRate(currency, 'RUB');

    if (rate) {
      bot.sendMessage(chatId, `💵 1 ${currency} = ${rate} RUB`);
    } else {
      bot.sendMessage(chatId, '❌ Не удалось получить курс.');
    }
  });
}

module.exports = { handleRate };