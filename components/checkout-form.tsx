'use client'

import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutFormProps {
  plan: {
    id: string
    name: string
    price: number
    currency: string
    interval: string
    features: string[]
  }
  onSuccess: (paymentData: any) => void
  onCancel: () => void
}

interface AddressData {
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: AddressData
  acceptTerms: boolean
  acceptMarketing: boolean
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: '15px',
      color: '#0f172a',
      fontFamily: 'inherit',
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: {
      color: '#dc2626',
    },
  },
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function StepBadge({ complete, index }: { complete: boolean; index: number }) {
  return (
    <span
      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
        complete ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
      }`}
    >
      {complete ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        index
      )}
    </span>
  )
}

function CheckoutFormInner({ plan, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: { line1: '', line2: '', city: '', state: '', postalCode: '', country: 'US' },
    acceptTerms: false,
    acceptMarketing: false,
  })
  const [cardComplete, setCardComplete] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const updateField = (field: keyof FormData, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }))
  const updateAddressField = (field: keyof AddressData, value: string) =>
    setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: value } }))
  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }))

  const contactComplete =
    formData.firstName.trim().length > 0 &&
    formData.lastName.trim().length > 0 &&
    emailPattern.test(formData.email) &&
    formData.phone.replace(/\D/g, '').length >= 10

  const addressComplete =
    formData.address.line1.trim().length > 0 &&
    formData.address.city.trim().length > 0 &&
    formData.address.state.trim().length > 0 &&
    formData.address.postalCode.trim().length >= 5

  const paymentComplete = cardComplete && formData.acceptTerms

  const allComplete = contactComplete && addressComplete && paymentComplete

  const fieldError = (condition: boolean, field: string) => touched[field] && !condition

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!allComplete) {
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        line1: true,
        city: true,
        state: true,
        postalCode: true,
        acceptTerms: true,
      })
      return
    }

    if (!stripe || !elements) return
    const cardElement = elements.getElement(CardElement)
    if (!cardElement) return

    setLoading(true)
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim()

      const customerRes = await fetch('/api/stripe/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: fullName,
          phone: formData.phone,
          address: {
            line1: formData.address.line1,
            line2: formData.address.line2 || undefined,
            city: formData.address.city,
            state: formData.address.state,
            postal_code: formData.address.postalCode,
            country: formData.address.country,
          },
          metadata: { planId: plan.id },
        }),
      })
      const customerData = await customerRes.json()
      if (!customerRes.ok || !customerData.success) {
        throw new Error(customerData.error || customerData.message || 'Could not save your billing details')
      }
      const customerId = customerData.customer.id

      const intentRes = await fetch('/api/stripe/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          currency: plan.currency,
          customerId,
          description: `Subscription - ${plan.name}`,
        }),
      })
      const intentData = await intentRes.json()
      if (!intentRes.ok || !intentData.success) {
        throw new Error(intentData.error || intentData.message || 'Could not start payment')
      }
      const clientSecret = intentData.paymentIntent.client_secret

      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: fullName,
            email: formData.email,
            phone: formData.phone,
          },
        },
      })

      if (confirmError) {
        throw new Error(confirmError.message || 'Your card could not be charged')
      }
      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        throw new Error('Payment was not completed')
      }

      const subRes = await fetch('/api/billing/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          planId: plan.id,
          metadata: { paymentIntentId: paymentIntent.id },
        }),
      })
      const subData = await subRes.json()
      if (!subRes.ok || !subData.success) {
        // The customer has already been charged at this point, so surface
        // this clearly rather than silently failing — this needs manual
        // follow-up, not a retry of the charge.
        throw new Error(
          'Payment succeeded but the subscription could not be created. Please contact support — you will not be charged again.'
        )
      }

      onSuccess({ paymentIntentId: paymentIntent.id })
    } catch (err: any) {
      console.error('Checkout failed:', err)
      setSubmitError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-slate-900 font-bold text-lg mb-8">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
            <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          Merit Point AI
        </div>

        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center gap-2 flex-1">
              <StepBadge complete={contactComplete} index={1} />
              <span className={`text-xs font-medium ${contactComplete ? 'text-slate-900' : 'text-slate-400'}`}>
                Contact info
              </span>
            </div>
            <div className={`h-0.5 flex-1 -mt-6 transition-colors ${contactComplete ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className="flex flex-col items-center gap-2 flex-1">
              <StepBadge complete={addressComplete} index={2} />
              <span className={`text-xs font-medium ${addressComplete ? 'text-slate-900' : 'text-slate-400'}`}>
                Billing address
              </span>
            </div>
            <div className={`h-0.5 flex-1 -mt-6 transition-colors ${addressComplete ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className="flex flex-col items-center gap-2 flex-1">
              <StepBadge complete={paymentComplete} index={3} />
              <span className={`text-xs font-medium ${paymentComplete ? 'text-slate-900' : 'text-slate-400'}`}>
                Payment
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <h1 className="text-xl font-bold text-slate-900 mb-1">Payment details</h1>
            <p className="text-sm text-slate-500 mb-6">Complete your subscription to {plan.name}</p>

            <div className="space-y-5">
              <div className="flex items-center gap-2 -mb-1">
                <StepBadge complete={contactComplete} index={1} />
                <span className="text-sm font-semibold text-slate-700">Contact info</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">First name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={e => updateField('firstName', e.target.value)}
                    onBlur={() => markTouched('firstName')}
                    placeholder="Jordan"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {fieldError(formData.firstName.trim().length > 0, 'firstName') && (
                    <p className="text-xs text-red-600 mt-1">Required</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Last name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={e => updateField('lastName', e.target.value)}
                    onBlur={() => markTouched('lastName')}
                    placeholder="Reyes"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {fieldError(formData.lastName.trim().length > 0, 'lastName') && (
                    <p className="text-xs text-red-600 mt-1">Required</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => updateField('email', e.target.value)}
                  onBlur={() => markTouched('email')}
                  placeholder="jordan.reyes@email.com"
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                {fieldError(emailPattern.test(formData.email), 'email') && (
                  <p className="text-xs text-red-600 mt-1">Enter a valid email</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => updateField('phone', e.target.value)}
                  onBlur={() => markTouched('phone')}
                  placeholder="(555) 123-4567"
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                {fieldError(formData.phone.replace(/\D/g, '').length >= 10, 'phone') && (
                  <p className="text-xs text-red-600 mt-1">Enter a valid phone number</p>
                )}
              </div>

              <hr className="border-slate-100" />

              <div className="flex items-center gap-2 -mb-1">
                <StepBadge complete={addressComplete} index={2} />
                <span className="text-sm font-semibold text-slate-700">Billing address</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Street address</label>
                <input
                  type="text"
                  value={formData.address.line1}
                  onChange={e => updateAddressField('line1', e.target.value)}
                  onBlur={() => markTouched('line1')}
                  placeholder="482 Maple Street"
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm text-slate-900 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                {fieldError(formData.address.line1.trim().length > 0, 'line1') && (
                  <p className="text-xs text-red-600 -mt-2 mb-3">Required</p>
                )}
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={e => updateAddressField('city', e.target.value)}
                    onBlur={() => markTouched('city')}
                    placeholder="City"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={e => updateAddressField('state', e.target.value)}
                    onBlur={() => markTouched('state')}
                    placeholder="State"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={formData.address.postalCode}
                    onChange={e => updateAddressField('postalCode', e.target.value)}
                    onBlur={() => markTouched('postalCode')}
                    placeholder="ZIP"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <hr className="border-slate-100" />

              <div className="flex items-center gap-2 -mb-1">
                <StepBadge complete={paymentComplete} index={3} />
                <span className="text-sm font-semibold text-slate-700">Payment</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">Card details</label>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    Secured by Stripe
                  </span>
                </div>
                <div className="h-11 px-3.5 flex items-center rounded-lg border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                  <div className="w-full">
                    <CardElement
                      options={cardElementOptions}
                      onChange={e => {
                        setCardComplete(e.complete)
                        setCardError(e.error?.message ?? null)
                      }}
                    />
                  </div>
                </div>
                {cardError && <p className="text-xs text-red-600 mt-1">{cardError}</p>}
                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Your card details are sent directly to Stripe and never touch our servers.
                </p>
              </div>

              <label className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={e => updateField('acceptTerms', e.target.checked)}
                  onBlur={() => markTouched('acceptTerms')}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                />
                <span className="text-sm text-slate-600">I agree to the terms of service and billing policy</span>
              </label>
              {fieldError(formData.acceptTerms, 'acceptTerms') && (
                <p className="text-xs text-red-600 -mt-3">You must accept the terms to continue</p>
              )}

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !stripe}
                className="w-full h-12 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                )}
                {loading ? 'Processing…' : `Subscribe for $${plan.price.toFixed(2)}/${plan.interval}`}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="w-full text-center text-sm text-slate-500 hover:text-slate-700"
              >
                Cancel and go back
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 lg:sticky lg:top-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-7">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">Order summary</p>

            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="font-semibold text-slate-900">{plan.name} plan</p>
                <p className="text-sm text-slate-500">Billed {plan.interval === 'year' ? 'yearly' : 'monthly'}</p>
              </div>
              <p className="font-semibold text-slate-900">${plan.price.toFixed(2)}</p>
            </div>

            <div className="border-t border-slate-100 my-5" />

            <ul className="space-y-2.5 mb-6">
              {plan.features.slice(0, 6).map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" className="shrink-0 mt-0.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="border-t border-slate-100 my-5" />

            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-slate-500">Due today</p>
              <p className="text-2xl font-bold text-slate-900">${plan.price.toFixed(2)}</p>
            </div>
            <p className="text-xs text-slate-400">
              Then ${plan.price.toFixed(2)} every {plan.interval}. Cancel anytime.
            </p>

            <div className="border-t border-slate-100 my-5" />

            <div className="flex items-center justify-center gap-2 text-slate-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <span className="text-xs font-medium">256-bit SSL encrypted checkout</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export function CheckoutForm(props: CheckoutFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormInner {...props} />
    </Elements>
  )
}
