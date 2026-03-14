import { cachedFetch } from '../utils/fetcher';

const BASE = 'https://api.coingecko.com/api/v3';

const DAYS_MAP = { '1D': 1, '1S': 7, '1M': 30 };

export async function fetchCryptoHistory(coinId, vsCurrency, period) {
  const days = DAYS_MAP[period] ?? 7;
  const vs = vsCurrency.toLowerCase();
  const url = `${BASE}/coins/${coinId}/market_chart?vs_currency=${vs}&days=${days}`;

  const json = await cachedFetch(url, 120_000);
  if (!json?.prices) return { points: [], stats: { high: 0, low: 0, volume: 0, change: 0 } };

  const points = json.prices.map(([ts, price]) => ({ x: ts, y: price }));
  const prices = points.map((p) => p.y);

  return {
    points,
    stats: {
      high:   Math.max(...prices),
      low:    Math.min(...prices),
      volume: json.total_volumes?.at(-1)?.[1] ?? 0,
      change: prices.length > 1 ? ((prices.at(-1) - prices[0]) / prices[0]) * 100 : 0,
    },
  };
}

export async function fetchCryptoPrices(coinIds, vsCurrency = 'usd') {
  const ids = coinIds.join(',');
  const vs = vsCurrency.toLowerCase();
  const url = `${BASE}/simple/price?ids=${ids}&vs_currencies=${vs}&include_24hr_change=true`;

  const json = await cachedFetch(url, 30_000);
  return json ?? {};
}

export async function fetchCryptoRate(coinId, vsCurrency) {
  const vs = vsCurrency.toLowerCase();
  const url = `${BASE}/simple/price?ids=${coinId}&vs_currencies=${vs}`;
  const json = await cachedFetch(url, 30_000);
  return json?.[coinId]?.[vs] ?? null;
}
