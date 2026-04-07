/**
 * In-memory cache for runtime settings that can be updated without restart.
 * Settings are also persisted to Vercel environment variables for durability.
 */

const cache: Record<string, string> = {};

export function getCachedSetting(key: string): string | undefined {
  const val = cache[key] || process.env[key] || undefined;
  return val?.trim() || undefined;
}

export function setCachedSetting(key: string, value: string): void {
  cache[key] = value;
}

export function clearCachedSetting(key: string): void {
  delete cache[key];
}
