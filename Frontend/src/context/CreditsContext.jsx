/**
 * CreditsContext.jsx
 *
 * Tracks how many evaluation credits the current user has.
 *
 * Usage:
 *   const { credits, loading, refresh, decrementOptimistic } = useCredits()
 *
 * refresh()              — hard re-fetch from server (call after purchase / evaluation start)
 * decrementOptimistic()  — instantly subtract 1 in the UI; server is source of truth
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { getCredits } from '../services/creditsService'

const CreditsContext = createContext(null)

export function CreditsProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) { setCredits(0); return }
    setLoading(true)
    try {
      const data = await getCredits()
      setCredits(data.credits ?? 0)
    } catch {
      // swallow — stale value is better than a crash
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  /**
   * Instantly subtract 1 so the navbar updates before the server round-trip.
   * Call this right BEFORE startEvaluation(); the subsequent refresh() will
   * confirm the real value from the server.
   */
  const decrementOptimistic = useCallback(() => {
    setCredits(prev => Math.max(0, prev - 1))
  }, [])

  // Fetch on mount / auth change
  useEffect(() => { refresh() }, [refresh])

  // Re-fetch when the user tabs back in — catches credits bought in another tab
  useEffect(() => {
    const handleFocus = () => { if (isAuthenticated) refresh() }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [isAuthenticated, refresh])

  return (
    <CreditsContext.Provider value={{ credits, loading, refresh, decrementOptimistic }}>
      {children}
    </CreditsContext.Provider>
  )
}

export function useCredits() {
  const ctx = useContext(CreditsContext)
  if (!ctx) throw new Error('useCredits() must be used inside <CreditsProvider>')
  return ctx
}