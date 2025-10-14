import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Subscription } from '@/lib/subscription-service'
import { 
  User, 
  Mail, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Settings,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  Edit
} from 'lucide-react'

interface SubscriptionEditModalProps {
  isOpen: boolean
  onClose: () => void
  subscription: Subscription | null
  onSave: (updatedSubscription: Subscription) => void
}

interface EditFormData {
  customerName: string
  customerEmail: string
  planId: string
  planName: string
  status: string
  amount: number
  currency: string
  billingCycle: string
  paymentMethod: string
  nextBillingDate: string
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEnd: string
  cancelAtPeriodEnd: boolean
  prorationEnabled: boolean
  dunningEnabled: boolean
  notes: string
  isExecutiveAccount: boolean
}

const PLANS = [
  { id: 'basic', name: 'Basic Plan', monthlyPrice: 29.99, yearlyPrice: 299.99 },
  { id: 'premium', name: 'Premium Plan', monthlyPrice: 59.99, yearlyPrice: 599.99 },
  { id: 'enterprise', name: 'Enterprise Plan', monthlyPrice: 99.99, yearlyPrice: 999.99 }
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'trialing', label: 'Trialing', color: 'bg-blue-100 text-blue-800' },
  { value: 'past_due', label: 'Past Due', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'paused', label: 'Paused', color: 'bg-gray-100 text-gray-800' },
  { value: 'incomplete', label: 'Incomplete', color: 'bg-orange-100 text-orange-800' }
]

const PAYMENT_METHODS = [
  'Visa ****4242',
  'Mastercard ****5555',
  'American Express ****1234',
  'Discover ****9876',
  'Executive Account (Free)'
]

