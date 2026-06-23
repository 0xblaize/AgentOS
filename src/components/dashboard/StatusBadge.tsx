'use client'

import { motion } from 'framer-motion'

interface StatusBadgeProps {
  online: boolean
}

export default function StatusBadge({ online }: StatusBadgeProps) {
  const label = online ? 'Online' : 'Degraded'
  const color = online ? '#34d399' : '#fbbf24'
  return (
    <div className="flex items-center gap-2 rounded-full border border-line bg-surface-1 px-3 py-1.5">
      <motion.span
        aria-hidden
        className="block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
        animate={online ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="text-[11px] font-medium tracking-wide" style={{ color }}>
        {label}
      </span>
    </div>
  )
}
