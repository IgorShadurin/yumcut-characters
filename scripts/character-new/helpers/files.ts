import fs from 'node:fs/promises';
import path from 'node:path';

function slug(input: string): string {
  const normalized = input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return normalized || 'character';
}

export async function assertFileExists(filePath: string): Promise<void> {
  let stat;
  try {
    stat = await fs.stat(filePath);
  } catch {
    throw new Error(`File not found: ${filePath}`);
  }

  if (!stat.isFile()) {
    throw new Error(`Not a file: ${filePath}`);
  }
}

export async function readTextFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf8');
}

export async function writeBinaryFile(filePath: string, bytes: Buffer): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, bytes);
}

export async function writeJsonFile(filePath: string, payload: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

export function defaultOutputPath(projectRoot: string, prompt: string): string {
  const stamp = new Date().toISOString().replace(/[.:]/g, '-');
  return path.join(projectRoot, 'tmp', 'character-new', `${slug(prompt).slice(0, 60)}-${stamp}.png`);
}

export function sidecarJsonPath(outputImagePath: string): string {
  const parsed = path.parse(outputImagePath);
  return path.join(parsed.dir, `${parsed.name}.json`);
}
