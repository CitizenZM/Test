/**
 * In-memory cache for runtime settings that can be updated without restart.
 * Settings are also persisted to Vercel environment variables for durability.
 */

const cache: Record<string, string> = {};

export function getCachedSetting(key: string): string | undefined {
  return cache[key] || process.env[key] || undefined;
}

export function setCachedSetting(key: string, value: string): void {
  cache[key] = value;
}

export function clearCachedSetting(key: string): void {
  delete cache[key];
}
