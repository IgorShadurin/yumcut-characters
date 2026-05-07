export type ReplicateLipsyncModel =
  | 'bytedance/omni-human'
  | 'bytedance/omni-human-1.5'
  | 'kwaivgi/kling-avatar-v2'
  | 'prunaai/p-video-avatar';

export interface CliOptions {
  imagePath: string;
  audioPath: string;
  outputPath?: string;
  model: ReplicateLipsyncModel;
  promptFilePath: string;
  additionalPrompt?: string;
  prompt: string;
  includeCost: boolean;
  includeReport: boolean;
  pollIntervalMs: number;
  timeoutMs: number;
}

export interface ReplicateModelConfig {
  modelId: ReplicateLipsyncModel;
  costUsdPerSecond: number;
  promptField: 'none' | 'prompt' | 'video_prompt';
}

export interface ReplicatePredictionUrls {
  get?: string;
}

export interface ReplicatePredictionMetrics {
  predict_time?: number;
  total_time?: number;
}

export interface ReplicatePrediction {
  id: string;
  status: string;
  output?: unknown;
  error?: unknown;
  metrics?: ReplicatePredictionMetrics;
  urls?: ReplicatePredictionUrls;
}

export interface ReplicatePredictionResult {
  predictionId: string;
  outputUrl: string;
  status: string;
  metrics: ReplicatePredictionMetrics;
}
