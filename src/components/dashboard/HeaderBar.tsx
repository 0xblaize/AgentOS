'use client'

import { useDashboardState } from '@/hooks/dashboard/useDashboardState'
import StatusBadge from './StatusBadge'
import TickerStream from './TickerStream'
import WalletHub from './WalletHub'

export default function HeaderBar() {
  const { terminated } = useDashboardState()

  return (
    <header className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-6 border-b border-line bg-surface-1/60 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-acid/15 ring-1 ring-acid/40">
          <span className="text-[14px] font-bold text-acid">A</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight text-ink">Agent.OS</span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-mute">
            v1.0.0 · paper
          </span>
        </div>
      </div>

      <div className="min-w-0">
        <TickerStream />
      </div>

      <div className="flex items-center gap-3">
        <StatusBadge online={!terminated} />
        <WalletHub />
      </div>
    </header>
  )
}
