'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  DollarSign, 
  Calendar, 
  CreditCard, 
  Banknote, 
  Wallet,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PayoutSettings {
  minimumPayoutAmount: number
  payoutSchedule: 'weekly' | 'biweekly' | 'monthly' | 'quarterly'
  payoutDay: number
  payoutMethod: 'card' | 'bank' | 'paypal'
  payoutMethodId: string
  taxId: string
  taxIdType: 'ssn' | 'ein'
  businessName: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  notifications: {
    payoutProcessed: boolean
    payoutFailed: boolean
    lowBalance: boolean
    taxDocuments: boolean
  }
}

interface PayoutSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (settings: PayoutSettings) => void
  currentSettings?: PayoutSettings
  paymentMethods: any[]
}

export function PayoutSettingsModal({
  isOpen,
  onClose,
  onSave,
  currentSettings,
  paymentMethods
}: PayoutSettingsModalProps) {
  const [settings, setSettings] = useState<PayoutSettings>({
    minimumPayoutAmount: 50.00,
    payoutSchedule: 'monthly',
    payoutDay: 1,
    payoutMethod: 'card',
    payoutMethodId: '',
    taxId: '',
    taxIdType: 'ssn',
    businessName: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    },
    notifications: {
      payoutProcessed: true,
      payoutFailed: true,
      lowBalance: true,
      taxDocuments: true
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Format Tax ID with hyphens based on type
  const formatTaxId = (value: string, type: 'ssn' | 'ein') => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    if (type === 'ssn') {
      // Format as XXX-XX-XXXX for SSN
      if (digits.length <= 3) {
        return digits
      } else if (digits.length <= 5) {
        return `${digits.slice(0, 3)}-${digits.slice(3)}`
      } else if (digits.length <= 9) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
      } else {
        // Limit to 9 digits for SSN
        return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`
      }
    } else {
      // Format as XX-XXXXXXX for EIN
      if (digits.length <= 2) {
        return digits
      } else if (digits.length <= 9) {
        return `${digits.slice(0, 2)}-${digits.slice(2)}`
      } else {
        // Limit to 9 digits for EIN
        return `${digits.slice(0, 2)}-${digits.slice(2, 9)}`
      }
    }
  }

  const handleTaxIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTaxId(e.target.value, settings.taxIdType)
    setSettings(prev => ({
      ...prev,
      taxId: formatted
    }))
  }

  const handleTaxIdTypeChange = (type: 'ssn' | 'ein') => {
    setSettings(prev => ({
      ...prev,
      taxIdType: type,
      taxId: '' // Clear the field when changing type
    }))
  }

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings)
    }
  }, [currentSettings])

  useEffect(() => {
    if (isOpen && paymentMethods.length > 0) {
      const defaultMethod = paymentMethods.find(pm => pm.isDefault) || paymentMethods[0]
      if (defaultMethod) {
        setSettings(prev => ({
          ...prev,
          payoutMethod: defaultMethod.type,
          payoutMethodId: defaultMethod.id
        }))
      }
    }
  }, [isOpen, paymentMethods])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Validate required fields
      if (!settings.payoutMethodId) {
        throw new Error('Please select a payout method')
      }
      if (settings.minimumPayoutAmount < 10) {
        throw new Error('Minimum payout amount must be at least $10')
      }
      if (!settings.taxId) {
        throw new Error('Tax ID is required for payouts')
      }

      // Call API to save settings
      const response = await fetch('/api/mlm/payout-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save payout settings')
      }

      toast({
        title: "Payout Settings Updated",
        description: "Your payout settings have been saved successfully.",
      })

      onSave(settings)
      onClose()
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : 'Failed to save payout settings',
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getPayoutScheduleText = (schedule: string) => {
    switch (schedule) {
      case 'weekly': return 'Weekly'
      case 'biweekly': return 'Bi-weekly (Every 2 weeks)'
      case 'monthly': return 'Monthly'
      case 'quarterly': return 'Quarterly'
      default: return 'Monthly'
    }
  }

  const getPayoutDayOptions = () => {
    switch (settings.payoutSchedule) {
      case 'weekly':
        return Array.from({ length: 7 }, (_, i) => ({
          value: i + 1,
          label: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i]
        }))
      case 'biweekly':
        return Array.from({ length: 14 }, (_, i) => ({
          value: i + 1,
          label: `Day ${i + 1}`
        }))
      case 'monthly':
        return Array.from({ length: 28 }, (_, i) => ({
          value: i + 1,
          label: `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}`
        }))
      case 'quarterly':
        return [
          { value: 1, label: '1st month' },
          { value: 2, label: '2nd month' },
          { value: 3, label: '3rd month' }
        ]
      default:
        return []
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Payout Settings</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Payout Amount & Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payout Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minimumPayout">Minimum Payout Amount ($)</Label>
                  <Input
                    id="minimumPayout"
                    type="number"
                    min="10"
                    step="0.01"
                    value={settings.minimumPayoutAmount}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      minimumPayoutAmount: parseFloat(e.target.value) || 0
                    }))}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Minimum amount before payout is processed
                  </p>
                </div>
                <div>
                  <Label htmlFor="payoutSchedule">Payout Schedule</Label>
                  <Select
                    value={settings.payoutSchedule}
                    onValueChange={(value: 'weekly' | 'biweekly' | 'monthly' | 'quarterly') => 
                      setSettings(prev => ({ ...prev, payoutSchedule: value, payoutDay: 1 }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="payoutDay">Payout Day</Label>
                <Select
                  value={settings.payoutDay.toString()}
                  onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    payoutDay: parseInt(value)
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getPayoutDayOptions().map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payout Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payout Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="payoutMethod">Select Payout Method</Label>
                <Select
                  value={settings.payoutMethod}
                  onValueChange={(value: 'card' | 'bank' | 'paypal') => 
                    setSettings(prev => ({ ...prev, payoutMethod: value, payoutMethodId: '' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bank">Bank Account</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.payoutMethod && (
                <div>
                  <Label htmlFor="payoutMethodId">Available Methods</Label>
                  <Select
                    value={settings.payoutMethodId}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      payoutMethodId: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods
                        .filter(pm => pm.type === settings.payoutMethod)
                        .map(pm => (
                          <SelectItem key={pm.id} value={pm.id}>
                            {pm.type === 'card' && (
                              <span className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                {pm.card?.brand?.toUpperCase()} •••• {pm.card?.last4}
                              </span>
                            )}
                            {pm.type === 'bank' && (
                              <span className="flex items-center gap-2">
                                <Banknote className="h-4 w-4" />
                                {pm.bank?.bankName} •••• {pm.bank?.last4}
                              </span>
                            )}
                            {pm.type === 'paypal' && (
                              <span className="flex items-center gap-2">
                                <Wallet className="h-4 w-4" />
                                {pm.paypal?.email}
                              </span>
                            )}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {paymentMethods.filter(pm => pm.type === settings.payoutMethod).length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No {settings.payoutMethod} payment methods available. 
                    Please add a payment method first.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Tax Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Tax Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxIdType">Tax ID Type</Label>
                  <Select
                    value={settings.taxIdType}
                    onValueChange={handleTaxIdTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ssn">SSN (Social Security Number)</SelectItem>
                      <SelectItem value="ein">EIN (Employer Identification Number)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taxId">
                    {settings.taxIdType === 'ssn' ? 'Social Security Number' : 'Employer ID Number'}
                  </Label>
                  <Input
                    id="taxId"
                    placeholder={settings.taxIdType === 'ssn' ? '123-45-6789' : '12-3456789'}
                    value={settings.taxId}
                    onChange={handleTaxIdChange}
                    maxLength={settings.taxIdType === 'ssn' ? 11 : 10}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {settings.taxIdType === 'ssn' 
                      ? 'Format: XXX-XX-XXXX (9 digits)'
                      : 'Format: XX-XXXXXXX (9 digits)'
                    }
                  </p>
                </div>
                <div>
                  <Label htmlFor="businessName">Business Name (Optional)</Label>
                  <Input
                    id="businessName"
                    placeholder="Your Business Name"
                    value={settings.businessName}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      businessName: e.target.value
                    }))}
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Billing Address</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Street Address"
                      value={settings.address.street}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        address: { ...prev.address, street: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="City"
                      value={settings.address.city}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="State"
                      value={settings.address.state}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="ZIP Code"
                      value={settings.address.zipCode}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        address: { ...prev.address, zipCode: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Select
                      value={settings.address.country}
                      onValueChange={(value) => setSettings(prev => ({
                        ...prev,
                        address: { ...prev.address, country: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key} className="text-sm font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <input
                      type="checkbox"
                      id={key}
                      checked={value}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          [key]: e.target.checked
                        }
                      }))}
                      className="rounded"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your payout information is encrypted and secure. We use bank-level security 
              to protect your financial data. Tax information is required for compliance 
              with IRS regulations.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving || !settings.payoutMethodId}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Payout Settings
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