export default function SubscriptionEditModal({
  isOpen,
  onClose,
  subscription,
  onSave
}: SubscriptionEditModalProps) {
  const [formData, setFormData] = useState<EditFormData>({
    customerName: '',
    customerEmail: '',
    planId: '',
    planName: '',
    status: 'active',
    amount: 0,
    currency: 'usd',
    billingCycle: 'month',
    paymentMethod: '',
    nextBillingDate: '',
    currentPeriodStart: '',
    currentPeriodEnd: '',
    trialEnd: '',
    cancelAtPeriodEnd: false,
    prorationEnabled: true,
    dunningEnabled: true,
    notes: '',
    isExecutiveAccount: false
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data when subscription changes
  useEffect(() => {
    if (subscription) {
      setFormData({
        customerName: subscription.customerName,
        customerEmail: subscription.customerEmail,
        planId: subscription.planId,
        planName: subscription.planName,
        status: subscription.status,
        amount: subscription.amount,
        currency: subscription.currency,
        billingCycle: subscription.billingCycle,
        paymentMethod: subscription.paymentMethod,
        nextBillingDate: subscription.nextBillingDate || '',
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        trialEnd: subscription.trialEnd || '',
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        prorationEnabled: subscription.prorationEnabled,
        dunningEnabled: subscription.dunningEnabled,
        notes: subscription.notes || '',
        isExecutiveAccount: subscription.isExecutiveAccount || false
      })
    }
  }, [subscription])

  const handleInputChange = (field: keyof EditFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Auto-update amount when plan or billing cycle changes
    if (field === 'planId' || field === 'billingCycle') {
      const plan = PLANS.find(p => p.id === value || p.id === formData.planId)
      if (plan && !formData.isExecutiveAccount) {
        const amount = formData.billingCycle === 'year' ? plan.yearlyPrice : plan.monthlyPrice
        setFormData(prev => ({ ...prev, amount }))
      }
    }
    
    // Handle executive account changes
    if (field === 'isExecutiveAccount') {
      if (value) {
        setFormData(prev => ({ ...prev, amount: 0, paymentMethod: 'Executive Account (Free)' }))
      } else {
        const plan = PLANS.find(p => p.id === formData.planId)
        if (plan) {
          const amount = formData.billingCycle === 'year' ? plan.yearlyPrice : plan.monthlyPrice
          setFormData(prev => ({ ...prev, amount, paymentMethod: '' }))
        }
      }
    }
    
    // Handle payment method changes
    if (field === 'paymentMethod' && value === 'Executive Account (Free)') {
      setFormData(prev => ({ ...prev, amount: 0, isExecutiveAccount: true }))
    } else if (field === 'paymentMethod' && value !== 'Executive Account (Free)') {
      setFormData(prev => ({ ...prev, isExecutiveAccount: false }))
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
      newErrors.customerName = 'Customer Name is required'
    }
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Customer Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Invalid email format'
    }
    if (!formData.planId) {
      newErrors.planId = 'Plan selection is required'
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required'
    }
    if (!formData.currentPeriodStart) {
      newErrors.currentPeriodStart = 'Current period start is required'
    }
    if (!formData.currentPeriodEnd) {
      newErrors.currentPeriodEnd = 'Current period end is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm() || !subscription) {
      return
    }

    setLoading(true)
    
    try {
      const updatedSubscription: Subscription = {
        ...subscription,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        planId: formData.planId,
        planName: formData.planName,
        status: formData.status as any,
        amount: formData.amount,
        currency: formData.currency,
        billingCycle: formData.billingCycle as any,
        paymentMethod: formData.paymentMethod,
        nextBillingDate: formData.nextBillingDate || undefined,
        currentPeriodStart: formData.currentPeriodStart,
        currentPeriodEnd: formData.currentPeriodEnd,
        trialEnd: formData.trialEnd || undefined,
        cancelAtPeriodEnd: formData.cancelAtPeriodEnd,
        prorationEnabled: formData.prorationEnabled,
        dunningEnabled: formData.dunningEnabled,
        notes: formData.notes,
        isExecutiveAccount: formData.isExecutiveAccount,
        updatedAt: new Date().toISOString()
      }

      await onSave(updatedSubscription)
      onClose()
      
    } catch (error) {
      console.error('Error saving subscription:', error)
      alert('An error occurred while saving the subscription. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedPlan = PLANS.find(p => p.id === formData.planId)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Edit className="h-6 w-6" />
            Edit Subscription
          </DialogTitle>
          <DialogDescription>
            Update subscription details for {subscription?.customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="John Doe"
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {errors.customerName}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="customerEmail">Customer Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    placeholder="john@example.com"
                  />
                  {errors.customerEmail && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {errors.customerEmail}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="planId">Plan</Label>
                  <Select value={formData.planId} onValueChange={(value) => {
                    const plan = PLANS.find(p => p.id === value)
                    handleInputChange('planId', value)
                    if (plan) {
                      handleInputChange('planName', plan.name)
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANS.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - ${plan.monthlyPrice}/month
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.planId && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {errors.planId}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={`${status.color} border-0`}>
                              {status.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="billingCycle">Billing Cycle</Label>
                  <Select value={formData.billingCycle} onValueChange={(value) => handleInputChange('billingCycle', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                      className="pl-10"
                      disabled={formData.isExecutiveAccount}
                    />
                  </div>
                  {formData.isExecutiveAccount && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Executive Account - Free
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
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
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {errors.paymentMethod}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="nextBillingDate">Next Billing Date</Label>
                  <Input
                    id="nextBillingDate"
                    type="date"
                    value={formData.nextBillingDate}
                    onChange={(e) => handleInputChange('nextBillingDate', e.target.value)}
                    disabled={formData.isExecutiveAccount}
                  />
                  {formData.isExecutiveAccount && (
                    <p className="text-sm text-gray-500 mt-1">No billing for executive accounts</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Period */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Billing Period
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currentPeriodStart">Period Start</Label>
                  <Input
                    id="currentPeriodStart"
                    type="date"
                    value={formData.currentPeriodStart}
                    onChange={(e) => handleInputChange('currentPeriodStart', e.target.value)}
                  />
                  {errors.currentPeriodStart && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {errors.currentPeriodStart}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="currentPeriodEnd">Period End</Label>
                  <Input
                    id="currentPeriodEnd"
                    type="date"
                    value={formData.currentPeriodEnd}
                    onChange={(e) => handleInputChange('currentPeriodEnd', e.target.value)}
                  />
                  {errors.currentPeriodEnd && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {errors.currentPeriodEnd}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="trialEnd">Trial End (Optional)</Label>
                  <Input
                    id="trialEnd"
                    type="date"
                    value={formData.trialEnd}
                    onChange={(e) => handleInputChange('trialEnd', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cancelAtPeriodEnd">Cancel at Period End</Label>
                    <p className="text-sm text-gray-500">Subscription will cancel when current period ends</p>
                  </div>
                  <Switch
                    id="cancelAtPeriodEnd"
                    checked={formData.cancelAtPeriodEnd}
                    onCheckedChange={(checked) => handleInputChange('cancelAtPeriodEnd', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="prorationEnabled">Proration Enabled</Label>
                    <p className="text-sm text-gray-500">Enable prorated billing for plan changes</p>
                  </div>
                  <Switch
                    id="prorationEnabled"
                    checked={formData.prorationEnabled}
                    onCheckedChange={(checked) => handleInputChange('prorationEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dunningEnabled">Dunning Enabled</Label>
                    <p className="text-sm text-gray-500">Enable automatic retry for failed payments</p>
                  </div>
                  <Switch
                    id="dunningEnabled"
                    checked={formData.dunningEnabled}
                    onCheckedChange={(checked) => handleInputChange('dunningEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isExecutiveAccount">Executive Account</Label>
                    <p className="text-sm text-gray-500">Free account for marketing/partnerships</p>
                  </div>
                  <Switch
                    id="isExecutiveAccount"
                    checked={formData.isExecutiveAccount}
                    onCheckedChange={(checked) => handleInputChange('isExecutiveAccount', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any notes about this subscription..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
