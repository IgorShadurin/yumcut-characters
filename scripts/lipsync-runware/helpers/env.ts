import dotenv from 'dotenv';

dotenv.config();

export function readRunwareApiKey(): string {
  const apiKey = (process.env.RUNWARE_API_KEY || '').trim();

  if (!apiKey) {
    throw new Error('Missing RUNWARE_API_KEY in .env or environment.');
  }

  return apiKey;
}
