const { saveSubscribers } = require('../subscribers');

function handleStop(bot, subscribers) {
  bot.onText(/\/stop/, (msg) => {
    const chatId = msg.chat.id;

    if (subscribers.includes(chatId)) {
      const updated = subscribers.filter(id => id !== chatId);
      subscribers.length = 0;
      subscribers.push(...updated);

      saveSubscribers(subscribers);
      console.log('❌ Отписался:', chatId);
    }

    bot.sendMessage(chatId, '❌ Вы успешно отписались от рассылки.');
  });
}

module.exports = { handleStop };
