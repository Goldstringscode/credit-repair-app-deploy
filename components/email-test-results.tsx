"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Download,
  BarChart3,
  TrendingUp,
  TestTube,
  Mail,
  Send,
  Users,
  FileText,
  Settings,
  Zap,
  Target,
  Eye,
  Filter,
  Search
} from "lucide-react"

interface TestResult {
  id: string
  test: string
  status: "success" | "error" | "pending" | "running"
  message: string
  timestamp: string
  duration?: number
  category?: string
  details?: any
}

interface EmailTestResultsProps {
  results: TestResult[]
  onClearResults: () => void
  onExportResults: () => void
  onRunTest: (testName: string) => void
  isLoading?: boolean
}

export function EmailTestResults({ 
  results, 
  onClearResults, 
  onExportResults, 
  onRunTest,
  isLoading = false 
}: EmailTestResultsProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredResults = results.filter(result => {
    const matchesSearch = result.test.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || result.status === statusFilter
    const matchesTab = activeTab === "all" || result.category === activeTab
    return matchesSearch && matchesStatus && matchesTab
  })

  const successCount = results.filter(r => r.status === "success").length
  const errorCount = results.filter(r => r.status === "error").length
  const runningCount = results.filter(r => r.status === "running").length
  const totalTests = results.length
  const successRate = totalTests > 0 ? Math.round((successCount / totalTests) * 100) : 0

  const avgDuration = results
    .filter(r => r.duration)
    .reduce((sum, r) => sum + (r.duration || 0), 0) / results.filter(r => r.duration).length || 0

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />
      case "running": return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800"
      case "error": return "bg-red-100 text-red-800"
      case "running": return "bg-blue-100 text-blue-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "api": return <Zap className="h-4 w-4" />
      case "email": return <Mail className="h-4 w-4" />
      case "campaign": return <Send className="h-4 w-4" />
      case "template": return <FileText className="h-4 w-4" />
      case "list": return <Users className="h-4 w-4" />
      case "analytics": return <BarChart3 className="h-4 w-4" />
      case "performance": return <TrendingUp className="h-4 w-4" />
      default: return <TestTube className="h-4 w-4" />
    }
  }

  const categories = Array.from(new Set(results.map(r => r.category).filter(Boolean)))

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TestTube className="h-6 w-6 text-blue-500" />
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
                <p className="text-2xl font-bold text-purple-600">{successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Performance Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {avgDuration.toFixed(0)}ms
              </p>
              <p className="text-sm text-gray-600">Avg Response Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {runningCount}
              </p>
              <p className="text-sm text-gray-600">Currently Running</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {successRate}%
              </p>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
          </div>
          
          {totalTests > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">{successCount}/{totalTests}</span>
              </div>
              <Progress value={successRate} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search test results..."
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
              <option value="running">Running</option>
              <option value="pending">Pending</option>
            </select>
            <Button variant="outline" onClick={onClearResults} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button variant="outline" onClick={onExportResults} disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <span>Test Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No test results found</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
                <TabsTrigger value="all">All Tests</TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {category?.charAt(0).toUpperCase() + category?.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                <div className="space-y-3">
                  {filteredResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{result.test}</h4>
                            {result.category && (
                              <div className="flex items-center space-x-1">
                                {getCategoryIcon(result.category)}
                                <span className="text-xs text-gray-500">{result.category}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{result.message}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              {new Date(result.timestamp).toLocaleString()}
                            </span>
                            {result.duration && (
                              <span className="text-xs text-gray-500">
                                Duration: {result.duration}ms
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                        {result.status === "error" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRunTest(result.test)}
                            disabled={isLoading}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Timeline */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.slice(0, 5).map((result, index) => (
                <div key={result.id} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    result.status === "success" ? "bg-green-500" :
                    result.status === "error" ? "bg-red-500" :
                    result.status === "running" ? "bg-blue-500" :
                    "bg-yellow-500"
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{result.test}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
