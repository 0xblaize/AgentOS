'use client'

// Live reasoning feed shell. Renders PERCEPTION / SMC / RISK / EXECUTION log
// lines once the backend stream is connected. Empty until then.

export default function ReasoningTerminal() {
  return (
    <div className="flex h-full min-h-0 flex-col border-b border-line bg-surface-1">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-ink-mute" />
          <span className="text-[11px] font-semibold tracking-wide text-ink">Reasoning</span>
        </div>
        <span className="font-mono text-[10px] tracking-[0.15em] text-ink-mute">
          perception · smc · risk · execution
        </span>
      </div>

      <div className="flex flex-1 min-h-0 items-center justify-center px-4 py-2">
        <div className="flex flex-col items-center gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-mute">
            stream idle
          </span>
          <span className="text-[11px] text-ink-mute/70">awaiting reasoning feed</span>
        </div>
      </div>
    </div>
  )
}
