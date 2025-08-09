const axios = require('axios');
const QuickChart = require('quickchart-js');
const { getUserCurrency } = require('../userPrefs');

function handleChart(bot, prefs) {
  bot.onText(/\/chart/, async (msg) => {
    const chatId = msg.chat.id;
    const currency = getUserCurrency(prefs, chatId); // выбранная валюта (по умолчанию USD)

    try {
      const today = new Date();
      const start = new Date();
      start.setDate(today.getDate() - 6);

      const startStr = start.toISOString().split('T')[0];
      const endStr = today.toISOString().split('T')[0];

      const url = `https://api.exchangerate.host/timeseries?start_date=${startStr}&end_date=${endStr}&base=${currency}&symbols=RUB`;
      const res = await axios.get(url);
      const data = res.data?.rates;

      if (!data || typeof data !== 'object') {
        throw new Error('Нет данных');
      }

      // сортируем даты по возрастанию
      const labels = Object.keys(data).sort();
      const values = labels
        .map((date) => data[date]?.RUB ?? null)
        .map((v) => (v == null ? null : Number(v).toFixed(2)))
        .filter((v) => v !== null);

      if (values.length === 0) {
        throw new Error('Данных нет');
      }

      const chart = new QuickChart();
      chart
        .setConfig({
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: `${currency} → RUB (7 дней)`,
                data: values,
                fill: false,
                borderWidth: 2,
              },
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
    } catch (error) {
      console.error('Ошибка /chart:', error.message);
      bot.sendMessage(chatId, '❌ Не удалось построить график.');
    }
  });
}

module.exports = { handleChart };