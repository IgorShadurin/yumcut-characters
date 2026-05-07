import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import type { CodexAuth } from '../interfaces/options';

type AuthFile = {
  auth_mode?: unknown;
  tokens?: {
    access_token?: unknown;
    refresh_token?: unknown;
  };
};

export function defaultAuthPath(): string {
  return path.join(os.homedir(), '.codex', 'auth.json');
}

function decodeJwtExpiryMs(token: string): number | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const payload = Buffer.from(parts[1]!.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const parsed = JSON.parse(payload) as { exp?: unknown };
    return typeof parsed.exp === 'number' ? parsed.exp * 1000 : null;
  } catch {
    return null;
  }
}

function normalizeChatgptBaseUrl(input: string): string {
  let baseUrl = input.trim();
  while (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  if (
    (baseUrl.startsWith('https://chatgpt.com') || baseUrl.startsWith('https://chat.openai.com')) &&
    !baseUrl.includes('/backend-api')
  ) {
    return `${baseUrl}/backend-api`;
  }
  return baseUrl;
}

function resolveChatgptBaseUrl(): string {
  const configured = process.env.CODEX_CHATGPT_BASE_URL?.trim() || process.env.CHATGPT_BASE_URL?.trim();
  return normalizeChatgptBaseUrl(configured || 'https://chatgpt.com/backend-api');
}

export async function readCodexAuth(authPath: string): Promise<CodexAuth> {
  const raw = await fs.readFile(authPath, 'utf8').catch(() => null);
  if (!raw) {
    throw new Error(`Codex auth file was not found at ${authPath}.`);
  }

  const parsed = JSON.parse(raw) as AuthFile;
  if (parsed.auth_mode !== 'chatgpt') {
    throw new Error('Codex auth is not configured in chatgpt mode.');
  }

  const accessToken = typeof parsed.tokens?.access_token === 'string' ? parsed.tokens.access_token : '';
  const refreshToken = typeof parsed.tokens?.refresh_token === 'string' ? parsed.tokens.refresh_token : '';

  if (!accessToken || !refreshToken) {
    throw new Error('Codex auth is missing access or refresh tokens.');
  }

  const expiresAtMs = decodeJwtExpiryMs(accessToken);
  if (expiresAtMs && expiresAtMs <= Date.now() + 30_000) {
    throw new Error('Codex access token is expired. Refresh Codex auth and try again.');
  }

  return {
    accessToken,
    chatgptBaseUrl: resolveChatgptBaseUrl(),
  };
}
