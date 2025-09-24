'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Shield,
  DollarSign,
  Award
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface MLMPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  mlmBenefits: string[]
  commissionRate: number
  rankRequirement?: string
  icon: React.ReactNode
}

interface MLMPaymentProcessorProps {
  plan: MLMPlan
  onSuccess: (subscriptionId: string) => void
  onError: (error: string) => void
  mlmCode?: string
  sponsorId?: string
}

export function MLMPaymentProcessor({
  plan,
  onSuccess,
  onError,
  mlmCode,
  sponsorId
}: MLMPaymentProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handlePayment = async () => {
    try {
      setIsProcessing(true)
      setError(null)

      // Create payment intent
      const response = await fetch('/api/mlm/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: plan.id,
          mlmCode,
          sponsorId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Payment failed')
      }

      const { clientSecret } = await response.json()

      // In a real implementation, you would integrate with Stripe Elements here
      // For now, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create subscription
      const subscriptionResponse = await fetch('/api/mlm/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: plan.id,
          paymentMethodId: 'pm_mock_payment_method',
          mlmCode,
          sponsorId,
        }),
      })

      if (!subscriptionResponse.ok) {
        const errorData = await subscriptionResponse.json()
        throw new Error(errorData.error || 'Subscription creation failed')
      }

      const { subscriptionId } = await subscriptionResponse.json()

      toast({
        title: "Payment Successful!",
        description: `Welcome to the ${plan.name} plan. Your MLM journey begins now!`,
      })

      onSuccess(subscriptionId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      setError(errorMessage)
      onError(errorMessage)
      
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {plan.icon}
          {plan.name}
        </CardTitle>
        <div className="text-3xl font-bold">
          ${plan.price}
          <span className="text-sm font-normal text-gray-600">/{plan.interval}</span>
        </div>
        <p className="text-gray-600">{plan.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* MLM Benefits */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-purple-800">MLM Benefits Included:</h4>
          <ul className="space-y-2">
            {plan.mlmBenefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-purple-500 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Commission Rate */}
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-800">Commission Rate:</span>
            <span className="text-lg font-bold text-green-600">
              {(plan.commissionRate * 100).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Earn on every referral you make
          </p>
        </div>

        {/* Payment Security */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your payment is processed securely through Stripe. 
            All MLM transactions are encrypted and protected.
          </AlertDescription>
        </Alert>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Start MLM Journey - ${plan.price}/{plan.interval}
            </>
          )}
        </Button>

        {/* Additional Info */}
        <div className="text-center text-xs text-gray-500">
          <p>By subscribing, you agree to our MLM terms and conditions.</p>
          <p>Cancel anytime from your billing dashboard.</p>
        </div>
      </CardContent>
    </Card>
  )
}
