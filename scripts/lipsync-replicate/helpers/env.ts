export function readReplicateApiToken(): string {
  const apiToken = process.env.REPLICATE_API_TOKEN?.trim();
  if (!apiToken) {
    throw new Error('Missing REPLICATE_API_TOKEN in environment.');
  }
  return apiToken;
}
