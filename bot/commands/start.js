const { getExchangeRate } = require('../../utils/getRate');
const { saveSubscribers } = require('../subscribers');
const { getUserCurrency } = require('../userPrefs');

function handleStart(bot, subscribers, prefs) {
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    // подписываем и сохраняем (идемпотентно)
    if (!subscribers.includes(chatId)) {
      subscribers.push(chatId);
      saveSubscribers(subscribers);
      console.log('✅ Подписан:', chatId);
    }

    // текущая валюта + безопасное получение курса
    const currency = getUserCurrency(prefs, chatId);
    let rateText = '—';
    try {
      const rate = await getExchangeRate(currency, 'RUB');
      if (rate) rateText = rate;
    } catch (e) {
      console.warn('⚠️ /start: не удалось получить курс:', e?.message || e);
    }

    const text = [
      '👋 Подписка активирована.',
      `💵 Прямо сейчас: 1 ${currency} = ${rateText} RUB`,
      '',
      'Можешь пользоваться кнопками ниже 👇',
    ].join('\n');

    // приветствие + инлайн-меню
    bot.sendMessage(chatId, text, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📈 Узнать курс', callback_data: 'rate' },
            { text: '🖼 График', callback_data: 'chart' },
          ],
          [
            { text: '💱 Валюта', callback_data: 'set_currency' },
            { text: '⏰ Расписание', callback_data: 'open_schedule' },
            { text: '❌ Отписаться', callback_data: 'stop' },
          ],
        ],
      },
    });
  });
}

module.exports = { handleStart };