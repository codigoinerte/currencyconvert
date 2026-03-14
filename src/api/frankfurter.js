import { cachedFetch } from '../utils/fetcher';

const FRANKFURTER = 'https://api.frankfurter.app';
const OPENEX      = 'https://open.er-api.com/v6/latest';

// Frankfurter only covers ECB currencies — PEN and others are missing
const FRANKFURTER_SUPPORTED = new Set([
  'AUD','BGN','BRL','CAD','CHF','CNY','CZK','DKK','EUR','GBP',
  'HKD','HUF','IDR','ILS','INR','ISK','JPY','KRW','MXN','MYR',
  'NOK','NZD','PHP','PLN','RON','SEK','SGD','THB','TRY','USD','ZAR',
]);

function daysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function monthsAgo(n) {
  const d = new Date(); d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

const PERIOD_START = {
  '1D': () => daysAgo(1),
  '1S': () => daysAgo(7),
  '1M': () => monthsAgo(1),
};

const EMPTY = { points: [], stats: { high: 0, low: 0, volume: null, change: 0 } };

/**
 * Historical series via Frankfurter (ECB currencies only).
 * Returns empty for unsupported pairs (e.g. PEN).
 */
export async function fetchFiatHistory(base, target, period) {
  if (!FRANKFURTER_SUPPORTED.has(base) || !FRANKFURTER_SUPPORTED.has(target)) return EMPTY;

  const effectivePeriod = period === '4h' ? '1D' : period;
  const startDate = PERIOD_START[effectivePeriod]?.() ?? PERIOD_START['1S']();
  const url = `${FRANKFURTER}/${startDate}..?base=${base}&symbols=${target}`;

  const json = await cachedFetch(url, 120_000);
  if (!json?.rates) return EMPTY;

  const points = Object.entries(json.rates).map(([date, rates]) => ({
    x: new Date(date).getTime(),
    y: rates[target],
  }));
  const prices = points.map((p) => p.y).filter(Boolean);
  if (!prices.length) return EMPTY;

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

/**
 * Current exchange rate for any fiat pair via open.er-api.com
 * (free, no key, CORS-safe, supports PEN and 160+ currencies).
 */
export async function fetchFiatRate(base, target) {
  const json = await cachedFetch(`${OPENEX}/${base}`, 60_000);
  return json?.rates?.[target] ?? null;
}

/**
 * Fetch all fiat rates relative to USD via open.er-api.com
 */
export async function fetchAllFiatRates(symbols) {
  const json = await cachedFetch(`${OPENEX}/USD`, 60_000);
  if (!json?.rates) return {};
  return Object.fromEntries(symbols.map((s) => [s, json.rates[s]]));
}
