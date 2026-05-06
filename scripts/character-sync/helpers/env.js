const dotenv = require('dotenv');

dotenv.config();

function readEnv(name) {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(`Missing required env variable: ${name}`);
  }

  return value.trim();
}

function loadConfig() {
  return {
    apiKey: readEnv('YUMCUT_API_KEY'),
    apiUrl: readEnv('YUMCUT_API_URL'),
  };
}

module.exports = {
  loadConfig,
};
