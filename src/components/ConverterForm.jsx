import { useState, useEffect }   from 'react';
import useDashboardStore          from '../store/useDashboardStore';
import { isCrypto }               from '../utils/assetConfig';
import { fetchFiatRate }          from '../api/frankfurter';
import { fetchBinancePrice }      from '../api/binance';

/**
 * Resolve exchange rate between any pair (fiat↔fiat, crypto↔fiat, crypto↔crypto).
 * Uses Binance ticker for crypto rates — no API key required, CORS-safe.
 */
async function getRate(fromAsset, toAsset) {
  if (fromAsset === toAsset) return 1;

  const fromCrypto = isCrypto(fromAsset);
  const toCrypto   = isCrypto(toAsset);

  if (!fromCrypto && !toCrypto) {
    return fetchFiatRate(fromAsset, toAsset);
  }

  if (fromCrypto && !toCrypto) {
    return fetchBinancePrice(fromAsset, toAsset);
  }

  if (!fromCrypto && toCrypto) {
    const rate = await fetchBinancePrice(toAsset, fromAsset);
    return rate ? 1 / rate : null;
  }

  // Both crypto — compute via USD
  const [fromUsd, toUsd] = await Promise.all([
    fetchBinancePrice(fromAsset, 'USD'),
    fetchBinancePrice(toAsset,   'USD'),
  ]);
  return fromUsd && toUsd ? fromUsd / toUsd : null;
}

export default function ConverterForm() {
  const { activeAsset, quoteCurrency, addHistoryEntry } = useDashboardStore();

  const [fromAsset,   setFromAsset]   = useState(activeAsset);
  const [toAsset,     setToAsset]     = useState(quoteCurrency);
  const [fromAmount,  setFromAmount]  = useState('1');
  const [toAmount,    setToAmount]    = useState('');
  const [rate,        setRate]        = useState(null);
  const [loadingRate, setLoadingRate] = useState(false);

  // Sync with dashboard selection
  useEffect(() => { setFromAsset(activeAsset); }, [activeAsset]);
  useEffect(() => { setToAsset(quoteCurrency); }, [quoteCurrency]);

  // Fetch rate whenever pair changes
  useEffect(() => {
    let cancelled = false;
    setLoadingRate(true);
    getRate(fromAsset, toAsset).then((r) => {
      if (!cancelled) { setRate(r); setLoadingRate(false); }
    });
    return () => { cancelled = true; };
  }, [fromAsset, toAsset]);

  // Recalculate result on amount or rate change
  useEffect(() => {
    if (rate == null || !fromAmount) { setToAmount(''); return; }
    setToAmount((parseFloat(fromAmount) * rate).toFixed(6));
  }, [fromAmount, rate]);

  function handleSwap() {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setFromAmount(toAmount || '1');
  }

  function handleSave() {
    if (!fromAmount || rate == null) return;
    // addHistoryEntry writes to the Zustand store → HistoryPanel updates immediately
    addHistoryEntry({
      from:      fromAsset,
      to:        toAsset,
      amount:    parseFloat(fromAmount),
      result:    parseFloat(toAmount),
      rate,
      timestamp: Date.now(),
    });
  }

  return (
    <div className="converter-form">
      <div className="converter-form-title">Convertir</div>

      <div className="input-group">
        <input
          type="number"
          value={fromAmount}
          min="0"
          onChange={(e) => setFromAmount(e.target.value)}
          placeholder="0"
        />
        <span className="currency-badge">{fromAsset}</span>
      </div>

      <div className="swap-row">
        <button className="swap-btn" onClick={handleSwap} title="Invertir par">⇅</button>
      </div>

      <div className="input-group">
        <input
          type="number"
          value={toAmount}
          readOnly
          placeholder={loadingRate ? '...' : '0'}
        />
        <span className="currency-badge">{toAsset}</span>
      </div>

      {rate != null && (
        <div className="rate-display">
          1 {fromAsset} = {rate.toLocaleString('en', { maximumFractionDigits: 6 })} {toAsset}
        </div>
      )}

      <button
        className="convert-btn"
        onClick={handleSave}
        disabled={!fromAmount || rate == null}
      >
        Guardar conversión
      </button>
    </div>
  );
}
