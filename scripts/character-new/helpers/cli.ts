import path from 'node:path';

import { defaultAuthPath } from './auth';
import type { CliOptions } from '../interfaces/options';

function usage(): never {
  console.error('Usage: npm run character:new -- --prompt "character description" [--output /path/to/file.png]');
  console.error('Example: npm run character:new -- --prompt "friendly robot barista with red apron"');
  console.error('Flags: --auth-path, --prompt-file, --style-file, --model, --include-cost=<true|false>, --no-cost, --include-report=<true|false>, --no-report');
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
    if (!token.startsWith('--')) continue;

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

  const prompt = (named.get('--prompt') || '').trim();
  if (!prompt) usage();

  const outputPath = (named.get('--output') || '').trim();
  const authPath = (named.get('--auth-path') || defaultAuthPath()).trim();
  const promptFilePath =
    (named.get('--prompt-file') || path.join(projectRoot, 'scripts', 'character-new', 'prompts', 'character-9x16.md')).trim();
  const styleFilePath =
    (named.get('--style-file') || path.join(projectRoot, 'scripts', 'character-new', 'prompts', 'styles', 'tropitoon.md')).trim();
  const model = (named.get('--model') || 'gpt-5.4').trim();
  const includeCost = parseBooleanFlag(named.get('--include-cost') || 'true', '--include-cost');
  const includeReport = parseBooleanFlag(named.get('--include-report') || 'true', '--include-report');

  return {
    prompt,
    outputPath: outputPath ? path.resolve(outputPath) : undefined,
    authPath: path.resolve(authPath),
    promptFilePath: path.resolve(promptFilePath),
    styleFilePath: path.resolve(styleFilePath),
    model,
    includeCost,
    includeReport,
  };
}
