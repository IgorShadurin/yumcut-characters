import type { CharacterMode, CodexAuth, GeneratedImageResult } from '../interfaces/options';

const CANVAS_SIZE = '1008x1792';

type GenerationRequest = {
  mode: CharacterMode;
  quality: 'low' | 'medium' | 'high';
  prompt: string;
  sourceImageDataUrl?: string;
  guideImageDataUrl?: string;
};

function buildInstructions(mode: CharacterMode): string {
  const common = [
    'Generate exactly one image.',
    'Do not return assistant text.',
    'Use the image_generation tool.',
    'Always output a vertical 9:16 composition.',
    'No text, no watermark, no logo, no frame.',
    'Never render, copy, or display guide lines, boxes, labels, or overlay elements in the final output.',
  ];

  const generateMode = [
    'If a guide image is provided, treat it as a strict composition constraint.',
    'The full character silhouette must fit completely inside the designated guide box; if uncertain, scale character down more.',
  ];

  const redrawMode = [
    'The source image is the style anchor: keep visual language, materials, rendering feel, and character identity.',
    'Apply the user prompt as a redraw direction while preserving the source style.',
    'When changing composition, keep the subject fully visible and centered.',
  ];

  return [...common, ...(mode === 'redraw' ? redrawMode : generateMode)].join('\n');
}

type StreamPayload = {
  type?: string;
  error?: { message?: string };
  partial_image_b64?: string;
  revised_prompt?: string;
  text?: string;
  response?: {
    usage?: {
      total_cost_usd?: number;
    };
  };
};

async function readStream(response: Response): Promise<GeneratedImageResult & { costUsd: number | null }> {
  if (!response.body) {
    throw new Error('Codex response did not include a body.');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let imageBase64 = '';
  let revisedPrompt: string | null = null;
  let errorText = '';
  let costUsd: number | null = null;

  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });

    while (buffer.includes('\n\n')) {
      const boundaryIndex = buffer.indexOf('\n\n');
      const rawEvent = buffer.slice(0, boundaryIndex).trim();
      buffer = buffer.slice(boundaryIndex + 2);
      if (!rawEvent) continue;

      const dataLines = rawEvent
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())
        .join('\n');
      if (!dataLines) continue;

      const payload = JSON.parse(dataLines) as StreamPayload;

      if (payload.type === 'response.image_generation_call.partial_image' && typeof payload.partial_image_b64 === 'string') {
        imageBase64 = payload.partial_image_b64;
        revisedPrompt = typeof payload.revised_prompt === 'string' ? payload.revised_prompt : revisedPrompt;
        continue;
      }

      if (payload.type === 'error' && typeof payload.error?.message === 'string') {
        errorText = payload.error.message;
      }

      if (payload.type === 'response.output_text.done' && typeof payload.text === 'string') {
        errorText = payload.text.trim() || errorText;
      }

      const usageCost = payload.response?.usage?.total_cost_usd;
      if (typeof usageCost === 'number') {
        costUsd = usageCost;
      }
    }
  }

  if (!imageBase64) {
    throw new Error(errorText || 'Codex image generation did not return an image.');
  }

  return {
    imageBase64,
    mediaType: 'image/png',
    revisedPrompt,
    costUsd,
  };
}

export async function generateCharacterImage(
  auth: CodexAuth,
  model: string,
  request: GenerationRequest
): Promise<GeneratedImageResult & { costUsd: number | null }> {
  const content: Array<{ type: 'input_image'; image_url: string } | { type: 'input_text'; text: string }> = [];
  if (request.sourceImageDataUrl) {
    content.push({
      type: 'input_image',
      image_url: request.sourceImageDataUrl,
    });
  }
  if (request.guideImageDataUrl) {
    content.push({
      type: 'input_image',
      image_url: request.guideImageDataUrl,
    });
  }
  content.push({
    type: 'input_text',
    text: request.prompt.trim(),
  });

  const response = await fetch(`${auth.chatgptBaseUrl}/codex/responses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      model,
      instructions: buildInstructions(request.mode),
      input: [
        {
          role: 'user',
          content,
        },
      ],
      reasoning: {
        effort: 'medium',
      },
      store: false,
      stream: true,
      tools: [
        {
          type: 'image_generation',
          action: 'generate',
          background: 'auto',
          output_format: 'png',
          quality: request.quality,
          size: CANVAS_SIZE,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Codex image generation failed with status ${response.status}.`);
  }

  return readStream(response);
}
