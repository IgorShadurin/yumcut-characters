import type {
  CliOptions,
  ReplicateLipsyncModel,
  ReplicateModelConfig,
  ReplicatePrediction,
  ReplicatePredictionResult,
} from '../interfaces/options';

interface ReplicateErrorPayload {
  detail?: unknown;
  error?: unknown;
  title?: unknown;
}

export const REPLICATE_MODELS: Record<ReplicateLipsyncModel, ReplicateModelConfig> = {
  'bytedance/omni-human': {
    modelId: 'bytedance/omni-human',
    costUsdPerSecond: 0.14,
    promptField: 'none',
  },
  'bytedance/omni-human-1.5': {
    modelId: 'bytedance/omni-human-1.5',
    costUsdPerSecond: 0.16,
    promptField: 'prompt',
  },
  'kwaivgi/kling-avatar-v2': {
    modelId: 'kwaivgi/kling-avatar-v2',
    costUsdPerSecond: 0.056,
    promptField: 'prompt',
  },
  'prunaai/p-video-avatar': {
    modelId: 'prunaai/p-video-avatar',
    costUsdPerSecond: 0.025,
    promptField: 'video_prompt',
  },
};

function normalizeErrorPayload(payload: unknown): string {
  if (!payload) return 'Unknown Replicate API error';
  if (typeof payload === 'string') return payload;
  if (typeof payload === 'object') {
    const maybe = payload as ReplicateErrorPayload;
    if (typeof maybe.detail === 'string') return maybe.detail;
    if (typeof maybe.error === 'string') return maybe.error;
    if (typeof maybe.title === 'string') return maybe.title;
    return JSON.stringify(payload);
  }
  return String(payload);
}

function splitModelId(modelId: ReplicateLipsyncModel): { owner: string; name: string } {
  const [owner, name] = modelId.split('/');
  if (!owner || !name) {
    throw new Error(`Invalid model id: ${modelId}`);
  }
  return { owner, name };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildInput(options: CliOptions, imageDataUri: string, audioDataUri: string): Record<string, unknown> {
  switch (options.model) {
    case 'bytedance/omni-human':
      return {
        image: imageDataUri,
        audio: audioDataUri,
      };
    case 'bytedance/omni-human-1.5':
      return {
        image: imageDataUri,
        audio: audioDataUri,
        prompt: options.prompt,
      };
    case 'kwaivgi/kling-avatar-v2':
      return {
        image: imageDataUri,
        audio: audioDataUri,
        prompt: options.prompt,
      };
    case 'prunaai/p-video-avatar':
      return {
        image: imageDataUri,
        audio: audioDataUri,
        video_prompt: options.prompt,
      };
    default:
      throw new Error(`Unsupported model mapping: ${options.model as string}`);
  }
}

function extractFirstUrl(output: unknown): string | undefined {
  if (typeof output === 'string' && output.startsWith('http')) {
    return output;
  }

  if (Array.isArray(output)) {
    for (const item of output) {
      const url = extractFirstUrl(item);
      if (url) return url;
    }
    return undefined;
  }

  if (!output || typeof output !== 'object') return undefined;
  const values = Object.values(output as Record<string, unknown>);
  for (const value of values) {
    const url = extractFirstUrl(value);
    if (url) return url;
  }
  return undefined;
}

async function postJson(apiToken: string, url: string, payload: unknown): Promise<ReplicatePrediction> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Replicate returned non-JSON response (${response.status}): ${text.slice(0, 500)}`);
  }

  if (!response.ok) {
    throw new Error(`Replicate request failed (${response.status}): ${normalizeErrorPayload(parsed)}`);
  }

  return parsed as ReplicatePrediction;
}

async function getJson(apiToken: string, url: string): Promise<ReplicatePrediction> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Replicate returned non-JSON response (${response.status}): ${text.slice(0, 500)}`);
  }

  if (!response.ok) {
    throw new Error(`Replicate request failed (${response.status}): ${normalizeErrorPayload(parsed)}`);
  }

  return parsed as ReplicatePrediction;
}

export async function createReplicatePrediction(
  apiToken: string,
  options: CliOptions,
  imageDataUri: string,
  audioDataUri: string
): Promise<ReplicatePrediction> {
  const { owner, name } = splitModelId(options.model);
  const url = `https://api.replicate.com/v1/models/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/predictions`;

  return postJson(apiToken, url, {
    input: buildInput(options, imageDataUri, audioDataUri),
  });
}

export async function waitForReplicatePrediction(
  apiToken: string,
  predictionId: string,
  options: CliOptions
): Promise<ReplicatePredictionResult> {
  const startedAt = Date.now();
  const pollUrl = `https://api.replicate.com/v1/predictions/${predictionId}`;

  while (Date.now() - startedAt <= options.timeoutMs) {
    const prediction = await getJson(apiToken, pollUrl);

    if (prediction.status === 'succeeded') {
      const outputUrl = extractFirstUrl(prediction.output);
      if (!outputUrl) {
        throw new Error(`Prediction succeeded but no output URL was found for id ${predictionId}.`);
      }

      return {
        predictionId: prediction.id,
        outputUrl,
        status: prediction.status,
        metrics: prediction.metrics || {},
      };
    }

    if (prediction.status === 'failed' || prediction.status === 'canceled' || prediction.status === 'aborted') {
      throw new Error(`Replicate prediction ${prediction.status}: ${normalizeErrorPayload(prediction.error)}`);
    }

    await sleep(options.pollIntervalMs);
  }

  throw new Error(`Replicate polling timed out after ${Math.round(options.timeoutMs / 1000)} seconds.`);
}

export function estimateCostUsd(model: ReplicateLipsyncModel, seconds: number | undefined): number | null {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }
  const rate = REPLICATE_MODELS[model].costUsdPerSecond;
  if (rate <= 0) return null;
  return Number((rate * seconds).toFixed(6));
}
