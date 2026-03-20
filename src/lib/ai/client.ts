import OpenAI from 'openai';
import { getCachedSetting } from '@/lib/settings-cache';

function createProxyFetch(proxyUrl: string): typeof globalThis.fetch | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const undici = require('undici');
    const dispatcher = new undici.ProxyAgent(proxyUrl);
    return ((input: string | URL | Request, init?: RequestInit) => {
      return undici.fetch(input as string, { ...init, dispatcher } as Record<string, unknown>);
    }) as unknown as typeof globalThis.fetch;
  } catch {
    return undefined;
  }
}

// Don't cache the client globally — re-create when the key changes
export function getOpenAIClient(): OpenAI {
  const apiKey = getCachedSetting('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is not configured. Go to Settings to add your OpenAI API key. ' +
      'Get your API key at https://platform.openai.com'
    );
  }

  const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;

  if (proxyUrl) {
    const proxyFetch = createProxyFetch(proxyUrl);
    if (proxyFetch) {
      return new OpenAI({ apiKey, fetch: proxyFetch });
    }
  }

  return new OpenAI({ apiKey });
}
