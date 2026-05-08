import path from 'node:path';

import type { CliOptions } from '../interfaces/options';

const SUPPORTED_MODELS = new Set([
  'pixverse:lipsync@1',
  'klingai:7@1',
  'bytedance:seedance@2.0',
  'bytedance:seedance@2.0-fast',
  'prunaai:p-video@0',
] as const);

function isSeedanceModel(model: string): model is 'bytedance:seedance@2.0' | 'bytedance:seedance@2.0-fast' {
  return model === 'bytedance:seedance@2.0' || model === 'bytedance:seedance@2.0-fast';
}

function isPVideoModel(model: string): model is 'prunaai:p-video@0' {
  return model === 'prunaai:p-video@0';
}

function usage(): never {
  console.error('Usage: npm run lipsync:runware -- <videoPath> --audio <audioPath> [--model <model>] [--output <outputPath>]');
  console.error('Example: npm run lipsync:runware -- ./video.mp4 --audio ./voice.wav --model pixverse:lipsync@1 --output ./tmp/lipsync-runware/out.mp4');
  console.error('Seedance example: npm run lipsync:runware -- --image ./image.png --audio ./voice.wav --model bytedance:seedance@2.0 --output ./tmp/lipsync-runware/out.mp4');
  console.error('P-Video example: npm run lipsync:runware -- --image ./image.png --audio ./voice.wav --model prunaai:p-video@0 --output ./tmp/lipsync-runware/out.mp4');
  console.error(
    'Flags: --prompt, --prompt-file, --include-cost=<true|false> (default true), --no-cost, --include-report=<true|false> (default true), --no-report'
  );
  console.error(
    'Supported models: pixverse:lipsync@1, klingai:7@1, bytedance:seedance@2.0, bytedance:seedance@2.0-fast, prunaai:p-video@0'
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
  const imagePath = (named.get('--image') || '').trim();
  const audioPath = (named.get('--audio') || '').trim();
  const outputPath = (named.get('--output') || '').trim();
  const model = (named.get('--model') || 'prunaai:p-video@0').trim();
  const additionalPrompt = (named.get('--prompt') || '').trim();
  const promptFilePath = (
    named.get('--prompt-file') || path.join(projectRoot, 'scripts', 'lipsync-runware', 'prompts', 'performance-default.md')
  ).trim();
  const includeCost = parseBooleanFlag(named.get('--include-cost') || 'true', '--include-cost');
  const includeReport = parseBooleanFlag(named.get('--include-report') || 'true', '--include-report');
  const pollIntervalMs = Number((named.get('--poll-interval-ms') || '5000').trim());
  const timeoutMs = Number((named.get('--timeout-ms') || '600000').trim());

  if (!audioPath) usage();
  if (!SUPPORTED_MODELS.has(model as 'pixverse:lipsync@1' | 'klingai:7@1' | 'bytedance:seedance@2.0' | 'bytedance:seedance@2.0-fast' | 'prunaai:p-video@0')) {
    throw new Error(
      `Unsupported model: ${model}. Supported models: pixverse:lipsync@1, klingai:7@1, bytedance:seedance@2.0, bytedance:seedance@2.0-fast, prunaai:p-video@0`
    );
  }

  if (isSeedanceModel(model) || isPVideoModel(model)) {
    if (!imagePath) {
      throw new Error('--image is required for this model.');
    }
  } else if (!videoPath) {
    throw new Error('<videoPath> (or --video) is required for this model.');
  }
  if (!Number.isFinite(pollIntervalMs) || pollIntervalMs < 1000) {
    throw new Error('--poll-interval-ms must be a number >= 1000');
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs < 10000) {
    throw new Error('--timeout-ms must be a number >= 10000');
  }

  return {
    videoPath: videoPath ? path.resolve(videoPath) : '',
    imagePath: imagePath ? path.resolve(imagePath) : undefined,
    audioPath: path.resolve(audioPath),
    outputPath: outputPath ? path.resolve(outputPath) : undefined,
    model: model as 'pixverse:lipsync@1' | 'klingai:7@1' | 'bytedance:seedance@2.0' | 'bytedance:seedance@2.0-fast' | 'prunaai:p-video@0',
    promptFilePath: path.resolve(promptFilePath),
    additionalPrompt: additionalPrompt || undefined,
    prompt: '',
    includeCost,
    includeReport,
    pollIntervalMs,
    timeoutMs,
  };
}
