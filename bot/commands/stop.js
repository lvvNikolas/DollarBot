const { saveSubscribers } = require('../subscribers');

function handleStop(bot, subscribers) {
  bot.onText(/\/stop/, (msg) => {
    const chatId = msg.chat.id;

    // если подписан — удаляем; если нет — просто продолжаем (идемпотентность)
    if (subscribers.includes(chatId)) {
      const updated = subscribers.filter((id) => id !== chatId);
      subscribers.length = 0;
      subscribers.push(...updated);
      saveSubscribers(subscribers);
      console.log('❌ Отписался:', chatId);
    } else {
      console.log('ℹ️ /stop: пользователь не был в подписчиках:', chatId);
    }

    // шлём сообщение без клавиатуры, чтобы скрыть меню
    bot.sendMessage(chatId, '❌ Вы успешно отписались от рассылки.', {
      reply_markup: { remove_keyboard: true },
    });
  });
}

module.exports = { handleStop };