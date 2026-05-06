export type VmodelModelId =
  | 'vmodel/talking-photo-turbo-pro'
  | 'vmodel/talking-photo-turbo'
  | 'lipsync/talk-photo';
export type VmodelResolution = '480' | '720';

export interface CliOptions {
  imagePath: string;
  audioPath: string;
  outputPath?: string;
  model: VmodelModelId;
  resolution: VmodelResolution;
  includeCost: boolean;
  includeReport: boolean;
  pollIntervalMs: number;
  timeoutMs: number;
}

export interface VmodelModelConfig {
  modelId: VmodelModelId;
  version: string;
  supportsResolution: boolean;
  pricingUsdPerSecond: Record<VmodelResolution, number>;
  taskCostPerSecondCredits: Record<VmodelResolution, number>;
}

export interface VmodelCreateTaskResult {
  taskId: string;
  taskCostCredits?: number;
}

export interface VmodelTaskResult {
  taskId: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  totalTimeSec?: number;
  predictTimeSec?: number;
  outputUrl?: string;
  error?: string;
}
