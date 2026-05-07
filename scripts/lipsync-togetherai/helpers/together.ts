import type { CliOptions, TogetherVideoResult } from '../interfaces/options';

interface TogetherErrorResponse {
  error?: {
    message?: string;
    code?: string;
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeError(payload: unknown): string {
  if (!payload) return 'Unknown Together API error';
  if (typeof payload === 'string') return payload;
  if (typeof payload === 'object') {
    const maybe = payload as TogetherErrorResponse;
    if (maybe.error?.code && maybe.error?.message) {
      return `${maybe.error.code}: ${maybe.error.message}`;
    }
    if (maybe.error?.message) return maybe.error.message;
    return JSON.stringify(payload);
  }
  return String(payload);
}

async function postJson(apiKey: string, url: string, payload: unknown): Promise<TogetherVideoResult> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Together API returned non-JSON response (${response.status}): ${text.slice(0, 500)}`);
  }

  if (!response.ok) {
    throw new Error(`Together API request failed (${response.status}): ${normalizeError(parsed)}`);
  }

  return parsed as TogetherVideoResult;
}

async function getJson(apiKey: string, url: string): Promise<TogetherVideoResult> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const text = await response.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Together API returned non-JSON response (${response.status}): ${text.slice(0, 500)}`);
  }

  if (!response.ok) {
    throw new Error(`Together API request failed (${response.status}): ${normalizeError(parsed)}`);
  }

  return parsed as TogetherVideoResult;
}

function isCompleted(result: TogetherVideoResult): boolean {
  return result.status === 'completed' && typeof result.outputs?.video_url === 'string' && !!result.outputs?.video_url;
}

function isFailed(result: TogetherVideoResult): boolean {
  return result.status === 'failed';
}

export async function createTogetherVideoTask(
  apiKey: string,
  options: CliOptions,
  imageDataUri: string,
  audioDataUri: string
): Promise<TogetherVideoResult> {
  const seconds = Number(options.seconds);
  const frameImage = {
    input_image: imageDataUri,
    frame: 'first',
  };
  const audioInput = {
    input_audio: audioDataUri,
  };

  const payload =
    options.model === 'Wan-AI/wan2.7-i2v'
      ? {
          model: options.model,
          prompt: options.prompt,
          seconds,
          media: {
            frame_images: [frameImage],
            audio_inputs: [audioInput],
          },
        }
      : {
          model: options.model,
          prompt: options.prompt,
          seconds,
          frame_images: [frameImage],
          media: {
            audio_inputs: [audioInput],
          },
        };

  return postJson(apiKey, 'https://api.together.xyz/v2/videos', payload);
}

export async function waitForTogetherVideo(
  apiKey: string,
  taskId: string,
  options: CliOptions
): Promise<TogetherVideoResult> {
  const startedAt = Date.now();

  while (Date.now() - startedAt <= options.timeoutMs) {
    const result = await getJson(apiKey, `https://api.together.xyz/v2/videos/${taskId}`);

    if (isCompleted(result)) {
      return result;
    }

    if (isFailed(result)) {
      throw new Error(`Together video task failed: ${normalizeError(result.error)}`);
    }

    await sleep(options.pollIntervalMs);
  }

  throw new Error(`Together video polling timed out after ${Math.round(options.timeoutMs / 1000)} seconds.`);
}
