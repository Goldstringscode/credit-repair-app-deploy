"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CreditCard,
  Crown,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

interface BillingInfo {
  subscription: {
    id: string
    status: string
    tierId: string
    tierName: string
    billingCycle: string
    amount: number
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
  } | null
  paymentMethod: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  } | null
}

interface Invoice {
  id: string
  date: string
  amount: number
  status: string
  pdf_url: string | null
}

const TIER_NAMES: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
}

export default function MLMBillingPage() {
  const router = useRouter()
  const { user, isLoading: userLoading } = useCurrentUser()
  const [billing, setBilling] = useState<BillingInfo | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState("")
  const [isNotMember, setIsNotMember] = useState(false)

  useEffect(() => {
    if (!userLoading) {
      fetchBillingData()
    }
  }, [userLoading])

  async function fetchBillingData() {
    try {
      const [billingRes, invoicesRes] = await Promise.all([
        fetch("/api/mlm/billing", { credentials: "include" }),
        fetch("/api/mlm/billing/invoices", { credentials: "include" }),
      ])

      if (billingRes.status === 404) {
        setIsNotMember(true)
        setIsLoading(false)
        return
      }

      if (billingRes.ok) {
        const data = await billingRes.json()
        if (data.success) {
          setBilling(data)
        } else {
          setIsNotMember(true)
        }
      }

      if (invoicesRes.ok) {
        const data = await invoicesRes.json()
        if (data.success) {
          setInvoices(data.invoices ?? [])
        }
      }
    } catch (err) {
      console.error("Failed to fetch billing data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCancelSubscription() {
    setIsCancelling(true)
    setCancelError("")
    try {
      const res = await fetch("/api/mlm/billing", {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json()
      if (data.success) {
        setShowCancelDialog(false)
        fetchBillingData()
      } else {
        setCancelError(data.error ?? "Failed to cancel subscription")
      }
    } catch {
      setCancelError("An error occurred. Please try again.")
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading || userLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (isNotMember || !billing?.subscription) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="text-center p-12">
          <Crown className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">You&apos;re not an MLM member yet</h2>
          <p className="text-gray-500 mb-6">
            Join our MLM program to start earning commissions and building your team.
          </p>
          <Link href="/mlm/pricing">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              View MLM Plans
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const { subscription, paymentMethod } = billing
  const periodEnd = new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing &amp; Payments</h1>
        <p className="text-gray-500">Manage your MLM subscription and payment details</p>
      </div>

      {/* Current Plan + Payment Method */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {TIER_NAMES[subscription.tierId] ?? subscription.tierId}
              </span>
              <Badge
                className={
                  subscription.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }
              >
                {subscription.status}
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium">
                  ${subscription.amount}/{subscription.billingCycle === "annual" ? "yr" : "mo"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Billing cycle</span>
                <span className="font-medium capitalize">{subscription.billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {subscription.cancelAtPeriodEnd ? "Cancels on" : "Next billing"}
                </span>
                <span className="font-medium">{periodEnd}</span>
              </div>
            </div>

            {subscription.cancelAtPeriodEnd && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                Your subscription will end on {periodEnd}
              </div>
            )}

            <Separator />

            <div className="flex gap-2">
              <Link href="/mlm/pricing" className="flex-1">
                <Button variant="outline" className="w-full" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Upgrade Plan
                </Button>
              </Link>
              {!subscription.cancelAtPeriodEnd && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setShowCancelDialog(true)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethod ? (
              <>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <CreditCard className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="font-medium capitalize">
                      {paymentMethod.brand} •••• {paymentMethod.last4}
                    </p>
                    <p className="text-sm text-gray-500">
                      Expires {String(paymentMethod.expMonth).padStart(2, "0")}/{paymentMethod.expYear}
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                </div>
                <p className="text-sm text-gray-500">
                  To update your payment method, please contact support or manage through your Stripe customer portal.
                </p>
              </>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <CreditCard className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p>No payment method on file</p>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              Payments secured by Stripe
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Billing History
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchBillingData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <DollarSign className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p>No billing history yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="py-3">
                      <td className="py-3">
                        {new Date(inv.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3 font-medium">${(inv.amount / 100).toFixed(2)}</td>
                      <td className="py-3">
                        <Badge
                          className={
                            inv.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : inv.status === "open"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        {inv.pdf_url ? (
                          <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Cancel Subscription?
            </DialogTitle>
            <DialogDescription>
              Your subscription will remain active until <strong>{periodEnd}</strong>, after which
              you will lose access to the MLM program and your team dashboard.
            </DialogDescription>
          </DialogHeader>
          {cancelError && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{cancelError}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={isCancelling}>
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling…" : "Yes, Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}