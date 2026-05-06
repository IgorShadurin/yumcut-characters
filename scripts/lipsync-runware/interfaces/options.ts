export interface CliOptions {
  videoPath: string;
  audioPath: string;
  outputPath?: string;
  model: string;
  includeCost: boolean;
  includeReport: boolean;
  pollIntervalMs: number;
  timeoutMs: number;
}

export interface LipsyncTaskResult {
  taskUUID: string;
  videoURL: string;
  cost?: number;
}
