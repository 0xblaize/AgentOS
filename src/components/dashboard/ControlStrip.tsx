'use client'

import { useEffect } from 'react'
import { useDashboardState } from '@/hooks/dashboard/useDashboardState'

type Variant = 'danger' | 'neutral' | 'subtle' | 'primary'

interface ButtonProps {
  label: string
  shortcut: string
  variant: Variant
  active?: boolean
  onClick: () => void
}

// Solid filled buttons — these are primary controls, not links. Each variant
// has a clear hover + active state so they feel like physical dashboard
// controls rather than text on a void.
const VARIANT: Record<Variant, string> = {
  danger: 'bg-rose-500/90 text-white hover:bg-rose-500 active:bg-rose-600',
  neutral: 'bg-surface-2 text-ink hover:bg-[#252a35] active:bg-[#1e222b]',
  subtle: 'bg-surface-1 text-ink-dim hover:bg-surface-2 hover:text-ink',
  primary: 'bg-acid text-black hover:bg-[#d9ff33] active:bg-[#b6e600]',
}

function CtrlButton({ label, shortcut, variant, active, onClick }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex h-10 items-center justify-center gap-2.5 rounded-md px-4 text-[11px] font-semibold tracking-wide transition ${VARIANT[variant]} ${
        active ? 'ring-1 ring-warn/60' : ''
      }`}
    >
      <span>{label}</span>
      <span className="rounded border border-current/30 px-1 py-[1px] font-mono text-[9px] tracking-[0.1em] opacity-70">
        {shortcut}
      </span>
    </button>
  )
}

export default function ControlStrip() {
  const { paused, terminated, togglePaused, terminate, flushLogs, resetSimulation } = useDashboardState()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const k = e.key.toLowerCase()
      if (k === 't') terminate()
      else if (k === 'p') togglePaused()
      else if (k === 'f') flushLogs()
      else if (k === 'r') resetSimulation()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [terminate, togglePaused, flushLogs, resetSimulation])

  return (
    <footer className="flex h-16 items-center justify-between gap-3 border-t border-line bg-surface-1/60 px-6 backdrop-blur">
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] font-medium tracking-wide text-ink-mute">System controls</span>
      </div>
      <div className="flex items-center gap-2">
        <CtrlButton
          label="Flush logs"
          shortcut="F"
          variant="subtle"
          onClick={flushLogs}
        />
        <CtrlButton
          label={paused ? 'Resume perception' : 'Pause perception'}
          shortcut="P"
          variant="neutral"
          active={paused}
          onClick={togglePaused}
        />
        <CtrlButton
          label="Reset simulation"
          shortcut="R"
          variant="primary"
          onClick={resetSimulation}
        />
        <CtrlButton
          label={terminated ? 'Agent halted' : 'Terminate agent'}
          shortcut="T"
          variant="danger"
          active={terminated}
          onClick={terminate}
        />
      </div>
    </footer>
  )
}
