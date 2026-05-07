export function renderLipsyncPrompt(template: string, additionalPrompt?: string): string {
  const base = template.trim();
  const extra = additionalPrompt?.trim();

  if (!extra) return base;
  return `${base}\n\nAdditional direction:\n${extra}`;
}
