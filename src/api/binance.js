import { cachedFetch } from '../utils/fetcher';

const BASE = 'https://api.binance.com/api/v3';

// Binance supports these quote currencies for crypto pairs
const SUPPORTED_QUOTES = new Set(['USDT', 'BUSD', 'BTC', 'ETH', 'BNB', 'EUR', 'GBP']);

// Map app quote currencies to Binance quote assets
function toBinanceQuote(quote) {
  if (quote === 'USD') return 'USDT';
  if (SUPPORTED_QUOTES.has(quote)) return quote;
  return 'USDT'; // fallback for PEN, MXN, etc.
}

// Kline config per period
const PERIOD_CONFIG = {
  '4h': { interval: '1h',  limit: 24  }, // 24 × 1h  = last 24h
  '1D': { interval: '1h',  limit: 24  }, // same as above
  '1S': { interval: '4h',  limit: 42  }, // 42 × 4h  ≈ 7 days
  '1M': { interval: '1d',  limit: 30  }, // 30 × 1d  = 30 days
};

export async function fetchBinanceCandles(symbol, quote, period = '1D') {
  const binanceQuote = toBinanceQuote(quote);
  const pair = `${symbol}${binanceQuote}`;
  const { interval, limit } = PERIOD_CONFIG[period] ?? PERIOD_CONFIG['1D'];
  const url = `${BASE}/klines?symbol=${pair}&interval=${interval}&limit=${limit}`;

  const json = await cachedFetch(url, 120_000);
  if (!Array.isArray(json)) return { points: [], stats: { high: 0, low: 0, volume: 0, change: 0 } };

  // Each candle: [openTime, open, high, low, close, quoteVolume, ...]
  const points = json.map((c) => ({ x: c[0], y: parseFloat(c[4]) }));
  const closes = points.map((p) => p.y);

  return {
    points,
    stats: {
      high:   Math.max(...json.map((c) => parseFloat(c[2]))),
      low:    Math.min(...json.map((c) => parseFloat(c[3]))),
      volume: json.reduce((acc, c) => acc + parseFloat(c[7]), 0),
      change: closes.length > 1 ? ((closes.at(-1) - closes[0]) / closes[0]) * 100 : 0,
    },
  };
}

/**
 * Fetch current price + 24h change for multiple crypto symbols.
 * Returns { [symbol]: { price, change24h } }
 * Uses Binance 24h ticker — no API key required, CORS-safe.
 */
export async function fetchBinanceTicker24h(symbols, quote = 'USD') {
  const binanceQuote = toBinanceQuote(quote);
  const pairs = JSON.stringify(symbols.map((s) => `${s}${binanceQuote}`));
  const url   = `${BASE}/ticker/24hr?symbols=${encodeURIComponent(pairs)}`;

  const json = await cachedFetch(url, 30_000);
  if (!Array.isArray(json)) return {};

  const result = {};
  for (const ticker of json) {
    const symbol = symbols.find((s) => ticker.symbol === `${s}${binanceQuote}`);
    if (symbol) {
      result[symbol] = {
        price:     parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent),
      };
    }
  }
  return result;
}

/**
 * Fetch current price of a single crypto pair from Binance.
 * Used for conversion rates in ConverterForm.
 */
export async function fetchBinancePrice(symbol, quote = 'USD') {
  const binanceQuote = toBinanceQuote(quote);
  const pair = `${symbol}${binanceQuote}`;
  const url  = `${BASE}/ticker/price?symbol=${pair}`;

  const json = await cachedFetch(url, 30_000);
  return json?.price ? parseFloat(json.price) : null;
}
