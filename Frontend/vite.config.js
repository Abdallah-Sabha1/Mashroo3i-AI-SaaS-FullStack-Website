/**
 * vite.config.js
 * ──────────────────────────────────────────────────────────────────────────
 * Vite is the build tool + dev server. Think of it as the modern replacement
 * for Create React App — faster, simpler, no webpack config hell.
 *
 * What this config does:
 *
 *  plugins: [react()]
 *    → Enables JSX transformation and React Fast Refresh (HMR that preserves
 *      component state while you edit — huge DX win).
 *
 *  server.port: 5173
 *    → Explicitly pins the dev server to port 5173. The backend's CORS
 *      policy allows exactly this origin. If you change this, update
 *      Program.cs → policy.WithOrigins(...) to match.
 *
 *  server.proxy
 *    → OPTIONAL but useful trick: in development, proxies /api/* requests
 *      to the backend so you never deal with CORS issues at all.
 *      The browser sees all requests go to localhost:5173 (same origin),
 *      and Vite silently forwards /api/* to localhost:5057.
 *
 *      We're NOT using this because the backend already has CORS configured,
 *      but it's here commented out so you know it exists.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:5057',
    //     changeOrigin: true,
    //   },
    // },
  },
})
