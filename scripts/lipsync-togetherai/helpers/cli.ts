import path from 'node:path';

import type { CliOptions, TogetherLipsyncModel } from '../interfaces/options';

const SUPPORTED_MODELS = new Set([
  'Wan-AI/wan2.7-i2v',
  'google/veo-3.0-audio',
  'google/veo-3.0-fast-audio',
] as const);

function usage(): never {
  console.error('Usage: npm run lipsync:togetherai -- <imagePath> --audio <audioPath> --model <model> [--output <outputPath>]');
  console.error('Example: npm run lipsync:togetherai -- ./avatar.png --audio ./voice.wav --model Wan-AI/wan2.7-i2v --output ./tmp/lipsync-togetherai/out.mp4');
  console.error(
    'Flags: --prompt, --prompt-file, --seconds=<4|6|8>, --include-cost=<true|false> (default true), --no-cost, --include-report=<true|false> (default true), --no-report'
  );
  console.error('Supported models: Wan-AI/wan2.7-i2v, google/veo-3.0-audio, google/veo-3.0-fast-audio');
  process.exit(1);
}

function parseBooleanFlag(rawValue: string, flagName: string): boolean {
  const value = rawValue.trim().toLowerCase();
  if (value === 'true' || value === '1' || value === 'yes') return true;
  if (value === 'false' || value === '0' || value === 'no') return false;
  throw new Error(`${flagName} must be true/false (or 1/0).`);
}

function parseSeconds(rawValue: string): string {
  const value = rawValue.trim();
  if (value === '4' || value === '6' || value === '8') {
    return value;
  }
  throw new Error('--seconds must be one of: 4, 6, 8');
}

export function parseCliArgs(argv: string[], projectRoot: string): CliOptions {
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

  const imagePath = (named.get('--image') || positional[0] || '').trim();
  const audioPath = (named.get('--audio') || '').trim();
  const outputPath = (named.get('--output') || '').trim();
  const model = (named.get('--model') || '').trim();
  const additionalPrompt = (named.get('--prompt') || '').trim();
  const promptFilePath = (
    named.get('--prompt-file') || path.join(projectRoot, 'scripts', 'lipsync-togetherai', 'prompts', 'performance-default.md')
  ).trim();
  const includeCost = parseBooleanFlag(named.get('--include-cost') || 'true', '--include-cost');
  const includeReport = parseBooleanFlag(named.get('--include-report') || 'true', '--include-report');
  const pollIntervalMs = Number((named.get('--poll-interval-ms') || '5000').trim());
  const timeoutMs = Number((named.get('--timeout-ms') || '900000').trim());
  const seconds = parseSeconds(named.get('--seconds') || '6');

  if (!imagePath || !audioPath || !model) usage();

  if (!SUPPORTED_MODELS.has(model as TogetherLipsyncModel)) {
    throw new Error(
      `Unsupported model: ${model}. Supported models: Wan-AI/wan2.7-i2v, google/veo-3.0-audio, google/veo-3.0-fast-audio`
    );
  }

  if (!Number.isFinite(pollIntervalMs) || pollIntervalMs < 1000) {
    throw new Error('--poll-interval-ms must be a number >= 1000');
  }

  if (!Number.isFinite(timeoutMs) || timeoutMs < 10000) {
    throw new Error('--timeout-ms must be a number >= 10000');
  }

  return {
    imagePath: path.resolve(imagePath),
    audioPath: path.resolve(audioPath),
    outputPath: outputPath ? path.resolve(outputPath) : undefined,
    model: model as TogetherLipsyncModel,
    promptFilePath: path.resolve(promptFilePath),
    additionalPrompt: additionalPrompt || undefined,
    prompt: '',
    includeCost,
    includeReport,
    pollIntervalMs,
    timeoutMs,
    seconds,
  };
}
