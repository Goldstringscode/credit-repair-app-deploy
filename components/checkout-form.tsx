'use client'

import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Mail,
} from 'lucide-react'

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

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: {
    line1: string
    line2: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  acceptTerms: boolean
  acceptMarketing: boolean
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#0f172a',
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: {
      color: '#dc2626',
    },
  },
}

function CheckoutFormInner({ plan, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [cardError, setCardError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
    },
    acceptTerms: false,
    acceptMarketing: false,
  })

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateAddressField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }))
  }

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (stepNumber === 1) {
      if (!formData.firstName) newErrors.firstName = 'First name is required'
      if (!formData.lastName) newErrors.lastName = 'Last name is required'
      if (!formData.email) newErrors.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
      if (!formData.phone) newErrors.phone = 'Phone number is required'
    }

    if (stepNumber === 2) {
      if (!formData.address.line1) newErrors.line1 = 'Address is required'
      if (!formData.address.city) newErrors.city = 'City is required'
      if (!formData.address.state) newErrors.state = 'State is required'
      if (!formData.address.postalCode) newErrors.postalCode = 'Postal code is required'
    }

    if (stepNumber === 3) {
      if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms to continue'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => s + 1)
  }

  const handleBack = () => setStep((s) => s - 1)

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    if (!stripe || !elements) return

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) return

    setLoading(true)
    setCardError(null)

    try {
      // 1. Create (or fetch) the Stripe customer for this billing info.
      const customerRes = await fetch('/api/stripe/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
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
      const customerJson = await customerRes.json()
      if (!customerRes.ok || !customerJson.success) {
        throw new Error(customerJson.error || customerJson.message || 'Failed to create customer')
      }
      const customerId = customerJson.customer.id

      // 2. Create a PaymentIntent for the plan's price.
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
      const intentJson = await intentRes.json()
      if (!intentRes.ok || !intentJson.success) {
        throw new Error(intentJson.error || intentJson.message || 'Failed to start payment')
      }
      const clientSecret = intentJson.paymentIntent.client_secret

      // 3. Confirm the card payment directly with Stripe. Card details never
      //    leave the browser except through Stripe's own SDK/iframe.
      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
          },
        },
      })

      if (confirmError) {
        throw new Error(confirmError.message || 'Card was declined')
      }

      if (paymentIntent?.status !== 'succeeded') {
        throw new Error('Payment could not be completed')
      }

      // 4. Create the subscription record now that the first payment has cleared.
      const subRes = await fetch('/api/billing/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          planId: plan.id,
          metadata: { paymentIntentId: paymentIntent.id },
        }),
      })
      const subJson = await subRes.json()
      if (!subRes.ok || !subJson.success) {
        // The customer has already been charged at this point, so surface this
        // clearly rather than silently failing — this needs manual follow-up,
        // not a retry of the charge.
        throw new Error(
          'Payment succeeded but the subscription could not be created. Please contact support — you will not be charged again.'
        )
      }

      onSuccess({
        customerId,
        subscriptionId: subJson.subscription?.id,
        paymentIntentId: paymentIntent.id,
        plan,
      })
    } catch (err: any) {
      setCardError(err.message || 'Something went wrong processing your payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-blue-600" />
          Checkout — {plan.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {cardError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{cardError}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First name</Label>
                <Input value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} />
                {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
              </div>
              <div>
                <Label>Last name</Label>
                <Input value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} />
                {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onCancel}>Cancel</Button>
              <Button onClick={handleNext}>Continue</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Address line 1</Label>
              <Input value={formData.address.line1} onChange={(e) => updateAddressField('line1', e.target.value)} />
              {errors.line1 && <p className="text-sm text-red-600">{errors.line1}</p>}
            </div>
            <div>
              <Label>Address line 2 (optional)</Label>
              <Input value={formData.address.line2} onChange={(e) => updateAddressField('line2', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input value={formData.address.city} onChange={(e) => updateAddressField('city', e.target.value)} />
                {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
              </div>
              <div>
                <Label>State</Label>
                <Input value={formData.address.state} onChange={(e) => updateAddressField('state', e.target.value)} />
                {errors.state && <p className="text-sm text-red-600">{errors.state}</p>}
              </div>
            </div>
            <div>
              <Label>Postal code</Label>
              <Input value={formData.address.postalCode} onChange={(e) => updateAddressField('postalCode', e.target.value)} />
              {errors.postalCode && <p className="text-sm text-red-600">{errors.postalCode}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={handleNext}>Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <p className="font-medium">{plan.name}</p>
              <p className="text-sm text-gray-600">${plan.price}/{plan.interval}</p>
              <ul className="text-sm text-gray-600 list-disc pl-4">
                {plan.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-gray-500" />
                Card details
              </Label>
              <div className="rounded-md border px-3 py-3">
                <CardElement options={cardElementOptions} />
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Your card details are sent directly to Stripe and never touch our servers.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                checked={formData.acceptTerms}
                onCheckedChange={(v) => updateField('acceptTerms', !!v)}
              />
              <Label className="text-sm">I agree to the terms of service and billing policy</Label>
            </div>
            {errors.acceptTerms && <p className="text-sm text-red-600">{errors.acceptTerms}</p>}

            <div className="flex items-start gap-2">
              <Checkbox
                checked={formData.acceptMarketing}
                onCheckedChange={(v) => updateField('acceptMarketing', !!v)}
              />
              <Label className="text-sm flex items-center gap-1">
                <Mail className="h-3 w-3" /> Send me product updates and offers
              </Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleBack} disabled={loading}>Back</Button>
              <Button onClick={handleSubmit} disabled={loading || !stripe}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Pay ${plan.price}
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function CheckoutForm(props: CheckoutFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormInner {...props} />
    </Elements>
  )
}
