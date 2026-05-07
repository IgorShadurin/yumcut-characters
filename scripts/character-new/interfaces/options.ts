export interface CliOptions {
  prompt: string;
  outputPath?: string;
  authPath: string;
  promptFilePath: string;
  styleFilePath: string;
  guideImagePath?: string;
  model: string;
  includeCost: boolean;
  includeReport: boolean;
}

export interface CodexAuth {
  accessToken: string;
  chatgptBaseUrl: string;
}

export interface StylePreset {
  name: string;
  description: string;
}

export interface GeneratedImageResult {
  imageBase64: string;
  mediaType: 'image/png';
  revisedPrompt: string | null;
}
