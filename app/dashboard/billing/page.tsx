'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Calendar,
  CreditCard,
  Loader2,
  ExternalLink,
} from 'lucide-react'

interface SubscriptionInfo {
  id: string
  planId: string | null
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  professional: 'Professional',
  premium: 'Premium',
  enterprise: 'Enterprise',
}

export default function BillingPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  const loadSubscriptions = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const res = await fetch('/api/billing/subscriptions')
      if (res.status === 401) {
        setLoadError('Please sign in to view your billing.')
        return
      }
      const json = await res.json()
      if (!json.success) {
        setLoadError(json.error || 'Failed to load your billing information.')
        return
      }
      setSubscriptions(json.subscriptions ?? [])
    } catch (err) {
      console.error('Failed to load subscriptions:', err)
      setLoadError('Something went wrong loading your billing information.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSubscriptions()
  }, [loadSubscriptions])

  const openBillingPortal = async () => {
    setPortalLoading(true)
    setPortalError(null)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const json = await res.json()
      if (!json.success || !json.url) {
        setPortalError(json.error || 'Failed to open billing portal.')
        return
      }
      window.location.href = json.url
    } catch (err) {
      console.error('Failed to open billing portal:', err)
      setPortalError('Something went wrong opening the billing portal.')
    } finally {
      setPortalLoading(false)
    }
  }

  const activeSubscription = subscriptions.find(s => ['active', 'trialing', 'past_due'].includes(s.status))

  const statusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: typeof CheckCircle }> = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      trialing: { color: 'bg-blue-100 text-blue-800', icon: Calendar },
      past_due: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      canceled: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    }
    const c = config[status] ?? config.active
    const Icon = c.icon
    return (
      <Badge className={`${c.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mb-3" />
          <p>Loading your billing information…</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card className="mt-16">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">{loadError}</p>
            <Button onClick={loadSubscriptions} variant="outline">
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-600">Manage your subscription and payment methods</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSubscription ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {PLAN_LABELS[activeSubscription.planId ?? ''] ?? activeSubscription.planId ?? 'Plan'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Renews {new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
                {statusBadge(activeSubscription.status)}
              </div>

              {activeSubscription.cancelAtPeriodEnd && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    Your subscription will end on{' '}
                    {new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()}. You can reactivate it
                    anytime before then from the billing portal below.
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">You don't have an active subscription yet.</p>
              <Button asChild>
                <Link href="/pricing">View Plans</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {activeSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Manage Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Change your plan, update your payment method, view invoices, or cancel your subscription — all
              handled securely through Stripe.
            </p>
            {portalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {portalError}
              </div>
            )}
            <Button onClick={openBillingPortal} disabled={portalLoading} className="w-full sm:w-auto">
              {portalLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Manage Billing & Payment Methods
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
