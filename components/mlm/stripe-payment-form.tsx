'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  Banknote, 
  Wallet, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Mock Stripe Elements for development
// In production, you would use: import { loadStripe } from '@stripe/stripe-js'
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

interface PaymentMethodData {
  type: 'card' | 'bank' | 'paypal'
  card?: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
  bank?: {
    bankName: string
    last4: string
    accountType: string
  }
  paypal?: {
    email: string
  }
  isDefault: boolean
}

interface StripePaymentFormProps {
  onSuccess: (paymentMethod: PaymentMethodData) => void
  onError: (error: string) => void
  isEditing?: boolean
  existingMethod?: PaymentMethodData
}

export function StripePaymentForm({ 
  onSuccess, 
  onError, 
  isEditing = false, 
  existingMethod 
}: StripePaymentFormProps) {
  const [paymentType, setPaymentType] = useState<'card' | 'bank' | 'paypal'>('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    cardholderName: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking',
    paypalEmail: '',
    isDefault: false
  })
  const { toast } = useToast()

  useEffect(() => {
    if (isEditing && existingMethod) {
      setPaymentType(existingMethod.type)
      if (existingMethod.card) {
        setFormData(prev => ({
          ...prev,
          cardNumber: `**** **** **** ${existingMethod.card!.last4}`,
          expMonth: existingMethod.card!.expMonth.toString().padStart(2, '0'),
          expYear: existingMethod.card!.expYear.toString(),
          cvc: '***',
          cardholderName: 'John Doe', // In real app, get from user data
          isDefault: existingMethod.isDefault
        }))
      } else if (existingMethod.bank) {
        setFormData(prev => ({
          ...prev,
          bankName: existingMethod.bank!.bankName,
          accountNumber: `****${existingMethod.bank!.last4}`,
          routingNumber: '***',
          accountType: existingMethod.bank!.accountType,
          isDefault: existingMethod.isDefault
        }))
      } else if (existingMethod.paypal) {
        setFormData(prev => ({
          ...prev,
          paypalEmail: existingMethod.paypal!.email,
          isDefault: existingMethod.isDefault
        }))
      }
    }
  }, [isEditing, existingMethod])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Simulate API call to create/update payment method
      await new Promise(resolve => setTimeout(resolve, 2000))

      let paymentMethod: PaymentMethodData

      if (paymentType === 'card') {
        if (!formData.cardNumber || !formData.expMonth || !formData.expYear || !formData.cvc || !formData.cardholderName) {
          throw new Error('Please fill in all card details')
        }

        paymentMethod = {
          type: 'card',
          card: {
            brand: getCardBrand(formData.cardNumber),
            last4: formData.cardNumber.slice(-4),
            expMonth: parseInt(formData.expMonth),
            expYear: parseInt(formData.expYear)
          },
          isDefault: formData.isDefault
        }
      } else if (paymentType === 'bank') {
        if (!formData.bankName || !formData.accountNumber || !formData.routingNumber) {
          throw new Error('Please fill in all bank account details')
        }

        paymentMethod = {
          type: 'bank',
          bank: {
            bankName: formData.bankName,
            last4: formData.accountNumber.slice(-4),
            accountType: formData.accountType
          },
          isDefault: formData.isDefault
        }
      } else if (paymentType === 'paypal') {
        if (!formData.paypalEmail) {
          throw new Error('Please enter your PayPal email')
        }

        paymentMethod = {
          type: 'paypal',
          paypal: {
            email: formData.paypalEmail
          },
          isDefault: formData.isDefault
        }
      } else {
        throw new Error('Invalid payment type')
      }

      // In production, this would call the actual Stripe API
      const response = await fetch('/api/mlm/payment-methods', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: paymentType,
          ...paymentMethod,
          isEditing,
          existingMethodId: existingMethod ? 'existing_id' : undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save payment method')
      }

      toast({
        title: isEditing ? "Payment Method Updated" : "Payment Method Added",
        description: `Your ${paymentType} payment method has been ${isEditing ? 'updated' : 'added'} successfully.`,
      })

      onSuccess(paymentMethod)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      onError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getCardBrand = (cardNumber: string) => {
    if (cardNumber.startsWith('4')) return 'visa'
    if (cardNumber.startsWith('5')) return 'mastercard'
    if (cardNumber.startsWith('3')) return 'amex'
    return 'unknown'
  }

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="h-5 w-5" />
      case 'bank':
        return <Banknote className="h-5 w-5" />
      case 'paypal':
        return <Wallet className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getMethodIcon(paymentType)}
          {isEditing ? 'Edit Payment Method' : 'Add Payment Method'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Type Selection */}
          <div>
            <Label htmlFor="paymentType">Payment Method Type</Label>
            <Select 
              value={paymentType} 
              onValueChange={(value: 'card' | 'bank' | 'paypal') => setPaymentType(value)}
              disabled={isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="bank">Bank Account</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Card Form */}
          {paymentType === 'card' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                  disabled={isEditing}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expMonth">Expiry Month</Label>
                  <Select 
                    value={formData.expMonth} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, expMonth: value }))}
                    disabled={isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                          {(i + 1).toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expYear">Expiry Year</Label>
                  <Select 
                    value={formData.expYear} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, expYear: value }))}
                    disabled={isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    value={formData.cvc}
                    onChange={(e) => setFormData(prev => ({ ...prev, cvc: e.target.value }))}
                    disabled={isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    value={formData.cardholderName}
                    onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
                    disabled={isEditing}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bank Account Form */}
          {paymentType === 'bank' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="Chase Bank"
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  disabled={isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="1234567890"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  disabled={isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  placeholder="123456789"
                  value={formData.routingNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, routingNumber: e.target.value }))}
                  disabled={isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="accountType">Account Type</Label>
                <Select 
                  value={formData.accountType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, accountType: value }))}
                  disabled={isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* PayPal Form */}
          {paymentType === 'paypal' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="paypalEmail">PayPal Email</Label>
                <Input
                  id="paypalEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.paypalEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, paypalEmail: e.target.value }))}
                  disabled={isEditing}
                />
              </div>
            </div>
          )}

          {/* Default Payment Method Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="isDefault">Set as default payment method</Label>
          </div>

          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your payment information is encrypted and secure. We use Stripe for payment processing 
              and never store your full card details. MLM-approved methods are eligible for commission payouts.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Payment Method' : 'Add Payment Method'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
