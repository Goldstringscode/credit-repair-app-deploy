"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Mail,
  Send,
  Eye,
  Download,
  RefreshCw,
  Search,
  Filter,
  Settings,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Users,
  BarChart3,
  TrendingUp,
  Shield,
  Target,
  Zap,
  Bug,
  Database,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  Plus,
  Star,
  Heart,
  ThumbsUp,
  MessageSquare,
  Share
} from "lucide-react"
import { creditRepairEmailTemplates } from "@/lib/credit-repair-email-templates"
import { additionalCreditRepairTemplates } from "@/lib/credit-repair-email-templates-extended"

interface EmailTestResult {
  id: string
  templateId: string
  templateName: string
  status: "success" | "error" | "pending" | "running"
  message: string
  timestamp: string
  duration?: number
  testData?: any
}

export default function EmailTemplatesTestPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<EmailTestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [testEmail, setTestEmail] = useState("test@example.com")
  const [testName, setTestName] = useState("Test User")
  
  // Test data for different scenarios
  const [testData, setTestData] = useState({
    userName: "John Doe",
    userEmail: "john.doe@example.com",
    dashboardUrl: "https://app.creditai.com/dashboard",
    profileSetupUrl: "https://app.creditai.com/onboarding/profile",
    disputeType: "Late Payment",
    creditBureau: "Experian",
    accountName: "Chase Credit Card",
    generatedDate: new Date().toLocaleDateString(),
    disputeLetterUrl: "https://app.creditai.com/disputes/letter/123",
    scoreIncrease: "25",
    previousScore: "650",
    currentScore: "675",
    updateDate: new Date().toLocaleDateString(),
    transactionId: "TXN-123456789",
    amount: "29.99",
    planName: "Professional Plan",
    billingPeriod: "Monthly",
    paymentDate: new Date().toLocaleDateString(),
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    daysSinceSubmission: "15",
    currentStatus: "Under Investigation",
    submissionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    expectedResponseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    trackingNumber: "TRK-987654321",
    disputeTrackingUrl: "https://app.creditai.com/disputes/track/123",
    daysRemaining: "5",
    uploadUrl: "https://app.creditai.com/dashboard/upload",
    ticketNumber: "TKT-456789",
    subject: "Account Access Issue",
    priority: "High",
    createdDate: new Date().toLocaleDateString(),
    status: "Open",
    responseTime: "24 hours",
    ticketUrl: "https://app.creditai.com/support/ticket/456789",
    supportPhone: "(555) 123-4567",
    featureName: "AI Credit Score Predictor",
    featureDescription: "Predict your credit score changes before making financial decisions",
    benefit1: "Predict credit score impact of financial actions",
    benefit2: "Get personalized recommendations",
    benefit3: "Track score trends over time",
    benefit4: "Make informed financial decisions",
    featureUrl: "https://app.creditai.com/features/score-predictor",
    complianceType: "FCRA Updates",
    impact1: "Enhanced dispute process requirements",
    impact2: "New documentation standards",
    impact3: "Updated privacy protections",
    actionRequired: "Review and accept updated terms of service",
    actionUrl: "https://app.creditai.com/legal/terms",
    effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    legalNotice: "This notice is required by federal law and must be acknowledged to continue service.",
    complianceEmail: "compliance@creditai.com",
    compliancePhone: "(555) 987-6543"
  })

  const allTemplates = [...creditRepairEmailTemplates, ...additionalCreditRepairTemplates]
  const categories = Array.from(new Set(allTemplates.map(t => t.category)))
  
  console.log(`📧 Loaded ${creditRepairEmailTemplates.length} main templates`)
  console.log(`📧 Loaded ${additionalCreditRepairTemplates.length} extended templates`)
  console.log(`📧 Total templates: ${allTemplates.length}`)

  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const addTestResult = (templateId: string, templateName: string, status: EmailTestResult["status"], message: string, duration?: number, testData?: any) => {
    const result: EmailTestResult = {
      id: Date.now().toString(),
      templateId,
      templateName,
      status,
      message,
      timestamp: new Date().toISOString(),
      duration,
      testData
    }
    setTestResults(prev => [result, ...prev])
  }

  const testSingleTemplate = async (template: any) => {
    addTestResult(template.id, template.name, "running", `Testing ${template.name}...`)
    const startTime = Date.now()

    try {
      // Actually send the email via API
      const response = await fetch('/api/email/credit-repair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_test',
          templateId: template.id,
          to: testEmail,
          testData: testData
        })
      })

      const result = await response.json()
      const duration = Date.now() - startTime

      if (result.success) {
        addTestResult(template.id, template.name, "success", `Email sent successfully to ${testEmail} (Message ID: ${result.messageId})`, duration, {
          subject: template.subject,
          messageId: result.messageId,
          variables: template.variables,
          category: template.category
        })
      } else {
        addTestResult(template.id, template.name, "error", `Failed to send email: ${result.error}`, duration)
      }
    } catch (err) {
      const duration = Date.now() - startTime
      addTestResult(template.id, template.name, "error", `Failed to send email: ${err instanceof Error ? err.message : 'Unknown error'}`, duration)
    }
  }

  const testAllTemplates = async () => {
    setIsRunningTests(true)
    setTestResults([])

    // Get unique templates to avoid duplicates
    const uniqueTemplates = filteredTemplates.filter((template, index, self) => 
      index === self.findIndex(t => t.id === template.id)
    )

    console.log(`🧪 Testing ${uniqueTemplates.length} unique templates`)

    for (const template of uniqueTemplates) {
      await testSingleTemplate(template)
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setIsRunningTests(false)
  }

  const testCategory = async (category: string) => {
    setIsRunningTests(true)
    const categoryTemplates = allTemplates.filter(t => t.category === category)
    
    for (const template of categoryTemplates) {
      await testSingleTemplate(template)
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setIsRunningTests(false)
  }

  const sendSingleEmail = async (template: any) => {
    addTestResult(template.id, template.name, "running", `Sending ${template.name}...`)
    const startTime = Date.now()

    try {
      const response = await fetch('/api/email/credit-repair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_test',
          templateId: template.id,
          to: testEmail,
          testData: testData
        })
      })

      const result = await response.json()
      const duration = Date.now() - startTime

      if (result.success) {
        addTestResult(template.id, template.name, "success", `Email sent successfully to ${testEmail} (Message ID: ${result.messageId})`, duration, {
          subject: template.subject,
          messageId: result.messageId,
          variables: template.variables,
          category: template.category
        })
      } else {
        addTestResult(template.id, template.name, "error", `Failed to send email: ${result.error}`, duration)
      }
    } catch (err) {
      const duration = Date.now() - startTime
      addTestResult(template.id, template.name, "error", `Failed to send email: ${err instanceof Error ? err.message : 'Unknown error'}`, duration)
    }
  }

  const getStatusIcon = (status: EmailTestResult["status"]) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />
      case "running": return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: EmailTestResult["status"]) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800"
      case "error": return "bg-red-100 text-red-800"
      case "running": return "bg-blue-100 text-blue-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "welcome": return <Heart className="h-4 w-4" />
      case "onboarding": return <Users className="h-4 w-4" />
      case "dispute": return <FileText className="h-4 w-4" />
      case "follow-up": return <RefreshCw className="h-4 w-4" />
      case "success": return <Star className="h-4 w-4" />
      case "reminder": return <Clock className="h-4 w-4" />
      case "billing": return <TrendingUp className="h-4 w-4" />
      case "support": return <MessageSquare className="h-4 w-4" />
      case "marketing": return <Share className="h-4 w-4" />
      case "compliance": return <Shield className="h-4 w-4" />
      default: return <Mail className="h-4 w-4" />
    }
  }

  const successCount = testResults.filter(r => r.status === "success").length
  const errorCount = testResults.filter(r => r.status === "error").length
  const totalTests = testResults.length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Email Templates Test Suite</h1>
            <p className="text-gray-600">
              Test all email templates for the credit repair app dashboard
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setTestResults([])}
              disabled={isRunningTests}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Results
            </Button>
            <Button
              onClick={testAllTemplates}
              disabled={isRunningTests}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunningTests ? "Sending Emails..." : "Send All Templates"}
            </Button>
          </div>
        </div>
      </div>

      {/* Test Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Test Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div>
              <Label htmlFor="testName">Test User Name</Label>
              <Input
                id="testName"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Test User"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results Summary */}
      {totalTests > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold">{totalTests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Passed</p>
                  <p className="text-2xl font-bold text-green-600">{successCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {totalTests > 0 ? Math.round((successCount / totalTests) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="test-results">Test Results</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Template Categories</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map((category) => {
                    const count = allTemplates.filter(t => t.category === category).length
                    const activeCount = allTemplates.filter(t => t.category === category && t.isActive).length
                    return (
                      <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(category)}
                          <span className="font-medium capitalize">{category.replace('-', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{activeCount}/{count}</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testCategory(category)}
                            disabled={isRunningTests}
                          >
                            Test
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setActiveTab("templates")}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Browse All Templates
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setActiveTab("preview")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Preview Templates
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setActiveTab("test-results")}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Test Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Templates List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(template.category)}
                      <Badge variant="outline" className="capitalize">
                        {template.category.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      {template.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Subject:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {template.subject}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {template.variables.length} variables
                      </span>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendSingleEmail(template)}
                          disabled={isRunningTests}
                          title="Send real email"
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Test Results Tab */}
        <TabsContent value="test-results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Test Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No tests run yet. Click "Test All Templates" to start testing.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testResults.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(result.status)}
                          <h4 className="font-medium">{result.templateName}</h4>
                          <Badge className={getStatusColor(result.status)}>
                            {result.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {new Date(result.timestamp).toLocaleString()}
                          </span>
                          {result.duration && (
                            <span className="text-xs text-gray-500">
                              {result.duration}ms
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Template Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a template from the Templates tab to preview it here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
