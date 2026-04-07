export function formatAIError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('429') || raw.includes('quota')) {
    return 'OpenAI API quota exceeded. Please check your billing at platform.openai.com or update your API key in Settings.';
  }
  if (raw.includes('401') || raw.includes('Incorrect API key')) {
    return 'Invalid OpenAI API key. Please update your key in Settings.';
  }
  if (raw === 'Connection error.') {
    return 'Could not connect to OpenAI API. The API key may be invalid or quota exceeded. Check Settings.';
  }
  if (raw.includes('not configured')) {
    return raw;
  }
  return raw;
}
