import fs from 'node:fs/promises';
import path from 'node:path';

const VIDEO_MIME: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
};

const AUDIO_MIME: Record<string, string> = {
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.flac': 'audio/flac',
};

function readMimeByExtension(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return VIDEO_MIME[ext] || AUDIO_MIME[ext] || 'application/octet-stream';
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

export async function fileToDataUri(filePath: string): Promise<string> {
  const bytes = await fs.readFile(filePath);
  const mime = readMimeByExtension(filePath);
  const base64 = bytes.toString('base64');
  return `data:${mime};base64,${base64}`;
}

export async function downloadToFile(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download result (${response.status}): ${response.statusText}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, bytes);
}

export function defaultOutputPath(projectRoot: string): string {
  const stamp = new Date().toISOString().replace(/[.:]/g, '-');
  return path.join(projectRoot, 'tmp', 'lipsync-runware', `lipsync-${stamp}.mp4`);
}

export function sidecarJsonPath(outputVideoPath: string): string {
  const parsed = path.parse(outputVideoPath);
  return path.join(parsed.dir, `${parsed.name}.json`);
}

export async function writeJsonFile(filePath: string, payload: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}
