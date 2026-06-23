'use client'

// Live market ticker placeholder. Sits in the header center until a real
// price feed is wired. Kept subtle so it doesn't dominate the bar.

export default function TickerStream() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <span className="text-[11px] font-medium tracking-[0.16em] text-ink-mute">
        Awaiting market feed
      </span>
    </div>
  )
}
