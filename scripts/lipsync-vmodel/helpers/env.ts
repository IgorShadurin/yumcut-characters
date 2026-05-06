import dotenv from 'dotenv';

dotenv.config();

export function readVmodelApiKey(): string {
  const apiKey = (process.env.VMODEL_API_KEY || '').trim();

  if (!apiKey) {
    throw new Error('Missing VMODEL_API_KEY in .env or environment.');
  }

  return apiKey;
}
