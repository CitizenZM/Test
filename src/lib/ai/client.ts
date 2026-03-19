import Anthropic from '@anthropic-ai/sdk';
import { getCachedSetting } from '@/lib/settings-cache';

// Don't cache the client globally — re-create when the key changes
export function getAnthropicClient(): Anthropic {
  const apiKey = getCachedSetting('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY is not configured. Go to Settings to add your Anthropic API key. ' +
      'Get your API key at https://console.anthropic.com'
    );
  }
  return new Anthropic({ apiKey });
}
