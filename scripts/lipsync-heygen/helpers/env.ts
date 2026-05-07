import dotenv from 'dotenv';

dotenv.config();

export function readHeygenApiKey(): string {
  const value = process.env.HEYGEN_API_KEY?.trim();
  if (!value) {
    throw new Error('Missing HEYGEN_API_KEY in environment (.env).');
  }
  return value;
}
