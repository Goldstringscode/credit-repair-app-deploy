'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Shield,
  DollarSign,
  Banknote,
  Wallet
} from 'lucide-react'

interface MLMPaymentMethod {
  id: string
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
  isExpired: boolean
  isMLMApproved: boolean
  payoutEligible: boolean
}

interface MLMPaymentMethodsProps {
  paymentMethods: MLMPaymentMethod[]
  onAdd: (method: Omit<MLMPaymentMethod, 'id'>) => void
  onEdit: (id: string, method: Partial<MLMPaymentMethod>) => void
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
}

export function MLMPaymentMethods({
  paymentMethods,
  onAdd,
  onEdit,
  onDelete,
  onSetDefault
}: MLMPaymentMethodsProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingMethod, setEditingMethod] = useState<MLMPaymentMethod | null>(null)
  const [paymentType, setPaymentType] = useState<'card' | 'bank' | 'paypal'>('card')
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

  const handleAdd = () => {
    let newMethod: Omit<MLMPaymentMethod, 'id'> | null = null

    if (paymentType === 'card' && formData.cardNumber && formData.expMonth && formData.expYear && formData.cvc && formData.cardholderName) {
      newMethod = {
        type: 'card',
        card: {
          brand: getCardBrand(formData.cardNumber),
          last4: formData.cardNumber.slice(-4),
          expMonth: parseInt(formData.expMonth),
          expYear: parseInt(formData.expYear)
        },
        isDefault: formData.isDefault || paymentMethods.length === 0,
        isExpired: isExpired(parseInt(formData.expMonth), parseInt(formData.expYear)),
        isMLMApproved: true,
        payoutEligible: true
      }
    } else if (paymentType === 'bank' && formData.bankName && formData.accountNumber && formData.routingNumber) {
      newMethod = {
        type: 'bank',
        bank: {
          bankName: formData.bankName,
          last4: formData.accountNumber.slice(-4),
          accountType: formData.accountType
        },
        isDefault: formData.isDefault || paymentMethods.length === 0,
        isExpired: false,
        isMLMApproved: true,
        payoutEligible: true
      }
    } else if (paymentType === 'paypal' && formData.paypalEmail) {
      newMethod = {
        type: 'paypal',
        paypal: {
          email: formData.paypalEmail
        },
        isDefault: formData.isDefault || paymentMethods.length === 0,
        isExpired: false,
        isMLMApproved: true,
        payoutEligible: true
      }
    }

    if (newMethod) {
      onAdd(newMethod)
      setFormData({
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
      setShowAddDialog(false)
    }
  }

  const handleEdit = (method: MLMPaymentMethod) => {
    setEditingMethod(method)
    setPaymentType(method.type)
    setFormData({
      cardNumber: method.card ? `**** **** **** ${method.card.last4}` : '',
      expMonth: method.card ? method.card.expMonth.toString().padStart(2, '0') : '',
      expYear: method.card ? method.card.expYear.toString() : '',
      cvc: '***',
      cardholderName: 'John Doe', // In real app, this would come from the method
      bankName: method.bank?.bankName || '',
      accountNumber: method.bank ? `****${method.bank.last4}` : '',
      routingNumber: '***',
      accountType: method.bank?.accountType || 'checking',
      paypalEmail: method.paypal?.email || '',
      isDefault: method.isDefault
    })
    setShowEditDialog(true)
  }

  const handleUpdate = () => {
    if (editingMethod) {
      onEdit(editingMethod.id, {
        isDefault: formData.isDefault
      })
      setShowEditDialog(false)
      setEditingMethod(null)
    }
  }

  const getCardBrand = (cardNumber: string) => {
    if (cardNumber.startsWith('4')) return 'visa'
    if (cardNumber.startsWith('5')) return 'mastercard'
    if (cardNumber.startsWith('3')) return 'amex'
    return 'unknown'
  }

  const isExpired = (month: number, year: number) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    return year < currentYear || (year === currentYear && month < currentMonth)
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
        return <DollarSign className="h-5 w-5" />
    }
  }

  const getMethodDisplayName = (method: MLMPaymentMethod) => {
    if (method.type === 'card' && method.card) {
      return `${method.card.brand.toUpperCase()} •••• ${method.card.last4}`
    } else if (method.type === 'bank' && method.bank) {
      return `${method.bank.bankName} •••• ${method.bank.last4}`
    } else if (method.type === 'paypal' && method.paypal) {
      return `PayPal • ${method.paypal.email}`
    }
    return 'Unknown Method'
  }

  const getExpiryText = (month: number, year: number) => {
    const isExp = isExpired(month, year)
    return `${month.toString().padStart(2, '0')}/${year}${isExp ? ' (Expired)' : ''}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            MLM Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                    {getMethodIcon(method.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {getMethodDisplayName(method)}
                      </p>
                      {method.isDefault && (
                        <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                      )}
                      {method.isExpired && (
                        <Badge className="bg-red-100 text-red-800">Expired</Badge>
                      )}
                      {method.isMLMApproved && (
                        <Badge className="bg-green-100 text-green-800">MLM Approved</Badge>
                      )}
                      {method.payoutEligible && (
                        <Badge className="bg-purple-100 text-purple-800">Payout Eligible</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {method.type === 'card' && method.card && `Expires ${getExpiryText(method.card.expMonth, method.card.expYear)}`}
                      {method.type === 'bank' && method.bank && `${method.bank.accountType} account`}
                      {method.type === 'paypal' && 'PayPal account'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSetDefault(method.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(method)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(method.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add MLM Payment Method</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="paymentType">Payment Method Type</Label>
                    <Select value={paymentType} onValueChange={(value: 'card' | 'bank' | 'paypal') => setPaymentType(value)}>
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

                  {paymentType === 'card' && (
                    <>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expMonth">Expiry Month</Label>
                          <Select value={formData.expMonth} onValueChange={(value) => setFormData(prev => ({ ...prev, expMonth: value }))}>
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
                          <Select value={formData.expYear} onValueChange={(value) => setFormData(prev => ({ ...prev, expYear: value }))}>
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
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardholderName">Cardholder Name</Label>
                          <Input
                            id="cardholderName"
                            placeholder="John Doe"
                            value={formData.cardholderName}
                            onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {paymentType === 'bank' && (
                    <>
                      <div>
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          placeholder="Chase Bank"
                          value={formData.bankName}
                          onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          placeholder="1234567890"
                          value={formData.accountNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="routingNumber">Routing Number</Label>
                        <Input
                          id="routingNumber"
                          placeholder="123456789"
                          value={formData.routingNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, routingNumber: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountType">Account Type</Label>
                        <Select value={formData.accountType} onValueChange={(value) => setFormData(prev => ({ ...prev, accountType: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="checking">Checking</SelectItem>
                            <SelectItem value="savings">Savings</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {paymentType === 'paypal' && (
                    <div>
                      <Label htmlFor="paypalEmail">PayPal Email</Label>
                      <Input
                        id="paypalEmail"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.paypalEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, paypalEmail: e.target.value }))}
                      />
                    </div>
                  )}

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
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Your payment information is encrypted and secure. We never store your full card details.
                      MLM-approved methods are eligible for commission payouts.
                    </AlertDescription>
                  </Alert>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdd}>
                    Add Payment Method
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Payment Method</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="editIsDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="editIsDefault">Set as default payment method</Label>
                  </div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      To update payment details, please add a new payment method and delete this one.
                      MLM approval status cannot be changed manually.
                    </AlertDescription>
                  </Alert>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate}>
                    Update
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
