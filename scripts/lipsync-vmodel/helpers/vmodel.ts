import type {
  CliOptions,
  VmodelCreateTaskResult,
  VmodelModelConfig,
  VmodelTaskResult,
} from '../interfaces/options';

interface VmodelEnvelope<T> {
  code?: number;
  result?: T;
  message?: unknown;
}

interface VmodelTaskPayload {
  task_id?: string;
  status?: string;
  output?: unknown;
  error?: string | { code?: string; message?: string } | null;
  total_time?: number;
  predict_time?: number;
}

export const VMODEL_MODELS: Record<string, VmodelModelConfig> = {
  'vmodel/talking-photo-turbo-pro': {
    modelId: 'vmodel/talking-photo-turbo-pro',
    version: 'ae74513f15f2bb0e42acf4023d7cd6dbddd61242c5538b71f830a630aacf1c9d',
    supportsResolution: true,
    pricingUsdPerSecond: {
      '480': 0.012,
      '720': 0.025,
    },
    taskCostPerSecondCredits: {
      '480': 1200,
      '720': 2500,
    },
  },
  'vmodel/talking-photo-turbo': {
    modelId: 'vmodel/talking-photo-turbo',
    version: '11fee5368eda61d569f53f1b24ce1c53b06c867157cd833e9a0a97b66096f974',
    supportsResolution: false,
    pricingUsdPerSecond: {
      '480': 0.002,
      '720': 0.002,
    },
    taskCostPerSecondCredits: {
      '480': 200,
      '720': 200,
    },
  },
  'lipsync/talk-photo': {
    modelId: 'lipsync/talk-photo',
    version: 'd833e9a0a97b66096f9741fee5368ee1c53bda61d569f53f1b24c106c867157c',
    supportsResolution: false,
    pricingUsdPerSecond: {
      '480': 0.002,
      '720': 0.002,
    },
    taskCostPerSecondCredits: {
      '480': 200,
      '720': 200,
    },
  },
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeMessage(message: unknown): string {
  if (!message) return 'Unknown VModel error';
  if (typeof message === 'string') return message;
  if (Array.isArray(message)) return message.map((item) => normalizeMessage(item)).join(' | ');
  if (typeof message === 'object') return JSON.stringify(message);
  return String(message);
}

function normalizeTaskError(error: unknown): string {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  if (typeof error === 'object') {
    const maybe = error as { code?: unknown; message?: unknown };
    const code = typeof maybe.code === 'string' ? maybe.code : undefined;
    const message = typeof maybe.message === 'string' ? maybe.message : undefined;
    if (code && message) return `${code}: ${message}`;
    if (message) return message;
    return JSON.stringify(error);
  }
  return String(error);
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

  const entries = Object.values(output as Record<string, unknown>);
  for (const value of entries) {
    const url = extractFirstUrl(value);
    if (url) return url;
  }

  return undefined;
}

async function postJson<T>(apiKey: string, url: string, payload: unknown): Promise<VmodelEnvelope<T>> {
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
    throw new Error(`VModel returned non-JSON response (${response.status}): ${text.slice(0, 500)}`);
  }

  if (!response.ok) {
    throw new Error(`VModel request failed (${response.status}): ${JSON.stringify(parsed)}`);
  }

  return parsed as VmodelEnvelope<T>;
}

async function getJson<T>(apiKey: string, url: string): Promise<VmodelEnvelope<T>> {
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
    throw new Error(`VModel returned non-JSON response (${response.status}): ${text.slice(0, 500)}`);
  }

  if (!response.ok) {
    throw new Error(`VModel request failed (${response.status}): ${JSON.stringify(parsed)}`);
  }

  return parsed as VmodelEnvelope<T>;
}

export async function createVmodelTask(
  apiKey: string,
  options: CliOptions,
  avatarUrl: string,
  speechUrl: string
): Promise<VmodelCreateTaskResult> {
  const modelConfig = VMODEL_MODELS[options.model];
  const inputPayload: Record<string, unknown> = {
    avatar: avatarUrl,
    speech: speechUrl,
  };

  if (modelConfig.supportsResolution) {
    inputPayload.resolution = options.resolution;
  }

  const envelope = await postJson<{ task_id?: string; task_cost?: number }>(
    apiKey,
    'https://api.vmodel.ai/api/tasks/v1/create',
    {
      version: modelConfig.version,
      input: inputPayload,
    }
  );

  if (envelope.code !== 200 || !envelope.result?.task_id) {
    throw new Error(`VModel create task failed: ${normalizeMessage(envelope.message)}`);
  }

  return {
    taskId: envelope.result.task_id,
    taskCostCredits: typeof envelope.result.task_cost === 'number' ? envelope.result.task_cost : undefined,
  };
}

export async function waitForVmodelTask(apiKey: string, taskId: string, options: CliOptions): Promise<VmodelTaskResult> {
  const startedAt = Date.now();

  while (Date.now() - startedAt <= options.timeoutMs) {
    const envelope = await getJson<VmodelTaskPayload>(apiKey, `https://api.vmodel.ai/api/tasks/v1/get/${taskId}`);

    if (envelope.code !== 200 || !envelope.result?.status) {
      throw new Error(`VModel poll failed: ${normalizeMessage(envelope.message)}`);
    }

    const status = envelope.result.status as VmodelTaskResult['status'];

    if (status === 'succeeded') {
      const outputUrl = extractFirstUrl(envelope.result.output);

      if (!outputUrl) {
        throw new Error(`VModel task succeeded but no output URL was found for task ${taskId}.`);
      }

      return {
        taskId,
        status,
        outputUrl,
        totalTimeSec: typeof envelope.result.total_time === 'number' ? envelope.result.total_time : undefined,
        predictTimeSec: typeof envelope.result.predict_time === 'number' ? envelope.result.predict_time : undefined,
      };
    }

    if (status === 'failed' || status === 'canceled') {
      throw new Error(`VModel task ${status}: ${normalizeTaskError(envelope.result.error)}`);
    }

    await sleep(options.pollIntervalMs);
  }

  throw new Error(`VModel polling timed out after ${Math.round(options.timeoutMs / 1000)} seconds.`);
}

export function creditsToUsd(credits: number): number {
  return Number((credits / 100000).toFixed(6));
}
