"use client"

import { useState, useEffect, useCallback } from "react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  BookOpen,
  Target,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Plus,
  BarChart3
} from "lucide-react"

interface NegativeItem {
  id: string
  user_id: string
  creditor: string
  account_number: string
  original_amount: number | null
  current_balance: number | null
  date_opened: string | null
  date_reported: string | null
  status: string
  item_type: string
  dispute_reason: string
  notes: string | null
  is_disputed: boolean | null
  dispute_date: string | null
  resolution_status: string | null
  created_at: string
}

interface CreditScore {
  id: string
  bureau: string
  score: number
  date: string
  notes: string | null
}

interface CreditData {
  negativeItems: NegativeItem[]
  creditScores: CreditScore[]
}

export default function CreditReportsDashboard() {
  const { user } = useCurrentUser()
  const [creditData, setCreditData] = useState<CreditData>({ negativeItems: [], creditScores: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCreditData = useCallback(async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      setError(null)
      const [negRes, scoresRes] = await Promise.all([
        fetch(`/api/credit-reports/negative-items?userId=${user.id}`, { credentials: 'include' }),
        fetch(`/api/credit-reports/credit-scores?userId=${user.id}`, { credentials: 'include' })
      ])
      const negData = await negRes.json()
      const scoresData = await scoresRes.json()
      setCreditData({
        negativeItems: negData.success ? (negData.data?.negativeItems ?? negData.data ?? []) : [],
        creditScores: scoresData.success ? (scoresData.data?.creditScores ?? scoresData.data ?? []) : []
      })
      if (!negData.success || !scoresData.success) {
        setError("Some credit data could not be loaded. Please try again.")
      }
    } catch (err) {
      console.error('Error loading credit data:', err)
      setError("Error loading credit data. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadCreditData()
  }, [loadCreditData])

  const getScoreColor = (score: number) => {
    if (score >= 750) return "text-green-600"
    if (score >= 700) return "text-blue-600"
    if (score >= 650) return "text-yellow-600"
    if (score >= 600) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 750) return "Excellent"
    if (score >= 700) return "Good"
    if (score >= 650) return "Fair"
    if (score >= 600) return "Poor"
    return "Very Poor"
  }

  const getItemTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      late_payment: 'bg-yellow-100 text-yellow-800',
      'Late Payment': 'bg-yellow-100 text-yellow-800',
      collection: 'bg-red-100 text-red-800',
      Collection: 'bg-red-100 text-red-800',
      charge_off: 'bg-red-100 text-red-800',
      'Charge Off': 'bg-red-100 text-red-800',
      bankruptcy: 'bg-red-100 text-red-800',
      Bankruptcy: 'bg-red-100 text-red-800',
      foreclosure: 'bg-orange-100 text-orange-800',
      repossession: 'bg-orange-100 text-orange-800',
      inquiry: 'bg-blue-100 text-blue-800',
      public_record: 'bg-purple-100 text-purple-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (val: number | null | undefined) =>
    val != null ? `$${Number(val).toLocaleString()}` : 'N/A'

  const formatDate = (val: string | null | undefined) =>
    val ? new Date(val).toLocaleDateString() : 'N/A'

  const disputedCount = creditData.negativeItems.filter(i => i.is_disputed).length
  const undisputedCount = creditData.negativeItems.length - disputedCount
  const progressPct = creditData.negativeItems.length > 0
    ? Math.round((disputedCount / creditData.negativeItems.length) * 100)
    : 0
  const avgScore = creditData.creditScores.length > 0
    ? Math.round(creditData.creditScores.reduce((s, c) => s + c.score, 0) / creditData.creditScores.length)
    : null

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading credit data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Negative Items</h1>
          <p className="text-gray-600">Track and dispute negative items from your credit report</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.location.href = '/dashboard/credit-reports/upload'} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />Add Negative Item
          </Button>
          <Button onClick={() => window.location.href = '/dashboard/letters/generate'} className="bg-blue-600 hover:bg-blue-700">
            <FileText className="h-4 w-4 mr-2" />Generate Letters
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Your Credit Repair Workspace</h2>
              <p className="text-gray-700 mb-4">
                Get your free credit reports from AnnualCreditReport.com, then add the negative items you want to dispute.
                Select them at letter generation time to send professional dispute letters to the credit bureaus.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => window.location.href = '/dashboard/credit-reports/guide'} className="bg-blue-600 hover:bg-blue-700">
                  <BookOpen className="h-4 w-4 mr-2" />View Guide
                </Button>
                <Button onClick={() => window.location.href = '/dashboard/credit-reports/upload'} className="bg-green-600 hover:bg-green-700">
                  <Target className="h-4 w-4 mr-2" />Add Items
                </Button>
              </div>
            </div>
            <div className="ml-6 hidden md:grid grid-cols-2 gap-4 text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <CreditCard className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Free Reports</p>
                <p className="text-xs text-gray-600">AnnualCreditReport.com</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">AI Letters</p>
                <p className="text-xs text-gray-600">Professional Disputes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Credit Scores</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{creditData.creditScores.length}</div>
            <p className="text-sm text-gray-600">Scores entered</p>
            {avgScore != null && (
              <div className="mt-2">
                <div className={`text-lg font-semibold ${getScoreColor(avgScore)}`}>{avgScore}</div>
                <p className="text-xs text-gray-500">Average - {getScoreLabel(avgScore)}</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Negative Items</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{creditData.negativeItems.length}</div>
            <p className="text-sm text-gray-600">Items on your profile</p>
            {creditData.negativeItems.length > 0 && (
              <div className="mt-2">
                <div className="text-lg font-semibold text-red-600">{undisputedCount}</div>
                <p className="text-xs text-gray-500">Not yet disputed</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{progressPct}%</div>
            <p className="text-sm text-gray-600">Disputes completed</p>
            {creditData.negativeItems.length > 0 && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {creditData.creditScores.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Credit Scores</CardTitle><CardDescription>Your entered scores across bureaus</CardDescription></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {creditData.creditScores.map((score) => (
                <div key={score.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium capitalize">{score.bureau}</h4>
                    <Badge variant="outline">{formatDate(score.date)}</Badge>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(score.score)}`}>{score.score}</div>
                  <div className="text-sm text-gray-600">{getScoreLabel(score.score)}</div>
                  {score.notes && <p className="text-xs text-gray-500 mt-1">{score.notes}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {creditData.negativeItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Negative Items</CardTitle>
            <CardDescription>Select these when generating dispute letters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {creditData.negativeItems.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.creditor}</h4>
                      <p className="text-sm text-gray-500">{item.account_number ? `Account: ${item.account_number}` : 'No account number'}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <Badge className={getItemTypeColor(item.item_type)}>{item.item_type.replace(/_/g, ' ')}</Badge>
                      <Badge variant={item.is_disputed ? "default" : "outline"}>{item.is_disputed ? "Disputed" : "Not Disputed"}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                    <div><span className="font-medium">Original:</span> {formatCurrency(item.original_amount)}</div>
                    <div><span className="font-medium">Balance:</span> {formatCurrency(item.current_balance)}</div>
                    <div><span className="font-medium">Reported:</span> {formatDate(item.date_reported)}</div>
                    <div><span className="font-medium">Opened:</span> {formatDate(item.date_opened)}</div>
                  </div>
                  {item.dispute_reason && (
                    <p className="text-sm text-gray-700 mt-2"><span className="font-medium">Dispute reason:</span> {item.dispute_reason}</p>
                  )}
                  {item.status && <p className="text-xs text-gray-500 mt-1"><span className="font-medium">Status:</span> {item.status}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {creditData.creditScores.length === 0 && creditData.negativeItems.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Credit Data Yet</h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              Get your free credit reports from AnnualCreditReport.com, then add your negative items here to start tracking and disputing them.
            </p>
            <Button onClick={() => window.location.href = '/dashboard/credit-reports/upload'} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />Add Your First Item
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
