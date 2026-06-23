'use client'

function SummaryCard({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-line bg-surface-1 px-4 py-3">
      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-mute">{label}</span>
      <span className="font-mono text-2xl text-ink-dim">—</span>
      {hint && (
        <span className="text-[10px] tracking-wide text-ink-mute/80">{hint}</span>
      )}
    </div>
  )
}

export default function PositionsLedger() {
  const columns = ['Asset', 'Side', 'Size', 'Lev', 'Entry', 'SL', 'TP', 'PnL', 'Liq']

  return (
    <section className="flex flex-col gap-4 border-t border-line bg-surface-0 px-6 py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-ink-mute" />
          <span className="text-[13px] font-semibold tracking-tight text-ink">Positions &amp; Performance</span>
        </div>
        <span className="text-[11px] tracking-wide text-ink-mute">
          Paper · 1% equity risk · Auto-managed
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard label="Win rate" hint="Awaiting closed trades" />
        <SummaryCard label="Max drawdown" hint="Awaiting closed trades" />
        <SummaryCard label="Cumulative PnL" hint="Awaiting closed trades" />
        <SummaryCard label="Open positions" hint="Awaiting execution feed" />
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface-1">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line bg-surface-2/50 text-left">
              {columns.map((h, i) => (
                <th
                  key={h}
                  className={`px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-mute ${
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
                className="px-3 py-10 text-center text-[11px] tracking-wide text-ink-mute"
              >
                No open positions · Awaiting execution feed
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
