"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Download,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Edit,
  Users,
  Activity,
  TrendingUp,
  Shield,
  FileText,
  BarChart3,
} from "lucide-react"
import {
  mockPayoutRequests,
  mockAdminSettings,
  mockSystemHealth,
  type PayoutRequest,
  type AdminPayoutSettings,
} from "@/lib/admin-payout-management"

export function PayoutManagementDashboard() {
  const [selectedTab, setSelectedTab] = useState("requests")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<AdminPayoutSettings>(mockAdminSettings)
  const [systemHealth] = useState(mockSystemHealth)

  const filteredRequests = mockPayoutRequests.filter((request) => {
    const matchesSearch =
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatCurrency = (amount: number) => `$${(amount / 100).toFixed(2)}`

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-600 bg-red-100"
    if (score >= 50) return "text-yellow-600 bg-yellow-100"
    if (score >= 30) return "text-orange-600 bg-orange-100"
    return "text-green-600 bg-green-100"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-purple-100 text-purple-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "failed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for requests:`, selectedRequests)
    // In real app, would call API
    setSelectedRequests([])
  }

  const handleApproveRequest = (requestId: string, reason?: string) => {
    console.log(`Approving request ${requestId}:`, reason)
    // In real app, would call API
  }

  const handleRejectRequest = (requestId: string, reason: string) => {
    console.log(`Rejecting request ${requestId}:`, reason)
    // In real app, would call API
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payout Management</h1>
          <p className="text-gray-600">Manage and monitor all payout requests</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                <p className="text-2xl font-bold text-yellow-600">{systemHealth.totalPendingPayouts}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2 text-xs text-yellow-600">{formatCurrency(systemHealth.totalPendingAmount)} total</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{systemHealth.successRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 text-xs text-green-600">Last 30 days</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Processing</p>
                <p className="text-2xl font-bold text-blue-600">{systemHealth.averageProcessingTime}h</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 text-xs text-blue-600">Processing time</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Load</p>
                <p className="text-2xl font-bold text-purple-600">{systemHealth.systemLoad}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 text-xs text-purple-600">Current load</div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {systemHealth.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemHealth.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === "critical"
                      ? "border-red-500 bg-red-50"
                      : alert.severity === "high"
                        ? "border-orange-500 bg-orange-50"
                        : alert.severity === "medium"
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-blue-500 bg-blue-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-gray-600">{alert.createdAt.toLocaleString()}</p>
                    </div>
                    <Badge variant="outline">{alert.severity}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="requests">Payout Requests</TabsTrigger>
          <TabsTrigger value="processing">Processing Queue</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedRequests.length > 0 && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleBulkAction("approve")}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve ({selectedRequests.length})
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleBulkAction("reject")}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject ({selectedRequests.length})
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Payout Requests Table */}
              <div className="border rounded-lg">
                <div className="grid grid-cols-8 gap-4 p-4 bg-gray-50 font-medium text-sm">
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedRequests.length === filteredRequests.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRequests(filteredRequests.map((r) => r.id))
                        } else {
                          setSelectedRequests([])
                        }
                      }}
                    />
                  </div>
                  <div>User</div>
                  <div>Amount</div>
                  <div>Method</div>
                  <div>Status</div>
                  <div>Risk Score</div>
                  <div>Requested</div>
                  <div>Actions</div>
                </div>

                {filteredRequests.map((request) => (
                  <div key={request.id} className="grid grid-cols-8 gap-4 p-4 border-t">
                    <div className="flex items-center">
                      <Checkbox
                        checked={selectedRequests.includes(request.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRequests([...selectedRequests, request.id])
                          } else {
                            setSelectedRequests(selectedRequests.filter((id) => id !== request.id))
                          }
                        }}
                      />
                    </div>

                    <div>
                      <p className="font-medium">{request.userName}</p>
                      <p className="text-sm text-gray-600">{request.userEmail}</p>
                    </div>

                    <div>
                      <p className="font-medium">{formatCurrency(request.amount)}</p>
                      <p className="text-sm text-gray-600">Net: {formatCurrency(request.fees.netAmount)}</p>
                    </div>

                    <div>
                      <p className="text-sm">{request.method.type.replace("_", " ").toUpperCase()}</p>
                      <Badge
                        variant="outline"
                        className={request.method.status === "verified" ? "text-green-600" : "text-yellow-600"}
                      >
                        {request.method.status}
                      </Badge>
                    </div>

                    <div>
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                    </div>

                    <div>
                      <Badge className={getRiskColor(request.riskScore)}>{request.riskScore}/100</Badge>
                      {request.flags.length > 0 && (
                        <div className="mt-1">
                          <AlertTriangle className="h-3 w-3 text-yellow-600" />
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-gray-600">{request.requestedAt.toLocaleDateString()}</div>

                    <div className="flex items-center space-x-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Payout Request Details</DialogTitle>
                            <DialogDescription>Review payout request #{request.id}</DialogDescription>
                          </DialogHeader>
                          <PayoutRequestDetails request={request} />
                        </DialogContent>
                      </Dialog>

                      {request.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleApproveRequest(request.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reject Payout Request</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to reject this payout request? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="my-4">
                                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                                <Textarea
                                  id="rejection-reason"
                                  placeholder="Please provide a reason for rejection..."
                                  className="mt-2"
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRejectRequest(request.id, "Admin rejection")}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Reject Request
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Processing Queue</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Queue
                  </Button>
                  <Button size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Process Now
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">Queue Depth</h4>
                    <p className="text-2xl font-bold text-blue-600">{systemHealth.queueDepth}</p>
                    <p className="text-sm text-blue-600">Requests waiting</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">Last Processed</h4>
                    <p className="text-lg font-bold text-green-600">
                      {systemHealth.lastProcessedAt.toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-green-600">{systemHealth.lastProcessedAt.toLocaleDateString()}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800">Next Run</h4>
                    <p className="text-lg font-bold text-purple-600">
                      {systemHealth.nextScheduledRun.toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-purple-600">{systemHealth.nextScheduledRun.toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-4">Processing Schedule</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Frequency</Label>
                      <p className="text-sm text-gray-600 capitalize">{settings.processingSchedule.frequency}</p>
                    </div>
                    <div>
                      <Label>Cutoff Time</Label>
                      <p className="text-sm text-gray-600">{settings.processingSchedule.cutoffTime}</p>
                    </div>
                    <div>
                      <Label>Processing Days</Label>
                      <p className="text-sm text-gray-600">
                        {settings.processingSchedule.processingDays
                          .map((day) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day])
                          .join(", ")}
                      </p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge
                        className={
                          settings.processingSchedule.enabled
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {settings.processingSchedule.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Payout Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input placeholder="Search users..." className="flex-1" />
                  <Button variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 font-medium text-sm">
                    <div>User</div>
                    <div>Total Earned</div>
                    <div>Total Paid</div>
                    <div>Available</div>
                    <div>Status</div>
                    <div>Actions</div>
                  </div>

                  {/* Mock user data */}
                  {[
                    {
                      id: "user_123",
                      name: "John Smith",
                      email: "john@example.com",
                      earned: 125000,
                      paid: 115000,
                      available: 7500,
                      status: "active",
                    },
                    {
                      id: "user_456",
                      name: "Sarah Johnson",
                      email: "sarah@example.com",
                      earned: 275000,
                      paid: 250000,
                      available: 15000,
                      status: "active",
                    },
                    {
                      id: "user_789",
                      name: "Mike Chen",
                      email: "mike@example.com",
                      earned: 50000,
                      paid: 0,
                      available: 50000,
                      status: "suspended",
                    },
                  ].map((user) => (
                    <div key={user.id} className="grid grid-cols-6 gap-4 p-4 border-t">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="font-medium">{formatCurrency(user.earned)}</div>
                      <div className="font-medium">{formatCurrency(user.paid)}</div>
                      <div className="font-medium text-green-600">{formatCurrency(user.available)}</div>
                      <div>
                        <Badge
                          className={
                            user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }
                        >
                          {user.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Shield className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Volume</p>
                    <p className="text-2xl font-bold">$284,750</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Platform Revenue</p>
                    <p className="text-2xl font-bold">$1,424</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold">1,247</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Payout</p>
                    <p className="text-2xl font-bold">$187</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock audit entries */}
                {[
                  {
                    id: "audit_001",
                    admin: "Admin User",
                    action: "approved",
                    payout: "payout_001",
                    timestamp: new Date(),
                    reason: "Standard approval",
                  },
                  {
                    id: "audit_002",
                    admin: "Admin User",
                    action: "rejected",
                    payout: "payout_002",
                    timestamp: new Date(Date.now() - 3600000),
                    reason: "Insufficient verification",
                  },
                  {
                    id: "audit_003",
                    admin: "System",
                    action: "processed",
                    payout: "payout_003",
                    timestamp: new Date(Date.now() - 7200000),
                    reason: "Automated processing",
                  },
                ].map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-full ${
                          entry.action === "approved"
                            ? "bg-green-100"
                            : entry.action === "rejected"
                              ? "bg-red-100"
                              : "bg-blue-100"
                        }`}
                      >
                        {entry.action === "approved" ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : entry.action === "rejected" ? (
                          <XCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <Activity className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {entry.admin} {entry.action} {entry.payout}
                        </p>
                        <p className="text-sm text-gray-600">{entry.reason}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{entry.timestamp.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payout System Settings</DialogTitle>
            <DialogDescription>Configure payout processing rules and limits</DialogDescription>
          </DialogHeader>
          <PayoutSystemSettings settings={settings} onSettingsChange={setSettings} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Payout Request Details Component
function PayoutRequestDetails({ request }: { request: PayoutRequest }) {
  const formatCurrency = (amount: number) => `$${(amount / 100).toFixed(2)}`

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">User Information</h4>
            <div className="mt-2 space-y-1">
              <p>
                <span className="text-gray-600">Name:</span> {request.userName}
              </p>
              <p>
                <span className="text-gray-600">Email:</span> {request.userEmail}
              </p>
              <p>
                <span className="text-gray-600">User ID:</span> {request.userId}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium">Payout Details</h4>
            <div className="mt-2 space-y-1">
              <p>
                <span className="text-gray-600">Amount:</span> {formatCurrency(request.amount)}
              </p>
              <p>
                <span className="text-gray-600">Platform Fee:</span> {formatCurrency(request.fees.platformFee)}
              </p>
              <p>
                <span className="text-gray-600">Processing Fee:</span> {formatCurrency(request.fees.processingFee)}
              </p>
              <p>
                <span className="text-gray-600">Net Amount:</span>{" "}
                <span className="font-medium text-green-600">{formatCurrency(request.fees.netAmount)}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Payout Method</h4>
            <div className="mt-2 space-y-1">
              <p>
                <span className="text-gray-600">Type:</span> {request.method.type.replace("_", " ").toUpperCase()}
              </p>
              <p>
                <span className="text-gray-600">Status:</span>
                <Badge
                  className={
                    request.method.status === "verified"
                      ? "ml-2 bg-green-100 text-green-800"
                      : "ml-2 bg-yellow-100 text-yellow-800"
                  }
                >
                  {request.method.status}
                </Badge>
              </p>
              {request.method.details.bankName && (
                <p>
                  <span className="text-gray-600">Bank:</span> {request.method.details.bankName} ****
                  {request.method.details.lastFour}
                </p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium">Risk Assessment</h4>
            <div className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Risk Score:</span>
                <Badge
                  className={
                    request.riskScore >= 70
                      ? "bg-red-100 text-red-800"
                      : request.riskScore >= 50
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                  }
                >
                  {request.riskScore}/100
                </Badge>
              </div>
              {request.flags.length > 0 && (
                <div>
                  <p className="text-gray-600 text-sm">Flags:</p>
                  <div className="space-y-1">
                    {request.flags.map((flag, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <AlertTriangle className="h-3 w-3 text-yellow-600" />
                        <span className="text-sm">{flag.message}</span>
                        <Badge variant="outline" className="text-xs">
                          {flag.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium">Request Metadata</h4>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p>
              <span className="text-gray-600">Requested:</span> {request.requestedAt.toLocaleString()}
            </p>
            <p>
              <span className="text-gray-600">IP Address:</span> {request.metadata.ipAddress}
            </p>
            <p>
              <span className="text-gray-600">Location:</span> {request.metadata.location}
            </p>
          </div>
          <div>
            <p>
              <span className="text-gray-600">Commission IDs:</span> {request.metadata.commissionIds.join(", ")}
            </p>
            <p>
              <span className="text-gray-600">Period:</span> {request.metadata.period}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          View Details
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  )
}

// Payout System Settings Component
function PayoutSystemSettings({
  settings,
  onSettingsChange,
}: {
  settings: AdminPayoutSettings
  onSettingsChange: (settings: AdminPayoutSettings) => void
}) {
  const formatCurrency = (amount: number) => `$${(amount / 100).toFixed(2)}`

  return (
    <div className="space-y-6">
      <Tabs defaultValue="limits" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="limits">Limits & Rules</TabsTrigger>
          <TabsTrigger value="schedule">Processing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="limits" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="auto-approval">Auto Approval Limit</Label>
                <Input
                  id="auto-approval"
                  type="number"
                  value={settings.autoApprovalLimit / 100}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      autoApprovalLimit: Number.parseFloat(e.target.value) * 100,
                    })
                  }
                />
                <p className="text-xs text-gray-600">Payouts under this amount are automatically approved</p>
              </div>

              <div>
                <Label htmlFor="daily-limit">Daily Payout Limit</Label>
                <Input
                  id="daily-limit"
                  type="number"
                  value={settings.dailyPayoutLimit / 100}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      dailyPayoutLimit: Number.parseFloat(e.target.value) * 100,
                    })
                  }
                />
                <p className="text-xs text-gray-600">Maximum payouts per user per day</p>
              </div>

              <div>
                <Label htmlFor="monthly-limit">Monthly Payout Limit</Label>
                <Input
                  id="monthly-limit"
                  type="number"
                  value={settings.monthlyPayoutLimit / 100}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      monthlyPayoutLimit: Number.parseFloat(e.target.value) * 100,
                    })
                  }
                />
                <p className="text-xs text-gray-600">Maximum payouts per user per month</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="account-age">Minimum Account Age (days)</Label>
                <Input
                  id="account-age"
                  type="number"
                  value={settings.minimumAccountAge}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      minimumAccountAge: Number.parseInt(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-gray-600">Account must exist this long before payouts</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="manual-review"
                  checked={settings.requireManualReview}
                  onCheckedChange={(checked) =>
                    onSettingsChange({
                      ...settings,
                      requireManualReview: checked,
                    })
                  }
                />
                <Label htmlFor="manual-review">Require Manual Review</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="risk-scoring"
                  checked={settings.enableRiskScoring}
                  onCheckedChange={(checked) =>
                    onSettingsChange({
                      ...settings,
                      enableRiskScoring: checked,
                    })
                  }
                />
                <Label htmlFor="risk-scoring">Enable Risk Scoring</Label>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="schedule-enabled"
                checked={settings.processingSchedule.enabled}
                onCheckedChange={(checked) =>
                  onSettingsChange({
                    ...settings,
                    processingSchedule: { ...settings.processingSchedule, enabled: checked },
                  })
                }
              />
              <Label htmlFor="schedule-enabled">Enable Scheduled Processing</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Processing Frequency</Label>
                <Select
                  value={settings.processingSchedule.frequency}
                  onValueChange={(value: "daily" | "weekly" | "biweekly") =>
                    onSettingsChange({
                      ...settings,
                      processingSchedule: { ...settings.processingSchedule, frequency: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cutoff-time">Cutoff Time</Label>
                <Input
                  id="cutoff-time"
                  type="time"
                  value={settings.processingSchedule.cutoffTime}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      processingSchedule: { ...settings.processingSchedule, cutoffTime: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Processing Days</Label>
              <div className="flex space-x-2 mt-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                  <div key={day} className="flex items-center space-x-1">
                    <Checkbox
                      id={`day-${index}`}
                      checked={settings.processingSchedule.processingDays.includes(index)}
                      onCheckedChange={(checked) => {
                        const days = checked
                          ? [...settings.processingSchedule.processingDays, index]
                          : settings.processingSchedule.processingDays.filter((d) => d !== index)
                        onSettingsChange({
                          ...settings,
                          processingSchedule: { ...settings.processingSchedule, processingDays: days },
                        })
                      }}
                    />
                    <Label htmlFor={`day-${index}`} className="text-sm">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="email-notifications"
                checked={settings.notifications.emailOnLargePayouts}
                onCheckedChange={(checked) =>
                  onSettingsChange({
                    ...settings,
                    notifications: { ...settings.notifications, emailOnLargePayouts: checked },
                  })
                }
              />
              <Label htmlFor="email-notifications">Email on Large Payouts</Label>
            </div>

            <div>
              <Label htmlFor="email-threshold">Email Threshold</Label>
              <Input
                id="email-threshold"
                type="number"
                value={settings.notifications.emailThreshold / 100}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      emailThreshold: Number.parseFloat(e.target.value) * 100,
                    },
                  })
                }
              />
              <p className="text-xs text-gray-600">Send email for payouts above this amount</p>
            </div>

            <div>
              <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
              <Input
                id="slack-webhook"
                type="url"
                value={settings.notifications.slackWebhook || ""}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    notifications: { ...settings.notifications, slackWebhook: e.target.value },
                  })
                }
                placeholder="https://hooks.slack.com/..."
              />
            </div>

            <div>
              <Label htmlFor="discord-webhook">Discord Webhook URL</Label>
              <Input
                id="discord-webhook"
                type="url"
                value={settings.notifications.discordWebhook || ""}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    notifications: { ...settings.notifications, discordWebhook: e.target.value },
                  })
                }
                placeholder="https://discord.com/api/webhooks/..."
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Hold Periods (days)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {Object.entries(settings.holdPeriods).map(([type, days]) => (
                  <div key={type}>
                    <Label htmlFor={`hold-${type}`}>{type.replace("_", " ").toUpperCase()}</Label>
                    <Input
                      id={`hold-${type}`}
                      type="number"
                      value={days}
                      onChange={(e) =>
                        onSettingsChange({
                          ...settings,
                          holdPeriods: {
                            ...settings.holdPeriods,
                            [type]: Number.parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save Settings</Button>
      </div>
    </div>
  )
}
