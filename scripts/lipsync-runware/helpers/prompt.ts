export function renderLipsyncPrompt(template: string, additionalPrompt?: string): string {
  const extra = (additionalPrompt || '').trim();
  const rendered = template.replaceAll('{{ADDITIONAL_PROMPT}}', extra || 'No additional direction.');
  return rendered.trim();
}
