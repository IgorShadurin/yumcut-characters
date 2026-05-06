import path from 'node:path';

import type { CliOptions } from '../interfaces/options';

const DEFAULT_MODEL = 'pixverse:lipsync@1';

function usage(): never {
  console.error('Usage: npm run lipsync:runware -- <videoPath> --audio <audioPath> [--output <outputPath>] [--model <model>]');
  console.error('Example: npm run lipsync:runware -- ./video.mp4 --audio ./voice.wav --output ./tmp/lipsync-runware/out.mp4');
  console.error('Flags: --include-cost=<true|false> (default true), --no-cost, --include-report=<true|false> (default true), --no-report');
  process.exit(1);
}

function parseBooleanFlag(rawValue: string, flagName: string): boolean {
  const value = rawValue.trim().toLowerCase();
  if (value === 'true' || value === '1' || value === 'yes') return true;
  if (value === 'false' || value === '0' || value === 'no') return false;
  throw new Error(`${flagName} must be true/false (or 1/0).`);
}

export function parseCliArgs(argv: string[]): CliOptions {
  const positional: string[] = [];
  const named = new Map<string, string>();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }
    if (token === '--no-cost') {
      named.set('--include-cost', 'false');
      continue;
    }
    if (token === '--no-report') {
      named.set('--include-report', 'false');
      continue;
    }

    const [rawKey, inlineValue] = token.split('=', 2);
    const key = rawKey.trim();

    if (!key) usage();

    if (inlineValue !== undefined) {
      named.set(key, inlineValue);
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith('--')) usage();
    named.set(key, next);
    index += 1;
  }

  const videoPath = (named.get('--video') || positional[0] || '').trim();
  const audioPath = (named.get('--audio') || '').trim();
  const outputPath = (named.get('--output') || '').trim();
  const model = (named.get('--model') || DEFAULT_MODEL).trim();
  const includeCost = parseBooleanFlag(named.get('--include-cost') || 'true', '--include-cost');
  const includeReport = parseBooleanFlag(named.get('--include-report') || 'true', '--include-report');
  const pollIntervalMs = Number((named.get('--poll-interval-ms') || '5000').trim());
  const timeoutMs = Number((named.get('--timeout-ms') || '600000').trim());

  if (!videoPath || !audioPath) usage();
  if (!Number.isFinite(pollIntervalMs) || pollIntervalMs < 1000) {
    throw new Error('--poll-interval-ms must be a number >= 1000');
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs < 10000) {
    throw new Error('--timeout-ms must be a number >= 10000');
  }

  return {
    videoPath: path.resolve(videoPath),
    audioPath: path.resolve(audioPath),
    outputPath: outputPath ? path.resolve(outputPath) : undefined,
    model,
    includeCost,
    includeReport,
    pollIntervalMs,
    timeoutMs,
  };
}
