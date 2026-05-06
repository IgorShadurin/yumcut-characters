export interface CliOptions {
  videoPath: string;
  audioPath: string;
  outputPath?: string;
  model: 'pixverse:lipsync@1' | 'klingai:7@1';
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
