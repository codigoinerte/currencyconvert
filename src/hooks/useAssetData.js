import { useState, useEffect } from 'react';
import { fetchBinanceCandles }  from '../api/binance';
import { fetchFiatHistory }     from '../api/freecurrencyapi';
import { isCrypto }             from '../utils/assetConfig';

const EMPTY_STATS = { high: 0, low: 0, volume: 0, change: 0 };

/**
 * Module-level result cache: keyed by "asset/quote/period".
 * Survives re-renders and component remounts within the same session.
 * Prevents loading flash and redundant fetches when revisiting a pair/period.
 */
const resultCache = new Map();

export function useAssetData(asset, quoteCurrency, period) {
  const cacheKey = `${asset}/${quoteCurrency}/${period}`;
  const cached   = resultCache.get(cacheKey);

  const [data,    setData]    = useState(cached?.points ?? []);
  const [loading, setLoading] = useState(!cached);
  const [stats,   setStats]   = useState(cached?.stats  ?? EMPTY_STATS);

  useEffect(() => {
    if (!asset || !quoteCurrency) return;

    const key = `${asset}/${quoteCurrency}/${period}`;

    // Cache hit → serve instantly, skip network
    if (resultCache.has(key)) {
      const r = resultCache.get(key);
      setData(r.points);
      setStats(r.stats);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        // Crypto  → Binance klines (no API key, all periods)
        // Fiat    → FreecurrencyAPI daily series (170+ currencies, supports PEN/MXN)
        // Note: 4h period for fiat uses a 2-day window (no intraday fiat data is free)
        const result = isCrypto(asset)
          ? await fetchBinanceCandles(asset, quoteCurrency, period)
          : await fetchFiatHistory(asset, quoteCurrency, period);

        if (!cancelled && result) {
          resultCache.set(key, result);
          setData(result.points);
          setStats(result.stats);
        }
      } catch (err) {
        console.warn('[useAssetData]', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    // cancelled = true prevents stale setState after unmount or dependency change.
    // Combined with fetcher's in-flight deduplication, StrictMode's double-invocation
    // results in exactly one network request and one state update.
    return () => { cancelled = true; };
  }, [asset, quoteCurrency, period]); // ← only re-fetches when these three change

  return { data, loading, stats };
}
