/**
 * App.jsx — Routing
 */

import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useEffect, useRef } from 'react'

import LandingPage    from './pages/Landingpage'
import AboutPage      from './pages/Aboutpage'
import ContactPage    from './pages/Contactpage'
import LoginPage      from './pages/auth/LoginPage'
import RegisterPage   from './pages/auth/RegisterPage'
import DashboardPage  from './pages/DashboardPage'
import SubmitIdeaPage from './pages/SubmitIdeaPage'
import ProfilePage    from './pages/Profilepage'
import EvaluationPage from './pages/EvaluationPage'
import PricingPage    from './pages/Pricingpage'
import CheckoutPage     from './pages/Checkoutpage'
import BuyCreditsPage   from './pages/BuyCreditsPage'
import BuyCreditsPage              from './pages/BuyCreditsPage'
import FinancialProjectionsPage   from './pages/FinancialProjectionsPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function PageTransition({ children }) {
  const ref = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(10px)'
    el.style.transition = 'none'
    const id = requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.32s cubic-bezier(0.22, 1, 0.36, 1), transform 0.36s cubic-bezier(0.22, 1, 0.36, 1)'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    })
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return <div ref={ref}>{children}</div>
}

export default function App() {
  const location = useLocation()
  return (
    <PageTransition>
      <Routes location={location}>
        <Route path="/"        element={<LandingPage />} />
        <Route path="/about"   element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/pricing" element={<PublicOnlyRoute><PricingPage /></PublicOnlyRoute>} />

        <Route path="/login"    element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

        <Route path="/dashboard"              element={<ProtectedRoute><DashboardPage  /></ProtectedRoute>} />
        <Route path="/submit-idea"            element={<ProtectedRoute><SubmitIdeaPage /></ProtectedRoute>} />
        <Route path="/profile"                element={<ProtectedRoute><ProfilePage    /></ProtectedRoute>} />
        <Route path="/evaluation/:ideaId"     element={<ProtectedRoute><EvaluationPage /></ProtectedRoute>} />
        <Route path="/financial-projections/:ideaId" element={<ProtectedRoute><FinancialProjectionsPage /></ProtectedRoute>} />
        <Route path="/checkout"               element={<ProtectedRoute><CheckoutPage   /></ProtectedRoute>} />
        <Route path="/buy-credits"             element={<ProtectedRoute><BuyCreditsPage /></ProtectedRoute>} />

        {/* Old subscription route → redirect to buy-credits */}
        <Route path="/account/subscription"   element={<Navigate to="/buy-credits" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageTransition>
  )
}