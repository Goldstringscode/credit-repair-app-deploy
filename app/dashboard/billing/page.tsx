'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

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

const elementStyle = {
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

/**
 * Full card entry: separate number/expiry/CVC fields plus a cardholder
 * name field, instead of a single combined field — a more complete-feeling
 * form. Used both by the standalone "Add card" modal and embedded inside
 * the Change Plan modal when the customer picks "use a new card" there.
 */
function CardFields({
  cardholderName,
  onCardholderNameChange,
  onFieldChange,
}: {
  cardholderName: string
  onCardholderNameChange: (v: string) => void
  onFieldChange: (field: string, error: string | null) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Cardholder name</label>
        <input
          type="text"
          value={cardholderName}
          onChange={e => onCardholderNameChange(e.target.value)}
          placeholder="Jordan Reyes"
          className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Card number</label>
        <div className="h-11 px-3.5 flex items-center rounded-lg border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
          <div className="w-full">
            <CardNumberElement options={elementStyle} onChange={e => onFieldChange('number', e.error?.message ?? null)} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Expiry date</label>
          <div className="h-11 px-3.5 flex items-center rounded-lg border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
            <div className="w-full">
              <CardExpiryElement options={elementStyle} onChange={e => onFieldChange('expiry', e.error?.message ?? null)} />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">CVC</label>
          <div className="h-11 px-3.5 flex items-center rounded-lg border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
            <div className="w-full">
              <CardCvcElement options={elementStyle} onChange={e => onFieldChange('cvc', e.error?.message ?? null)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Saves a card via SetupIntent + confirmCardSetup (charges nothing), then
 * registers it with /api/billing/payment-methods. onSaved receives the new
 * payment method's id so callers (standalone add-card, or the change-plan
 * modal) can use it immediately.
 */
function useSaveCard() {
  const stripe = useStripe()
  const elements = useElements()

  return useCallback(
    async (cardholderName: string, makeDefault: boolean): Promise<string> => {
      if (!stripe || !elements) throw new Error('Payment form is still loading')
      const cardNumberElement = elements.getElement(CardNumberElement)
      if (!cardNumberElement) throw new Error('Card details are incomplete')

      const intentRes = await fetch('/api/stripe/setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const intentData = await intentRes.json()
      if (!intentRes.ok || !intentData.success) {
        throw new Error(intentData.error || 'Could not start card setup')
      }

      const { setupIntent, error: confirmError } = await stripe.confirmCardSetup(intentData.setupIntent.client_secret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: { name: cardholderName || undefined },
        },
      })

      if (confirmError) throw new Error(confirmError.message || 'Your card could not be saved')
      if (!setupIntent || setupIntent.status !== 'succeeded') throw new Error('Card setup was not completed')

      const saveRes = await fetch('/api/billing/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setupIntentId: setupIntent.id, makeDefault }),
      })
      const saveData = await saveRes.json()
      if (!saveRes.ok || !saveData.success) {
        throw new Error(saveData.error || 'Card was saved but could not be added to your account')
      }

      return saveData.paymentMethod.id as string
    },
    [stripe, elements]
  )
}

function AddCardForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe()
  const saveCard = useSaveCard()
  const [cardholderName, setCardholderName] = useState('')
  const [makeDefault, setMakeDefault] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSubmitError(null)
    try {
      await saveCard(cardholderName, makeDefault)
      onSuccess()
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const errorMessage = Object.values(fieldErrors).find(Boolean)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardFields
        cardholderName={cardholderName}
        onCardholderNameChange={setCardholderName}
        onFieldChange={(field, error) => setFieldErrors(prev => ({ ...prev, [field]: error }))}
      />
      {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}

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

interface ChangePlanModalProps {
  currentPlanName: string
  targetPlan: { id: string; name: string; price: number }
  paymentMethods: PaymentMethodInfo[]
  onClose: () => void
  onConfirmed: () => void
  subscriptionId: string
}

/** Inner content of the change-plan modal — needs Stripe context only for the inline "new card" option. */
function ChangePlanModalContent({
  currentPlanName,
  targetPlan,
  paymentMethods,
  onClose,
  onConfirmed,
  subscriptionId,
}: ChangePlanModalProps) {
  const saveCard = useSaveCard()
  const [preview, setPreview] = useState<{ isUpgrade: boolean; amountDueToday: number; effectiveDate: string } | null>(null)
  const [previewLoading, setPreviewLoading] = useState(true)
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(
    paymentMethods.find(pm => pm.isDefault)?.id ?? paymentMethods[0]?.id ?? null
  )
  const [usingNewCard, setUsingNewCard] = useState(paymentMethods.length === 0)
  const [cardholderName, setCardholderName] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/billing/subscriptions/preview-plan-change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId, planId: targetPlan.id }),
    })
      .then(res => res.json())
      .then(data => {
        if (cancelled) return
        if (data.success) {
          setPreview(data)
        } else {
          setError(data.error || 'Could not calculate the price change')
        }
      })
      .catch(() => !cancelled && setError('Could not calculate the price change'))
      .finally(() => !cancelled && setPreviewLoading(false))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    try {
      let paymentMethodId = selectedPaymentMethodId || undefined

      if (preview?.isUpgrade && usingNewCard) {
        paymentMethodId = await saveCard(cardholderName, true)
      }

      const res = await fetch('/api/billing/subscriptions/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId, planId: targetPlan.id, paymentMethodId }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to change plan')
      onConfirmed()
    } catch (err: any) {
      setError(err.message || 'Failed to change plan')
    } finally {
      setLoading(false)
    }
  }

  if (previewLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    )
  }

  // Downgrade: no charge, no payment method needed — just confirm.
  if (preview && !preview.isUpgrade) {
    return (
      <div className="space-y-5">
        <p className="text-sm text-slate-600">
          You'll keep full access to <span className="font-semibold text-slate-900">{currentPlanName}</span> through{' '}
          <span className="font-semibold text-slate-900">{new Date(preview.effectiveDate).toLocaleDateString()}</span> — you've
          already paid for this billing period. After that, you'll automatically switch to{' '}
          <span className="font-semibold text-slate-900">{targetPlan.name}</span> at ${targetPlan.price}/month.
        </p>
        <p className="text-xs text-slate-400">Nothing is charged today.</p>
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-11 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 h-11 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Scheduling…' : 'Confirm switch'}
          </button>
        </div>
      </div>
    )
  }

  // Upgrade: charge today — pick a card.
  const errorMessage = Object.values(fieldErrors).find(Boolean)

  return (
    <div className="space-y-5">
      <div className="rounded-lg bg-blue-50 border border-blue-100 p-3.5">
        <p className="text-sm text-slate-700">
          Switching to <span className="font-semibold">{targetPlan.name}</span> today.
        </p>
        <p className="text-2xl font-bold text-slate-900 mt-1">${(preview?.amountDueToday ?? 0).toFixed(2)}</p>
        <p className="text-xs text-slate-500">Prorated charge due today, then ${targetPlan.price}.00/month going forward.</p>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Pay with</p>
        <div className="space-y-2">
          {paymentMethods.map(pm => (
            <label
              key={pm.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                !usingNewCard && selectedPaymentMethodId === pm.id ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200'
              }`}
            >
              <input
                type="radio"
                name="payment-method"
                checked={!usingNewCard && selectedPaymentMethodId === pm.id}
                onChange={() => {
                  setSelectedPaymentMethodId(pm.id)
                  setUsingNewCard(false)
                }}
                className="text-blue-600 focus:ring-blue-500/30"
              />
              <CardBrandIcon brand={pm.brand} />
              <span className="text-sm text-slate-900 capitalize">
                {pm.brand} •••• {pm.last4}
              </span>
              {pm.isDefault && <span className="ml-auto text-xs text-slate-400">Default</span>}
            </label>
          ))}
          <label
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
              usingNewCard ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200'
            }`}
          >
            <input
              type="radio"
              name="payment-method"
              checked={usingNewCard}
              onChange={() => setUsingNewCard(true)}
              className="text-blue-600 focus:ring-blue-500/30"
            />
            <span className="text-sm text-slate-900">Use a new card</span>
          </label>
        </div>
      </div>

      {usingNewCard && (
        <div className="pt-1 border-t border-slate-100">
          <div className="pt-4">
            <CardFields
              cardholderName={cardholderName}
              onCardholderNameChange={setCardholderName}
              onFieldChange={(field, err) => setFieldErrors(prev => ({ ...prev, [field]: err }))}
            />
          </div>
        </div>
      )}
      {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 h-11 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading || (!usingNewCard && !selectedPaymentMethodId)}
          className="flex-1 h-11 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Processing…' : `Confirm & pay $${(preview?.amountDueToday ?? 0).toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
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
  const [changePlanTarget, setChangePlanTarget] = useState<{ id: string; name: string; price: number } | null>(null)
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
                    onClick={() => setChangePlanTarget(plan)}
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
          <p className="text-xs text-slate-400 mt-4">
            Upgrades are charged immediately for the prorated difference. Downgrades take effect at the end of your current billing period — you keep your current plan's access until then.
          </p>
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

      {/* Change plan */}
      {changePlanTarget && activeSubscription && (
        <Modal title="Confirm plan change" onClose={() => setChangePlanTarget(null)}>
          <Elements stripe={stripePromise}>
            <ChangePlanModalContent
              currentPlanName={currentPlanMeta?.name ?? 'your current plan'}
              targetPlan={changePlanTarget}
              paymentMethods={paymentMethods}
              subscriptionId={activeSubscription.id}
              onClose={() => setChangePlanTarget(null)}
              onConfirmed={() => {
                setChangePlanTarget(null)
                loadAll()
              }}
            />
          </Elements>
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
