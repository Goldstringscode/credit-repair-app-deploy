"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, FileText, Users, AlertCircle, CheckCircle, Upload, BarChart3, DollarSign, Zap, Bell, Shield, Mail, Send, Eye, Target } from "lucide-react"
import Link from "next/link"
import { useNotifications } from "@/lib/notification-context"
import { useDashboardNotifications } from "@/hooks/use-page-notifications"

interface DashboardStats {
  current_credit_score: number | null
  bureau_scores: {
    experian: number | null
    equifax: number | null
    transunion: number | null
  }
  score_change: number | null
  total_accounts: number
  open_accounts: number
  negative_items: number
  total_debt: number
  credit_utilization: number | null
  recent_inquiries: number
  dispute_success_rate: number
  data_completeness: {
    confidence_score: number | null
    has_personal_info: boolean
    has_accounts: boolean
    has_payment_history: boolean
    has_inquiries: boolean
    has_negative_items: boolean
  }
  email_metrics: {
    total_sent: number
    open_rate: number
    click_rate: number
    active_campaigns: number
    total_subscribers: number
  }
  last_updated: string | null
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addNotification } = useNotifications()
  
  // Add dashboard notification integration
  const { notifyTaskComplete } = useDashboardNotifications()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)

      // Read from localStorage instead of API
      const latestReport = localStorage.getItem("latestCreditReport")

      if (latestReport) {
        const reportData = JSON.parse(latestReport)
        const analysis = reportData.analysis

        // Transform localStorage data to match DashboardStats interface
        const dashboardStats: DashboardStats = {
          current_credit_score: analysis.credit_score,
          bureau_scores: {
            experian: analysis.experian_score,
            equifax: analysis.equifax_score,
            transunion: analysis.transunion_score,
          },
          score_change: Math.floor(Math.random() * 20 - 10), // Mock score change
          total_accounts: analysis.accounts?.length || 0,
          open_accounts: analysis.accounts?.filter((acc: any) => acc.payment_status === "Current").length || 0,
          negative_items: analysis.negative_items?.length || 0,
          total_debt: analysis.summary?.total_balance || 0,
          credit_utilization: analysis.summary?.credit_utilization || null,
          recent_inquiries: analysis.inquiries?.length || 0,
          dispute_success_rate: 85, // Mock success rate
          data_completeness: {
            confidence_score: 0.95, // High confidence for uploaded data
            has_personal_info: !!analysis.personal_info,
            has_accounts: (analysis.accounts?.length || 0) > 0,
            has_payment_history: true,
            has_inquiries: (analysis.inquiries?.length || 0) > 0,
            has_negative_items: (analysis.negative_items?.length || 0) > 0,
          },
          email_metrics: {
            total_sent: 15420,
            open_rate: 80.0,
            click_rate: 20.0,
            active_campaigns: 3,
            total_subscribers: 2150,
          },
          last_updated: reportData.uploadDate,
        }

        setStats(dashboardStats)
      } else {
        // No data available - set empty state
        setStats({
          current_credit_score: null,
          bureau_scores: {
            experian: null,
            equifax: null,
            transunion: null,
          },
          score_change: null,
          total_accounts: 0,
          open_accounts: 0,
          negative_items: 0,
          total_debt: 0,
          credit_utilization: null,
          recent_inquiries: 0,
          dispute_success_rate: 0,
          data_completeness: {
            confidence_score: null,
            has_personal_info: false,
            has_accounts: false,
            has_payment_history: false,
            has_inquiries: false,
            has_negative_items: false,
          },
          email_metrics: {
            total_sent: 0,
            open_rate: 0,
            click_rate: 0,
            active_campaigns: 0,
            total_subscribers: 0,
          },
          last_updated: null,
        })
      }
    } catch (err) {
      setError("Failed to load dashboard data")
      console.error("Dashboard stats error:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-gray-400"
    if (score >= 750) return "text-green-600"
    if (score >= 700) return "text-blue-600"
    if (score >= 650) return "text-yellow-600"
    return "text-red-600"
  }

  const getChangeIndicator = (change: number | null) => {
    if (!change) return { text: "No data", color: "text-gray-500" }
    if (change > 0) return { text: `+${change}`, color: "text-green-600" }
    if (change < 0) return { text: `${change}`, color: "text-red-600" }
    return { text: "No change", color: "text-gray-500" }
  }

  const getBureauDisplayName = (bureau: string) => {
    const names = {
      experian: "Experian",
      equifax: "Equifax",
      transunion: "TransUnion",
    }
    return names[bureau as keyof typeof names] || bureau
  }

  // Test notification functions
  const testLessonNotification = async () => {
    await addNotification({
      title: "Lesson Completed! 🎉",
      message: `Great job completing "Understanding Your Credit Report" in Credit Basics & Fundamentals! You earned 50 points.`,
      type: "success",
      priority: "medium",
      category: "training"
    })
  }

  const testQuizNotification = async () => {
    await addNotification({
      title: "Quiz Completed! 📝",
      message: `You scored 85% on "Credit Knowledge Quiz" - Excellent work!`,
      type: "success",
      priority: "medium",
      category: "training"
    })
  }

  const testMilestoneNotification = async () => {
    await addNotification({
      title: "Milestone Achieved! 🏆",
      message: "First Steps Complete - You've completed your first 2 lessons in Credit Basics!",
      type: "success",
      priority: "high",
      category: "milestone"
    })
  }

  const testCourseCompletionNotification = async () => {
    await addNotification({
      title: "Course Completed! 🎓",
      message: "Congratulations! You've successfully completed Credit Basics & Fundamentals.",
      type: "success",
      priority: "high",
      category: "training"
    })
  }

  const testActionPlanNotification = async () => {
    await addNotification({
      title: "Task Completed! ✅",
      message: "Review Credit Report completed in Credit Repair Action Plan",
      type: "success",
      priority: "medium",
      category: "training"
    })
  }

  // Phase 3 Test Functions
  const testPushNotification = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Test Push Notification', {
          body: 'This is a test of the push notification system!',
          icon: '/favicon.ico'
        })
      } else if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          new Notification('Test Push Notification', {
            body: 'This is a test of the push notification system!',
            icon: '/favicon.ico'
          })
        } else {
          alert('Push notification permission was denied. Please enable notifications in your browser settings.')
        }
      } else {
        alert('Push notifications are blocked. Please enable notifications in your browser settings.')
      }
    } else {
      alert('Push notifications are not supported in this browser')
    }
  }

  const testRealtimeConnection = () => {
    alert('Real-time connection status can be seen in the notification bell (green/yellow/red dot)')
  }

  const testFiltering = () => {
    alert('Filtering can be tested by using the filter controls in the notification bell')
  }

  const testBulkOperations = () => {
    alert('Bulk operations can be tested by using the bulk action controls in the notification bell')
  }

  const testPreferences = () => {
    alert('Preferences can be tested by clicking the Settings button in the notification bell')
  }

  const getAvailableBureauScores = () => {
    if (!stats?.bureau_scores) return []
    return Object.entries(stats.bureau_scores)
      .filter(([_, score]) => score !== null)
      .map(([bureau, score]) => ({ bureau, score: score as number }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">CreditRepair AI</h1>
              <Badge
                className={`ml-3 ${stats?.current_credit_score ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
              >
                {stats?.current_credit_score ? "Live Data" : "No Data"}
              </Badge>
              {stats?.data_completeness.confidence_score && (
                <Badge variant="outline" className="ml-2">
                  {Math.round(stats.data_completeness.confidence_score * 100)}% Confidence
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testLessonNotification}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Bell className="h-4 w-4 mr-2" />
                Test Lesson
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testQuizNotification}
                className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
              >
                <Bell className="h-4 w-4 mr-2" />
                Test Quiz
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testMilestoneNotification}
                className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
              >
                <Bell className="h-4 w-4 mr-2" />
                Test Milestone
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testPushNotification}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                <Bell className="h-4 w-4 mr-2" />
                Test Push
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testRealtimeConnection}
                className="bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
              >
                <Bell className="h-4 w-4 mr-2" />
                Test Real-time
              </Button>
              <Link href="/test-security">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security Tests
                </Button>
              </Link>
              <Link href="/dashboard/reports/upload">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Reports
                </Button>
              </Link>
              <Button variant="outline">Settings</Button>
              <Link href="/">
                <Button variant="ghost">Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Dashboard</h2>
          <p className="text-gray-600">Monitor your credit repair progress and manage your account</p>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">Error Loading Data</h3>
                  <p className="text-sm text-red-700">{error}</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={fetchDashboardStats}>
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {stats && getAvailableBureauScores().length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Scores by Bureau</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(stats.bureau_scores).map(([bureau, score]) => (
                <Card key={bureau} className={score ? "border-blue-200" : "border-gray-200 opacity-60"}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{getBureauDisplayName(bureau)}</CardTitle>
                    <TrendingUp className={`h-4 w-4 ${score ? "text-blue-600" : "text-gray-400"}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(score)}`}>{score || "N/A"}</div>
                    <p className="text-xs text-muted-foreground">{score ? "Available" : "No data uploaded"}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Primary Credit Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(stats?.current_credit_score)}`}>
                {stats?.current_credit_score || "N/A"}
              </div>
              <p className={`text-xs ${getChangeIndicator(stats?.score_change).color}`}>
                {getChangeIndicator(stats?.score_change).text} from last report
              </p>
              {stats && (
                <p className="text-xs text-muted-foreground mt-1">
                  {getAvailableBureauScores().length}/3 bureaus available
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_accounts || 0}</div>
              <p className="text-xs text-muted-foreground">{stats?.open_accounts || 0} currently open</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Negative Items</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.negative_items || 0}</div>
              <p className="text-xs text-muted-foreground">Items to dispute</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credit Utilization</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.credit_utilization ? `${stats.credit_utilization.toFixed(1)}%` : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.credit_utilization && stats.credit_utilization > 30 ? "Above recommended" : "Good range"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Email Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.email_metrics?.total_sent?.toLocaleString() || "0"}</div>
              <p className="text-xs text-muted-foreground">Total campaigns sent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.email_metrics?.open_rate?.toFixed(1) || "0"}%</div>
              <p className="text-xs text-muted-foreground">Average open rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.email_metrics?.click_rate?.toFixed(1) || "0"}%</div>
              <p className="text-xs text-muted-foreground">Average click rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.email_metrics?.total_subscribers?.toLocaleString() || "0"}</div>
              <p className="text-xs text-muted-foreground">Active subscribers</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.total_debt)}</div>
                <p className="text-xs text-muted-foreground">Across all accounts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Inquiries</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recent_inquiries}</div>
                <p className="text-xs text-muted-foreground">Last 24 months</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.dispute_success_rate}%</div>
                <p className="text-xs text-muted-foreground">Dispute success rate</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest credit repair actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.current_credit_score ? (
                    <>
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Credit report analyzed successfully</p>
                          <p className="text-xs text-gray-500">Score: {stats.current_credit_score}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{stats.total_accounts} accounts identified</p>
                          <p className="text-xs text-gray-500">{stats.negative_items} negative items found</p>
                        </div>
                        <Badge variant="secondary">Processed</Badge>
                      </div>
                      {stats.negative_items > 0 && (
                        <div className="flex items-center space-x-4">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Ready to generate dispute letters</p>
                            <p className="text-xs text-gray-500">{stats.negative_items} items can be disputed</p>
                          </div>
                          <Badge variant="secondary">Action Available</Badge>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Credit Reports Yet</h3>
                      <p className="text-gray-500 mb-4">Upload your first credit report to see your activity here</p>
                      <Link href="/dashboard/reports/upload">
                        <Button>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Credit Report
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/reports/upload">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Credit Report
                  </Button>
                </Link>
                <Link href="/test-upload-system">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Zap className="mr-2 h-4 w-4" />
                    Test Upload System
                  </Button>
                </Link>
                <Link href="/dashboard/letters">
                  <Button
                    className="w-full justify-start bg-transparent"
                    variant="outline"
                    disabled={!stats?.negative_items}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Dispute Letter
                  </Button>
                </Link>
                <Link href="/dashboard/analytics">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </Link>
                <Link href="/dashboard/monitoring">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Credit Monitoring
                  </Button>
                </Link>
                <Link href="/dashboard/email">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Marketing
                  </Button>
                </Link>
                <Link href="/dashboard/email/campaigns/create">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Send className="mr-2 h-4 w-4" />
                    Create Campaign
                  </Button>
                </Link>
                <Link href="/dashboard/email/analytics">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Email Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Progress Card */}
            {stats && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Credit Health Overview</CardTitle>
                  <CardDescription>Your current credit status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Primary Score</span>
                        <span>{stats.current_credit_score || "N/A"}/850</span>
                      </div>
                      <Progress
                        value={stats.current_credit_score ? (stats.current_credit_score / 850) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Credit Utilization</span>
                        <span>{stats.credit_utilization ? `${stats.credit_utilization.toFixed(1)}%` : "N/A"}</span>
                      </div>
                      <Progress
                        value={stats.credit_utilization ? Math.min(stats.credit_utilization, 100) : 0}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Account Health</span>
                        <span>
                          {stats.open_accounts}/{stats.total_accounts} Active
                        </span>
                      </div>
                      <Progress
                        value={stats.total_accounts > 0 ? (stats.open_accounts / stats.total_accounts) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Data Completeness</span>
                        <span>
                          {stats.data_completeness.confidence_score
                            ? `${Math.round(stats.data_completeness.confidence_score * 100)}%`
                            : "N/A"}
                        </span>
                      </div>
                      <Progress
                        value={
                          stats.data_completeness.confidence_score ? stats.data_completeness.confidence_score * 100 : 0
                        }
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Status Notice */}
        <div className="mt-8">
          <Card
            className={`${stats?.current_credit_score ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertCircle
                  className={`h-5 w-5 ${stats?.current_credit_score ? "text-green-600" : "text-blue-600"}`}
                />
                <div>
                  <h3 className={`font-semibold ${stats?.current_credit_score ? "text-green-900" : "text-blue-900"}`}>
                    {stats?.current_credit_score ? "Credit Data Loaded" : "Ready to Get Started"}
                  </h3>
                  <p className={`text-sm ${stats?.current_credit_score ? "text-green-700" : "text-blue-700"}`}>
                    {stats?.current_credit_score
                      ? `Your credit report has been analyzed. You have ${stats.negative_items} items that can be disputed.`
                      : "Upload your credit report to begin analyzing your credit and generating dispute letters."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
