export function sanitizeForPrompt(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .slice(0, 2000);
}

export function sanitizePublisherInfo(fields: Record<string, string | number | null | undefined>): string {
  return Object.entries(fields)
    .map(([key, val]) => `- ${key}: ${sanitizeForPrompt(String(val ?? 'N/A'))}`)
    .join('\n');
}
