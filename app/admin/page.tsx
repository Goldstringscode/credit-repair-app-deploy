"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  DollarSign,
  Activity,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Shield,
  Database,
  Mail,
  UserCheck,
  Eye,
  Edit,
  Trash2,
  Send,
  BarChart3,
  FileText,
  Target,
  Clock,
  Users as UsersIcon,
  Settings,
  TestTube,
  Plus,
  TrendingUp,
  CheckCircle,
  CreditCard,
  TrendingDown,
  Upload,
} from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("overview")

  // Mock data
  const systemStats = {
    totalUsers: 12847,
    activeUsers: 8932,
    totalRevenue: 2847392,
    monthlyGrowth: 12.5,
    systemHealth: 98.7,
    activeDisputes: 1247,
    completedDisputes: 8934,
    pendingPayments: 23,
  }

  const recentUsers = [
    {
      id: 1,
      name: "John Smith",
      email: "john@example.com",
      plan: "Professional",
      status: "Active",
      joined: "2024-01-15",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      plan: "Premium",
      status: "Active",
      joined: "2024-01-14",
    },
    { id: 3, name: "Mike Davis", email: "mike@example.com", plan: "Basic", status: "Suspended", joined: "2024-01-13" },
    {
      id: 4,
      name: "Lisa Wilson",
      email: "lisa@example.com",
      plan: "Professional",
      status: "Active",
      joined: "2024-01-12",
    },
    { id: 5, name: "Tom Brown", email: "tom@example.com", plan: "Premium", status: "Pending", joined: "2024-01-11" },
  ]

  const systemAlerts = [
    { id: 1, type: "warning", message: "High API usage detected", time: "2 minutes ago" },
    { id: 2, type: "info", message: "Scheduled maintenance in 24 hours", time: "1 hour ago" },
    { id: 3, type: "error", message: "Payment gateway timeout", time: "3 hours ago" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, monitor system performance, and configure platform settings.</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+{systemStats.monthlyGrowth}% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {((systemStats.activeUsers / systemStats.totalUsers) * 100).toFixed(1)}% active rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${systemStats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+{systemStats.monthlyGrowth}% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.systemHealth}%</div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            user.status === "Active"
                              ? "default"
                              : user.status === "Suspended"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {user.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{user.joined}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Recent system notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3">
                      <div
                        className={`p-1 rounded-full ${
                          alert.type === "error"
                            ? "bg-red-100"
                            : alert.type === "warning"
                              ? "bg-yellow-100"
                              : "bg-blue-100"
                        }`}
                      >
                        <AlertTriangle
                          className={`h-3 w-3 ${
                            alert.type === "error"
                              ? "text-red-600"
                              : alert.type === "warning"
                                ? "text-yellow-600"
                                : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-gray-500">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* User Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage all platform users</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Link href="/admin/users">
                    <Button size="sm">Add User</Button>
                  </Link>
                  <Link href="/admin/users">
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Full Users Page
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-blue-900">Full User Management</h3>
                    <p className="text-sm text-blue-700">Access the complete user management system with advanced features</p>
                  </div>
                  <Link href="/admin/users">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Users className="h-4 w-4 mr-2" />
                      Go to Users Page
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="border rounded-lg">
                <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 font-medium text-sm">
                  <div>User</div>
                  <div>Plan</div>
                  <div>Status</div>
                  <div>Joined</div>
                  <div>Revenue</div>
                  <div>Actions</div>
                </div>
                {recentUsers.map((user) => (
                  <div key={user.id} className="grid grid-cols-6 gap-4 p-4 border-t">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div>
                      <Badge variant="outline">{user.plan}</Badge>
                    </div>
                    <div>
                      <Badge
                        variant={
                          user.status === "Active"
                            ? "default"
                            : user.status === "Suspended"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {user.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">{user.joined}</div>
                    <div className="font-medium">$1,247</div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

    <TabsContent value="email" className="space-y-6">
      {/* Complete Email Marketing Dashboard */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Email Marketing Dashboard</h2>
            <p className="text-gray-600">
              Manage email campaigns, templates, and subscriber lists
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Import List</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Lists</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Template Builder</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <TestTube className="h-4 w-4" />
              <span>Test Templates</span>
            </Button>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Campaign</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Email Marketing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                <p className="text-2xl font-bold">15,420</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Send className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                <p className="text-2xl font-bold">12,847</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold">24.8%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold">8.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Management Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Email Analytics
            </CardTitle>
            <CardDescription>Comprehensive email performance analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics Dashboard
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TestTube className="h-4 w-4 mr-2" />
              Test Email Templates
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Email Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Template Management
            </CardTitle>
            <CardDescription>Create and manage email templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Create New Template
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              View All Templates
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Template Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              List Management
            </CardTitle>
            <CardDescription>Manage email lists and segments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Manage Lists
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Target className="h-4 w-4 mr-2" />
              Create Segments
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Import Lists
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Email Campaigns */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>Manage and monitor email campaigns</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Campaign List */}
            <div className="border rounded-lg">
              <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 font-medium text-sm">
                <div>Campaign</div>
                <div>Status</div>
                <div>Recipients</div>
                <div>Open Rate</div>
                <div>Click Rate</div>
                <div>Actions</div>
              </div>

              {/* Sample Campaign Data */}
              <div className="grid grid-cols-6 gap-4 p-4 border-t">
                <div>
                  <p className="font-medium">Welcome Series</p>
                  <p className="text-sm text-gray-500">New user onboarding</p>
                </div>
                <div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div>2,847</div>
                <div>28.5%</div>
                <div>12.3%</div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-4 p-4 border-t">
                <div>
                  <p className="font-medium">Credit Score Update</p>
                  <p className="text-sm text-gray-500">Monthly score notifications</p>
                </div>
                <div>
                  <Badge variant="secondary">Scheduled</Badge>
                </div>
                <div>5,234</div>
                <div>31.2%</div>
                <div>15.7%</div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-4 p-4 border-t">
                <div>
                  <p className="font-medium">Payment Reminder</p>
                  <p className="text-sm text-gray-500">Billing notifications</p>
                </div>
                <div>
                  <Badge variant="outline">Draft</Badge>
                </div>
                <div>1,156</div>
                <div>-</div>
                <div>-</div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Manage email templates and designs</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Template Cards */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Welcome Email</h4>
                  <Badge variant="default">Active</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-3">New user onboarding template</p>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <TestTube className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Payment Confirmation</h4>
                  <Badge variant="default">Active</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-3">Payment success notification</p>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <TestTube className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Credit Score Update</h4>
                  <Badge variant="secondary">Draft</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-3">Score improvement notification</p>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <TestTube className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email System Status */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Email Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Status</span>
                <Badge variant="default">Operational</Badge>
              </div>
              <div className="flex justify-between">
                <span>Queue</span>
                <span>23 pending</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Rate</span>
                <span>99.2%</span>
              </div>
              <div className="flex justify-between">
                <span>Last Sent</span>
                <span>2 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Scheduled Emails
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Pending</span>
                <span>12</span>
              </div>
              <div className="flex justify-between">
                <span>Today</span>
                <span>8</span>
              </div>
              <div className="flex justify-between">
                <span>This Week</span>
                <span>45</span>
              </div>
              <div className="flex justify-between">
                <span>Next Run</span>
                <span>In 2 hours</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Avg Open Rate</span>
                <span>24.8%</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Click Rate</span>
                <span>8.2%</span>
              </div>
              <div className="flex justify-between">
                <span>Unsubscribe Rate</span>
                <span>0.3%</span>
              </div>
              <div className="flex justify-between">
                <span>Bounce Rate</span>
                <span>1.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">GDPR Compliance</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">98.5%</div>
                <p className="text-xs text-muted-foreground">+0.2% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">FCRA Compliance</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">99.1%</div>
                <p className="text-xs text-muted-foreground">+0.1% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CCPA Compliance</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">97.8%</div>
                <p className="text-xs text-muted-foreground">+0.3% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PCI DSS</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">100%</div>
                <p className="text-xs text-muted-foreground">Fully compliant</p>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Management Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  GDPR Management
                </CardTitle>
                <CardDescription>Manage GDPR compliance and data protection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/compliance">
                  <Button className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Full Compliance Dashboard
                  </Button>
                </Link>
                <Link href="/admin/compliance">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Data Export Requests
                  </Button>
                </Link>
                <Link href="/admin/compliance">
                  <Button className="w-full justify-start" variant="outline">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Data Deletion Requests
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  FCRA Management
                </CardTitle>
                <CardDescription>Fair Credit Reporting Act compliance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/letters/generate">
                  <Button className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Dispute Management
                  </Button>
                </Link>
                <Link href="/dashboard/letters">
                  <Button className="w-full justify-start" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Credit Report Requests
                  </Button>
                </Link>
                <Link href="/admin/compliance">
                  <Button className="w-full justify-start" variant="outline">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Compliance Monitoring
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  PCI DSS Management
                </CardTitle>
                <CardDescription>Payment card industry compliance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/compliance">
                  <Button className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Security Monitoring
                  </Button>
                </Link>
                <Link href="/admin/compliance">
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Vulnerability Assessment
                  </Button>
                </Link>
                <Link href="/admin/compliance">
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Compliance Reports
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Status Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Compliance Status Overview</CardTitle>
                  <CardDescription>Real-time compliance monitoring and management</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Link href="/admin/compliance">
                    <Button size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Full Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">98.5%</div>
                    <p className="text-sm font-medium">GDPR Compliance</p>
                    <p className="text-xs text-gray-500">Data Protection</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">99.1%</div>
                    <p className="text-sm font-medium">FCRA Compliance</p>
                    <p className="text-xs text-gray-500">Credit Reporting</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">97.8%</div>
                    <p className="text-sm font-medium">CCPA Compliance</p>
                    <p className="text-xs text-gray-500">Privacy Rights</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">100%</div>
                    <p className="text-sm font-medium">PCI DSS</p>
                    <p className="text-xs text-gray-500">Payment Security</p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-center space-x-4">
                  <Link href="/admin/compliance">
                    <Button>
                      <Shield className="h-4 w-4 mr-2" />
                      Access Full Compliance Dashboard
                    </Button>
                  </Link>
                  <Link href="/admin/compliance">
                    <Button variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Compliance Reports
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Compliance Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Compliance Events</CardTitle>
              <CardDescription>Latest compliance activities and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">GDPR Data Export Completed</p>
                      <p className="text-sm text-gray-500">User ID: 12345 - 2 minutes ago</p>
                    </div>
                  </div>
                  <Badge variant="default">Completed</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">FCRA Dispute Submitted</p>
                      <p className="text-sm text-gray-500">Account: Chase Bank - 15 minutes ago</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Processing</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">CCPA Deletion Request</p>
                      <p className="text-sm text-gray-500">User ID: 67890 - 1 hour ago</p>
                    </div>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Shield className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">PCI Security Scan Completed</p>
                      <p className="text-sm text-gray-500">All systems secure - 2 hours ago</p>
                    </div>
                  </div>
                  <Badge variant="default">Secure</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          {/* System Health */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Connections</span>
                    <span>47/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Response Time</span>
                    <span>12ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Email Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge variant="default">Operational</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Queue</span>
                    <span>23 pending</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Rate</span>
                    <span>99.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge variant="default">Secure</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed Logins</span>
                    <span>3 today</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SSL</span>
                    <span>Valid</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          {/* Billing Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$125,000</div>
                <p className="text-xs text-muted-foreground">+3.2% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,250</div>
                <p className="text-xs text-muted-foreground">+12.5% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payment Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.0%</div>
                <p className="text-xs text-muted-foreground">+0.1% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.86%</div>
                <p className="text-xs text-muted-foreground">-0.2% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Billing Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription Management
                </CardTitle>
                <CardDescription>Manage customer subscriptions and billing cycles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/billing/subscriptions">
                  <Button className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    View All Subscriptions
                  </Button>
                </Link>
                <Link href="/admin/billing/payments">
                  <Button className="w-full justify-start" variant="outline">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Payment Management
                  </Button>
                </Link>
                <Link href="/admin/billing/analytics">
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Billing Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest billing events and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">New subscription created</p>
                      <p className="text-gray-600">Premium Plan - John Doe</p>
                    </div>
                    <span className="text-xs text-gray-500">2 min ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">Payment processed</p>
                      <p className="text-gray-600">$59.99 - Jane Smith</p>
                    </div>
                    <span className="text-xs text-gray-500">5 min ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">Subscription cancelled</p>
                      <p className="text-gray-600">Basic Plan - Bob Johnson</p>
                    </div>
                    <span className="text-xs text-gray-500">1 hour ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Billing Alerts
                </CardTitle>
                <CardDescription>Issues requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-yellow-600">Failed Payments</p>
                      <p className="text-gray-600">3 payments need retry</p>
                    </div>
                    <Badge variant="destructive">3</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-blue-600">Expiring Trials</p>
                      <p className="text-gray-600">12 trials ending soon</p>
                    </div>
                    <Badge variant="secondary">12</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-red-600">Past Due</p>
                      <p className="text-gray-600">5 subscriptions past due</p>
                    </div>
                    <Badge variant="destructive">5</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Billing Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Overview</CardTitle>
              <CardDescription>Comprehensive billing management and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">$125,000</div>
                  <p className="text-sm text-gray-600">Monthly Recurring Revenue</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">1,250</div>
                  <p className="text-sm text-gray-600">Active Subscriptions</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">$89.99</div>
                  <p className="text-sm text-gray-600">Average Revenue Per User</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">0.86%</div>
                  <p className="text-sm text-gray-600">Churn Rate</p>
                </div>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <Link href="/admin/billing">
                  <Button>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Full Billing Dashboard
                  </Button>
                </Link>
                <Link href="/test-advanced-billing">
                  <Button variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    Test Billing Features
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Manage platform settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">General Settings</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Platform Name</label>
                    <Input defaultValue="CreditAI Pro" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Support Email</label>
                    <Input defaultValue="support@creditaipro.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Users</label>
                    <Input defaultValue="50000" type="number" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Security Settings</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Session Timeout (minutes)</label>
                    <Input defaultValue="30" type="number" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Login Attempts</label>
                    <Input defaultValue="5" type="number" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password Min Length</label>
                    <Input defaultValue="8" type="number" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
