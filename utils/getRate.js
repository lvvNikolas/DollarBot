const axios = require('axios');

async function getDollarRate() {
  try {
    const res = await axios.get('https://open.er-api.com/v6/latest/USD');
    return res.data.rates.RUB.toFixed(2);
  } catch {
    return null;
  }
}

module.exports = { getDollarRate };
