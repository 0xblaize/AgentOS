'use client'

// Spec §6: full-width bottom section. 4 performance summary cards over a
// 9-column trade table. All values render their empty/awaiting states until
// real position data is wired in.

interface SummaryCardProps {
  title: string
  subtext: string
  value: string
  valueClassName?: string
}

function SummaryCard({ title, subtext, value, valueClassName }: SummaryCardProps) {
  return (
    <div className="flex flex-1 flex-col gap-1.5 rounded-md border border-line bg-surface-1 px-4 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-mute">
        {title}
      </span>
      <span className={`font-mono text-[22px] leading-none ${valueClassName ?? 'text-ink-dim'}`}>
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-[0.15em] text-ink-fade">
        {subtext}
      </span>
    </div>
  )
}

export default function PositionsLedger() {
  const columns = ['Asset', 'Side', 'Size', 'Lev', 'Entry', 'SL', 'TP', 'PnL', 'Liq']

  return (
    <section className="flex flex-col gap-3 border-t border-line bg-surface-0 px-6 py-4">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold tracking-tight text-ink">
          Positions &amp; Performance
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-fade">
          paper · 1% equity risk · auto-managed
        </span>
      </div>

      {/* 6.1 Performance Summary Metrics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard title="Win Rate" subtext="Awaiting closed trades" value="—" />
        <SummaryCard title="Max Drawdown" subtext="Closed-trade PNL peak" value="—" />
        <SummaryCard title="Cumulative PNL" subtext="Realized" value="—" />
        <SummaryCard title="Open Positions" subtext="0L · 0S" value="—" valueClassName="text-ink" />
      </div>

      {/* 6.2 Trade Table */}
      <div className="overflow-hidden rounded-md border border-line bg-surface-1">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line bg-surface-2/60 text-left">
              {columns.map((h, i) => (
                <th
                  key={h}
                  className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-mute ${
                    i >= 2 ? 'text-right' : ''
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-10 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-ink-fade"
              >
                no open positions · awaiting execution feed
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
