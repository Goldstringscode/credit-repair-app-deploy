'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
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
import { CreditCard, Plus, Trash2, Shield, Loader2 } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#0f172a',
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: {
      color: '#dc2626',
    },
  },
}

function AddCardDialog({
  open,
  onOpenChange,
  onCardUpdate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCardUpdate: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddCard = async () => {
    if (!stripe || !elements) return

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) return

    setSaving(true)
    setError(null)

    try {
      // Card details are tokenized directly with Stripe in the browser. We
      // never see the raw card number or CVC — only the resulting
      // PaymentMethod id, which is what gets sent to our server.
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { name },
      })

      if (pmError) {
        throw new Error(pmError.message || 'Could not process this card')
      }

      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/billing/user/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ paymentMethodId: paymentMethod.id })
      })
      const json = await response.json()

      if (!response.ok || !json.success) {
        throw new Error(json.error || json.message || 'Failed to save card')
      }

      cardElement.clear()
      setName('')
      onOpenChange(false)
      onCardUpdate()
    } catch (err: any) {
      setError(err.message || 'Something went wrong adding this card')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a payment card</DialogTitle>
          <DialogDescription>
            Your card details go directly to Stripe and never touch our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label>Name on card</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-gray-500" />
              Card details
            </Label>
            <div className="rounded-md border px-3 py-3">
              <CardElement options={cardElementOptions} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleAddCard} disabled={saving || !stripe || !name}>
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </span>
            ) : (
              'Add Card'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function CardManagement({ onCardUpdate }: CardManagementProps) {
  const [cards, setCards] = useState<PaymentCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
          ...(token && { Authorization: `Bearer ${token}` })
        }
      })
      const json = await response.json()
      if (json.success) {
        setCards(json.cards)
      }
    } catch (err) {
      console.error('Failed to fetch cards:', err)
      setError('Failed to load your saved cards')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/billing/user/cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      })
      if (response.ok) {
        await fetchCards()
        onCardUpdate()
      }
    } catch (err) {
      console.error('Failed to delete card:', err)
    }
  }

  const handleSetDefault = async (cardId: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/billing/user/cards/${cardId}/default`, {
        method: 'PATCH',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      })
      if (response.ok) {
        await fetchCards()
        onCardUpdate()
      }
    } catch (err) {
      console.error('Failed to set default card:', err)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>Manage the cards on your account</CardDescription>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Card
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading cards...
          </div>
        ) : cards.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">No payment methods on file yet.</p>
        ) : (
          cards.map((card) => (
            <div
              key={card.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">
                    {card.brand} •••• {card.last4}
                  </p>
                  <p className="text-sm text-gray-500">
                    Expires {String(card.expMonth).padStart(2, '0')}/{card.expYear} — {card.name}
                  </p>
                </div>
                {card.isDefault && <Badge variant="secondary">Default</Badge>}
              </div>
              <div className="flex items-center gap-2">
                {!card.isDefault && (
                  <Button variant="outline" size="sm" onClick={() => handleSetDefault(card.id)}>
                    Make default
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleDeleteCard(card.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <Elements stripe={stripePromise}>
        <AddCardDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onCardUpdate={() => {
            fetchCards()
            onCardUpdate()
          }}
        />
      </Elements>
    </Card>
  )
}
