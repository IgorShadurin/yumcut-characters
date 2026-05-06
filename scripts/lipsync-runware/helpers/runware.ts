import { randomUUID } from 'node:crypto';

import type { CliOptions, LipsyncTaskResult } from '../interfaces/options';

interface RunwareEnvelope {
  data?: Array<Record<string, unknown>>;
  errors?: Array<Record<string, unknown>>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postRunware(apiKey: string, tasks: Array<Record<string, unknown>>): Promise<RunwareEnvelope> {
  const response = await fetch('https://api.runware.ai/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(tasks),
  });

  const text = await response.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Runware returned non-JSON response (${response.status}): ${text.slice(0, 500)}`);
  }

  if (!response.ok) {
    throw new Error(`Runware request failed (${response.status}): ${JSON.stringify(parsed)}`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Runware response has invalid structure.');
  }

  return parsed as RunwareEnvelope;
}

function collectErrors(envelope: RunwareEnvelope): string[] {
  const errors = Array.isArray(envelope.errors) ? envelope.errors : [];
  return errors
    .map((item) => {
      const message = typeof item.message === 'string' ? item.message : 'Unknown Runware error';
      const code = typeof item.code === 'string' ? item.code : 'unknown';
      return `${code}: ${message}`;
    })
    .filter(Boolean);
}

function findVideoSuccess(envelope: RunwareEnvelope, taskUUID: string): LipsyncTaskResult | undefined {
  const rows = Array.isArray(envelope.data) ? envelope.data : [];

  for (const row of rows) {
    if (row.taskUUID !== taskUUID) continue;
    if (row.status !== 'success') continue;
    if (typeof row.videoURL !== 'string' || !row.videoURL.trim()) continue;

    const costValue = typeof row.cost === 'number' ? row.cost : undefined;
    return {
      taskUUID,
      videoURL: row.videoURL,
      cost: costValue,
    };
  }

  return undefined;
}

function isStillProcessing(envelope: RunwareEnvelope, taskUUID: string): boolean {
  const rows = Array.isArray(envelope.data) ? envelope.data : [];
  for (const row of rows) {
    if (row.taskUUID === taskUUID && row.status === 'processing') {
      return true;
    }
  }
  return false;
}

function buildInferenceTask(
  options: CliOptions,
  taskUUID: string,
  referenceVideo: string,
  inputAudio: string
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    taskType: 'videoInference',
    taskUUID,
    model: options.model,
    deliveryMethod: 'async',
    outputType: 'URL',
    outputFormat: 'MP4',
    includeCost: options.includeCost,
  };

  if (options.model === 'klingai:7@1') {
    return {
      ...base,
      // KlingAI Lip-Sync uses model-specific inputs.video + inputs.audio fields.
      inputs: {
        video: referenceVideo,
        audio: inputAudio,
      },
    };
  }

  return {
    ...base,
    // PixVerse LipSync accepts referenceVideos + inputAudios.
    referenceVideos: [referenceVideo],
    inputAudios: [inputAudio],
  };
}

export async function generateLipsyncVideo(
  apiKey: string,
  options: CliOptions,
  referenceVideo: string,
  inputAudio: string
): Promise<LipsyncTaskResult> {
  const taskUUID = randomUUID();

  const submitEnvelope = await postRunware(apiKey, [buildInferenceTask(options, taskUUID, referenceVideo, inputAudio)]);

  const submitErrors = collectErrors(submitEnvelope);
  if (submitErrors.length > 0) {
    throw new Error(`Runware submit failed: ${submitErrors.join(' | ')}`);
  }

  const startedAt = Date.now();

  while (Date.now() - startedAt <= options.timeoutMs) {
    const pollEnvelope = await postRunware(apiKey, [{ taskType: 'getResponse', taskUUID }]);

    const result = findVideoSuccess(pollEnvelope, taskUUID);
    if (result) {
      return result;
    }

    const pollErrors = collectErrors(pollEnvelope);
    if (pollErrors.length > 0) {
      throw new Error(`Runware polling failed: ${pollErrors.join(' | ')}`);
    }

    if (!isStillProcessing(pollEnvelope, taskUUID)) {
      throw new Error(`Runware polling returned no success and no processing state for task ${taskUUID}.`);
    }

    await sleep(options.pollIntervalMs);
  }

  throw new Error(`Runware polling timed out after ${Math.round(options.timeoutMs / 1000)} seconds.`);
}
