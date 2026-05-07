export type CharacterMode = 'generate' | 'redraw';

export interface CliOptions {
  mode: CharacterMode;
  prompt: string;
  outputPath?: string;
  authPath: string;
  promptFilePath: string;
  styleFilePath: string;
  sourceImagePath?: string;
  guideImagePath?: string;
  model: string;
  quality: 'low' | 'medium' | 'high';
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
