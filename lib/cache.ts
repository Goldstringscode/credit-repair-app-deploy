/**
 * Lightweight in-memory TTL cache for admin API routes.
 * Prevents hammering Supabase on every page load/refresh.
 * Cache is per-instance (Edge/Node), resets on redeploy.
 *
 * Usage:
 *   const cached = getCached('key')
 *   if (cached) return NextResponse.json(cached)
 *   const data = await fetchFromSupabase()
 *   setCached('key', data, 60)   // 60s TTL
 *   return NextResponse.json(data)
 */

interface CacheEntry {
  value: unknown
  expiresAt: number
}

const CACHE = new Map<string, CacheEntry>()
const MAX_ENTRIES = 500

export function getCached<T>(key: string): T | null {
  const entry = CACHE.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    CACHE.delete(key)
    return null
  }
  return entry.value as T
}

export function setCached(key: string, value: unknown, ttlSeconds: number): void {
  // Evict oldest entry when at capacity
  if (CACHE.size >= MAX_ENTRIES) {
    const oldest = [...CACHE.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt)[0]
    if (oldest) CACHE.delete(oldest[0])
  }
  CACHE.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
}

export function invalidateCache(prefix: string): void {
  for (const key of CACHE.keys()) {
    if (key.startsWith(prefix)) CACHE.delete(key)
  }
}

export function cacheStats(): { size: number; keys: string[] } {
  return { size: CACHE.size, keys: [...CACHE.keys()] }
}
