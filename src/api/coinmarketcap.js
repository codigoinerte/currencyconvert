/**
 * CoinMarketCap API module
 *
 * Requires VITE_COINMARKETCAP_KEY in .env
 * Free Basic plan: https://coinmarketcap.com/api/pricing/
 *
 * NOTE: CoinMarketCap's API blocks direct CORS from browsers by default.
 * If you see CORS errors, either:
 *   1. Use a lightweight proxy (e.g. Vite's server.proxy in vite.config.js), or
 *   2. The prices will gracefully fall back to Binance 24h ticker (built-in fallback).
 */

import { cachedFetch } from '../utils/fetcher';

const CMC_KEY  = import.meta.env.VITE_COINMARKETCAP_KEY;
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

async function cmcFetch(path, params = {}) {
  if (!CMC_KEY) return null;

  const qs  = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${path}?${qs}`;

  try {
    const res = await fetch(url, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_KEY,
        Accept: 'application/json',
      },
    });
    if (!res.ok) throw new Error(`CMC HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[coinmarketcap] fetch failed:', err.message);
    return null;
  }
}

/**
 * Returns a map of { [symbol]: { price, change24h, volume24h } }
 * for the given symbols, converted to the given quote currency.
 */
export async function fetchCMCPrices(symbols, quoteCurrency = 'USD') {
  const json = await cmcFetch('/cryptocurrency/quotes/latest', {
    symbol:  symbols.join(','),
    convert: quoteCurrency,
  });

  if (!json?.data) return null;

  const result = {};
  const quote  = quoteCurrency.toUpperCase();

  for (const symbol of symbols) {
    const entry = Object.values(json.data).find(
      (d) => d.symbol === symbol
    );
    if (!entry) continue;
    const q = entry.quote?.[quote];
    result[symbol] = {
      price:     q?.price            ?? null,
      change24h: q?.percent_change_24h ?? null,
      volume24h: q?.volume_24h       ?? null,
    };
  }

  return result;
}

/**
 * Returns the current price of a single crypto symbol in the given currency.
 */
export async function fetchCMCRate(symbol, quoteCurrency = 'USD') {
  const data = await fetchCMCPrices([symbol], quoteCurrency);
  return data?.[symbol]?.price ?? null;
}
