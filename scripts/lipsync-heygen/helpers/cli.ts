import path from 'node:path';

import type { CliOptions } from '../interfaces/options';

function usage(): never {
  console.error('Usage: npm run lipsync:heygen -- --image <imagePath> [--audio <audioPath>] [--output <outputPath>]');
  console.error('Audio example: npm run lipsync:heygen -- --image ./avatar.png --audio ./voice.wav --output ./tmp/lipsync-heygen/out.mp4');
  console.error('Text example: npm run lipsync:heygen -- --image ./avatar.png --script "Short script text" --voice-id <voiceId> --output ./tmp/lipsync-heygen/out.mp4');
  console.error(
    'Flags: --prompt, --prompt-file, --script, --script-file, --voice-id, --include-cost=<true|false> (default true), --no-cost, --include-report=<true|false> (default true), --no-report'
  );
  process.exit(1);
}

function parseBooleanFlag(rawValue: string, flagName: string): boolean {
  const value = rawValue.trim().toLowerCase();
  if (value === 'true' || value === '1' || value === 'yes') return true;
  if (value === 'false' || value === '0' || value === 'no') return false;
  throw new Error(`${flagName} must be true/false (or 1/0).`);
}

export function parseCliArgs(argv: string[], projectRoot: string): CliOptions {
  const named = new Map<string, string>();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) usage();

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

  const imagePath = (named.get('--image') || '').trim();
  const audioPath = (named.get('--audio') || '').trim();
  const outputPath = (named.get('--output') || '').trim();
  const additionalPrompt = (named.get('--prompt') || '').trim();
  const inlineScript = (named.get('--script') || '').trim();
  const voiceId = (named.get('--voice-id') || '').trim();
  const promptFilePath = (
    named.get('--prompt-file') || path.join(projectRoot, 'scripts', 'lipsync-heygen', 'prompts', 'performance-default.md')
  ).trim();
  const scriptFilePath = (
    named.get('--script-file') || path.join(projectRoot, 'scripts', 'lipsync-heygen', 'prompts', 'script-default.md')
  ).trim();
  const includeCost = parseBooleanFlag(named.get('--include-cost') || 'true', '--include-cost');
  const includeReport = parseBooleanFlag(named.get('--include-report') || 'true', '--include-report');
  const pollIntervalMs = Number((named.get('--poll-interval-ms') || '5000').trim());
  const timeoutMs = Number((named.get('--timeout-ms') || '600000').trim());

  if (!imagePath) usage();

  if (!Number.isFinite(pollIntervalMs) || pollIntervalMs < 1000) {
    throw new Error('--poll-interval-ms must be a number >= 1000');
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs < 10000) {
    throw new Error('--timeout-ms must be a number >= 10000');
  }

  return {
    imagePath: path.resolve(imagePath),
    audioPath: audioPath ? path.resolve(audioPath) : undefined,
    outputPath: outputPath ? path.resolve(outputPath) : undefined,
    promptFilePath: path.resolve(promptFilePath),
    scriptFilePath: path.resolve(scriptFilePath),
    additionalPrompt: additionalPrompt || undefined,
    inlineScript: inlineScript || undefined,
    voiceId: voiceId || undefined,
    includeCost,
    includeReport,
    pollIntervalMs,
    timeoutMs,
    prompt: '',
    scriptText: '',
  };
}
