'use client'

import { useDashboardState } from '@/hooks/dashboard/useDashboardState'

// Spec §5.1: Live Reasoning Terminal. Pure black bg, modular header with
// muted "perception · smc · risk · execution" tags. Renders the empty state
// until a real reasoning stream is wired in. PERC/SMC/RISK/EXEC line color
// map is documented in the spec but not yet exercised because no feed runs.
export default function ReasoningTerminal() {
  const { active } = useDashboardState()

  return (
    <div className="flex h-full min-h-0 flex-col border-b border-line bg-surface-1">
      {/* Panel header (Spec §1.2) */}
      <div className="flex h-8 items-center justify-between border-b border-line px-4">
        <span className="text-[11px] font-semibold tracking-tight text-ink">Reasoning</span>
        <span className="font-mono text-[10px] tracking-[0.18em] text-ink-fade">
          <span className="text-acid">perception</span>
          <span className="mx-1">·</span>
          <span className="text-acid">smc</span>
          <span className="mx-1">·</span>
          <span className="text-acid">risk</span>
          <span className="mx-1">·</span>
          <span className="text-acid">execution</span>
        </span>
      </div>

      {/* Spec §5.1 active feed area — pure black */}
      <div className="relative flex flex-1 min-h-0 flex-col bg-black px-4 py-3 font-mono text-[11px]">
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink-ghost">
              stream {active ? 'live' : 'idle'}
            </span>
            <span className="text-[11px] text-ink-fade/80">
              {active ? 'reasoning feed not yet bound' : 'awaiting reasoning feed'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
