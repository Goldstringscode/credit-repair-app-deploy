'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Shield,
  Calendar,
  User,
  Mail,
  MapPin
} from 'lucide-react'

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
  // Billing Information
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
  
  // Payment Information
  cardNumber: string
  expMonth: string
  expYear: string
  cvc: string
  cardholderName: string
  
  // Terms and Conditions
  acceptTerms: boolean
  acceptMarketing: boolean
}

export function CheckoutForm({ plan, onSuccess, onCancel }: CheckoutFormProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
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
      country: 'US'
    },
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    cardholderName: '',
    acceptTerms: false,
    acceptMarketing: false
  })

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
      if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required'
      else if (formData.cardNumber.replace(/\s/g, '').length < 13) newErrors.cardNumber = 'Card number is too short'
      if (!formData.expMonth) newErrors.expMonth = 'Expiry month is required'
      if (!formData.expYear) newErrors.expYear = 'Expiry year is required'
      if (!formData.cvc) newErrors.cvc = 'CVC is required'
      else if (formData.cvc.length < 3) newErrors.cvc = 'CVC is too short'
      if (!formData.cardholderName) newErrors.cardholderName = 'Cardholder name is required'
    }

    if (stepNumber === 4) {
      if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return

    setLoading(true)
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const paymentData = {
        plan,
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        },
        payment: {
          cardNumber: formData.cardNumber,
          expMonth: formData.expMonth,
          expYear: formData.expYear,
          cvc: formData.cvc,
          cardholderName: formData.cardholderName
        },
        preferences: {
          marketing: formData.acceptMarketing
        }
      }

      onSuccess(paymentData)
    } catch (error) {
      console.error('Payment failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const getCardBrand = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '')
    if (number.startsWith('4')) return 'visa'
    if (number.startsWith('5')) return 'mastercard'
    if (number.startsWith('3')) return 'amex'
    return 'unknown'
  }

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Billing Address', icon: MapPin },
    { number: 3, title: 'Payment', icon: CreditCard },
    { number: 4, title: 'Review', icon: CheckCircle }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
        <p className="text-gray-600">Secure checkout for {plan.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Secure Checkout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Steps */}
              <div className="flex items-center justify-between">
                {steps.map((stepItem, index) => {
                  const Icon = stepItem.icon
                  const isActive = step === stepItem.number
                  const isCompleted = step > stepItem.number
                  
                  return (
                    <div key={stepItem.number} className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isActive 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <span className={`ml-2 text-sm font-medium ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {stepItem.title}
                      </span>
                      {index < steps.length - 1 && (
                        <div className={`w-8 h-0.5 mx-4 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>
              )}

              {/* Step 2: Billing Address */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Billing Address</h3>
                  <div>
                    <Label htmlFor="line1">Street Address *</Label>
                    <Input
                      id="line1"
                      value={formData.address.line1}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, line1: e.target.value }
                      }))}
                      className={errors.line1 ? 'border-red-500' : ''}
                    />
                    {errors.line1 && <p className="text-sm text-red-500 mt-1">{errors.line1}</p>}
                  </div>
                  <div>
                    <Label htmlFor="line2">Apartment, suite, etc. (optional)</Label>
                    <Input
                      id="line2"
                      value={formData.address.line2}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, line2: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.address.city}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, city: e.target.value }
                        }))}
                        className={errors.city ? 'border-red-500' : ''}
                      />
                      {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select value={formData.address.state} onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, state: value }
                      }))}>
                        <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AL">Alabama</SelectItem>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="FL">Florida</SelectItem>
                          <SelectItem value="NY">New York</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                          {/* Add more states as needed */}
                        </SelectContent>
                      </Select>
                      {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">ZIP Code *</Label>
                      <Input
                        id="postalCode"
                        value={formData.address.postalCode}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, postalCode: e.target.value }
                        }))}
                        className={errors.postalCode ? 'border-red-500' : ''}
                      />
                      {errors.postalCode && <p className="text-sm text-red-500 mt-1">{errors.postalCode}</p>}
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Select value={formData.address.country} onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, country: value }
                      }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Information */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Payment Information</h3>
                  <div>
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        cardNumber: formatCardNumber(e.target.value)
                      }))}
                      placeholder="1234 5678 9012 3456"
                      className={errors.cardNumber ? 'border-red-500' : ''}
                    />
                    {errors.cardNumber && <p className="text-sm text-red-500 mt-1">{errors.cardNumber}</p>}
                    {formData.cardNumber && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-gray-600">Card type:</span>
                        <Badge variant="outline">{getCardBrand(formData.cardNumber).toUpperCase()}</Badge>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cardholderName">Cardholder Name *</Label>
                    <Input
                      id="cardholderName"
                      value={formData.cardholderName}
                      onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
                      className={errors.cardholderName ? 'border-red-500' : ''}
                    />
                    {errors.cardholderName && <p className="text-sm text-red-500 mt-1">{errors.cardholderName}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="expMonth">Month *</Label>
                      <Select value={formData.expMonth} onValueChange={(value) => setFormData(prev => ({ ...prev, expMonth: value }))}>
                        <SelectTrigger className={errors.expMonth ? 'border-red-500' : ''}>
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                              {(i + 1).toString().padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.expMonth && <p className="text-sm text-red-500 mt-1">{errors.expMonth}</p>}
                    </div>
                    <div>
                      <Label htmlFor="expYear">Year *</Label>
                      <Select value={formData.expYear} onValueChange={(value) => setFormData(prev => ({ ...prev, expYear: value }))}>
                        <SelectTrigger className={errors.expYear ? 'border-red-500' : ''}>
                          <SelectValue placeholder="YYYY" />
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
                      {errors.expYear && <p className="text-sm text-red-500 mt-1">{errors.expYear}</p>}
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC *</Label>
                      <Input
                        id="cvc"
                        value={formData.cvc}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          cvc: e.target.value.replace(/\D/g, '')
                        }))}
                        placeholder="123"
                        className={errors.cvc ? 'border-red-500' : ''}
                      />
                      {errors.cvc && <p className="text-sm text-red-500 mt-1">{errors.cvc}</p>}
                    </div>
                  </div>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Your payment information is encrypted and secure. We never store your full card details.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Step 4: Review and Terms */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Review Your Order</h3>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Plan Details</h4>
                      <p className="text-sm text-gray-600">{plan.name}</p>
                      <p className="text-lg font-bold">${plan.price}/{plan.interval}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Billing Information</h4>
                      <p className="text-sm">{formData.firstName} {formData.lastName}</p>
                      <p className="text-sm text-gray-600">{formData.email}</p>
                      <p className="text-sm text-gray-600">{formData.address.line1}</p>
                      <p className="text-sm text-gray-600">
                        {formData.address.city}, {formData.address.state} {formData.address.postalCode}
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Payment Method</h4>
                      <p className="text-sm">
                        {getCardBrand(formData.cardNumber).toUpperCase()} •••• {formData.cardNumber.slice(-4)}
                      </p>
                      <p className="text-sm text-gray-600">Expires {formData.expMonth}/{formData.expYear}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptTerms"
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptTerms: !!checked }))}
                      />
                      <label htmlFor="acceptTerms" className="text-sm">
                        I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> *
                      </label>
                    </div>
                    {errors.acceptTerms && <p className="text-sm text-red-500">{errors.acceptTerms}</p>}
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptMarketing"
                        checked={formData.acceptMarketing}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptMarketing: !!checked }))}
                      />
                      <label htmlFor="acceptMarketing" className="text-sm">
                        Send me updates about new features and special offers
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={step === 1 ? onCancel : handlePrevious}
                  disabled={loading}
                >
                  {step === 1 ? 'Cancel' : 'Previous'}
                </Button>
                <Button
                  onClick={step === 4 ? handleSubmit : handleNext}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : step === 4 ? (
                    'Complete Purchase'
                  ) : (
                    'Next'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>{plan.name}</span>
                <span className="font-semibold">${plan.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Billing cycle</span>
                <span className="text-sm text-gray-600">{plan.interval}ly</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${plan.price}</span>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">What's included:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}





