'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckoutForm } from '@/components/checkout-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: number
  currency: string
  interval: string
  features: string[]
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 29.99,
      currency: 'usd',
      interval: 'month',
      features: [
        'Credit report analysis',
        'Basic dispute letters',
        'Email support',
        'Monthly credit monitoring'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 59.99,
      currency: 'usd',
      interval: 'month',
      features: [
        'Everything in Basic',
        'Advanced dispute strategies',
        'Priority support',
        'Weekly credit monitoring',
        'Custom dispute letters',
        'Credit score tracking'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 99.99,
      currency: 'usd',
      interval: 'month',
      features: [
        'Everything in Premium',
        'Unlimited disputes',
        '24/7 phone support',
        'Daily credit monitoring',
        'AI-powered recommendations',
        'White-label options',
        'API access'
      ]
    }
  ]

  useEffect(() => {
    const planId = searchParams.get('plan')
    if (planId) {
      const selectedPlan = plans.find(p => p.id === planId)
      if (selectedPlan) {
        setPlan(selectedPlan)
      } else {
        setError('Invalid plan selected')
      }
    } else {
      setError('No plan selected')
    }
    setLoading(false)
  }, [searchParams])

  const handleSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData)
    setSuccess(true)
    
    // In a real app, you would:
    // 1. Create the subscription
    // 2. Send confirmation email
    // 3. Redirect to dashboard
    // 4. Update user's subscription status
  }

  const handleCancel = () => {
    router.push('/dashboard/billing')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <button
              onClick={() => router.push('/dashboard/billing')}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Back to Billing
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your payment has been processed successfully. You will receive a confirmation email shortly.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <p><strong>Plan:</strong> {plan?.name}</p>
              <p><strong>Amount:</strong> ${plan?.price}/{plan?.interval}</p>
              <p><strong>Status:</strong> Active</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/billing')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Go to Billing Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Plan Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The selected plan could not be found.</p>
            <button
              onClick={() => router.push('/dashboard/billing')}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Back to Billing
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutForm
        plan={plan}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}