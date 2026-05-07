export type TogetherLipsyncModel =
  | 'Wan-AI/wan2.7-i2v'
  | 'google/veo-3.0-audio'
  | 'google/veo-3.0-fast-audio';

export interface CliOptions {
  imagePath: string;
  audioPath: string;
  outputPath?: string;
  model: TogetherLipsyncModel;
  promptFilePath: string;
  additionalPrompt?: string;
  prompt: string;
  includeCost: boolean;
  includeReport: boolean;
  pollIntervalMs: number;
  timeoutMs: number;
  seconds: string;
}

export interface TogetherVideoResult {
  id: string;
  model: string;
  status: 'in_progress' | 'completed' | 'failed';
  outputs?: {
    cost?: number;
    video_url?: string;
  };
  error?: {
    message?: string;
    code?: string;
  };
}
