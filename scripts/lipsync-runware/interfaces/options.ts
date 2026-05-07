export interface CliOptions {
  videoPath: string;
  imagePath?: string;
  audioPath: string;
  outputPath?: string;
  model: 'pixverse:lipsync@1' | 'klingai:7@1' | 'bytedance:seedance@2.0' | 'bytedance:seedance@2.0-fast' | 'prunaai:p-video@0';
  promptFilePath: string;
  additionalPrompt?: string;
  prompt: string;
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
