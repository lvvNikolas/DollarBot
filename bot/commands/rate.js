const { getDollarRate } = require('../../utils/getRate');

function handleRate(bot) {
  bot.onText(/\/rate/, async (msg) => {
    const chatId = msg.chat.id;
    const rate = await getDollarRate();

    if (rate) {
      bot.sendMessage(chatId, `💵 1 USD = ${rate} RUB`);
    } else {
      bot.sendMessage(chatId, '❌ Не удалось получить курс.');
    }
  });
}

module.exports = { handleRate };
