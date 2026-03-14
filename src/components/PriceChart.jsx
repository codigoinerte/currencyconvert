import { useEffect, useRef } from 'react';
import { createChart, AreaSeries, ColorType } from 'lightweight-charts';

const GRID_COLOR  = '#2e3138';
const TICK_COLOR  = '#555d6b';
const LABEL_BG    = '#1e2026';
const LINE_COLOR  = '#4d8ef7';
const AREA_TOP    = 'rgba(77,142,247,0.18)';
const AREA_BOTTOM = 'rgba(77,142,247,0.00)';

const BASE_OPTIONS = {
  layout: {
    background: { type: ColorType.Solid, color: 'transparent' },
    textColor:  TICK_COLOR,
    fontFamily: 'IBM Plex Mono',
    fontSize:   10,
  },
  grid: {
    vertLines: { color: GRID_COLOR },
    horzLines: { color: GRID_COLOR },
  },
  rightPriceScale: {
    borderColor: GRID_COLOR,
  },
  timeScale: {
    borderColor:    GRID_COLOR,
    timeVisible:    true,
    secondsVisible: false,
    fixLeftEdge:    true,
    fixRightEdge:   true,
  },
  crosshair: {
    vertLine: { color: TICK_COLOR, labelBackgroundColor: LABEL_BG },
    horzLine: { color: TICK_COLOR, labelBackgroundColor: LABEL_BG },
  },
  handleScroll: false,
  handleScale:  false,
};

const SERIES_OPTIONS = {
  lineColor:        LINE_COLOR,
  topColor:         AREA_TOP,
  bottomColor:      AREA_BOTTOM,
  lineWidth:        2,
  priceLineVisible: false,
  lastValueVisible: true,
};

export default function PriceChart({ data }) {
  const containerRef = useRef(null);
  const chartRef     = useRef(null);
  const seriesRef    = useRef(null);

  // Mount chart once — cleanup on unmount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      ...BASE_OPTIONS,
      width:  el.clientWidth,
      height: el.clientHeight || 240,
    });

    seriesRef.current = chart.addSeries(AreaSeries, SERIES_OPTIONS);
    chartRef.current  = chart;

    // Resize both axes whenever the container changes size
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      chart.applyOptions({
        width:  Math.floor(width),
        height: Math.floor(height),
      });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current  = null;
      seriesRef.current = null;
    };
  }, []);

  // Push new data whenever it changes
  useEffect(() => {
    const series = seriesRef.current;
    if (!series || !data?.length) return;

    // lightweight-charts requires time in seconds (sorted ascending)
    const points = data
      .map((d) => ({ time: Math.floor(d.x / 1000), value: d.y }))
      .sort((a, b) => a.time - b.time);

    series.setData(points);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {!data?.length && (
        <div className="chart-loading" style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          Sin datos
        </div>
      )}
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
