'use client'

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'

interface DashboardState {
  paused: boolean
  terminated: boolean
  resetNonce: number
  flushNonce: number
}

type Action =
  | { type: 'TOGGLE_PAUSED' }
  | { type: 'TERMINATE' }
  | { type: 'FLUSH' }
  | { type: 'RESET' }

const initial: DashboardState = {
  paused: false,
  terminated: false,
  resetNonce: 0,
  flushNonce: 0,
}

function reducer(state: DashboardState, action: Action): DashboardState {
  switch (action.type) {
    case 'TOGGLE_PAUSED':
      return { ...state, paused: !state.paused }
    case 'TERMINATE':
      return { ...state, terminated: !state.terminated, paused: !state.terminated || state.paused }
    case 'FLUSH':
      return { ...state, flushNonce: state.flushNonce + 1 }
    case 'RESET':
      return {
        ...state,
        resetNonce: state.resetNonce + 1,
        terminated: false,
        paused: false,
      }
    default:
      return state
  }
}

interface DashboardContextValue extends DashboardState {
  togglePaused: () => void
  terminate: () => void
  flushLogs: () => void
  resetSimulation: () => void
}

const Ctx = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial)

  const togglePaused = useCallback(() => dispatch({ type: 'TOGGLE_PAUSED' }), [])
  const terminate = useCallback(() => dispatch({ type: 'TERMINATE' }), [])
  const flushLogs = useCallback(() => dispatch({ type: 'FLUSH' }), [])
  const resetSimulation = useCallback(() => dispatch({ type: 'RESET' }), [])

  const value = useMemo<DashboardContextValue>(
    () => ({ ...state, togglePaused, terminate, flushLogs, resetSimulation }),
    [state, togglePaused, terminate, flushLogs, resetSimulation],
  )

  return createElement(Ctx.Provider, { value }, children)
}

export function useDashboardState(): DashboardContextValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useDashboardState must be used within DashboardProvider')
  return v
}
