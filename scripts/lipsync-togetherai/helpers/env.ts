import dotenv from 'dotenv';

dotenv.config();

export function readTogetherApiKey(): string {
  const apiKey = (process.env.TOGETHER_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('Missing TOGETHER_API_KEY in .env or environment.');
  }
  return apiKey;
}
