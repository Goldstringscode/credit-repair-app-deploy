'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface SubscriptionInfo {
  id: string
  planId: string | null
  status: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

interface PaymentMethodInfo {
  id: string
  brand: string
  last4: string
  expMonth: number | null
  expYear: number | null
  isDefault: boolean
}

interface InvoiceInfo {
  id: string
  number: string | null
  status: string
  amountPaid: number
  currency: string
  created: string
  hostedInvoiceUrl: string | null
  invoicePdf: string | null
}

const PLANS = [
  { id: 'basic', name: 'Basic', price: 39 },
  { id: 'professional', name: 'Professional', price: 79 },
  { id: 'premium', name: 'Premium', price: 129 },
]

const cardElementOptions = {
  style: {
    base: {
      fontSize: '15px',
      color: '#0f172a',
      fontFamily: 'inherit',
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: { color: '#dc2626' },
  },
}

function CardBrandIcon({ brand }: { brand: string }) {
  if (brand === 'mastercard') {
    return (
      <svg width="28" height="20" viewBox="0 0 24 17">
        <rect width="24" height="17" rx="2" fill="#252525" />
        <circle cx="9" cy="8.5" r="5" fill="#EB001B" />
        <circle cx="15" cy="8.5" r="5" fill="#F79E1B" fillOpacity="0.8" />
      </svg>
    )
  }
  return (
    <svg width="28" height="20" viewBox="0 0 24 17">
      <rect width="24" height="17" rx="2" fill="#1a1f36" />
      <rect y="5" width="24" height="3" fill="#635bff" />
    </svg>
  )
}

/** Card entry form, rendered inside an <Elements> provider only while the add-card modal is open. */
function AddCardForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [makeDefault, setMakeDefault] = useState(true)
  const [cardError, setCardError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    const cardElement = elements.getElement(CardElement)
    if (!cardElement) return

    setLoading(true)
    setSubmitError(null)
    try {
      const intentRes = await fetch('/api/stripe/setup-intent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const intentData = await intentRes.json()
      if (!intentRes.ok || !intentData.success) {
        throw new Error(intentData.error || 'Could not start card setup')
      }

      const { setupIntent, error: confirmError } = await stripe.confirmCardSetup(
        intentData.setupIntent.client_secret,
        { payment_method: { card: cardElement } }
      )

      if (confirmError) {
        throw new Error(confirmError.message || 'Your card could not be saved')
      }
      if (!setupIntent || setupIntent.status !== 'succeeded') {
        throw new Error('Card setup was not completed')
      }

      const saveRes = await fetch('/api/billing/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setupIntentId: setupIntent.id, makeDefault }),
      })
      const saveData = await saveRes.json()
      if (!saveRes.ok || !saveData.success) {
        throw new Error(saveData.error || 'Card was saved but could not be added to your account')
      }

      onSuccess()
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Card details</label>
        <div className="h-11 px-3.5 flex items-center rounded-lg border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
          <div className="w-full">
            <CardElement
              options={cardElementOptions}
              onChange={e => setCardError(e.error?.message ?? null)}
            />
          </div>
        </div>
        {cardError && <p className="text-xs text-red-600 mt-1">{cardError}</p>}
      </div>

      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={makeDefault}
          onChange={e => setMakeDefault(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
        />
        <span className="text-sm text-slate-600">Make this my default payment method</span>
      </label>

      {submitError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{submitError}</div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-11 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !stripe}
          className="flex-1 h-11 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Saving…' : 'Save card'}
        </button>
      </div>
    </form>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function BillingPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionInfo[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodInfo[]>([])
  const [invoices, setInvoices] = useState<InvoiceInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showChangePlanConfirm, setShowChangePlanConfirm] = useState<string | null>(null)
  const [showAddCard, setShowAddCard] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const [subsRes, pmRes, invRes] = await Promise.all([
        fetch('/api/billing/subscriptions'),
        fetch('/api/billing/payment-methods'),
        fetch('/api/billing/invoices'),
      ])
      if (subsRes.status === 401 || pmRes.status === 401 || invRes.status === 401) {
        setLoadError('Please sign in to view your billing.')
        return
      }
      const [subsJson, pmJson, invJson] = await Promise.all([subsRes.json(), pmRes.json(), invRes.json()])
      if (!subsJson.success) throw new Error(subsJson.error || 'Failed to load subscription')
      setSubscriptions(subsJson.subscriptions ?? [])
      setPaymentMethods(pmJson.paymentMethods ?? [])
      setInvoices(invJson.invoices ?? [])
    } catch (err: any) {
      console.error('Failed to load billing data:', err)
      setLoadError('Something went wrong loading your billing information.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const activeSubscription = subscriptions.find(s => ['active', 'trialing', 'past_due'].includes(s.status))

  const handleCancelConfirmed = async () => {
    if (!activeSubscription) return
    setActionLoading('cancel')
    setActionError(null)
    try {
      const res = await fetch('/api/billing/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: activeSubscription.id, atPeriodEnd: true }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to cancel subscription')
      setShowCancelConfirm(false)
      await loadAll()
    } catch (err: any) {
      setActionError(err.message || 'Failed to cancel subscription')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReactivate = async () => {
    if (!activeSubscription) return
    setActionLoading('reactivate')
    setActionError(null)
    try {
      const res = await fetch('/api/billing/subscriptions/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: activeSubscription.id }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to reactivate subscription')
      await loadAll()
    } catch (err: any) {
      setActionError(err.message || 'Failed to reactivate subscription')
    } finally {
      setActionLoading(null)
    }
  }

  const handleChangePlanConfirmed = async (planId: string) => {
    if (!activeSubscription) return
    setActionLoading('change-plan')
    setActionError(null)
    try {
      const res = await fetch('/api/billing/subscriptions/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: activeSubscription.id, planId }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to change plan')
      setShowChangePlanConfirm(null)
      await loadAll()
    } catch (err: any) {
      setActionError(err.message || 'Failed to change plan')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemoveCard = async (id: string) => {
    setActionLoading(`remove-${id}`)
    setActionError(null)
    try {
      const res = await fetch(`/api/billing/payment-methods/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to remove card')
      await loadAll()
    } catch (err: any) {
      setActionError(err.message || 'Failed to remove card')
    } finally {
      setActionLoading(null)
    }
  }

  const handleMakeDefault = async (id: string) => {
    setActionLoading(`default-${id}`)
    setActionError(null)
    try {
      const res = await fetch(`/api/billing/payment-methods/${id}`, { method: 'PATCH' })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update default card')
      await loadAll()
    } catch (err: any) {
      setActionError(err.message || 'Failed to update default card')
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <svg className="animate-spin h-8 w-8 mb-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <p>Loading your billing information…</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center mt-16">
          <p className="text-slate-700 mb-4">{loadError}</p>
          <button onClick={loadAll} className="h-10 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Try again
          </button>
        </div>
      </div>
    )
  }

  const currentPlanMeta = PLANS.find(p => p.id === activeSubscription?.planId)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="text-slate-500">Manage your subscription, payment methods, and billing history</p>
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{actionError}</div>
      )}

      {/* Current Plan */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-7">
        {activeSubscription ? (
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Current Plan</p>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">{currentPlanMeta?.name ?? activeSubscription.planId}</h2>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {activeSubscription.status === 'past_due' ? 'Past due' : 'Active'}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {currentPlanMeta ? `$${currentPlanMeta.price.toFixed(2)}/month · ` : ''}
                {activeSubscription.cancelAtPeriodEnd
                  ? `Ends ${new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()}`
                  : `Renews ${new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()}`}
              </p>
              {activeSubscription.cancelAtPeriodEnd && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3 max-w-sm">
                  Your subscription is set to end on {new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()}. You'll keep access until then.
                </p>
              )}
            </div>
            {activeSubscription.cancelAtPeriodEnd ? (
              <button
                onClick={handleReactivate}
                disabled={actionLoading === 'reactivate'}
                className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {actionLoading === 'reactivate' ? 'Reactivating…' : 'Reactivate'}
              </button>
            ) : (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="h-10 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel subscription
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-slate-600 mb-4">You don't have an active subscription yet.</p>
            <Link href="/pricing" className="inline-flex h-10 px-4 items-center rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
              View Plans
            </Link>
          </div>
        )}
      </div>

      {/* Change Plan */}
      {activeSubscription && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-7">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-4">Change Plan</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {PLANS.map(plan => {
              const isCurrent = plan.id === activeSubscription.planId
              return (
                <div
                  key={plan.id}
                  className={`rounded-xl p-4 relative ${isCurrent ? 'border-2 border-blue-600 bg-blue-50/40' : 'border border-slate-200'}`}
                >
                  {isCurrent && (
                    <span className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                  <p className="font-semibold text-slate-900">{plan.name}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    ${plan.price}
                    <span className="text-sm font-normal text-slate-400">/mo</span>
                  </p>
                  <button
                    disabled={isCurrent}
                    onClick={() => setShowChangePlanConfirm(plan.id)}
                    className={`w-full mt-4 h-9 rounded-lg text-sm font-medium transition-colors ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : plan.price > (currentPlanMeta?.price ?? 0)
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {isCurrent ? 'Your current plan' : plan.price > (currentPlanMeta?.price ?? 0) ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`}
                  </button>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-slate-400 mt-4">Plan changes are prorated automatically — you'll only pay the difference.</p>
        </div>
      )}

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-7">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Payment Methods</p>
          <button onClick={() => setShowAddCard(true)} className="text-sm font-medium text-blue-600 hover:text-blue-700">
            + Add card
          </button>
        </div>

        {paymentMethods.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">No payment methods saved yet.</p>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map(pm => (
              <div key={pm.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <CardBrandIcon brand={pm.brand} />
                  <div>
                    <p className="text-sm font-medium text-slate-900 capitalize">
                      {pm.brand} •••• {pm.last4}
                    </p>
                    <p className="text-xs text-slate-400">
                      {pm.expMonth && pm.expYear ? `Expires ${String(pm.expMonth).padStart(2, '0')}/${pm.expYear}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {pm.isDefault ? (
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 rounded-full px-2.5 py-1">Default</span>
                  ) : (
                    <button
                      onClick={() => handleMakeDefault(pm.id)}
                      disabled={actionLoading === `default-${pm.id}`}
                      className="text-xs font-medium text-slate-500 hover:text-slate-700"
                    >
                      Make default
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveCard(pm.id)}
                    disabled={actionLoading === `remove-${pm.id}`}
                    className="text-xs text-slate-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-7">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-4">Billing History</p>
        {invoices.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">No invoices yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {invoices.map(inv => (
              <div key={inv.id} className="flex items-center justify-between py-3 flex-wrap gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">{new Date(inv.created).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-400">Invoice {inv.number ?? ''}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                      inv.status === 'paid' ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'
                    }`}
                  >
                    {inv.status === 'paid' ? 'Paid' : inv.status}
                  </span>
                  <p className="text-sm font-semibold text-slate-900 w-16 text-right">${inv.amountPaid.toFixed(2)}</p>
                  {inv.invoicePdf && (
                    <a href={inv.invoicePdf} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                      Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel confirmation */}
      {showCancelConfirm && (
        <Modal title="Cancel subscription?" onClose={() => setShowCancelConfirm(false)}>
          <p className="text-sm text-slate-600 mb-6">
            You've already paid for the current billing period, so you'll keep full access to {currentPlanMeta?.name ?? 'your plan'} until{' '}
            {activeSubscription && new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()}. After that, your plan won't renew. You can
            undo this anytime before then.
          </p>
          {actionError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">{actionError}</div>}
          <div className="flex gap-3">
            <button onClick={() => setShowCancelConfirm(false)} className="flex-1 h-11 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Keep my plan
            </button>
            <button
              onClick={handleCancelConfirmed}
              disabled={actionLoading === 'cancel'}
              className="flex-1 h-11 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
            >
              {actionLoading === 'cancel' ? 'Cancelling…' : 'Cancel subscription'}
            </button>
          </div>
        </Modal>
      )}

      {/* Change plan confirmation */}
      {showChangePlanConfirm && (
        <Modal title="Confirm plan change" onClose={() => setShowChangePlanConfirm(null)}>
          <p className="text-sm text-slate-600 mb-6">
            Switch from {currentPlanMeta?.name} to {PLANS.find(p => p.id === showChangePlanConfirm)?.name}? Stripe will automatically prorate the
            difference on your next invoice.
          </p>
          {actionError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">{actionError}</div>}
          <div className="flex gap-3">
            <button onClick={() => setShowChangePlanConfirm(null)} className="flex-1 h-11 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button
              onClick={() => handleChangePlanConfirmed(showChangePlanConfirm)}
              disabled={actionLoading === 'change-plan'}
              className="flex-1 h-11 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {actionLoading === 'change-plan' ? 'Switching…' : 'Confirm switch'}
            </button>
          </div>
        </Modal>
      )}

      {/* Add card */}
      {showAddCard && (
        <Modal title="Add a payment method" onClose={() => setShowAddCard(false)}>
          <Elements stripe={stripePromise}>
            <AddCardForm
              onSuccess={() => {
                setShowAddCard(false)
                loadAll()
              }}
              onCancel={() => setShowAddCard(false)}
            />
          </Elements>
        </Modal>
      )}
    </div>
  )
}
