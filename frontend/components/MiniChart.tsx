'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries } from 'lightweight-charts';

interface MiniChartProps {
  ticker: string;
  name: string;
  data: { time: string; open: number; high: number; low: number; close: number; volume: number }[];
  height?: number;
}

export default function MiniChart({ ticker, name, data, height = 250 }: MiniChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const last = data[data.length - 1].close;
    const initial = data[0].close;
    const isUp = last >= initial;
    
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: 'rgba(255,255,255,0.05)' },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      timeScale: {
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        timeVisible: true,
      },
      handleScroll: false,
      handleScale: false,
      crosshair: {
        mode: 1,
        vertLine: { color: 'rgba(255,255,255,0.2)' },
        horzLine: { color: 'rgba(255,255,255,0.2)' },
      }
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    const sortedData = [...data]
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    candleSeries.setData(sortedData.map(d => ({ 
      time: d.time as any, 
      open: d.open, 
      high: d.high, 
      low: d.low, 
      close: d.close 
    })));

    // Volume Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: isUp ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
      priceFormat: { type: 'volume' },
      priceScaleId: '', 
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    volumeSeries.setData(sortedData.map(d => ({ 
      time: d.time as any, 
      value: d.volume,
      color: d.close >= d.open ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
    })));

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  const lastValue = data.length > 0 ? data[data.length - 1].close : 0;
  const initialValue = data.length > 0 ? data[0].close : 0;
  const isUp = lastValue >= initialValue;
  const pnlColor = isUp ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white';

  return (
    <div className="relative w-full rounded-xl overflow-hidden glass-panel border border-white/5 bg-[#0a0a0b]">
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-3">
        <div className="bg-white/10 rounded-full w-6 h-6 flex items-center justify-center">
            <span className="text-[10px] text-white font-bold">{ticker[0]}</span>
        </div>
        <div className="flex bg-white/5 border border-white/10 rounded-md overflow-hidden">
            <span className="px-2 py-1 text-xs font-bold text-white bg-white/10">{ticker}</span>
            <span className="px-2 py-1 text-[10px] text-white/50 truncate max-w-[80px]">{name}</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 pointer-events-none">
        <div className={`px-3 py-1 rounded font-mono text-xs font-bold ${pnlColor}`}>
            {lastValue.toFixed(2)}
        </div>
      </div>

      <div ref={chartContainerRef} className="w-full mt-2" style={{ height: `${height}px` }} />
    </div>
  );
}
