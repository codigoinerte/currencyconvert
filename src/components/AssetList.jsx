import { useEffect, useState } from 'react';
import useDashboardStore         from '../store/useDashboardStore';
import { ASSETS }                from '../utils/assetConfig';
import { fetchBinanceTicker24h } from '../api/binance';
import { fetchAllFiatRates }     from '../api/frankfurter';
import AssetRow from './AssetRow';

const CRYPTO_SYMBOLS = ASSETS.filter((a) => a.type === 'crypto').map((a) => a.id);
const FIAT_SYMBOLS   = ASSETS.filter((a) => a.type === 'fiat' && a.id !== 'USD').map((a) => a.id);

async function fetchPrices() {
  const prices = {};

  const [cryptoData, fiatData] = await Promise.allSettled([
    fetchBinanceTicker24h(CRYPTO_SYMBOLS, 'USD'),
    fetchAllFiatRates(FIAT_SYMBOLS),
  ]);

  if (cryptoData.status === 'fulfilled' && cryptoData.value) {
    CRYPTO_SYMBOLS.forEach((symbol) => {
      if (cryptoData.value[symbol]) prices[symbol] = cryptoData.value[symbol];
    });
  }

  if (fiatData.status === 'fulfilled' && fiatData.value) {
    FIAT_SYMBOLS.forEach((id) => {
      prices[id] = { price: fiatData.value[id], change24h: null };
    });
  }

  prices['USD'] = { price: 1, change24h: 0 };
  return prices;
}

export default function AssetList({ filter }) {
  const { activeAsset, setAsset } = useDashboardStore();
  const [prices, setPrices] = useState({});

  useEffect(() => {
    fetchPrices().then(setPrices);
    const id = setInterval(() => fetchPrices().then(setPrices), 30_000);
    return () => clearInterval(id);
  }, []);

  const filtered = filter === 'all'
    ? ASSETS
    : ASSETS.filter((a) => a.type === filter);

  return (
    <div className="asset-list">
      {filtered.map((asset) => (
        <AssetRow
          key={asset.id}
          asset={asset}
          price={prices[asset.id]?.price}
          change24h={prices[asset.id]?.change24h}
          isSelected={activeAsset === asset.id}
          onClick={() => setAsset(asset.id)}
        />
      ))}
    </div>
  );
}
