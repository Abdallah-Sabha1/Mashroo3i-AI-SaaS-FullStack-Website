/**
 * AuthContext.jsx — Global Auth State
 * ──────────────────────────────────────────────────────────────────────────
 * WHY React Context for auth?
 *
 *   Imagine you have 20 pages. Every page needs to know "is the user logged
 *   in?" and "what's their name?". Without Context you'd have to pass that
 *   info as props through every component in between — that's called "prop
 *   drilling" and it's a nightmare to maintain.
 *
 *   Context solves this: wrap the whole app in <AuthProvider>, and any
 *   component anywhere in the tree can call useAuth() to get the current
 *   user without any prop passing.
 *
 * HOW it works:
 *   1. AuthProvider reads the stored token on first load (so if you refresh
 *      the page, you stay logged in).
 *   2. login() and logout() update BOTH localStorage (persistence) AND the
 *      React state (UI reactivity) at the same time.
 *   3. Any component that needs auth state just calls:
 *        const { user, login, logout, isAuthenticated } = useAuth()
 *
 * IMPORTANT: This is the "single source of truth" for auth in the UI.
 *   Components should NEVER read from localStorage directly — always go
 *   through useAuth(). That way if we ever move to cookies or a different
 *   storage mechanism, we change it here and nowhere else.
 */

import { createContext, useContext, useState, useCallback } from 'react'
import * as authService from '../services/authService'

// ── Create the context ────────────────────────────────────────────────────
// We export this so useAuth can check it was used inside the provider.
export const AuthContext = createContext(null)

// ── Provider Component ────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  // Initialize state from localStorage on first render.
  // This is why you stay logged in after a page refresh.
  const [user, setUser] = useState(() => authService.getStoredUser())

  /**
   * login() — called by the LoginPage after the API responds successfully.
   *
   * We receive the data from authService.login() which already stored the
   * token in localStorage. Here we just update React state so the UI
   * re-renders immediately with the user's name etc.
   */
  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    setUser({ fullName: data.fullName, role: data.role, token: data.accessToken })
    return data
  }, [])

  /**
   * logout() — wipes localStorage and clears React state.
   * React will re-render, the protected routes will redirect to /login.
   */
  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const value = {
    user,                               // { fullName, role, token } or null
    isAuthenticated: Boolean(user),     // convenience boolean
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Custom hook ───────────────────────────────────────────────────────────
/**
 * useAuth() — consume the auth context from any component.
 *
 * Usage:
 *   const { user, login, logout, isAuthenticated } = useAuth()
 *
 * Throws if used outside of <AuthProvider> so you get a clear error instead
 * of a silent undefined.
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth() must be used inside <AuthProvider>')
  }
  return ctx
}
