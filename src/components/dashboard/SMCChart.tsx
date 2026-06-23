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

// Spec §5.2: SMC Smart Chart. lightweight-charts, transparent layout so the
// panel background shows through, textColor zinc-500, horizontal gridlines
// zinc-800. Candles emerald-500 / rose-500. No data is fed yet — the panel
// shows an empty grid until a real candle stream is wired.
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
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#71717a',
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 10,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: '#27272a' },
      },
      rightPriceScale: { borderColor: '#27272a' },
      timeScale: { borderColor: '#27272a', timeVisible: true, secondsVisible: false },
      crosshair: { mode: CrosshairMode.Normal },
    })
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
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
      <div className="flex h-8 items-center justify-between border-b border-line px-4">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-semibold tracking-tight text-ink">SMC Chart</span>
          <span className="rounded-sm border border-line bg-surface-2 px-1.5 py-[1px] font-mono text-[9px] tracking-[0.18em] text-ink-dim">
            1m
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-fade">
          awaiting candle feed
        </span>
      </div>
      <div className="relative flex-1 min-h-0">
        <div ref={containerRef} className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-md border border-line bg-surface-1/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-ink-fade backdrop-blur">
            no data
          </span>
        </div>
      </div>
    </div>
  )
}
