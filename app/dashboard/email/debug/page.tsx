"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Bug,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Search,
  Filter,
  Download,
  Settings,
  Zap,
  Mail,
  Send,
  Users,
  FileText,
  BarChart3,
  TrendingUp,
  Shield,
  Target,
  Clock,
  Info,
  HelpCircle,
  ExternalLink
} from "lucide-react"
import { useEmailDashboard } from "@/hooks/use-email-dashboard"

interface DebugResult {
  id: string
  test: string
  status: "success" | "error" | "warning" | "info"
  message: string
  details: any
  timestamp: string
  duration?: number
  suggestions: string[]
}

export default function EmailDebugPage() {
  const [debugResults, setDebugResults] = useState<DebugResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const {
    metrics,
    campaigns,
    templates,
    lists,
    analytics,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createCampaign,
    createTemplate,
    createList,
    sendTestEmail,
    refreshData,
    clearError
  } = useEmailDashboard()

  const addDebugResult = (test: string, status: DebugResult["status"], message: string, details: any, suggestions: string[] = [], duration?: number) => {
    const result: DebugResult = {
      id: Date.now().toString(),
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString(),
      duration,
      suggestions
    }
    setDebugResults(prev => [result, ...prev])
  }

  const runComprehensiveDebug = async () => {
    setIsRunning(true)
    setDebugResults([])

    try {
      // Debug 1: API Endpoint Test
      addDebugResult("API Endpoint Test", "info", "Testing API endpoint connectivity...", null, [])
      try {
        const response = await fetch('/api/email/dashboard?type=overview')
        const data = await response.json()
        
        if (data.success) {
          addDebugResult("API Endpoint Test", "success", "API endpoint is working correctly", data, [
            "API is responding properly",
            "Data structure is valid"
          ])
        } else {
          addDebugResult("API Endpoint Test", "error", `API returned error: ${data.error}`, data, [
            "Check API endpoint implementation",
            "Verify error handling in API",
            "Check server logs for details"
          ])
        }
      } catch (err) {
        addDebugResult("API Endpoint Test", "error", `API request failed: ${err instanceof Error ? err.message : 'Unknown error'}`, err, [
          "Check if API endpoint exists",
          "Verify network connectivity",
          "Check CORS settings",
          "Verify API route configuration"
        ])
      }

      // Debug 2: Hook State Analysis
      addDebugResult("Hook State Analysis", "info", "Analyzing hook state and data...", null, [])
      const hookState = {
        metrics: metrics ? "Loaded" : "Not loaded",
        campaigns: campaigns ? `${campaigns.length} loaded` : "Not loaded",
        templates: templates ? `${templates.length} loaded` : "Not loaded",
        lists: lists ? `${lists.length} loaded` : "Not loaded",
        analytics: analytics ? "Loaded" : "Not loaded",
        isLoading,
        isCreating,
        isUpdating,
        isDeleting,
        error: error || "None"
      }
      
      const issues = []
      if (!metrics) issues.push("Metrics not loaded")
      if (!campaigns || campaigns.length === 0) issues.push("No campaigns loaded")
      if (!templates || templates.length === 0) issues.push("No templates loaded")
      if (!lists || lists.length === 0) issues.push("No lists loaded")
      if (!analytics) issues.push("Analytics not loaded")
      if (error) issues.push(`Error present: ${error}`)

      if (issues.length === 0) {
        addDebugResult("Hook State Analysis", "success", "All hook states are healthy", hookState, [
          "Hook is working correctly",
          "All data is loaded properly"
        ])
      } else {
        addDebugResult("Hook State Analysis", "warning", `Hook state issues: ${issues.join(", ")}`, hookState, [
          "Check if data is being fetched properly",
          "Verify API responses",
          "Check for loading states",
          "Review error handling"
        ])
      }

      // Debug 3: Data Structure Validation
      addDebugResult("Data Structure Validation", "info", "Validating data structures...", null, [])
      const dataValidation = {
        metrics: {
          valid: metrics && typeof metrics.totalSent === 'number',
          type: typeof metrics,
          keys: metrics ? Object.keys(metrics) : []
        },
        campaigns: {
          valid: Array.isArray(campaigns),
          length: campaigns?.length || 0,
          sample: campaigns?.[0] || null
        },
        templates: {
          valid: Array.isArray(templates),
          length: templates?.length || 0,
          sample: templates?.[0] || null
        },
        lists: {
          valid: Array.isArray(lists),
          length: lists?.length || 0,
          sample: lists?.[0] || null
        },
        analytics: {
          valid: analytics && typeof analytics === 'object',
          hasTimeSeries: analytics?.timeSeries ? true : false,
          timeSeriesLength: analytics?.timeSeries?.length || 0
        }
      }

      const validationIssues = []
      if (!dataValidation.metrics.valid) validationIssues.push("Metrics structure invalid")
      if (!dataValidation.campaigns.valid) validationIssues.push("Campaigns not an array")
      if (!dataValidation.templates.valid) validationIssues.push("Templates not an array")
      if (!dataValidation.lists.valid) validationIssues.push("Lists not an array")
      if (!dataValidation.analytics.valid) validationIssues.push("Analytics structure invalid")

      if (validationIssues.length === 0) {
        addDebugResult("Data Structure Validation", "success", "All data structures are valid", dataValidation, [
          "Data structures match expected format",
          "All arrays and objects are properly formed"
        ])
      } else {
        addDebugResult("Data Structure Validation", "error", `Data structure issues: ${validationIssues.join(", ")}`, dataValidation, [
          "Check API response format",
          "Verify data transformation logic",
          "Check type definitions",
          "Review data mapping"
        ])
      }

      // Debug 4: Function Availability Test
      addDebugResult("Function Availability Test", "info", "Testing function availability...", null, [])
      const functions = {
        createCampaign: typeof createCampaign === 'function',
        createTemplate: typeof createTemplate === 'function',
        createList: typeof createList === 'function',
        sendTestEmail: typeof sendTestEmail === 'function',
        refreshData: typeof refreshData === 'function',
        clearError: typeof clearError === 'function'
      }

      const missingFunctions = Object.entries(functions)
        .filter(([_, available]) => !available)
        .map(([name, _]) => name)

      if (missingFunctions.length === 0) {
        addDebugResult("Function Availability Test", "success", "All required functions are available", functions, [
          "All hook functions are properly exported",
          "Functions are correctly bound"
        ])
      } else {
        addDebugResult("Function Availability Test", "error", `Missing functions: ${missingFunctions.join(", ")}`, functions, [
          "Check hook implementation",
          "Verify function exports",
          "Check import statements",
          "Review hook dependencies"
        ])
      }

      // Debug 5: Error State Analysis
      addDebugResult("Error State Analysis", "info", "Analyzing error states...", null, [])
      const errorAnalysis = {
        hasError: !!error,
        errorMessage: error || "No error",
        isLoading,
        isCreating,
        isUpdating,
        isDeleting,
        errorType: error ? typeof error : "none"
      }

      if (!error && !isLoading && !isCreating && !isUpdating && !isDeleting) {
        addDebugResult("Error State Analysis", "success", "No errors detected", errorAnalysis, [
          "System is in a healthy state",
          "No blocking operations detected"
        ])
      } else if (error) {
        addDebugResult("Error State Analysis", "error", `Error detected: ${error}`, errorAnalysis, [
          "Check error source",
          "Review error handling",
          "Check for API errors",
          "Verify error propagation"
        ])
      } else {
        addDebugResult("Error State Analysis", "warning", "System is in loading state", errorAnalysis, [
          "Wait for operations to complete",
          "Check for stuck loading states",
          "Review async operations"
        ])
      }

      // Debug 6: Performance Test
      addDebugResult("Performance Test", "info", "Testing system performance...", null, [])
      const startTime = Date.now()
      
      try {
        await refreshData()
        const endTime = Date.now()
        const duration = endTime - startTime

        if (duration < 1000) {
          addDebugResult("Performance Test", "success", `Data refresh completed in ${duration}ms`, { duration }, [
            "Performance is within acceptable range",
            "Data operations are efficient"
          ])
        } else {
          addDebugResult("Performance Test", "warning", `Data refresh took ${duration}ms (slow)`, { duration }, [
            "Consider optimizing data fetching",
            "Check for unnecessary re-renders",
            "Review API response times"
          ])
        }
      } catch (err) {
        addDebugResult("Performance Test", "error", `Performance test failed: ${err instanceof Error ? err.message : 'Unknown error'}`, err, [
          "Check data fetching implementation",
          "Verify API performance",
          "Review error handling"
        ])
      }

      // Debug 7: Mock Data Validation
      addDebugResult("Mock Data Validation", "info", "Validating mock data integrity...", null, [])
      const mockDataIssues = []
      
      if (campaigns && campaigns.length > 0) {
        const campaign = campaigns[0]
        if (!campaign.id) mockDataIssues.push("Campaign missing ID")
        if (!campaign.name) mockDataIssues.push("Campaign missing name")
        if (!campaign.subject) mockDataIssues.push("Campaign missing subject")
        if (typeof campaign.recipients !== 'number') mockDataIssues.push("Campaign recipients not a number")
      }

      if (templates && templates.length > 0) {
        const template = templates[0]
        if (!template.id) mockDataIssues.push("Template missing ID")
        if (!template.name) mockDataIssues.push("Template missing name")
        if (!template.subject) mockDataIssues.push("Template missing subject")
      }

      if (lists && lists.length > 0) {
        const list = lists[0]
        if (!list.id) mockDataIssues.push("List missing ID")
        if (!list.name) mockDataIssues.push("List missing name")
        if (typeof list.subscribers !== 'number') mockDataIssues.push("List subscribers not a number")
      }

      if (mockDataIssues.length === 0) {
        addDebugResult("Mock Data Validation", "success", "Mock data structure is valid", { campaigns: campaigns?.length, templates: templates?.length, lists: lists?.length }, [
          "Mock data is properly structured",
          "All required fields are present"
        ])
      } else {
        addDebugResult("Mock Data Validation", "error", `Mock data issues: ${mockDataIssues.join(", ")}`, mockDataIssues, [
          "Check mock data structure",
          "Verify required fields",
          "Review data generation logic"
        ])
      }

    } catch (err) {
      addDebugResult("Debug Suite", "error", `Debug suite failed: ${err instanceof Error ? err.message : 'Unknown error'}`, err, [
        "Check debug implementation",
        "Review error handling",
        "Check system configuration"
      ])
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: DebugResult["status"]) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />
      case "warning": return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "info": return <Info className="h-4 w-4 text-blue-500" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: DebugResult["status"]) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800"
      case "error": return "bg-red-100 text-red-800"
      case "warning": return "bg-yellow-100 text-yellow-800"
      case "info": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredResults = debugResults.filter(result => {
    const matchesSearch = result.test.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || result.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const successCount = debugResults.filter(r => r.status === "success").length
  const errorCount = debugResults.filter(r => r.status === "error").length
  const warningCount = debugResults.filter(r => r.status === "warning").length
  const totalTests = debugResults.length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Email System Debug Tool</h1>
            <p className="text-gray-600">
              Comprehensive debugging and diagnostics for email system issues
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setDebugResults([])}
              disabled={isRunning}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Results
            </Button>
            <Button
              onClick={runComprehensiveDebug}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Bug className="h-4 w-4 mr-2" />
              {isRunning ? "Running Debug..." : "Run Debug Analysis"}
            </Button>
          </div>
        </div>
      </div>

      {/* Debug Results Summary */}
      {totalTests > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bug className="h-6 w-6 text-blue-500" />
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
                  <p className="text-sm font-medium text-gray-600">Success</p>
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
                  <p className="text-sm font-medium text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search debug results..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Debug Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bug className="h-5 w-5" />
            <span>Debug Analysis Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bug className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No debug results yet. Click "Run Debug Analysis" to start.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <div key={result.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <h4 className="font-medium">{result.test}</h4>
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
                  
                  <p className="text-sm text-gray-600 mb-3">{result.message}</p>
                  
                  {result.suggestions && result.suggestions.length > 0 && (
                    <div className="mb-3">
                      <h6 className="text-sm font-medium text-gray-700 mb-2">Suggestions:</h6>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {result.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTest(selectedTest === result.id ? null : result.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {selectedTest === result.id ? "Hide" : "Show"} Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(result.details, null, 2))}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Copy Data
                    </Button>
                  </div>
                  
                  {selectedTest === result.id && result.details && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <h6 className="text-sm font-medium text-gray-700 mb-2">Raw Data:</h6>
                      <pre className="text-xs text-gray-600 bg-white p-2 rounded border overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
