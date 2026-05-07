import type { StylePreset } from '../interfaces/options';

function extractTag(text: string, tag: string): string {
  const pattern = new RegExp(`^${tag}:\\s*(.+)$`, 'mi');
  const match = text.match(pattern);
  return (match?.[1] || '').trim();
}

export function parseStylePreset(raw: string): StylePreset {
  const name = extractTag(raw, 'STYLE_NAME');
  const description = extractTag(raw, 'STYLE_DESCRIPTION');

  if (!name) {
    throw new Error('Style file must contain STYLE_NAME: <one-word-name>.');
  }

  if (!description) {
    throw new Error('Style file must contain STYLE_DESCRIPTION: <text>.');
  }

  return {
    name,
    description,
  };
}

export function renderPromptTemplate(template: string, style: StylePreset, userPrompt: string): string {
  return template
    .replaceAll('{{STYLE_NAME}}', style.name)
    .replaceAll('{{STYLE_DESCRIPTION}}', style.description)
    .replaceAll('{{USER_PROMPT}}', userPrompt.trim());
}
