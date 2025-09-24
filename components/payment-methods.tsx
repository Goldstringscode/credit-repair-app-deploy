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
  Shield
} from 'lucide-react'

interface PaymentMethod {
  id: string
  type: 'card'
  card: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
  isDefault: boolean
  isExpired: boolean
}

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[]
  onAdd: (method: Omit<PaymentMethod, 'id'>) => void
  onEdit: (id: string, method: Partial<PaymentMethod>) => void
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
}

export function PaymentMethods({
  paymentMethods,
  onAdd,
  onEdit,
  onDelete,
  onSetDefault
}: PaymentMethodsProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [formData, setFormData] = useState({
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    cardholderName: '',
    isDefault: false
  })

  const handleAdd = () => {
    if (formData.cardNumber && formData.expMonth && formData.expYear && formData.cvc && formData.cardholderName) {
      const newMethod: Omit<PaymentMethod, 'id'> = {
        type: 'card',
        card: {
          brand: getCardBrand(formData.cardNumber),
          last4: formData.cardNumber.slice(-4),
          expMonth: parseInt(formData.expMonth),
          expYear: parseInt(formData.expYear)
        },
        isDefault: formData.isDefault || paymentMethods.length === 0,
        isExpired: isExpired(parseInt(formData.expMonth), parseInt(formData.expYear))
      }
      onAdd(newMethod)
      setFormData({
        cardNumber: '',
        expMonth: '',
        expYear: '',
        cvc: '',
        cardholderName: '',
        isDefault: false
      })
      setShowAddDialog(false)
    }
  }

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method)
    setFormData({
      cardNumber: `**** **** **** ${method.card.last4}`,
      expMonth: method.card.expMonth.toString().padStart(2, '0'),
      expYear: method.card.expYear.toString(),
      cvc: '***',
      cardholderName: 'John Doe', // In real app, this would come from the method
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

  const getCardIcon = (brand: string) => {
    switch (brand) {
      case 'visa':
        return '💳'
      case 'mastercard':
        return '💳'
      case 'amex':
        return '💳'
      default:
        return '💳'
    }
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
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-lg">{getCardIcon(method.card.brand)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {method.card.brand.toUpperCase()} •••• {method.card.last4}
                      </p>
                      {method.isDefault && (
                        <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                      )}
                      {method.isExpired && (
                        <Badge className="bg-red-100 text-red-800">Expired</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Expires {getExpiryText(method.card.expMonth, method.card.expYear)}
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
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
                      To update card details, please add a new payment method and delete this one.
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





