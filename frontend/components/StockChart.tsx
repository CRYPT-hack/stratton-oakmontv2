'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';

interface StockChartProps {
  data: { date: string; close: number }[];
  label?: string;
  color?: string;
  height?: number;
}

export default function StockChart({ data, label = 'Price', color = '#3b82f6', height = 200 }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.4)',
        fontSize: 10,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        visible: false, // Match original StockChart behavior
      },
      handleScroll: false,
      handleScale: false,
      crosshair: {
        vertLine: { color: 'rgba(255, 255, 255, 0.1)' },
        horzLine: { color: 'rgba(255, 255, 255, 0.1)' },
      }
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: color,
      topColor: `${color}33`,
      bottomColor: `${color}00`,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    // Ensure data is sorted by time
    const sortedData = [...data]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(d => ({
        time: d.date,
        value: d.close,
      }));

    series.setData(sortedData);
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
  }, [data, color, height]);

  return (
    <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px` }} />
  );
}
