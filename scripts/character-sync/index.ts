import { loadConfig } from './helpers/env';

function main(): void {
  const config = loadConfig();

  console.log('Character sync tool is configured.');
  console.log(`API URL: ${config.apiUrl}`);
}

main();
