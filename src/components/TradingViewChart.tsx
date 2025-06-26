'use client';

import { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
}

export default function TradingViewChart({ symbol }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetLoaded = useRef(false);

  useEffect(() => {
    if (widgetLoaded.current || !containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      new (window as any).TradingView.widget({
        width: '100%',
        height: 400,
        symbol: symbol,
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: 'light',
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        allow_symbol_change: false,
        container_id: `tradingview_${symbol}`,
      });
      widgetLoaded.current = true;
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol]);

  return <div id={`tradingview_${symbol}`} ref={containerRef} />;
}