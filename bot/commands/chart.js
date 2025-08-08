const axios = require('axios');
const QuickChart = require('quickchart-js');

function handleChart(bot) {
  bot.onText(/\/chart/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      const today = new Date();
      const start = new Date();
      start.setDate(today.getDate() - 6);

      const startStr = start.toISOString().split('T')[0];
      const endStr = today.toISOString().split('T')[0];

      const url = `https://api.exchangerate.host/timeseries?start_date=${startStr}&end_date=${endStr}&base=USD&symbols=RUB`;
      const res = await axios.get(url);
      const data = res.data?.rates;

      if (!data) throw new Error('Нет данных');

      const labels = Object.keys(data);
      const values = labels.map(date => data[date].RUB?.toFixed(2) || null).filter(Boolean);

      if (values.length === 0) throw new Error('Данных нет');

      const chart = new QuickChart();
      chart.setConfig({
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'USD to RUB (7 дней)',
            data: values,
            fill: false,
            borderWidth: 2
          }]
        }
      }).setWidth(600).setHeight(300).setBackgroundColor('white');

      const chartUrl = chart.getUrl();

      bot.sendPhoto(chatId, chartUrl, {
        caption: '📈 График курса USD → RUB за последние 7 дней'
      });

    } catch (error) {
      console.error('Ошибка /chart:', error.message);
      bot.sendMessage(chatId, '❌ Не удалось построить график.');
    }
  });
}

module.exports = { handleChart };
