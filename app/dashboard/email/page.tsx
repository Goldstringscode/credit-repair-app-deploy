"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Mail, 
  Send, 
  Users, 
  BarChart3, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Zap,
  FileText,
  Settings,
  Download,
  Upload,
  TestTube,
  Bug,
  Wrench,
  Database
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface EmailCampaign {
  id: string
  name: string
  subject: string
  status: "draft" | "scheduled" | "sending" | "sent" | "paused"
  recipients: number
  sent: number
  opened: number
  clicked: number
  unsubscribed: number
  bounceRate: number
  openRate: number
  clickRate: number
  createdAt: string
  scheduledFor?: string
  template: string
  category: "marketing" | "transactional" | "newsletter" | "promotional"
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  category: string
  isDefault: boolean
  createdAt: string
  lastUsed?: string
  usageCount: number
}

interface EmailList {
  id: string
  name: string
  subscribers: number
  activeSubscribers: number
  unsubscribed: number
  createdAt: string
  lastUpdated: string
  tags: string[]
}

export default function EmailDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Mock data - in real app, this would come from API
  const [campaigns] = useState<EmailCampaign[]>([
    {
      id: "1",
      name: "Welcome Series - New Users",
      subject: "Welcome to Credit Repair AI!",
      status: "sent",
      recipients: 1250,
      sent: 1248,
      opened: 998,
      clicked: 234,
      unsubscribed: 2,
      bounceRate: 0.16,
      openRate: 79.9,
      clickRate: 18.7,
      createdAt: "2024-01-15",
      template: "welcome-series-1",
      category: "transactional"
    },
    {
      id: "2",
      name: "Credit Score Update Alert",
      subject: "Your Credit Score Has Improved!",
      status: "sending",
      recipients: 850,
      sent: 650,
      opened: 520,
      clicked: 89,
      unsubscribed: 0,
      bounceRate: 0.12,
      openRate: 80.0,
      clickRate: 13.7,
      createdAt: "2024-01-18",
      template: "credit-update",
      category: "transactional"
    },
    {
      id: "3",
      name: "Monthly Newsletter",
      subject: "Credit Tips & Updates - January 2024",
      status: "scheduled",
      recipients: 2100,
      sent: 0,
      opened: 0,
      clicked: 0,
      unsubscribed: 0,
      bounceRate: 0,
      openRate: 0,
      clickRate: 0,
      createdAt: "2024-01-20",
      scheduledFor: "2024-01-25T10:00:00Z",
      template: "newsletter-template",
      category: "newsletter"
    },
    {
      id: "4",
      name: "Dispute Letter Reminder",
      subject: "Don't Forget to Send Your Dispute Letters",
      status: "draft",
      recipients: 0,
      sent: 0,
      opened: 0,
      clicked: 0,
      unsubscribed: 0,
      bounceRate: 0,
      openRate: 0,
      clickRate: 0,
      createdAt: "2024-01-22",
      template: "dispute-reminder",
      category: "marketing"
    }
  ])

  const [templates] = useState<EmailTemplate[]>([
    {
      id: "1",
      name: "Welcome Email",
      subject: "Welcome to Credit Repair AI!",
      category: "transactional",
      isDefault: true,
      createdAt: "2024-01-01",
      lastUsed: "2024-01-15",
      usageCount: 45
    },
    {
      id: "2",
      name: "Credit Score Update",
      subject: "Your Credit Score Has Changed",
      category: "transactional",
      isDefault: true,
      createdAt: "2024-01-01",
      lastUsed: "2024-01-18",
      usageCount: 23
    },
    {
      id: "3",
      name: "Monthly Newsletter",
      subject: "Credit Tips & Updates",
      category: "newsletter",
      isDefault: false,
      createdAt: "2024-01-05",
      lastUsed: "2024-01-20",
      usageCount: 12
    },
    {
      id: "4",
      name: "Dispute Letter Reminder",
      subject: "Don't Forget Your Dispute Letters",
      category: "marketing",
      isDefault: false,
      createdAt: "2024-01-10",
      usageCount: 0
    }
  ])

  const [emailLists] = useState<EmailList[]>([
    {
      id: "1",
      name: "All Subscribers",
      subscribers: 2150,
      activeSubscribers: 1980,
      unsubscribed: 170,
      createdAt: "2024-01-01",
      lastUpdated: "2024-01-22",
      tags: ["all", "active"]
    },
    {
      id: "2",
      name: "Premium Users",
      subscribers: 450,
      activeSubscribers: 420,
      unsubscribed: 30,
      createdAt: "2024-01-01",
      lastUpdated: "2024-01-22",
      tags: ["premium", "active"]
    },
    {
      id: "3",
      name: "New Users (Last 30 Days)",
      subscribers: 180,
      activeSubscribers: 175,
      unsubscribed: 5,
      createdAt: "2024-01-01",
      lastUpdated: "2024-01-22",
      tags: ["new", "recent"]
    }
  ])

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
    const matchesCategory = categoryFilter === "all" || campaign.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "bg-green-100 text-green-800"
      case "sending": return "bg-blue-100 text-blue-800"
      case "scheduled": return "bg-yellow-100 text-yellow-800"
      case "draft": return "bg-gray-100 text-gray-800"
      case "paused": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "transactional": return "bg-blue-100 text-blue-800"
      case "marketing": return "bg-purple-100 text-purple-800"
      case "newsletter": return "bg-green-100 text-green-800"
      case "promotional": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const totalRecipients = campaigns.reduce((sum, campaign) => sum + campaign.recipients, 0)
  const totalSent = campaigns.reduce((sum, campaign) => sum + campaign.sent, 0)
  const totalOpened = campaigns.reduce((sum, campaign) => sum + campaign.opened, 0)
  const totalClicked = campaigns.reduce((sum, campaign) => sum + campaign.clicked, 0)
  const averageOpenRate = campaigns.length > 0 ? campaigns.reduce((sum, campaign) => sum + campaign.openRate, 0) / campaigns.length : 0
  const averageClickRate = campaigns.length > 0 ? campaigns.reduce((sum, campaign) => sum + campaign.clickRate, 0) / campaigns.length : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Email Marketing Dashboard</h1>
            <p className="text-gray-600">
              Manage your email campaigns, templates, and subscriber lists
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Import List</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              onClick={() => router.push('/dashboard/email/analytics')}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              onClick={() => router.push('/dashboard/email/lists')}
            >
              <Users className="h-4 w-4" />
              <span>Lists</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              onClick={() => router.push('/dashboard/email/templates/builder')}
            >
              <FileText className="h-4 w-4" />
              <span>Template Builder</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              onClick={() => router.push('/dashboard/email/templates-test')}
            >
              <TestTube className="h-4 w-4" />
              <span>Test Templates</span>
            </Button>
            <Button 
              className="flex items-center space-x-2"
              onClick={() => router.push('/dashboard/email/campaigns/create')}
            >
              <Plus className="h-4 w-4" />
              <span>Create Campaign</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                <p className="text-2xl font-bold">{totalRecipients.toLocaleString()}</p>
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
                <p className="text-2xl font-bold">{totalSent.toLocaleString()}</p>
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
                <p className="text-2xl font-bold">{averageOpenRate.toFixed(1)}%</p>
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
                <p className="text-2xl font-bold">{averageClickRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="lists">Lists</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Recent Campaigns</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.slice(0, 3).map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <p className="text-sm text-gray-600">{campaign.subject}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {campaign.sent.toLocaleString()} sent
                          </span>
                          <span className="text-xs text-gray-500">
                            {campaign.openRate.toFixed(1)}% open rate
                          </span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Email Lists Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Email Lists</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emailLists.map((list) => (
                    <div key={list.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{list.name}</h4>
                        <p className="text-sm text-gray-600">
                          {list.activeSubscribers.toLocaleString()} active subscribers
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {list.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{list.subscribers.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Email Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Email performance chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="sending">Sending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns List */}
          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>
                Manage your email campaigns and track their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCampaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">{campaign.name}</h4>
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                          <Badge className={getCategoryColor(campaign.category)}>
                            {campaign.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{campaign.subject}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Recipients</p>
                            <p className="font-medium">{campaign.recipients.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Sent</p>
                            <p className="font-medium">{campaign.sent.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Open Rate</p>
                            <p className="font-medium">{campaign.openRate.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Click Rate</p>
                            <p className="font-medium">{campaign.clickRate.toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>
                    Create and manage your email templates
                  </CardDescription>
                </div>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>New Template</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      {template.isDefault && (
                        <Badge variant="outline" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.subject}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{template.category}</span>
                      <span>Used {template.usageCount} times</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lists Tab */}
        <TabsContent value="lists" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Email Lists</CardTitle>
                  <CardDescription>
                    Manage your subscriber lists and segments
                  </CardDescription>
                </div>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>New List</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailLists.map((list) => (
                  <div key={list.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">{list.name}</h4>
                          <div className="flex items-center space-x-2">
                            {list.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Total Subscribers</p>
                            <p className="font-medium">{list.subscribers.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Active</p>
                            <p className="font-medium text-green-600">{list.activeSubscribers.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Unsubscribed</p>
                            <p className="font-medium text-red-600">{list.unsubscribed.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
