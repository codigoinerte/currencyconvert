/**
 * Fiat historical rates via apilayer exchangerates_data.
 * - Supports PEN, MXN and 170+ currencies (not limited to ECB set)
 * - Uses existing VITE_CONVERT_DB_KEY — no extra registration needed
 * - apikey sent as query param → compatible with cachedFetch (no custom headers)
 * - Free plan: 250 req/month. With 10-min TTL + module-level result cache,
 *   this is sufficient for normal dashboard usage.
 */
import { cachedFetch } from '../utils/fetcher';

const BASE    = 'https://api.apilayer.com/exchangerates_data';
const API_KEY = import.meta.env.VITE_CONVERT_DB_KEY;

const EMPTY = { points: [], stats: { high: 0, low: 0, volume: null, change: 0 } };

// Historical rates update once per day — 10-min TTL is safe
const HISTORY_TTL = 10 * 60 * 1000;

function dateStr(date) {
  return date.toISOString().slice(0, 10);
}

function getDateRange(period) {
  const to   = new Date();
  const from = new Date();
  switch (period) {
    case '4h':
    case '1D': from.setDate(from.getDate() - 2);  break;
    case '1S': from.setDate(from.getDate() - 8);  break;
    case '1M': from.setDate(from.getDate() - 32); break;
    default:   from.setDate(from.getDate() - 8);
  }
  return { from: dateStr(from), to: dateStr(to) };
}

export async function fetchFiatHistory(base, target, period) {
  if (!API_KEY) {
    console.warn('[fiatHistory] VITE_CONVERT_DB_KEY not set');
    return EMPTY;
  }

  const { from, to } = getDateRange(period);
  const url = `${BASE}/timeseries?start_date=${from}&end_date=${to}&base=${base}&symbols=${target}&apikey=${API_KEY}`;

  const json = await cachedFetch(url, HISTORY_TTL);
  if (!json?.success || !json.rates) return EMPTY;

  const points = Object.entries(json.rates)
    .map(([date, rates]) => ({
      x: new Date(date).getTime(),
      y: rates[target],
    }))
    .filter((p) => p.y != null)
    .sort((a, b) => a.x - b.x);

  if (!points.length) return EMPTY;

  const prices = points.map((p) => p.y);
  return {
    points,
    stats: {
      high:   Math.max(...prices),
      low:    Math.min(...prices),
      volume: null,
      change: ((prices.at(-1) - prices[0]) / prices[0]) * 100,
    },
  };
}
