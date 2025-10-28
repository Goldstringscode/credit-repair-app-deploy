"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Upload, 
  BookOpen, 
  Target,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Plus,
  BarChart3
} from "lucide-react"

interface CreditData {
  negativeItems: any[]
  creditScores: any[]
}

export default function CreditReportsDashboard() {
  const [creditData, setCreditData] = useState<CreditData>({ negativeItems: [], creditScores: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCreditData()
  }, [])

  const loadCreditData = async () => {
    try {
      setLoading(true)
      
      // Load negative items and credit scores from database
      const [negativeItemsResponse, creditScoresResponse] = await Promise.all([
        fetch('/api/credit-reports/negative-items?userId=1'),
        fetch('/api/credit-reports/credit-scores?userId=1')
      ])
      
      const negativeItemsData = await negativeItemsResponse.json()
      const creditScoresData = await creditScoresResponse.json()
      
      if (negativeItemsData.success && creditScoresData.success) {
        setCreditData({
          negativeItems: negativeItemsData.data.negativeItems || [],
          creditScores: creditScoresData.data.creditScores || []
        })
      } else {
        setError("Failed to load credit data")
      }
    } catch (error) {
      console.error('Error loading credit data:', error)
      setError("Error loading credit data")
    } finally {
      setLoading(false)
    }
  }

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
      'Late Payment': 'bg-yellow-100 text-yellow-800',
      'Collection': 'bg-red-100 text-red-800',
      'Charge Off': 'bg-red-100 text-red-800',
      'Bankruptcy': 'bg-red-100 text-red-800',
      'Lien': 'bg-orange-100 text-orange-800',
      'Judgment': 'bg-red-100 text-red-800',
      'Other': 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

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
          <h1 className="text-3xl font-bold">Credit Reports Dashboard</h1>
          <p className="text-gray-600">Manage your credit data and generate professional dispute letters</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => window.location.href = '/dashboard/credit-reports/upload'}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Credit Data
          </Button>
          <Button 
            onClick={() => window.location.href = '/dashboard/letters/generate'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Letters
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

      {/* Manual Upload System Introduction */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                🎯 Manual Credit Report System
              </h2>
              <p className="text-gray-700 mb-4">
                Enter your credit data manually and generate professional dispute letters. 
                Get your free credit reports from AnnualCreditReport.com and use our system to track and dispute negative items.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => window.location.href = '/dashboard/credit-reports/guide'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Complete Guide
                </Button>
                <Button 
                  onClick={() => window.location.href = '/dashboard/credit-reports/upload'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Start Data Entry
                </Button>
              </div>
            </div>
            <div className="ml-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <CreditCard className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Free Reports</p>
                  <p className="text-xs text-gray-600">AnnualCreditReport.com</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">AI Letters</p>
                  <p className="text-xs text-gray-600">Professional Disputes</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Credit Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{creditData.creditScores.length}</div>
            <p className="text-sm text-gray-600">Scores entered</p>
            {creditData.creditScores.length > 0 && (
              <div className="mt-2">
                <div className="text-lg font-semibold">
                  {Math.round(creditData.creditScores.reduce((sum, score) => sum + score.score, 0) / creditData.creditScores.length)}
                </div>
                <p className="text-xs text-gray-500">Average score</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Negative Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{creditData.negativeItems.length}</div>
            <p className="text-sm text-gray-600">Items to dispute</p>
            {creditData.negativeItems.length > 0 && (
              <div className="mt-2">
                <div className="text-lg font-semibold text-red-600">
                  {creditData.negativeItems.filter(item => !item.isDisputed).length}
                </div>
                <p className="text-xs text-gray-500">Not yet disputed</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {creditData.negativeItems.length > 0 
                ? Math.round((creditData.negativeItems.filter(item => item.isDisputed).length / creditData.negativeItems.length) * 100)
                : 0}%
            </div>
            <p className="text-sm text-gray-600">Disputes completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Credit Scores Overview */}
      {creditData.creditScores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Credit Scores</CardTitle>
            <CardDescription>Your current credit scores from all three bureaus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {creditData.creditScores.map((score) => (
                <div key={score.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{score.bureau}</h4>
                    <Badge variant="outline">{score.date}</Badge>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(score.score)}`}>
                    {score.score}
                  </div>
                  <div className="text-sm text-gray-600">
                    {getScoreLabel(score.score)}
                  </div>
                  {score.notes && (
                    <p className="text-xs text-gray-500 mt-1">{score.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Negative Items Overview */}
      {creditData.negativeItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Negative Items</CardTitle>
            <CardDescription>Items that may be affecting your credit score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {creditData.negativeItems.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.creditor}</h4>
                      <p className="text-sm text-gray-600">{item.accountNumber}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getItemTypeColor(item.itemType)}>
                        {item.itemType}
                      </Badge>
                      <Badge variant={item.isDisputed ? "default" : "outline"}>
                        {item.isDisputed ? "Disputed" : "Not Disputed"}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Amount:</span> ${item.originalAmount.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {item.status}
                    </div>
                    <div>
                      <span className="font-medium">Reported:</span> {item.dateReported}
                    </div>
                    <div>
                      <span className="font-medium">Opened:</span> {item.dateOpened}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Dispute Reason:</span> {item.disputeReason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {creditData.creditScores.length === 0 && creditData.negativeItems.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Credit Data Yet</h3>
            <p className="text-gray-600 text-center mb-6">
              Get started by adding your credit scores and negative items to begin tracking and disputing.
            </p>
            <Button 
              onClick={() => window.location.href = '/dashboard/credit-reports/upload'}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Credit Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

