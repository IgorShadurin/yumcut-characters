import type { CliOptions, HeygenCreateResult, HeygenVideoResult } from '../interfaces/options';

interface HeygenEnvelope {
  data?: Record<string, unknown>;
  error?: unknown;
  message?: unknown;
}

const HEYGEN_BASE_URL = 'https://api.heygen.com';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pickString(...values: Array<unknown>): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value;
  }
  return undefined;
}

function pickNumber(...values: Array<unknown>): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

function readEnvelopeMessage(payload: unknown): string {
  if (!payload) return 'Unknown HeyGen API error';
  if (typeof payload === 'string') return payload;
  if (typeof payload === 'object') return JSON.stringify(payload);
  return String(payload);
}

async function postJson(apiKey: string, url: string, payload: unknown): Promise<HeygenEnvelope> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`HeyGen returned non-JSON response (${response.status}): ${text.slice(0, 500)}`);
  }

  if (!response.ok) {
    throw new Error(`HeyGen request failed (${response.status}): ${readEnvelopeMessage(parsed)}`);
  }

  return parsed as HeygenEnvelope;
}

async function getJson(apiKey: string, url: string): Promise<HeygenEnvelope> {
  const response = await fetch(url, {
    headers: {
      'X-Api-Key': apiKey,
    },
  });

  const text = await response.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`HeyGen returned non-JSON response (${response.status}): ${text.slice(0, 500)}`);
  }

  if (!response.ok) {
    throw new Error(`HeyGen request failed (${response.status}): ${readEnvelopeMessage(parsed)}`);
  }

  return parsed as HeygenEnvelope;
}

function buildCreatePayload(options: CliOptions, imageUrl: string, audioUrl?: string): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    dimension: {
      width: 720,
      height: 1280,
    },
    image_url: imageUrl,
  };

  if (audioUrl) {
    payload.audio_url = audioUrl;
    return payload;
  }

  payload.text = options.scriptText;
  payload.voice_id = options.voiceId;
  return payload;
}

function extractVideoId(envelope: HeygenEnvelope): string | undefined {
  const data = envelope.data || {};
  return pickString(data.video_id, data.videoId, (envelope as Record<string, unknown>).video_id);
}

function extractVideoResult(videoId: string, envelope: HeygenEnvelope): HeygenVideoResult {
  const data = envelope.data || {};
  const status = pickString(data.status, data.video_status, (envelope as Record<string, unknown>).status) || 'unknown';
  const videoUrl = pickString(data.video_url, data.url, data.videoUrl);
  const thumbnailUrl = pickString(data.thumbnail_url, data.thumbnailUrl);
  const durationSec = pickNumber(data.duration, data.duration_sec, data.durationSec);
  const error = pickString(data.error, (envelope as Record<string, unknown>).error, envelope.message);

  return {
    videoId,
    status,
    videoUrl,
    thumbnailUrl,
    durationSec,
    error,
    rawData: data,
  };
}

export async function pickHeygenVoiceId(apiKey: string): Promise<string> {
  const envelope = await getJson(apiKey, `${HEYGEN_BASE_URL}/v2/voices`);
  const data = envelope.data || {};
  const voices = (data.voices as Array<Record<string, unknown>> | undefined) ||
    (data as unknown as Array<Record<string, unknown>> | undefined) ||
    [];

  for (const voice of voices) {
    const id = pickString(voice.voice_id, voice.voiceId, voice.id);
    if (id) return id;
  }

  throw new Error('No HeyGen voice_id found in /v2/voices response. Pass --voice-id explicitly.');
}

export async function createHeygenVideo(
  apiKey: string,
  options: CliOptions,
  imageUrl: string,
  audioUrl?: string
): Promise<HeygenCreateResult> {
  const envelope = await postJson(apiKey, `${HEYGEN_BASE_URL}/v2/videos`, buildCreatePayload(options, imageUrl, audioUrl));
  const videoId = extractVideoId(envelope);

  if (!videoId) {
    throw new Error(`HeyGen create response did not include video_id: ${JSON.stringify(envelope)}`);
  }

  return { videoId };
}

export async function waitForHeygenVideo(apiKey: string, videoId: string, options: CliOptions): Promise<HeygenVideoResult> {
  const startedAt = Date.now();

  while (Date.now() - startedAt <= options.timeoutMs) {
    const envelope = await getJson(apiKey, `${HEYGEN_BASE_URL}/v2/videos/${encodeURIComponent(videoId)}`);
    const result = extractVideoResult(videoId, envelope);

    if (result.status === 'completed' || result.status === 'success') {
      if (!result.videoUrl) {
        throw new Error(`HeyGen video is completed but video URL is missing for id ${videoId}.`);
      }
      return result;
    }

    if (result.status === 'failed' || result.status === 'error') {
      throw new Error(`HeyGen generation failed for ${videoId}: ${result.error || 'Unknown error'}`);
    }

    await sleep(options.pollIntervalMs);
  }

  throw new Error(`HeyGen polling timed out after ${Math.round(options.timeoutMs / 1000)} seconds.`);
}

export function estimateCostUsd(costSource: Record<string, unknown> | undefined): number | null {
  if (!costSource) return null;
  const direct = pickNumber(costSource.cost, costSource.price, costSource.credits_used_usd);
  if (typeof direct === 'number') return Number(direct.toFixed(6));

  const credits = pickNumber(costSource.credits, costSource.credits_used);
  if (typeof credits === 'number') {
    return null;
  }

  return null;
}
