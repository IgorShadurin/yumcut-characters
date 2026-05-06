import path from 'node:path';

import type { CliOptions, VmodelModelId, VmodelResolution } from '../interfaces/options';

const SUPPORTED_MODELS = new Set([
  'vmodel/talking-photo-turbo-pro',
  'vmodel/talking-photo-turbo',
  'lipsync/talk-photo',
] as const);
const SUPPORTED_RESOLUTIONS = new Set(['480', '720'] as const);

function usage(): never {
  console.error('Usage: npm run lipsync:vmodel -- <imagePath> --audio <audioPath> [--output <outputPath>]');
  console.error('Example: npm run lipsync:vmodel -- ./avatar.png --audio ./voice.wav --resolution 720 --output ./tmp/lipsync-vmodel/out.mp4');
  console.error('Flags: --model <model> (default vmodel/talking-photo-turbo-pro), --resolution <480|720> (default 720), --include-cost=<true|false>, --no-cost, --include-report=<true|false>, --no-report');
  console.error('Supported models: vmodel/talking-photo-turbo-pro, vmodel/talking-photo-turbo, lipsync/talk-photo');
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

  const imagePath = (named.get('--image') || positional[0] || '').trim();
  const audioPath = (named.get('--audio') || '').trim();
  const outputPath = (named.get('--output') || '').trim();
  const model = (named.get('--model') || 'vmodel/talking-photo-turbo-pro').trim();
  const resolution = (named.get('--resolution') || '720').trim();
  const includeCost = parseBooleanFlag(named.get('--include-cost') || 'true', '--include-cost');
  const includeReport = parseBooleanFlag(named.get('--include-report') || 'true', '--include-report');
  const pollIntervalMs = Number((named.get('--poll-interval-ms') || '5000').trim());
  const timeoutMs = Number((named.get('--timeout-ms') || '600000').trim());

  if (!imagePath || !audioPath) usage();

  if (!SUPPORTED_MODELS.has(model as VmodelModelId)) {
    throw new Error(
      `Unsupported model: ${model}. Supported models: vmodel/talking-photo-turbo-pro, vmodel/talking-photo-turbo, lipsync/talk-photo`
    );
  }

  if (!SUPPORTED_RESOLUTIONS.has(resolution as VmodelResolution)) {
    throw new Error(`Unsupported resolution: ${resolution}. Supported values: 480, 720`);
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
    model: model as VmodelModelId,
    resolution: resolution as VmodelResolution,
    includeCost,
    includeReport,
    pollIntervalMs,
    timeoutMs,
  };
}
