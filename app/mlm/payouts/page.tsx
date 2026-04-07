"use client"

import { useState, useEffect } from "react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Crown,
  Banknote,
  AlertTriangle,
  RefreshCw,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface PayoutSummary {
  totalEarnings: number
  availableBalance: number
  thisMonth: number
  totalPaidOut: number
  payouts: Payout[]
  monthlyEarnings: { month: string; amount: number }[]
}

interface Payout {
  id: string
  date: string
  amount: number
  method: string
  status: string
  transactionId: string
}

const MIN_PAYOUT = 50

export default function MLMPayoutsPage() {
  const { isLoading: userLoading } = useCurrentUser()
  const [data, setData] = useState<PayoutSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isNotMember, setIsNotMember] = useState(false)
  const [showPayoutDialog, setShowPayoutDialog] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)
  const [payoutError, setPayoutError] = useState("")
  const [payoutSuccess, setPayoutSuccess] = useState(false)

  useEffect(() => {
    if (!userLoading) fetchData()
  }, [userLoading])

  async function fetchData() {
    try {
      const res = await fetch("/api/mlm/payouts", { credentials: "include" })
      if (res.status === 404) { setIsNotMember(true); setIsLoading(false); return }
      if (res.ok) {
        const json = await res.json()
        if (json.success) { setData(json) } else { setIsNotMember(true) }
      }
    } catch (err) {
      console.error("Failed to fetch payout data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRequestPayout() {
    if (!data) return
    setIsRequesting(true)
    setPayoutError("")
    try {
      const res = await fetch("/api/mlm/payouts/process", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: data.availableBalance, method: "bank_account" }),
      })
      const json = await res.json()
      if (json.success) { setShowPayoutDialog(false); setPayoutSuccess(true); fetchData() }
      else { setPayoutError(json.error ?? "Failed to process payout") }
    } catch { setPayoutError("An error occurred. Please try again.") }
    finally { setIsRequesting(false) }
  }

  if (isLoading || userLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-64" /><Skeleton className="h-64" />
      </div>
    )
  }

  if (isNotMember || !data) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Card className="text-center p-12">
          <Crown className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">You are not an MLM member yet</h2>
          <p className="text-gray-500 mb-6">Join our MLM program to start earning commissions.</p>
          <Link href="/mlm/pricing"><Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">View MLM Plans</Button></Link>
        </Card>
      </div>
    )
  }

  const summaryCards = [
    { label: "Total Earnings", value: `$${data.totalEarnings.toFixed(2)}`, icon: <TrendingUp className="h-6 w-6 text-blue-600" />, bg: "bg-blue-50" },
    { label: "Available Balance", value: `$${data.availableBalance.toFixed(2)}`, icon: <DollarSign className="h-6 w-6 text-green-600" />, bg: "bg-green-50" },
    { label: "This Month", value: `$${data.thisMonth.toFixed(2)}`, icon: <BarChart3 className="h-6 w-6 text-purple-600" />, bg: "bg-purple-50" },
    { label: "Total Paid Out", value: `$${data.totalPaidOut.toFixed(2)}`, icon: <CheckCircle className="h-6 w-6 text-emerald-600" />, bg: "bg-emerald-50" },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payouts &amp; Earnings</h1>
          <p className="text-gray-500">Track your commissions and request payouts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" />Refresh</Button>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white" size="sm" disabled={data.availableBalance < MIN_PAYOUT} onClick={() => setShowPayoutDialog(true)}>
            <Banknote className="h-4 w-4 mr-1" />Request Payout
          </Button>
        </div>
      </div>

      {payoutSuccess && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <CheckCircle className="h-5 w-5" />Payout request submitted! Processed within 2-3 business days.
        </div>
      )}

      {data.availableBalance < MIN_PAYOUT && data.availableBalance > 0 && (
        <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          <Clock className="h-4 w-4" />Minimum payout is ${MIN_PAYOUT}. You have ${data.availableBalance.toFixed(2)} available.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className={`${card.bg} border-0`}> 
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div><p className="text-xs text-gray-500 mb-1">{card.label}</p><p className="text-xl font-bold text-gray-900">{card.value}</p></div>
                {card.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-purple-600" />Monthly Earnings (Last 6 Months)</CardTitle></CardHeader>
        <CardContent>
          {data.monthlyEarnings.length === 0 || data.monthlyEarnings.every((m) => m.amount === 0) ? (
            <div className="text-center py-10 text-gray-400"><BarChart3 className="h-10 w-10 mx-auto mb-2" /><p>No earnings data yet.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.monthlyEarnings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Earnings"]} />
                <Bar dataKey="amount" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Payout Methods</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Bank Account (ACH)", icon: <Banknote className="h-6 w-6 text-blue-600" />, desc: "Direct deposit. 2-3 business days.", status: "available" },
              { name: "PayPal", icon: <DollarSign className="h-6 w-6 text-blue-500" />, desc: "Fast transfer to PayPal.", status: "coming_soon" },
              { name: "Check", icon: <CheckCircle className="h-6 w-6 text-gray-500" />, desc: "Physical check. 7-10 business days.", status: "coming_soon" },
            ].map((method) => (
              <div key={method.name} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center gap-2">{method.icon}<span className="font-medium text-sm">{method.name}</span></div>
                <p className="text-xs text-gray-500">{method.desc}</p>
                {method.status === "coming_soon" ? <Badge variant="outline" className="text-xs">Coming Soon</Badge> : <Badge className="bg-green-100 text-green-800 text-xs">Available</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-gray-500" />Payout History</CardTitle></CardHeader>
        <CardContent>
          {data.payouts.length === 0 ? (
            <div className="text-center py-10 text-gray-400"><DollarSign className="h-10 w-10 mx-auto mb-2" /><p>No payouts yet. Minimum is ${MIN_PAYOUT}.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-gray-500"><th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium">Amount</th><th className="pb-3 font-medium">Method</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Transaction ID</th></tr></thead>
                <tbody className="divide-y">
                  {data.payouts.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3">{new Date(p.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
                      <td className="py-3 font-medium">${p.amount.toFixed(2)}</td>
                      <td className="py-3 capitalize">{p.method.replace("_", " ")}</td>
                      <td className="py-3"><Badge className={p.status === "paid" ? "bg-green-100 text-green-800" : p.status === "processing" ? "bg-blue-100 text-blue-800" : p.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>{p.status}</Badge></td>
                      <td className="py-3 text-gray-400 text-xs font-mono">{p.transactionId || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Payout</DialogTitle>
            <DialogDescription>You are requesting <strong>${data.availableBalance.toFixed(2)}</strong> via Bank Account (ACH). Processed within 2-3 business days.</DialogDescription>
          </DialogHeader>
          {payoutError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2"><AlertTriangle className="h-4 w-4" />{payoutError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutDialog(false)} disabled={isRequesting}>Cancel</Button>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white" onClick={handleRequestPayout} disabled={isRequesting}>{isRequesting ? "Processing..." : "Confirm Payout"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}