import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Subscription } from '@/lib/subscription-service'
import { 
  CreditCard, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  AlertTriangle,
  Loader2,
  Plus,
  Trash2,
  Edit,
  Shield,
  Calendar,
  User
} from 'lucide-react'

interface PaymentMethodModalProps {
  isOpen: boolean
  onClose: () => void
  subscription: Subscription | null
  onUpdate: (subscriptionId: string, newPaymentMethod: string, gracePeriodData?: any) => Promise<void>
}

interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account' | 'paypal'
  last4: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  isExpired: boolean
}

// Mock payment methods - in real app, this would come from Stripe API
const generateMockPaymentMethods = (subscription: Subscription): PaymentMethod[] => {
  const isExecutiveAccount = subscription.paymentMethod === 'Executive Account (Free)' || subscription.isExecutiveAccount
  
  if (isExecutiveAccount) {
    // If this is an executive account, show the executive account as the primary payment method
    return [
      {
        id: 'exec_primary',
        type: 'card',
        last4: 'EXEC',
        brand: 'executive',
        isDefault: true,
        isExpired: false
      },
      {
        id: 'pm_1',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: false,
        isExpired: false
      },
      {
        id: 'pm_2',
        type: 'card',
        last4: '5555',
        brand: 'mastercard',
        expiryMonth: 8,
        expiryYear: 2024,
        isDefault: false,
        isExpired: true
      }
    ]
  } else {
    // Regular payment methods for non-executive accounts
    return [
      {
        id: 'pm_1',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
        isExpired: false
      },
      {
        id: 'pm_2',
        type: 'card',
        last4: '5555',
        brand: 'mastercard',
        expiryMonth: 8,
        expiryYear: 2024,
        isDefault: false,
        isExpired: true
      },
      {
        id: 'pm_3',
        type: 'card',
        last4: '1234',
        brand: 'amex',
        expiryMonth: 3,
        expiryYear: 2026,
        isDefault: false,
        isExpired: false
      }
    ]
  }
}

