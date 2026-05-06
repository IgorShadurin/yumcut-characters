import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function probeMediaDurationSec(filePath: string): Promise<number | undefined> {
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filePath,
    ]);

    const value = Number(stdout.trim());
    if (!Number.isFinite(value) || value <= 0) {
      return undefined;
    }

    return value;
  } catch {
    return undefined;
  }
}
