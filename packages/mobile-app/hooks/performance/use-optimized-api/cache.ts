import { CacheEntry } from "./types";

// Global cache map for API responses
export const cache = new Map<string, CacheEntry<any>>();

export function getCached<T>(key: string): CacheEntry<T> | undefined {
  return cache.get(key);
}

export function setCached<T>(key: string, entry: CacheEntry<T>): void {
  cache.set(key, entry);
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) if (key.includes(pattern)) cache.delete(key);
}

export function getCacheStats() {
  return { size: cache.size, keys: Array.from(cache.keys()) };
}
