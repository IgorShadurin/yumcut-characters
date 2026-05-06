import fs from 'node:fs/promises';
import path from 'node:path';

interface TmpfilesUploadResponse {
  status?: string;
  data?: {
    url?: string;
  };
}

function toTmpfilesDownloadUrl(publicUrl: string): string {
  const match = publicUrl.match(/^https?:\/\/tmpfiles\.org\/(.+)$/i);
  if (!match) {
    throw new Error(`Unexpected tmpfiles URL format: ${publicUrl}`);
  }

  return `https://tmpfiles.org/dl/${match[1]}`;
}

export async function uploadToTmpfiles(filePath: string): Promise<string> {
  const bytes = await fs.readFile(filePath);
  const fileName = path.basename(filePath);

  const formData = new FormData();
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  formData.append('file', blob, fileName);

  const response = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body: formData,
  });

  const text = await response.text();
  let parsed: TmpfilesUploadResponse;

  try {
    parsed = JSON.parse(text) as TmpfilesUploadResponse;
  } catch {
    throw new Error(`tmpfiles returned non-JSON response (${response.status}): ${text.slice(0, 500)}`);
  }

  if (!response.ok || parsed.status !== 'success' || !parsed.data?.url) {
    throw new Error(`tmpfiles upload failed (${response.status}): ${JSON.stringify(parsed)}`);
  }

  return toTmpfilesDownloadUrl(parsed.data.url);
}
