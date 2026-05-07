export interface CliOptions {
  imagePath: string;
  audioPath?: string;
  outputPath?: string;
  promptFilePath: string;
  scriptFilePath: string;
  additionalPrompt?: string;
  inlineScript?: string;
  voiceId?: string;
  includeCost: boolean;
  includeReport: boolean;
  pollIntervalMs: number;
  timeoutMs: number;
  prompt: string;
  scriptText: string;
}

export interface HeygenCreateResult {
  videoId: string;
}

export interface HeygenVideoResult {
  videoId: string;
  status: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  durationSec?: number;
  error?: string;
  rawData?: Record<string, unknown>;
}
