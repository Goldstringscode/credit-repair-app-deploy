"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Mail,
  Send,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  FileText,
  Users,
  BarChart3,
  Plus,
  Eye,
  Download,
  Search,
  Calendar,
  MapPin,
  Building,
  Edit,
  Star,
  Filter,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react"
import Link from "next/link"

interface MailItem {
  id: string
  recipient: {
    name: string
    company: string
    address: string
    city: string
    state: string
    zip: string
  }
  subject: string
  content: string
  status: "draft" | "processing" | "sent" | "in_transit" | "delivered" | "failed"
  trackingNumber?: string
  cost: number
  services: string[]
  sentDate?: string
  deliveredDate?: string
  estimatedDelivery?: string
  createdAt: string
  priority: "normal" | "high" | "urgent"
  attachments: number
}

export default function CertifiedMailPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedMail, setSelectedMail] = useState<MailItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  const [mailItems] = useState<MailItem[]>([
    {
      id: "1",
      recipient: {
        name: "Experian Information Solutions",
        company: "Experian",
        address: "P.O. Box 4500",
        city: "Allen",
        state: "TX",
        zip: "75013",
      },
      subject: "Credit Report Dispute - Account Verification Required",
      content:
        "Dear Experian Team,\n\nI am writing to dispute the following information on my credit report that I believe to be inaccurate...",
      status: "delivered",
      trackingNumber: "9405511206213414161234",
      cost: 7.43,
      services: ["certified", "return_receipt"],
      sentDate: "2024-01-15",
      deliveredDate: "2024-01-17",
      createdAt: "2024-01-15",
      priority: "high",
      attachments: 3,
    },
    {
      id: "2",
      recipient: {
        name: "TransUnion Consumer Relations",
        company: "TransUnion",
        address: "P.O. Box 2000",
        city: "Chester",
        state: "PA",
        zip: "19016",
      },
      subject: "Identity Theft Dispute Letter - Fraudulent Accounts",
      content:
        "Dear TransUnion,\n\nI am writing to report fraudulent accounts on my credit report that were opened without my authorization...",
      status: "in_transit",
      trackingNumber: "9405511206213414161235",
      cost: 12.48,
      services: ["certified", "return_receipt", "restricted_delivery"],
      sentDate: "2024-01-18",
      estimatedDelivery: "2024-01-22",
      createdAt: "2024-01-18",
      priority: "urgent",
      attachments: 5,
    },
    {
      id: "3",
      recipient: {
        name: "Capital One Customer Service",
        company: "Capital One",
        address: "P.O. Box 30285",
        city: "Salt Lake City",
        state: "UT",
        zip: "84130",
      },
      subject: "Goodwill Letter - Late Payment Removal Request",
      content:
        "Dear Capital One Team,\n\nI hope this letter finds you well. I am writing as a long-standing customer to request your consideration...",
      status: "processing",
      cost: 7.43,
      services: ["certified", "return_receipt"],
      createdAt: "2024-01-20",
      priority: "normal",
      attachments: 2,
    },
    {
      id: "4",
      recipient: {
        name: "Equifax Information Services",
        company: "Equifax",
        address: "P.O. Box 740256",
        city: "Atlanta",
        state: "GA",
        zip: "30374",
      },
      subject: "Credit Report Dispute - Inaccurate Payment History",
      content:
        "Dear Equifax,\n\nI am disputing the following items on my credit report that contain inaccurate payment history information...",
      status: "draft",
      cost: 7.43,
      services: ["certified", "return_receipt"],
      createdAt: "2024-01-21",
      priority: "normal",
      attachments: 1,
    },
    {
      id: "5",
      recipient: {
        name: "Chase Bank Collections",
        company: "JPMorgan Chase",
        address: "P.O. Box 15298",
        city: "Wilmington",
        state: "DE",
        zip: "19850",
      },
      subject: "Debt Validation Request - Account #****1234",
      content:
        "Dear Sir or Madam,\n\nThis letter is sent in response to a notice I received from you. This is NOT a refusal to pay...",
      status: "sent",
      trackingNumber: "9405511206213414161236",
      cost: 7.43,
      services: ["certified", "return_receipt"],
      sentDate: "2024-01-19",
      estimatedDelivery: "2024-01-23",
      createdAt: "2024-01-19",
      priority: "high",
      attachments: 4,
    },
    {
      id: "6",
      recipient: {
        name: "Midland Credit Management",
        company: "Midland Credit",
        address: "P.O. Box 2365",
        city: "San Diego",
        state: "CA",
        zip: "92112",
      },
      subject: "Cease and Desist Communication Request",
      content:
        "You are hereby notified under the provisions of Public Law 95-109, Section 805-C of the Fair Debt Collection Practices Act...",
      status: "delivered",
      trackingNumber: "9405511206213414161237",
      cost: 7.43,
      services: ["certified", "return_receipt"],
      sentDate: "2024-01-14",
      deliveredDate: "2024-01-16",
      createdAt: "2024-01-14",
      priority: "urgent",
      attachments: 1,
    },
  ])

  const stats = {
    totalSent: mailItems.filter((m) => ["sent", "in_transit", "delivered"].includes(m.status)).length,
    delivered: mailItems.filter((m) => m.status === "delivered").length,
    inTransit: mailItems.filter((m) => m.status === "in_transit").length,
    processing: mailItems.filter((m) => m.status === "processing").length,
    drafts: mailItems.filter((m) => m.status === "draft").length,
    totalCost: mailItems.reduce((sum, item) => sum + item.cost, 0),
    avgDeliveryTime: "2.3 days",
    successRate: 94.2,
    thisMonth: {
      sent: 23,
      delivered: 21,
      revenue: 187.45,
      growth: 18.7,
    },
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <FileText className="h-4 w-4 text-gray-500" />
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "sent":
        return <Send className="h-4 w-4 text-blue-500" />
      case "in_transit":
        return <Truck className="h-4 w-4 text-blue-500" />
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "in_transit":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "normal":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredMails = mailItems.filter((mail) => {
    const matchesSearch =
      mail.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mail.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mail.recipient.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mail.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || mail.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Certified Mail Center</h1>
              <p className="text-gray-600 mt-1">Professional mail delivery with USPS tracking and legal compliance</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-4 w-4 mr-1" />
                {stats.successRate}% Success Rate
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                <Shield className="h-4 w-4 mr-1" />
                USPS Certified
              </Badge>
              <Link href="/dashboard/letters/certified-mail/compose">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Compose Mail
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="compose">Quick Compose</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Sent</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalSent}</p>
                      <p className="text-xs text-green-600 mt-1">+{stats.thisMonth.growth}% this month</p>
                    </div>
                    <div className="bg-blue-100 rounded-full p-3">
                      <Send className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Delivered</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.delivered}</p>
                      <p className="text-xs text-gray-500 mt-1">{stats.successRate}% success rate</p>
                    </div>
                    <div className="bg-green-100 rounded-full p-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Transit</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.inTransit}</p>
                      <p className="text-xs text-gray-500 mt-1">Avg {stats.avgDeliveryTime}</p>
                    </div>
                    <div className="bg-yellow-100 rounded-full p-3">
                      <Truck className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">${stats.thisMonth.revenue}</p>
                      <p className="text-xs text-green-600 mt-1">+{stats.thisMonth.growth}% growth</p>
                    </div>
                    <div className="bg-purple-100 rounded-full p-3">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-4 gap-4">
              <Link href="/dashboard/letters/certified-mail/compose">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-3">
                      <Plus className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">New Letter</h3>
                    <p className="text-sm text-gray-600 mt-1">Create professional dispute letter</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/letters/certified-mail/bulk">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="bg-green-100 rounded-full p-3 w-fit mx-auto mb-3">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Bulk Mail</h3>
                    <p className="text-sm text-gray-600 mt-1">Send to multiple recipients</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/letters/certified-mail/templates">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="bg-purple-100 rounded-full p-3 w-fit mx-auto mb-3">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Templates</h3>
                    <p className="text-sm text-gray-600 mt-1">Professional letter templates</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/letters/certified-mail/address-book">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="bg-orange-100 rounded-full p-3 w-fit mx-auto mb-3">
                      <Building className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Address Book</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage your contacts</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Recent Mail */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Recent Mail
                  </CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search mail..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredMails.map((mail) => (
                    <div
                      key={mail.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedMail(mail)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h3 className="font-semibold text-lg">{mail.recipient.name}</h3>
                            <p className="text-sm text-gray-600">{mail.recipient.company}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(mail.status)}>
                              {getStatusIcon(mail.status)}
                              <span className="ml-1 capitalize">{mail.status.replace("_", " ")}</span>
                            </Badge>
                            <Badge className={getPriorityColor(mail.priority)}>
                              {mail.priority === "urgent" && <Zap className="h-3 w-3 mr-1" />}
                              {mail.priority.charAt(0).toUpperCase() + mail.priority.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">${mail.cost.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">{mail.createdAt}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-600">Subject</p>
                          <p className="font-medium truncate">{mail.subject}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Address</p>
                          <p className="font-medium">
                            {mail.recipient.city}, {mail.recipient.state}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Tracking</p>
                          <p className="font-medium font-mono text-xs">{mail.trackingNumber || "Not assigned"}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Attachments</p>
                          <p className="font-medium">{mail.attachments} files</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>Services:</span>
                          {mail.services.map((service) => (
                            <Badge key={service} variant="outline" className="text-xs">
                              {service.replace("_", " ")}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>

                      {mail.status === "in_transit" && mail.estimatedDelivery && (
                        <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <Truck className="h-4 w-4 inline mr-1" />
                            Estimated delivery: {mail.estimatedDelivery}
                          </p>
                        </div>
                      )}

                      {mail.status === "delivered" && mail.deliveredDate && (
                        <div className="mt-3 p-2 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Delivered on {mail.deliveredDate}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredMails.length === 0 && (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No mail found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
                    <Link href="/dashboard/letters/certified-mail/compose">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Mail
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Compose Tab */}
          <TabsContent value="compose" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Compose</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Professional Mail</h3>
                  <p className="text-gray-600 mb-6">
                    Use our advanced composer to create and send certified mail with USPS tracking
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <Link href="/dashboard/letters/certified-mail/compose">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        New Letter
                      </Button>
                    </Link>
                    <Link href="/dashboard/letters/certified-mail/bulk">
                      <Button variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Bulk Mail
                      </Button>
                    </Link>
                    <Link href="/dashboard/letters/certified-mail/templates">
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Templates
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Mail Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mailItems
                    .filter((m) => m.trackingNumber)
                    .map((mail) => (
                      <div key={mail.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">{mail.recipient.name}</h3>
                            <p className="text-sm text-gray-600">{mail.subject}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(mail.status)}>
                              {getStatusIcon(mail.status)}
                              <span className="ml-1 capitalize">{mail.status.replace("_", " ")}</span>
                            </Badge>
                            <Badge className={getPriorityColor(mail.priority)}>{mail.priority}</Badge>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Tracking Number</p>
                            <p className="font-mono text-sm font-semibold">{mail.trackingNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Sent Date</p>
                            <p className="font-semibold">{mail.sentDate || "Not sent"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Cost</p>
                            <p className="font-semibold text-green-600">${mail.cost.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Tracking Progress */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>Delivery Progress</span>
                            <span>
                              {mail.status === "delivered"
                                ? "100%"
                                : mail.status === "in_transit"
                                  ? "75%"
                                  : mail.status === "sent"
                                    ? "50%"
                                    : "25%"}
                            </span>
                          </div>
                          <Progress
                            value={
                              mail.status === "delivered"
                                ? 100
                                : mail.status === "in_transit"
                                  ? 75
                                  : mail.status === "sent"
                                    ? 50
                                    : 25
                            }
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Processing</span>
                            <span>Sent</span>
                            <span>In Transit</span>
                            <span>Delivered</span>
                          </div>
                        </div>

                        {mail.estimatedDelivery && mail.status !== "delivered" && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <Calendar className="h-4 w-4 inline mr-1" />
                              Estimated delivery: {mail.estimatedDelivery}
                            </p>
                          </div>
                        )}

                        {mail.status === "delivered" && mail.deliveredDate && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800">
                              <CheckCircle className="h-4 w-4 inline mr-1" />
                              Successfully delivered on {mail.deliveredDate}
                            </p>
                          </div>
                        )}
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
                <CardTitle>Professional Mail Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Templates</h3>
                  <p className="text-gray-600 mb-6">
                    Access our library of proven letter templates for credit repair and debt management
                  </p>
                  <Link href="/dashboard/letters/certified-mail/templates">
                    <Button>
                      <FileText className="h-4 w-4 mr-2" />
                      Browse Templates
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.successRate}%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                  <div className="text-xs text-green-600 mt-1">+2.1% improvement</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.avgDeliveryTime}</div>
                  <div className="text-sm text-gray-600">Avg Delivery</div>
                  <div className="text-xs text-green-600 mt-1">-0.4 days faster</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">${stats.totalCost.toFixed(0)}</div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                  <div className="text-xs text-gray-600 mt-1">This period</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-3">
                    <Star className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">4.8</div>
                  <div className="text-sm text-gray-600">Customer Rating</div>
                  <div className="text-xs text-green-600 mt-1">+0.2 improvement</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Analytics</h3>
                  <p className="text-gray-600 mb-6">Track performance, optimize campaigns, and measure success rates</p>
                  <Link href="/dashboard/letters/certified-mail/analytics">
                    <Button>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Detailed Analytics
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mail Detail Dialog */}
      {selectedMail && (
        <Dialog open={!!selectedMail} onOpenChange={() => setSelectedMail(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <span>{selectedMail.recipient.name}</span>
                <Badge className={getStatusColor(selectedMail.status)}>
                  {getStatusIcon(selectedMail.status)}
                  <span className="ml-1 capitalize">{selectedMail.status.replace("_", " ")}</span>
                </Badge>
                <Badge className={getPriorityColor(selectedMail.priority)}>{selectedMail.priority}</Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Recipient Information</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">{selectedMail.recipient.company}</span>
                    </p>
                    <p className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      {selectedMail.recipient.address}
                    </p>
                    <p className="ml-6">
                      {selectedMail.recipient.city}, {selectedMail.recipient.state} {selectedMail.recipient.zip}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Mail Details</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">Cost:</span>{" "}
                      <span className="font-semibold text-green-600">${selectedMail.cost.toFixed(2)}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Services:</span> {selectedMail.services.join(", ")}
                    </p>
                    <p>
                      <span className="text-gray-600">Attachments:</span> {selectedMail.attachments} files
                    </p>
                    {selectedMail.trackingNumber && (
                      <p>
                        <span className="text-gray-600">Tracking:</span>{" "}
                        <span className="font-mono text-xs">{selectedMail.trackingNumber}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Subject</h4>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedMail.subject}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Content Preview</h4>
                <div className="text-sm bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {selectedMail.content}
                </div>
              </div>

              {selectedMail.trackingNumber && (
                <div>
                  <h4 className="font-semibold mb-2">Tracking Information</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Tracking Number: {selectedMail.trackingNumber}</span>
                      <Badge className={getStatusColor(selectedMail.status)}>
                        {getStatusIcon(selectedMail.status)}
                        <span className="ml-1 capitalize">{selectedMail.status.replace("_", " ")}</span>
                      </Badge>
                    </div>
                    {selectedMail.sentDate && <p className="text-sm text-blue-700">Sent: {selectedMail.sentDate}</p>}
                    {selectedMail.estimatedDelivery && selectedMail.status !== "delivered" && (
                      <p className="text-sm text-blue-700">Estimated Delivery: {selectedMail.estimatedDelivery}</p>
                    )}
                    {selectedMail.deliveredDate && (
                      <p className="text-sm text-green-700">Delivered: {selectedMail.deliveredDate}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Created: {selectedMail.createdAt}
                  {selectedMail.sentDate && ` • Sent: ${selectedMail.sentDate}`}
                  {selectedMail.deliveredDate && ` • Delivered: ${selectedMail.deliveredDate}`}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Track
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
