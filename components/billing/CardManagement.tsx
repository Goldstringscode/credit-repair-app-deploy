'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreditCard, Plus, Edit, Trash2, Shield } from 'lucide-react'

interface PaymentCard {
  id: string
  last4: string
  brand: string
  expMonth: number
  expYear: number
  isDefault: boolean
  name: string
}

interface CardManagementProps {
  onCardUpdate: () => void
}

export function CardManagement({ onCardUpdate }: CardManagementProps) {
  const [cards, setCards] = useState<PaymentCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingCard, setEditingCard] = useState<PaymentCard | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    name: '',
    zipCode: ''
  })

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/billing/user/cards', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })
      if (response.ok) {
        const data = await response.json()
        setCards(data.cards || [])
      }
    } catch (error) {
      console.error('Failed to fetch cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCard = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/billing/user/cards', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onCardUpdate()
        setShowAddDialog(false)
        setFormData({
          cardNumber: '',
          expiryMonth: '',
          expiryYear: '',
          cvc: '',
          name: '',
          zipCode: ''
        })
        fetchCards()
      } else {
        const error = await response.json()
        alert(`Failed to add card: ${error.message}`)
      }
    } catch (error) {
      console.error('Add card failed:', error)
      alert('Failed to add card. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSetDefault = async (cardId: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/billing/user/cards/${cardId}/default`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })

      if (response.ok) {
        fetchCards()
        onCardUpdate()
      } else {
        const error = await response.json()
        alert(`Failed to set default card: ${error.message}`)
      }
    } catch (error) {
      console.error('Set default card failed:', error)
      alert('Failed to set default card. Please try again.')
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/billing/user/cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })

      if (response.ok) {
        fetchCards()
        onCardUpdate()
      } else {
        const error = await response.json()
        alert(`Failed to delete card: ${error.message}`)
      }
    } catch (error) {
      console.error('Delete card failed:', error)
      alert('Failed to delete card. Please try again.')
    }
  }

  const getCardBrand = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '')
    if (number.startsWith('4')) return 'Visa'
    if (number.startsWith('5')) return 'Mastercard'
    if (number.startsWith('3')) return 'American Express'
    return 'Card'
  }

  const formatCardNumber = (number: string) => {
    return number.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  if (loading) {
    return <div className="text-center py-8">Loading cards...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
          <p className="text-gray-600 mt-2">Manage your saved payment methods</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Card
        </Button>
      </div>

      {cards.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
            <p className="text-gray-600 mb-4">Add a payment method to get started</p>
            <Button onClick={() => setShowAddDialog(true)}>
              Add Your First Card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => (
            <Card key={card.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <span className="font-medium">{card.brand}</span>
                  </div>
                  {card.isDefault && (
                    <Badge variant="default" className="text-xs">Default</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Card Number</p>
                  <p className="font-mono">•••• •••• •••• {card.last4}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Expires</p>
                    <p>{card.expMonth.toString().padStart(2, '0')}/{card.expYear}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p>{card.name}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  {!card.isDefault && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSetDefault(card.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setEditingCard(card)
                      setShowEditDialog(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteCard(card.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Card Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a new credit or debit card to your account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="name">Cardholder Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="expiryMonth">Month</Label>
                <Input
                  id="expiryMonth"
                  placeholder="MM"
                  value={formData.expiryMonth}
                  onChange={(e) => setFormData({...formData, expiryMonth: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="expiryYear">Year</Label>
                <Input
                  id="expiryYear"
                  placeholder="YYYY"
                  value={formData.expiryYear}
                  onChange={(e) => setFormData({...formData, expiryYear: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={formData.cvc}
                  onChange={(e) => setFormData({...formData, cvc: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                placeholder="12345"
                value={formData.zipCode}
                onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
              />
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your payment information is encrypted and secure. We never store your full card details.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCard} disabled={saving}>
              {saving ? 'Adding...' : 'Add Card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
