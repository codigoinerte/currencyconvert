const responseCache = new Map(); // url → { data, ts }
const inFlight      = new Map(); // url → Promise  — deduplicates concurrent requests

export async function safeFetch(url, fallback = null) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[fxdash] fetch failed:`, err.message);
    return fallback;
  }
}

/**
 * Fetch with TTL cache + in-flight deduplication.
 * Two simultaneous calls with the same URL share a single network request.
 */
export async function cachedFetch(url, ttl = 60_000) {
  // 1. Serve from cache if fresh
  const cached = responseCache.get(url);
  if (cached && Date.now() - cached.ts < ttl) return cached.data;

  // 2. Reuse in-flight promise if the same URL is already being fetched
  if (inFlight.has(url)) return inFlight.get(url);

  // 3. Start new request
  const promise = safeFetch(url).then((data) => {
    if (data) responseCache.set(url, { data, ts: Date.now() });
    inFlight.delete(url);
    return data;
  });

  inFlight.set(url, promise);
  return promise;
}
