// bot/commands/handleButtons.js
const { getExchangeRate } = require('../../utils/getRate');
const { saveSubscribers } = require('../subscribers');
const { getUserCurrency, setUserCurrency } = require('../userPrefs');
const { showScheduleMenu } = require('./schedule'); // ✅ правильный путь
const axios = require('axios');
const QuickChart = require('quickchart-js');

function handleButtons(bot, subscribers, prefs) {
  bot.on('callback_query', async (query) => {
    const chatId = query.message?.chat?.id;
    const action = query.data;

    if (!chatId || !action) {
      try { await bot.answerCallbackQuery(query.id); } catch {}
      return;
    }

    // текущая валюта пользователя (по умолчанию USD)
    const currency = getUserCurrency(prefs, chatId);

    try {
      // 📈 курс
      if (action === 'rate') {
        const rate = await getExchangeRate(currency, 'RUB');
        await bot.sendMessage(
          chatId,
          rate ? `💵 1 ${currency} = ${rate} RUB` : '❌ Не удалось получить курс.'
        );
      }

      // 🖼 график за 7 дней
      if (action === 'chart') {
        try {
          const today = new Date();
          const start = new Date();
          start.setDate(today.getDate() - 6);

          const startStr = start.toISOString().split('T')[0];
          const endStr = today.toISOString().split('T')[0];

          const url = `https://api.exchangerate.host/timeseries?start_date=${startStr}&end_date=${endStr}&base=${currency}&symbols=RUB`;
          const res = await axios.get(url);
          const data = res.data?.rates;

          if (!data || typeof data !== 'object') throw new Error('Нет данных');

          const labels = Object.keys(data).sort();
          const values = labels
            .map((d) => data[d]?.RUB ?? null)
            .map((v) => (v == null ? null : Number(v).toFixed(2)))
            .filter((v) => v !== null);

          if (!values.length) throw new Error('Данных нет');

          const chart = new QuickChart();
          chart
            .setConfig({
              type: 'line',
              data: {
                labels,
                datasets: [
                  { label: `${currency} → RUB (7 дней)`, data: values, fill: false, borderWidth: 2 },
                ],
              },
            })
            .setWidth(600)
            .setHeight(300)
            .setBackgroundColor('white');

          const chartUrl = chart.getUrl();

          await bot.sendPhoto(chatId, chartUrl, {
            caption: `📈 График курса ${currency} → RUB за последние 7 дней`,
          });
        } catch (err) {
          console.error('Ошибка графика:', err.message);
          await bot.sendMessage(chatId, '❌ Не удалось построить график.');
        }
      }

      // ❌ отписаться
      if (action === 'stop') {
        const updated = subscribers.filter((id) => id !== chatId);
        subscribers.length = 0;
        subscribers.push(...updated);
        saveSubscribers(subscribers);
        await bot.sendMessage(chatId, '❌ Вы отписались от рассылки.');
      }

      // 💱 меню выбора валюты
      if (action === 'set_currency') {
        await bot.sendMessage(chatId, '💱 Выберите валюту:', {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🇺🇸 USD', callback_data: 'currency_USD' },
                { text: '🇪🇺 EUR', callback_data: 'currency_EUR' },
                { text: '🇬🇧 GBP', callback_data: 'currency_GBP' },
              ],
              [
                { text: '🇨🇳 CNY', callback_data: 'currency_CNY' },
                { text: '🇯🇵 JPY', callback_data: 'currency_JPY' },
                { text: '🇨🇭 CHF', callback_data: 'currency_CHF' },
              ],
            ],
          },
        });
      }

      // ⏰ открыть меню расписания
      if (action === 'open_schedule') {
        showScheduleMenu(bot, prefs, chatId);
      }

      // выбор конкретной валюты
      if (action.startsWith('currency_')) {
        const newCurrency = action.split('_')[1]; // USD / EUR / GBP / CNY / JPY / CHF
        setUserCurrency(prefs, chatId, newCurrency);
        await bot.sendMessage(chatId, `✅ Ваша валюта установлена: ${newCurrency}`);
      }
    } finally {
      // закрываем «часики» на кнопке
      try { await bot.answerCallbackQuery(query.id); } catch {}
    }
  });
}

module.exports = { handleButtons };