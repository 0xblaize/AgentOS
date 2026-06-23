'use client'

import { useEffect } from 'react'
import { useDashboardState } from '@/hooks/dashboard/useDashboardState'

// Spec §7: Emergency Action Bar. h-14, border-top, four buttons aligned
// right. Flush · Pause · Reset · Terminate. Each has a keyboard shortcut.

type Variant = 'danger' | 'neutral' | 'subtle' | 'primary'

interface ButtonProps {
  label: string
  shortcut: string
  variant: Variant
  active?: boolean
  disabled?: boolean
  onClick: () => void
}

// Spec §7 button visuals — direct color references.
const VARIANT: Record<Variant, string> = {
  // 7.1 Flush: transparent bg, white text, 1px zinc-700 border
  subtle: 'border border-[#3f3f46] bg-transparent text-ink hover:bg-surface-2',
  // 7.2 Pause: dark grey bg, white text
  neutral: 'border border-line bg-surface-2 text-ink hover:bg-[#1f1f23] active:bg-[#141417]',
  // 7.3 Reset: solid acid, text black
  primary: 'bg-acid text-black hover:bg-[#bef264] active:bg-[#84cc16]',
  // 7.4 Terminate: solid rose-600, text white
  danger: 'bg-[#e11d48] text-white hover:bg-[#be123c] active:bg-[#9f1239]',
}

function CtrlButton({ label, shortcut, variant, active, disabled, onClick }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group flex h-9 items-center justify-center gap-2 rounded-md px-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT[variant]} ${
        active ? 'ring-1 ring-warn/60' : ''
      }`}
    >
      <span>{label}</span>
      <span className="rounded-sm border border-current/30 px-1 py-[1px] font-mono text-[9px] tracking-[0.1em] opacity-70">
        {shortcut}
      </span>
    </button>
  )
}

export default function ControlStrip() {
  const { active, paused, terminated, togglePaused, terminate, flushLogs, resetSimulation } =
    useDashboardState()

  // Keyboard shortcuts: T / P / F / R. Ignored while typing in inputs.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return
      }
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
    <footer className="flex h-14 items-center justify-between gap-3 border-t border-line bg-surface-1 px-6">
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-mute">
          Emergency controls
        </span>
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
          disabled={!active && !paused}
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
