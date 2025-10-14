'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { subscriptionService } from '@/lib/subscription-service'
import { 
  User, 
  Mail, 
  CreditCard, 
  Calendar, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface CreateSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (subscription: any) => void
}

interface SubscriptionFormData {
  customerName: string
  customerEmail: string
  planId: string
  billingCycle: 'month' | 'year'
  amount: number
  currency: string
  trialDays: number
  paymentMethod: string
  notes: string
}

const PLANS = [
  { id: 'basic', name: 'Basic Plan', monthlyPrice: 29.99, yearlyPrice: 299.99 },
  { id: 'premium', name: 'Premium Plan', monthlyPrice: 59.99, yearlyPrice: 599.99 },
  { id: 'enterprise', name: 'Enterprise Plan', monthlyPrice: 99.99, yearlyPrice: 999.99 }
]

const PAYMENT_METHODS = [
  'Visa ****4242',
  'Mastercard ****5555',
  'American Express ****1234',
  'Discover ****9876',
  'Executive Account (Free)'
]

export default function CreateSubscriptionModal({ isOpen, onClose, onSuccess }: CreateSubscriptionModalProps) {
  const [formData, setFormData] = useState<SubscriptionFormData>({
    customerName: '',
    customerEmail: '',
    planId: '',
    billingCycle: 'month',
    amount: 0,
    currency: 'usd',
    trialDays: 0,
    paymentMethod: '',
    notes: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(1)

  const handleInputChange = (field: keyof SubscriptionFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Auto-calculate amount when plan or billing cycle changes
    if (field === 'planId' || field === 'billingCycle') {
      const plan = PLANS.find(p => p.id === value || p.id === formData.planId)
      if (plan) {
        const amount = formData.billingCycle === 'year' ? plan.yearlyPrice : plan.monthlyPrice
        setFormData(prev => ({ ...prev, amount }))
      }
    }
    
    // Handle executive account - set amount to 0
    if (field === 'paymentMethod' && value === 'Executive Account (Free)') {
      setFormData(prev => ({ ...prev, amount: 0 }))
    } else if (field === 'paymentMethod' && value !== 'Executive Account (Free)' && formData.amount === 0) {
      // Restore original amount if switching away from executive account
      const plan = PLANS.find(p => p.id === formData.planId)
      if (plan) {
        const amount = formData.billingCycle === 'year' ? plan.yearlyPrice : plan.monthlyPrice
        setFormData(prev => ({ ...prev, amount }))
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required'
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Customer email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address'
    }

    if (!formData.planId) {
      newErrors.planId = 'Please select a plan'
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      // Create subscription object
      const isExecutiveAccount = formData.paymentMethod === 'Executive Account (Free)'
      const subscriptionData = {
        customerId: `cus_${Date.now()}`,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        planId: formData.planId,
        planName: PLANS.find(p => p.id === formData.planId)?.name || '',
        status: 'active' as const,
        currentPeriodStart: new Date().toISOString().split('T')[0],
        currentPeriodEnd: new Date(Date.now() + (formData.billingCycle === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        cancelAtPeriodEnd: false,
        amount: isExecutiveAccount ? 0 : formData.amount,
        currency: formData.currency,
        nextBillingDate: isExecutiveAccount ? undefined : new Date(Date.now() + (formData.billingCycle === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentMethod: formData.paymentMethod,
        billingCycle: formData.billingCycle,
        prorationEnabled: !isExecutiveAccount,
        dunningEnabled: !isExecutiveAccount,
        notes: isExecutiveAccount ? 
          `${formData.notes ? formData.notes + ' | ' : ''}Executive Account - Marketing/Free Account` : 
          formData.notes,
        isExecutiveAccount
      }

      // Call the real API
      const response = await subscriptionService.createSubscription(subscriptionData)
      
      if (response.success && response.data) {
        console.log('Created subscription:', response.data.subscription)
        
        if (onSuccess) {
          onSuccess(response.data.subscription)
        }
        
        // Reset form and close modal
        setFormData({
          customerName: '',
          customerEmail: '',
          planId: '',
          billingCycle: 'month',
          amount: 0,
          currency: 'usd',
          trialDays: 0,
          paymentMethod: '',
          notes: ''
        })
        setStep(1)
        onClose()
      } else {
        console.error('Failed to create subscription:', response.error)
        alert(`Failed to create subscription: ${response.error}`)
      }
      
    } catch (error) {
      console.error('Error creating subscription:', error)
      alert('An error occurred while creating the subscription. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedPlan = PLANS.find(p => p.id === formData.planId)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Create New Subscription
          </DialogTitle>
          <DialogDescription>
            Create a new subscription for a customer. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Customer Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      placeholder="Enter customer name"
                      className={errors.customerName ? 'border-red-500' : ''}
                    />
                    {errors.customerName && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.customerName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Customer Email *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                      placeholder="Enter customer email"
                      className={errors.customerEmail ? 'border-red-500' : ''}
                    />
                    {errors.customerEmail && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.customerEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Add any notes about this subscription"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Plan Selection */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Plan Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Plan *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PLANS.map((plan) => (
                      <div
                        key={plan.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.planId === plan.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleInputChange('planId', plan.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{plan.name}</h3>
                          {formData.planId === plan.id && (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Monthly: ${plan.monthlyPrice}
                          </p>
                          <p className="text-sm text-gray-600">
                            Yearly: ${plan.yearlyPrice}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.planId && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.planId}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Billing Cycle</Label>
                    <Select
                      value={formData.billingCycle}
                      onValueChange={(value: 'month' | 'year') => handleInputChange('billingCycle', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Monthly</SelectItem>
                        <SelectItem value="year">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Trial Days</Label>
                    <Input
                      type="number"
                      value={formData.trialDays}
                      onChange={(e) => handleInputChange('trialDays', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      max="30"
                    />
                  </div>
                </div>

                {selectedPlan && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Selected Plan:</span>
                      <Badge variant="outline">{selectedPlan.name}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span>Amount:</span>
                      <span className="font-semibold">
                        ${formData.billingCycle === 'year' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice}
                        /{formData.billingCycle}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Payment Method */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Method *</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => handleInputChange('paymentMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.paymentMethod && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.paymentMethod}
                    </p>
                  )}
                </div>

                <div className={`p-4 rounded-lg ${formData.paymentMethod === 'Executive Account (Free)' ? 'bg-green-50 border border-green-200' : 'bg-blue-50'}`}>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    Subscription Summary
                    {formData.paymentMethod === 'Executive Account (Free)' && (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        Executive Account
                      </Badge>
                    )}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <span>{formData.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span>{formData.customerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plan:</span>
                      <span>{selectedPlan?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Billing:</span>
                      <span>{formData.billingCycle}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Amount:</span>
                      <span className={formData.amount === 0 ? 'text-green-600 font-bold' : ''}>
                        {formData.amount === 0 ? 'FREE' : `$${formData.amount}`}
                      </span>
                    </div>
                    {formData.paymentMethod === 'Executive Account (Free)' && (
                      <div className="flex justify-between text-green-600">
                        <span>Account Type:</span>
                        <span className="font-medium">Marketing/Executive</span>
                      </div>
                    )}
                    {formData.trialDays > 0 && (
                      <div className="flex justify-between">
                        <span>Trial:</span>
                        <span>{formData.trialDays} days</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              disabled={loading}
            >
              {step > 1 ? 'Previous' : 'Cancel'}
            </Button>

            <div className="flex gap-2">
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Subscription'
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-3 h-3 rounded-full ${
                  stepNumber <= step ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
