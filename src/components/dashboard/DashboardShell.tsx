'use client'

import HeaderBar from './HeaderBar'
import AgentViewport from './AgentViewport'
import ReasoningTerminal from './ReasoningTerminal'
import SMCChart from './SMCChart'
import PositionsLedger from './PositionsLedger'
import ControlStrip from './ControlStrip'

export default function DashboardShell() {
  return (
    <main className="grid h-screen w-full grid-rows-[64px_minmax(0,1fr)_auto_64px] bg-surface-0 text-ink">
      <HeaderBar />

      {/* Workspace: 3D agent (left), terminal-over-chart (right). The right
          column is wider than the original split and the chart gets the
          dominant vertical share so it actually reads as a TradingView panel. */}
      <section className="grid min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(540px,1.4fr)]">
        <AgentViewport />
        <div className="grid min-h-0 grid-rows-[minmax(0,0.85fr)_minmax(0,1.6fr)] border-l border-line">
          <ReasoningTerminal />
          <SMCChart />
        </div>
      </section>

      <PositionsLedger />
      <ControlStrip />
    </main>
  )
}