export default function PaymentMethodModal({
  isOpen,
  onClose,
  subscription,
  onUpdate
}: PaymentMethodModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    brand: ''
  })
  const [paymentMethodType, setPaymentMethodType] = useState<'executive' | 'payment'>('payment')
  const [showDemoteModal, setShowDemoteModal] = useState(false)
  const [gracePeriodOption, setGracePeriodOption] = useState<'immediate' | '30days'>('30days')
  const [confirmDemote, setConfirmDemote] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  React.useEffect(() => {
    if (subscription && isOpen) {
      setLoading(true)
      // Reset modal state when opening
      setConfirmDemote(false)
      setGracePeriodOption('30days')
      setShowDemoteModal(false)
      // Simulate API call to fetch payment methods
      setTimeout(() => {
        const mockMethods = generateMockPaymentMethods(subscription)
        setPaymentMethods(mockMethods)
        setLoading(false)
      }, 1000)
    }
  }, [subscription, isOpen])

  const getBrandIcon = (brand: string) => {
    switch (brand) {
      case 'visa': return '💳'
      case 'mastercard': return '💳'
      case 'amex': return '💳'
      case 'executive': return '🛡️'
      default: return '💳'
    }
  }

  const getBrandName = (brand: string) => {
    switch (brand) {
      case 'visa': return 'Visa'
      case 'mastercard': return 'Mastercard'
      case 'amex': return 'American Express'
      case 'executive': return 'Executive Account'
      default: return 'Card'
    }
  }

  const formatExpiry = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`
  }

  const setDefaultPaymentMethod = async (methodId: string) => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          isDefault: method.id === methodId
        }))
      )
      
      alert('Default payment method updated successfully!')
    } catch (error) {
      alert('Failed to update default payment method')
    } finally {
      setSaving(false)
    }
  }

  const deletePaymentMethod = async (methodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return
    }

    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPaymentMethods(prev => prev.filter(method => method.id !== methodId))
      alert('Payment method deleted successfully!')
    } catch (error) {
      alert('Failed to delete payment method')
    } finally {
      setSaving(false)
    }
  }

  const validateNewCard = () => {
    const newErrors: Record<string, string> = {}

    if (!newCard.cardNumber.replace(/\s/g, '').match(/^\d{13,19}$/)) {
      newErrors.cardNumber = 'Please enter a valid card number'
    }
    if (!newCard.expiryMonth || !newCard.expiryYear) {
      newErrors.expiry = 'Please select expiry date'
    }
    if (!newCard.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'Please enter a valid CVV'
    }
    if (!newCard.cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter cardholder name'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addNewCard = async () => {
    if (!validateNewCard()) {
      return
    }

    setSaving(true)
    try {
      // Simulate API call to add new card
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: 'card',
        last4: newCard.cardNumber.slice(-4),
        brand: newCard.brand || 'visa',
        expiryMonth: parseInt(newCard.expiryMonth),
        expiryYear: parseInt(newCard.expiryYear),
        isDefault: paymentMethods.length === 0,
        isExpired: false
      }

      setPaymentMethods(prev => [...prev, newMethod])
      setNewCard({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
        brand: ''
      })
      setShowAddForm(false)
      setErrors({})
      alert('New payment method added successfully!')
    } catch (error) {
      alert('Failed to add new payment method')
    } finally {
      setSaving(false)
    }
  }

  const addExecutiveAccount = async () => {
    if (!newCard.cardholderName.trim()) {
      setErrors({ cardholderName: 'Executive name is required' })
      return
    }

    setSaving(true)
    try {
      // Simulate API call to add executive account
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const executiveMethod: PaymentMethod = {
        id: `exec_${Date.now()}`,
        type: 'card', // We'll use 'card' type but with special handling
        last4: 'EXEC',
        brand: 'executive',
        isDefault: paymentMethods.length === 0,
        isExpired: false
      }

      setPaymentMethods(prev => [...prev, executiveMethod])
      setNewCard({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
        brand: ''
      })
      setShowAddForm(false)
      setErrors({})
      setPaymentMethodType('payment')
      
      // Update the subscription to use executive account
      if (subscription) {
        onUpdate(subscription.id, 'Executive Account (Free)')
      }
      
      alert('Executive account added successfully! This account now has free access to all premium features.')
    } catch (error) {
      alert('Failed to add executive account')
    } finally {
      setSaving(false)
    }
  }

  const demoteExecutiveAccount = async () => {
    console.log('Demote function called:', { subscription: subscription?.id, confirmDemote, gracePeriodOption })
    if (!subscription) return
    if (!confirmDemote) {
      alert('Please confirm that you understand the consequences of demoting this executive account.')
      return
    }

    setSaving(true)
    try {
      // Simulate API call to demote executive account
      console.log('Starting demote process...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
       // Update the subscription based on grace period option
       let newPaymentMethod = 'Credit Card •••• 4242'
       let message = ''
       let gracePeriodEndDate = null
       let status = 'grace_period' // Set to grace_period status for proper tracking
       
       if (gracePeriodOption === 'immediate') {
         newPaymentMethod = 'Executive Access - Immediate Action Required'
         gracePeriodEndDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
         message = 'Executive account has been demoted. The customer must add a payment method within 24 hours or they will lose access to their account.'
       } else {
         newPaymentMethod = 'Executive Access - 30 Days Remaining'
         gracePeriodEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
         message = 'Executive account has been demoted. The customer has 30 days of executive access remaining before payment is required. They will receive notifications to update their payment method.'
       }
      
      // Call onUpdate with error handling
      try {
        if (onUpdate && typeof onUpdate === 'function') {
          const gracePeriodData = {
            gracePeriodEndDate: gracePeriodEndDate?.toISOString(),
            status: status
          }
          await onUpdate(subscription.id, newPaymentMethod, gracePeriodData)
          console.log('Successfully called onUpdate with:', { 
            subscriptionId: subscription.id, 
            newPaymentMethod, 
            gracePeriodData 
          })
          
          // Close modal and show success message only after successful update
          setShowDemoteModal(false)
          setConfirmDemote(false)
          setGracePeriodOption('30days')
          alert(message)
        } else {
          console.warn('onUpdate function is not available or not a function')
          // Still close modal and show message even if onUpdate is not available
          setShowDemoteModal(false)
          setConfirmDemote(false)
          setGracePeriodOption('30days')
          alert(message)
        }
      } catch (updateError) {
        console.error('Error in onUpdate call:', updateError)
        // Don't close modal on error, let user retry
        alert(`Failed to update subscription: ${updateError.message}`)
        throw updateError // Re-throw to trigger the main catch block
      }
    } catch (error) {
      console.error('Error demoting executive account:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        subscription: subscription?.id,
        confirmDemote,
        gracePeriodOption
      })
      alert('Failed to demote executive account. Please try again.')
    } finally {
      setSaving(false)
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {subscription?.paymentMethod === 'Executive Account (Free)' || subscription?.isExecutiveAccount ? (
              <>
                <Shield className="h-6 w-6 text-green-600" />
                Executive Account Payment Methods
              </>
            ) : (
              <>
                <CreditCard className="h-6 w-6" />
                Payment Methods
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {subscription?.paymentMethod === 'Executive Account (Free)' || subscription?.isExecutiveAccount ? (
              <>
                Manage payment methods for {subscription?.customerName} (Executive Account)
                <div className="mt-2 text-sm text-green-600 font-medium">
                  🛡️ This account has free access to all premium features
                </div>
              </>
            ) : (
              `Manage payment methods for ${subscription?.customerName}`
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Payment Methods */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {subscription?.paymentMethod === 'Executive Account (Free)' || subscription?.isExecutiveAccount ? (
                    <>
                      <Shield className="h-5 w-5 text-green-600" />
                      Current Payment Methods (Executive Account)
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Current Payment Methods
                    </>
                  )}
                </CardTitle>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  size="sm"
                  disabled={saving}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </div>
              {subscription?.paymentMethod === 'Executive Account (Free)' || subscription?.isExecutiveAccount ? (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-800">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Executive Account Active</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDemoteModal(true)}
                      className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                    >
                      <User className="h-4 w-4 mr-1" />
                      Demote to Regular
                    </Button>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    This account has free access to all premium features. Additional payment methods can be added for backup purposes.
                  </p>
                </div>
              ) : null}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No payment methods found</p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getBrandIcon(method.brand || 'card')}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {getBrandName(method.brand || 'card')} •••• {method.last4}
                              </span>
                              {method.isDefault && (
                                <Badge className="bg-green-100 text-green-800">Default</Badge>
                              )}
                              {method.isExpired && (
                                <Badge variant="destructive">Expired</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {method.brand === 'executive' ? (
                                <span className="text-green-600 font-medium">Free Access - No Expiry</span>
                              ) : (
                                `Expires ${formatExpiry(method.expiryMonth || 0, method.expiryYear || 0)}`
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!method.isDefault && method.brand !== 'executive' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDefaultPaymentMethod(method.id)}
                              disabled={saving}
                            >
                              Set Default
                            </Button>
                          )}
                          {method.brand === 'executive' && (
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              Executive Account
                            </Badge>
                          )}
                          {method.brand !== 'executive' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePaymentMethod(method.id)}
                              disabled={saving}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add New Payment Method Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Payment Method Type Selection */}
                <div>
                  <Label htmlFor="paymentMethodType">Payment Method Type</Label>
                  <Select 
                    value={paymentMethodType} 
                    onValueChange={(value: 'executive' | 'payment') => setPaymentMethodType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Credit Card / Payment Method
                        </div>
                      </SelectItem>
                      <SelectItem value="executive">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          Executive Account (Free)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditional form based on payment method type */}
                {paymentMethodType === 'payment' ? (
                  <>
                    <div>
                      <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    value={newCard.cardholderName}
                    onChange={(e) => setNewCard(prev => ({ ...prev, cardholderName: e.target.value }))}
                    placeholder="John Doe"
                  />
                  {errors.cardholderName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {errors.cardholderName}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={newCard.cardNumber}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value)
                      setNewCard(prev => ({ ...prev, cardNumber: formatted }))
                    }}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                  {errors.cardNumber && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {errors.cardNumber}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryMonth">Expiry Month</Label>
                    <Select value={newCard.expiryMonth} onValueChange={(value) => setNewCard(prev => ({ ...prev, expiryMonth: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {(i + 1).toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expiryYear">Expiry Year</Label>
                    <Select value={newCard.expiryYear} onValueChange={(value) => setNewCard(prev => ({ ...prev, expiryYear: value }))}>
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

                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={newCard.cvv}
                    onChange={(e) => setNewCard(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                    placeholder="123"
                    maxLength={4}
                  />
                  {errors.cvv && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {errors.cvv}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="setAsDefault"
                    checked={paymentMethods.length === 0}
                    disabled={paymentMethods.length === 0}
                  />
                  <Label htmlFor="setAsDefault">
                    Set as default payment method
                    {paymentMethods.length === 0 && ' (will be set automatically)'}
                  </Label>
                </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => {
                        setShowAddForm(false)
                        setNewCard({
                          cardNumber: '',
                          expiryMonth: '',
                          expiryYear: '',
                          cvv: '',
                          cardholderName: '',
                          brand: ''
                        })
                        setErrors({})
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={addNewCard} disabled={saving}>
                        {saving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Add Payment Method
                      </Button>
                    </div>
                  </>
                ) : (
                  /* Executive Account Form */
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-green-800">Executive Account Benefits</h3>
                      </div>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Free access to all premium features</li>
                        <li>• No monthly subscription fees</li>
                        <li>• Priority customer support</li>
                        <li>• Advanced analytics and reporting</li>
                        <li>• Unlimited credit monitoring</li>
                      </ul>
                    </div>

                    <div>
                      <Label htmlFor="executiveName">Executive Name</Label>
                      <Input
                        id="executiveName"
                        value={newCard.cardholderName}
                        onChange={(e) => setNewCard(prev => ({ ...prev, cardholderName: e.target.value }))}
                        placeholder="Enter executive name"
                      />
                      {errors.cardholderName && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" /> {errors.cardholderName}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="executiveEmail">Executive Email</Label>
                      <Input
                        id="executiveEmail"
                        type="email"
                        value={subscription?.customerEmail || ''}
                        disabled
                        placeholder="Executive email"
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This will use the customer's current email address
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="setAsDefaultExecutive"
                        checked={paymentMethods.length === 0}
                        disabled={paymentMethods.length === 0}
                      />
                      <Label htmlFor="setAsDefaultExecutive">
                        Set as default payment method
                        {paymentMethods.length === 0 && ' (will be set automatically)'}
                      </Label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => {
                        setShowAddForm(false)
                        setNewCard({
                          cardNumber: '',
                          expiryMonth: '',
                          expiryYear: '',
                          cvv: '',
                          cardholderName: '',
                          brand: ''
                        })
                        setErrors({})
                        setPaymentMethodType('payment')
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={addExecutiveAccount} disabled={saving} className="bg-green-600 hover:bg-green-700">
                        {saving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Shield className="h-4 w-4 mr-2" />
                        )}
                        Add Executive Account
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Secure Payment Processing</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    All payment methods are securely processed and stored using industry-standard encryption. 
                    We never store your full card details on our servers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>

      {/* Demote Executive Account Confirmation Modal */}
      <Dialog open={showDemoteModal} onOpenChange={setShowDemoteModal}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              Demote Executive Account
            </DialogTitle>
            <DialogDescription>
              This action will convert the executive account back to a regular paid subscription.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">Important Notice</h4>
                  <ul className="text-sm text-red-700 mt-2 space-y-1">
                    <li>• The customer will lose free access to premium features</li>
                    <li>• They will be charged according to their selected plan</li>
                    <li>• This action cannot be undone without re-adding executive privileges</li>
                    <li>• The customer will be notified of this change</li>
                    {gracePeriodOption === 'immediate' && (
                      <li>• <strong>URGENT:</strong> Customer must add payment method within 24 hours or lose access</li>
                    )}
                    {gracePeriodOption === '30days' && (
                      <li>• Customer has 30 days before first payment, but must add payment method within 7 days</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Name:</strong> {subscription?.customerName}</p>
                <p><strong>Email:</strong> {subscription?.customerEmail}</p>
                <p><strong>Current Plan:</strong> {subscription?.planName}</p>
                <p><strong>Status:</strong> Executive Account (Free)</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">Payment Grace Period Options</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="immediate"
                    name="gracePeriod"
                    value="immediate"
                    checked={gracePeriodOption === 'immediate'}
                    onChange={(e) => setGracePeriodOption(e.target.value as 'immediate' | '30days')}
                    className="text-red-600"
                  />
                  <label htmlFor="immediate" className="text-sm text-blue-800">
                    <strong>Immediate Payment Required (24 Hours)</strong>
                    <div className="text-xs text-blue-600 mt-1">
                      Customer must add a payment method within 24 hours or lose account access
                    </div>
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="30days"
                    name="gracePeriod"
                    value="30days"
                    checked={gracePeriodOption === '30days'}
                    onChange={(e) => setGracePeriodOption(e.target.value as 'immediate' | '30days')}
                    className="text-red-600"
                  />
                  <label htmlFor="30days" className="text-sm text-blue-800">
                    <strong>30-Day Grace Period</strong>
                    <div className="text-xs text-blue-600 mt-1">
                      Customer has 30 days before first payment, but must add payment method within 7 days or lose access
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="confirmDemote"
                checked={confirmDemote}
                onChange={(e) => setConfirmDemote(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="confirmDemote" className="text-sm text-gray-700">
                I understand that this will remove executive privileges and the customer will be charged for their subscription according to the selected grace period.
              </label>
            </div>
            {!confirmDemote && (
              <div className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Please check the confirmation box above to enable the demote button
              </div>
            )}
            {confirmDemote && (
              <div className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Confirmation checked - Demote button is now enabled
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => setShowDemoteModal(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                console.log('Demote button clicked!', { confirmDemote, saving, gracePeriodOption })
                demoteExecutiveAccount()
              }}
              disabled={saving || !confirmDemote}
              className={`${confirmDemote ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'} text-white`}
              title={!confirmDemote ? 'Please check the confirmation checkbox first' : 'Demote executive account to regular subscription'}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <User className="h-4 w-4 mr-2" />
              )}
              Demote to Regular Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
