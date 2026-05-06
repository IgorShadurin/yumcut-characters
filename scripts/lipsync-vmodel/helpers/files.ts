import fs from 'node:fs/promises';
import path from 'node:path';

function slugFromPath(filePath: string): string {
  const baseName = path.parse(filePath).name.toLowerCase();
  const slug = baseName.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug || 'lipsync';
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

export async function downloadToFile(url: string, outputPath: string, authToken?: string): Promise<void> {
  const headers: Record<string, string> = {};
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let response = await fetch(url, { headers });

  if (!response.ok && authToken) {
    response = await fetch(url);
  }

  if (!response.ok) {
    throw new Error(`Failed to download result (${response.status}): ${response.statusText}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, bytes);
}

export function defaultOutputPath(projectRoot: string, imagePath: string): string {
  const slug = slugFromPath(imagePath);
  return path.join(projectRoot, 'tmp', 'lipsync-vmodel', `${slug}-lipsync.mp4`);
}

export function sidecarJsonPath(outputVideoPath: string): string {
  const parsed = path.parse(outputVideoPath);
  return path.join(parsed.dir, `${parsed.name}.json`);
}

export async function writeJsonFile(filePath: string, payload: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}
