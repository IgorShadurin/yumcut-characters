const { loadConfig } = require('./helpers/env');

function main() {
  const config = loadConfig();

  console.log('Character sync tool is configured.');
  console.log(`API URL: ${config.apiUrl}`);
}

main();
