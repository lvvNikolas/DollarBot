// bot/commands/schedule.js
const {
  getUserSchedule,
  setUserSchedule,
  getQuietNight,
  toggleQuietNight,
} = require('../userPrefs');

function showScheduleMenu(bot, prefs, chatId) {
  const current = getUserSchedule(prefs, chatId);
  const quiet = getQuietNight(prefs, chatId);

  bot.sendMessage(
    chatId,
    `⏰ Текущее расписание: ${humanSchedule(current)}\n` +
    `🌙 Тишина ночью (23:00–07:00): ${quiet ? 'вкл' : 'выкл'}`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🕘 09:00', callback_data: 'sch_09:00' },
            { text: '🕕 18:00', callback_data: 'sch_18:00' },
          ],
          [
            { text: '🕘 09:00 & 18:00', callback_data: 'sch_twice' },
            { text: '⏱ Каждый час', callback_data: 'sch_hourly' },
          ],
          [
            { text: '⛔️ Выкл. авторассылку', callback_data: 'sch_off' },
          ],
          [
            { text: `🌙 Тишина ночью: ${quiet ? 'выкл' : 'вкл'}`, callback_data: 'sch_quiet_toggle' },
          ],
        ],
      },
    }
  );
}

function handleSchedule(bot, prefs) {
  // /schedule — показать меню
  bot.onText(/\/schedule/, (msg) => showScheduleMenu(bot, prefs, msg.chat.id));

  // обрабатываем клики
  bot.on('callback_query', async (query) => {
    const chatId = query.message?.chat?.id;
    const data = query.data;
    if (!chatId || !data) return;

    if (data === 'sch_quiet_toggle') {
      const state = toggleQuietNight(prefs, chatId);
      await bot.answerCallbackQuery(query.id, { text: `🌙 Тишина ночью: ${state ? 'вкл' : 'выкл'}` });
      return;
    }

    if (data.startsWith('sch_')) {
      const key = data.replace('sch_', ''); // '09:00' | '18:00' | 'twice' | 'hourly' | 'off'
      setUserSchedule(prefs, chatId, key);
      await bot.answerCallbackQuery(query.id, { text: `✅ Расписание: ${humanSchedule(key)}` });
      // обновим меню, чтобы пользователь видел актуальные значения
      showScheduleMenu(bot, prefs, chatId);
    }
  });
}

function humanSchedule(k) {
  return ({
    '09:00': 'ежедневно в 09:00',
    '18:00': 'ежедневно в 18:00',
    'twice': 'ежедневно в 09:00 и 18:00',
    'hourly': 'каждый час',
    'off': 'авторассылка выключена',
  }[k]) || 'каждый час';
}

module.exports = { handleSchedule, showScheduleMenu };