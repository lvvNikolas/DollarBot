const cron = require('node-cron');
const { getDollarRate } = require('../utils/getRate');

function setupScheduler(bot, subscribers) {
  cron.schedule('*/60 * * * * *', async () => {
    const time = new Date().toLocaleTimeString();
    const rate = await getDollarRate();
    if (!rate) return;

    for (const chatId of subscribers) {
      bot.sendMessage(chatId, `⏰ ${time} — 1 USD = ${rate} RUB`);
    }
  });
}

module.exports = { setupScheduler };
