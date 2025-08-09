// utils/getRate.js
const axios = require('axios');

/**
 * Возвращает курс base -> target (например, 'USD' -> 'RUB') с округлением до 2 знаков.
 * Основной источник: exchangerate.host
 * Фолбэк: open.er-api.com
 */
async function getExchangeRate(base = 'USD', target = 'RUB') {
  // 1) основной источник
  try {
    const res = await axios.get(
      `https://api.exchangerate.host/latest?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(target)}`
    );
    const val = res.data?.rates?.[target];
    if (typeof val === 'number') return val.toFixed(2);
  } catch (e) {
    // продолжаем к фолбэку
  }

  // 2) фолбэк-источник
  try {
    const res = await axios.get(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`);
    const val = res.data?.rates?.[target];
    if (typeof val === 'number') return val.toFixed(2);
  } catch (e) {
    // глушим, вернём null ниже
  }

  return null;
}

module.exports = { getExchangeRate };