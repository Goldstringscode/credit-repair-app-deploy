'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface SubscriptionInfo {
  id: string
  planId: string | null
  status: string
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  professional: 'Professional',
  premium: 'Premium',
  enterprise: 'Enterprise',
}

/**
 * Never shows "success" based on the redirect alone — the PaymentIntent id
 * in the URL is only a hint. This page independently confirms a real active
 * subscription exists (via /api/billing/subscriptions, which reads live from
 * Stripe) before celebrating, since the subscription record is written
 * synchronously during checkout but a brief poll guards against any latency.
 */
export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentIntentId = searchParams.get('paymentIntentId')

  const [status, setStatus] = useState<'checking' | 'confirmed' | 'pending' | 'error'>('checking')
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)

  const verify = useCallback(async (attempt: number) => {
    try {
      const res = await fetch('/api/billing/subscriptions')
      if (res.status === 401) {
        router.replace('/login')
        return
      }
      const json = await res.json()
      const active = (json.subscriptions ?? []).find((s: SubscriptionInfo) =>
        ['active', 'trialing'].includes(s.status)
      )
      if (active) {
        setSubscription(active)
        setStatus('confirmed')
        return
      }
      if (attempt < 4) {
        setTimeout(() => verify(attempt + 1), 1500)
      } else {
        setStatus('pending')
      }
    } catch (err) {
      console.error('Failed to verify subscription:', err)
      setStatus('error')
    }
  }, [router])

  useEffect(() => {
    verify(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const planLabel = subscription?.planId ? (PLAN_LABELS[subscription.planId] ?? subscription.planId) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center">
        {status === 'checking' && (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
              <svg className="animate-spin h-7 w-7 text-blue-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-1">Confirming your payment…</h1>
            <p className="text-sm text-slate-500">This only takes a moment.</p>
          </>
        )}

        {status === 'confirmed' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment successful</h1>
            <p className="text-sm text-slate-600 mb-6">
              {planLabel ? (
                <>You're subscribed to the <span className="font-semibold text-slate-900">{planLabel}</span> plan.</>
              ) : (
                <>Your subscription is active.</>
              )}
            </p>

            <div className="rounded-lg bg-slate-50 border border-slate-100 p-4 mb-6 text-left">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Active
                </span>
              </div>
              {paymentIntentId && (
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-500">Confirmation</span>
                  <span className="font-mono text-xs text-slate-500">{paymentIntentId.slice(-12)}</span>
                </div>
              )}
            </div>

            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center h-12 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to your dashboard
            </Link>
            <Link href="/dashboard/billing" className="block mt-3 text-sm text-slate-500 hover:text-slate-700">
              View billing details
            </Link>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Still finalizing your subscription</h1>
            <p className="text-sm text-slate-600 mb-6">
              Your payment went through, but it's taking a little longer than usual to activate. Your dashboard
              will update automatically once it's ready — no need to pay again.
            </p>
            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center h-12 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to your dashboard
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v5M12 16h.01" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Couldn't confirm your subscription</h1>
            <p className="text-sm text-slate-600 mb-6">
              Check your billing page for the latest status, or contact support if you were charged but don't see
              an active plan.
            </p>
            <Link
              href="/dashboard/billing"
              className="w-full inline-flex items-center justify-center h-12 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              View billing
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
