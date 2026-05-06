import dotenv from 'dotenv';

import type { CharacterSyncConfig } from '../interfaces/config';

dotenv.config();

function readEnv(name: string): string {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(`Missing required env variable: ${name}`);
  }

  return value.trim();
}

export function loadConfig(): CharacterSyncConfig {
  return {
    apiKey: readEnv('YUMCUT_API_KEY'),
    apiUrl: readEnv('YUMCUT_API_URL'),
  };
}
