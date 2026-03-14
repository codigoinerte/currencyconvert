import { useState, useEffect } from 'react';

const signalCache = new Map();
const GEMINI_KEY  = import.meta.env.VITE_GEMINI_KEY;

export function useAISignal(asset, quote, period, priceHistory) {
  const [signal,  setSignal]  = useState(null);
  const [loading, setLoading] = useState(false);

  // Boolean flag: data arrived for this pair (avoids re-triggering on every length change)
  const hasData = (priceHistory?.length ?? 0) > 0;

  useEffect(() => {
    if (!hasData || !GEMINI_KEY) return;

    // One API call per asset/quote/period combo — never per data-length change
    const key = `${asset}/${quote}/${period}`;
    if (signalCache.has(key)) {
      setSignal(signalCache.get(key));
      return;
    }

    let cancelled = false;
    setLoading(true);

    analyzeSignal(asset, quote, priceHistory)
      .then((result) => {
        if (cancelled) return;
        signalCache.set(key, result);
        setSignal(result);
      })
      .catch(() => { if (!cancelled) setSignal('neutral'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    // Cleanup cancels in-flight call (handles React StrictMode double-invocation)
    return () => { cancelled = true; };
  }, [asset, quote, period, hasData]); // eslint-disable-line react-hooks/exhaustive-deps

  return { signal, loading };
}

async function analyzeSignal(asset, quote, history) {
  const prices  = history.map((p) => p.y);
  const first   = prices[0].toFixed(4);
  const last    = prices.at(-1).toFixed(4);
  const change  = (((last - first) / first) * 100).toFixed(2);
  const highest = Math.max(...prices).toFixed(4);
  const lowest  = Math.min(...prices).toFixed(4);

  const prompt = `Analiza este resumen de precios del par ${asset}/${quote}:
- Precio inicial del periodo: ${first}
- Precio actual: ${last}
- Cambio: ${change}%
- Máximo del periodo: ${highest}
- Mínimo del periodo: ${lowest}

Responde ÚNICAMENTE con una de estas tres palabras: alcista, bajista, neutral.
No agregues ningún texto adicional.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents:         [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 10, temperature: 0 },
      }),
    }
  );

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() ?? 'neutral';

  return ['alcista', 'bajista', 'neutral'].includes(text) ? text : 'neutral';
}
