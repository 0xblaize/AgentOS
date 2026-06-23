'use client'

import { useEffect, useRef } from 'react'
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  createChart,
  type IChartApi,
  type ISeriesApi,
} from 'lightweight-charts'

// Mounts an empty TradingView lightweight-charts canvas, themed to match the
// dashboard. No data is fed yet — the panel waits for a real candle feed.

export default function SMCChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: '#13161d' },
        textColor: 'rgba(226,230,238,0.65)',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.05)' },
      },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.08)', timeVisible: true, secondsVisible: false },
      crosshair: { mode: CrosshairMode.Normal },
    })
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#34d399',
      downColor: '#fb7185',
      wickUpColor: '#34d399',
      wickDownColor: '#fb7185',
      borderVisible: false,
    })
    chartRef.current = chart
    seriesRef.current = series

    const ro = new ResizeObserver(() => {
      if (!el) return
      chart.applyOptions({ width: el.clientWidth, height: el.clientHeight })
    })
    ro.observe(el)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface-1">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-ink-mute" />
          <span className="text-[11px] font-semibold tracking-wide text-ink">SMC Chart</span>
          <span className="rounded-sm border border-line bg-surface-2 px-1.5 py-[1px] font-mono text-[9px] tracking-[0.15em] text-ink-dim">
            1m
          </span>
        </div>
        <span className="text-[10px] tracking-wide text-ink-mute">Awaiting candle feed</span>
      </div>
      <div className="relative flex-1 min-h-0">
        <div ref={containerRef} className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-md border border-line bg-surface-1/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-mute backdrop-blur">
            no data
          </span>
        </div>
      </div>
    </div>
  )
}
