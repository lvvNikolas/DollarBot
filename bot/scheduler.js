const cron = require('node-cron');
const { getDollarRate } = require('../utils/getRate');
const { getUserSchedule, getQuietNight } = require('./userPrefs');

function isTime(hhmm, date = new Date()) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}` === hhmm;
}
function isQuiet(date = new Date()) {
  const hour = date.getHours();
  return hour >= 23 || hour < 7;
}

function setupScheduler(bot, subscribers, prefs) {
  cron.schedule('*/1 * * * *', async () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    for (const chatId of subscribers) {
      const schedule = getUserSchedule(prefs, chatId);
      const quiet = getQuietNight(prefs, chatId);

      if (schedule === 'off') continue;
      if (quiet && isQuiet(now)) continue;

      let shouldSend = false;
      switch (schedule) {
        case 'hourly':
          shouldSend = now.getMinutes() === 0;
          break;
        case '09:00':
          shouldSend = isTime('09:00', now);
          break;
        case '18:00':
          shouldSend = isTime('18:00', now);
          break;
        case 'twice':
          shouldSend = isTime('09:00', now) || isTime('18:00', now);
          break;
        default:
          shouldSend = now.getMinutes() === 0;
      }

      if (!shouldSend) continue;

      const rate = await getDollarRate();
      if (!rate) continue;

      await bot.sendMessage(chatId, `⏰ ${timeStr} — 1 USD = ${rate} RUB`);
    }
  });
}

module.exports = { setupScheduler };