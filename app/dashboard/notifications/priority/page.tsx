"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useNotifications } from "@/lib/notification-context"
import { 
  Target, 
  Settings, 
  TestTube, 
  BarChart3, 
  Users,
  Zap,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from "lucide-react"

interface PriorityRule {
  id: string
  name: string
  description: string
  conditions: PriorityCondition[]
  priority: 'low' | 'medium' | 'high'
  weight: number
  enabled: boolean
}

interface PriorityCondition {
  field: string
  operator: string
  value: any
  weight: number
}

interface PriorityScore {
  score: number
  priority: 'low' | 'medium' | 'high'
  confidence: number
  factors: {
    ruleBased: number
    userContext: number
    timeBased: number
    engagementBased: number
  }
  reasoning: string[]
}

interface UserContext {
  userId: string
  preferences: {
    [category: string]: {
      priority: 'low' | 'medium' | 'high'
      frequency: 'low' | 'medium' | 'high'
    }
  }
  engagement: {
    [category: string]: {
      readRate: number
      clickRate: number
      averageReadTime: number
    }
  }
  behavior: {
    activeHours: number[]
    preferredCategories: string[]
    notificationFrequency: 'low' | 'medium' | 'high'
  }
  recentActivity: {
    lastActiveAt: string
    notificationsReceived: number
    notificationsRead: number
    notificationsClicked: number
  }
}

export default function NotificationPriorityPage() {
  const { addNotification } = useNotifications()
  const [rules, setRules] = useState<PriorityRule[]>([])
  const [stats, setStats] = useState<any>(null)
  const [userContext, setUserContext] = useState<UserContext | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [testResult, setTestResult] = useState<PriorityScore | null>(null)
  const [testForm, setTestForm] = useState({
    category: 'credit',
    type: 'success',
    title: 'Credit Score Improved!',
    message: 'Your credit score has increased by 25 points'
  })

  useEffect(() => {
    loadPriorityData()
  }, [])

  const loadPriorityData = async () => {
    try {
      setIsLoading(true)
      
      // Load rules
      const rulesResponse = await fetch('/api/notifications/priority?action=rules')
      const rulesData = await rulesResponse.json()
      if (rulesData.success) {
        setRules(rulesData.rules)
      }

      // Load stats
      const statsResponse = await fetch('/api/notifications/priority?action=stats')
      const statsData = await statsResponse.json()
      if (statsData.success) {
        setStats(statsData.stats)
      }

      // Load user context
      const contextResponse = await fetch('/api/notifications/priority?action=user-context')
      const contextData = await contextResponse.json()
      if (contextData.success) {
        setUserContext(contextData.userContext)
      }
    } catch (error) {
      console.error('Error loading priority data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const testPriority = async () => {
    try {
      const response = await fetch('/api/notifications/priority', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test-priority',
          notification: testForm,
          userId: '550e8400-e29b-41d4-a716-446655440000'
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setTestResult(result.priority)
        addNotification({
          title: "Priority Test Complete! 🎯",
          message: `Calculated priority: ${result.priority.priority} (${result.priority.score}/100)`,
          type: "success",
          priority: "medium",
          category: "system",
          read: false
        })
      } else {
        addNotification({
          title: "Priority Test Failed ❌",
          message: result.error || "Failed to calculate priority",
          type: "error",
          priority: "high",
          category: "system",
          read: false
        })
      }
    } catch (error) {
      console.error('Error testing priority:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityIcon = (priority: string) => {
    const icons = {
      high: <AlertTriangle className="h-4 w-4 text-red-600" />,
      medium: <Clock className="h-4 w-4 text-yellow-600" />,
      low: <CheckCircle className="h-4 w-4 text-green-600" />
    }
    return icons[priority as keyof typeof icons] || <Activity className="h-4 w-4 text-gray-600" />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading priority system...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Target className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Smart Priority System</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI-powered notification prioritization based on user behavior, preferences, and context
            </p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{stats.totalRules}</p>
                      <p className="text-sm text-gray-600">Total Rules</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{stats.enabledRules}</p>
                      <p className="text-sm text-gray-600">Active Rules</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                      <p className="text-sm text-gray-600">Tracked Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">AI</p>
                      <p className="text-sm text-gray-600">Powered</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="rules">Priority Rules</TabsTrigger>
              <TabsTrigger value="user-context">User Context</TabsTrigger>
              <TabsTrigger value="test">Test System</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* How It Works */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5" />
                      <span>How It Works</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-blue-600">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Rule-Based Analysis</h4>
                          <p className="text-sm text-gray-600">Applies predefined rules based on notification content and type</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-green-600">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium">User Context</h4>
                          <p className="text-sm text-gray-600">Considers user preferences and engagement patterns</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-purple-600">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Time-Based</h4>
                          <p className="text-sm text-gray-600">Adjusts priority based on user's active hours</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-orange-600">4</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Engagement-Based</h4>
                          <p className="text-sm text-gray-600">Uses historical engagement data to predict importance</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Priority Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Priority Distribution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats && (
                      <div className="space-y-4">
                        {Object.entries(stats.rulesByPriority).map(([priority, count]) => (
                          <div key={priority} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                {getPriorityIcon(priority)}
                                <span className="font-medium capitalize">{priority} Priority</span>
                              </div>
                              <Badge className={getPriorityColor(priority)}>
                                {String(count)} rules
                              </Badge>
                            </div>
                            <Progress 
                              value={(count as number / stats.totalRules) * 100} 
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Benefits</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-medium">Higher Engagement</h4>
                      <p className="text-sm text-gray-600">Users engage more with relevant, prioritized notifications</p>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Brain className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-medium">Smart Filtering</h4>
                      <p className="text-sm text-gray-600">Automatically filters out low-priority notifications</p>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <h4 className="font-medium">Personalized</h4>
                      <p className="text-sm text-gray-600">Adapts to individual user behavior and preferences</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rules Tab */}
            <TabsContent value="rules" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Priority Rules</span>
                  </CardTitle>
                  <CardDescription>
                    Configure rules that determine notification priority based on content and context
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rules.map((rule) => (
                      <div key={rule.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium">{rule.name}</h4>
                              <Badge className={getPriorityColor(rule.priority)}>
                                {rule.priority}
                              </Badge>
                              <Badge variant="outline">
                                Weight: {rule.weight}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                            
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium">Conditions:</h5>
                              {rule.conditions.map((condition, index) => (
                                <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                                  <span className="font-medium">{condition.field}</span> {condition.operator} <span className="font-medium">{JSON.stringify(condition.value)}</span>
                                  <span className="text-gray-500 ml-2">(weight: {condition.weight})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="ml-4">
                            <Switch
                              checked={rule.enabled}
                              onCheckedChange={(checked) => {
                                // In a real app, this would update the rule
                                console.log(`Toggle rule ${rule.id}: ${checked}`)
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* User Context Tab */}
            <TabsContent value="user-context" className="space-y-6">
              {userContext && (
                <>
                  {/* User Preferences */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>User Preferences</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(userContext.preferences).map(([category, prefs]) => (
                          <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium capitalize">{category}</h4>
                              <p className="text-sm text-gray-600">
                                Priority: {prefs.priority} • Frequency: {prefs.frequency}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Badge className={getPriorityColor(prefs.priority)}>
                                {prefs.priority}
                              </Badge>
                              <Badge variant="outline">
                                {prefs.frequency}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Engagement Data */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5" />
                        <span>Engagement Data</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(userContext.engagement).map(([category, engagement]) => (
                          <div key={category} className="border rounded-lg p-4">
                            <h4 className="font-medium capitalize mb-3">{category}</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm text-gray-600">Read Rate</span>
                                  <span className="text-sm font-medium">{engagement.readRate}%</span>
                                </div>
                                <Progress value={engagement.readRate} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm text-gray-600">Click Rate</span>
                                  <span className="text-sm font-medium">{engagement.clickRate}%</span>
                                </div>
                                <Progress value={engagement.clickRate} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm text-gray-600">Avg Read Time</span>
                                  <span className="text-sm font-medium">{engagement.averageReadTime}s</span>
                                </div>
                                <Progress value={Math.min(engagement.averageReadTime * 5, 100)} className="h-2" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Behavior Data */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>Behavior Patterns</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Active Hours</h4>
                          <div className="flex flex-wrap gap-2">
                            {userContext.behavior.activeHours.map((hour) => (
                              <Badge key={hour} variant="outline">
                                {hour}:00
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Preferred Categories</h4>
                          <div className="flex flex-wrap gap-2">
                            {userContext.behavior.preferredCategories.map((category) => (
                              <Badge key={category} className="bg-blue-100 text-blue-800">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Notification Frequency</h4>
                          <Badge className={getPriorityColor(userContext.behavior.notificationFrequency)}>
                            {userContext.behavior.notificationFrequency}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Test Tab */}
            <TabsContent value="test" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TestTube className="h-5 w-5" />
                    <span>Test Priority System</span>
                  </CardTitle>
                  <CardDescription>
                    Test how the priority system would rank different notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="testCategory">Category</Label>
                      <Select value={testForm.category} onValueChange={(value) => setTestForm(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit">Credit</SelectItem>
                          <SelectItem value="dispute">Dispute</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="payment">Payment</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                          <SelectItem value="alert">Alert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="testType">Type</Label>
                      <Select value={testForm.type} onValueChange={(value) => setTestForm(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="testTitle">Title</Label>
                    <Input
                      id="testTitle"
                      value={testForm.title}
                      onChange={(e) => setTestForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter notification title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="testMessage">Message</Label>
                    <Textarea
                      id="testMessage"
                      value={testForm.message}
                      onChange={(e) => setTestForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Enter notification message"
                      rows={3}
                    />
                  </div>
                  
                  <Button onClick={testPriority} className="w-full bg-blue-600 hover:bg-blue-700">
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Priority Calculation
                  </Button>
                </CardContent>
              </Card>

              {/* Test Results */}
              {testResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Priority Analysis Results</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-3xl font-bold mb-2">{testResult.score}/100</div>
                        <div className="text-sm text-gray-600">Priority Score</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          {getPriorityIcon(testResult.priority)}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">{testResult.priority} Priority</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-3xl font-bold mb-2">{testResult.confidence}%</div>
                        <div className="text-sm text-gray-600">Confidence</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Priority Factors</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Rule-Based</span>
                            <span className="text-sm font-medium">{testResult.factors.ruleBased}/100</span>
                          </div>
                          <Progress value={testResult.factors.ruleBased} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">User Context</span>
                            <span className="text-sm font-medium">{testResult.factors.userContext}/100</span>
                          </div>
                          <Progress value={testResult.factors.userContext} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Time-Based</span>
                            <span className="text-sm font-medium">{testResult.factors.timeBased}/100</span>
                          </div>
                          <Progress value={testResult.factors.timeBased} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Engagement-Based</span>
                            <span className="text-sm font-medium">{testResult.factors.engagementBased}/100</span>
                          </div>
                          <Progress value={testResult.factors.engagementBased} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Reasoning</h4>
                      <div className="space-y-2">
                        {testResult.reasoning.map((reason, index) => (
                          <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm">{reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}













