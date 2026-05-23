/**
 * authService.js — Auth API calls
 * ──────────────────────────────────────────────────────────────────────────
 * WHY this file exists:
 *   Business logic for auth lives here, not in the React components.
 *   Components just call authService.login(email, password) and get back
 *   a result. They don't need to know the endpoint URL, the body shape,
 *   or how the token is stored.
 *
 *   This pattern is called a "service layer" — it separates "what does
 *   the UI look like" from "how does the app talk to the server".
 */

import api from './api'

/**
 * Login the user.
 *
 * Matches the backend LoginDto exactly:
 *   { email: string, password: string }
 *
 * On success: stores the JWT in localStorage and returns the full response.
 * On failure: throws — the calling component catches and shows the error.
 *
 * @param {string} email
 * @param {string} password
 * @returns {{ accessToken: string, role: string, fullName: string }}
 */
export async function login(email, password) {
  const data = await api.post('/api/auth/login', {
    body: { email, password },
  })

  // Store the token so subsequent authenticated requests can attach it.
  // We also store fullName and role so the app can display them without
  // making another API call.
  localStorage.setItem('accessToken', data.accessToken)
  localStorage.setItem('userFullName', data.fullName)
  localStorage.setItem('userRole', data.role)

  return data
}

/**
 * Register a new entrepreneur.
 *
 * Matches the backend RegisterDto exactly:
 *   { fullName, email, password, education, experience, businessInterest }
 *
 * The backend returns { message: "Registered successfully." } — it does NOT
 * auto-login after register, so after this succeeds we redirect to login.
 *
 * @param {object} formData
 * @returns {{ message: string }}
 */
export async function register(formData) {
  return api.post('/api/auth/register', {
    body: {
      fullName:         formData.fullName,
      email:            formData.email,
      password:         formData.password,
      education:        formData.education,
      experience:       formData.experience,
      businessInterest: formData.businessInterest,
    },
  })
}

/**
 * Log out the current user.
 * No API call needed — JWT is stateless. Just wipe local storage.
 */
export function logout() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('userFullName')
  localStorage.removeItem('userRole')
}

/**
 * Check if there's a stored token (used to decide auth state on page load).
 * @returns {boolean}
 */
export function isAuthenticated() {
  return Boolean(localStorage.getItem('accessToken'))
}

/**
 * Get the stored user info without an API call.
 * @returns {{ fullName: string, role: string } | null}
 */
export function getStoredUser() {
  const token = localStorage.getItem('accessToken')
  if (!token) return null
  return {
    fullName: localStorage.getItem('userFullName') ?? '',
    role:     localStorage.getItem('userRole') ?? '',
    token,
  }
}
