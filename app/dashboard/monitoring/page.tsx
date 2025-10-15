"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  MapPin,
  Calendar,
  Package,
  Mail,
  Phone,
  Building,
  User,
  CreditCard,
  Shield,
  BarChart3,
  Bell,
  Activity
} from "lucide-react"

interface LetterTracking {
  id: string
  letterType: string
  recipient: string
  recipientAddress: string
  trackingNumber: string
  status: "sent" | "in_transit" | "delivered" | "returned" | "pending"
  sentDate: string
  expectedDelivery: string
  actualDelivery?: string
  currentLocation: string
  lastUpdate: string
  disputeType: string
  creditBureau: string
  certifiedMail: boolean
  returnReceipt: boolean
  notes?: string
}

export default function LetterMonitoringPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [bureauFilter, setBureauFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data - in real app, this would come from API
  const [letters] = useState<LetterTracking[]>([
    {
      id: "1",
      letterType: "Dispute Letter - Collection Account",
      recipient: "Experian Information Solutions",
      recipientAddress: "P.O. Box 4500, Allen, TX 75013",
      trackingNumber: "9405 5036 9930 0000 0000 00",
      status: "delivered",
      sentDate: "2024-01-15",
      expectedDelivery: "2024-01-18",
      actualDelivery: "2024-01-17",
      currentLocation: "Delivered to Allen, TX",
      lastUpdate: "2024-01-17 14:32",
      disputeType: "Collection Account Removal",
      creditBureau: "Experian",
      certifiedMail: true,
      returnReceipt: true,
      notes: "Account #123456789 - Capital One Collection"
    },
    {
      id: "2",
      letterType: "Dispute Letter - Late Payment",
      recipient: "Equifax Information Services",
      recipientAddress: "P.O. Box 740256, Atlanta, GA 30374",
      trackingNumber: "9405 5036 9930 0000 0000 01",
      status: "in_transit",
      sentDate: "2024-01-20",
      expectedDelivery: "2024-01-23",
      currentLocation: "In Transit - Memphis, TN",
      lastUpdate: "2024-01-22 09:15",
      disputeType: "Late Payment Dispute",
      creditBureau: "Equifax",
      certifiedMail: true,
      returnReceipt: false,
      notes: "Account #987654321 - Chase Credit Card"
    },
    {
      id: "3",
      letterType: "Dispute Letter - Identity Theft",
      recipient: "TransUnion LLC",
      recipientAddress: "P.O. Box 2000, Chester, PA 19016",
      trackingNumber: "9405 5036 9930 0000 0000 02",
      status: "sent",
      sentDate: "2024-01-25",
      expectedDelivery: "2024-01-28",
      currentLocation: "Processing at Origin Facility",
      lastUpdate: "2024-01-25 16:45",
      disputeType: "Identity Theft Affidavit",
      creditBureau: "TransUnion",
      certifiedMail: true,
      returnReceipt: true,
      notes: "Identity theft case #IT-2024-001"
    },
    {
      id: "4",
      letterType: "Dispute Letter - Incorrect Balance",
      recipient: "Experian Information Solutions",
      recipientAddress: "P.O. Box 4500, Allen, TX 75013",
      trackingNumber: "9405 5036 9930 0000 0000 03",
      status: "returned",
      sentDate: "2024-01-10",
      expectedDelivery: "2024-01-13",
      actualDelivery: "2024-01-12",
      currentLocation: "Returned to Sender",
      lastUpdate: "2024-01-15 11:20",
      disputeType: "Balance Dispute",
      creditBureau: "Experian",
      certifiedMail: true,
      returnReceipt: false,
      notes: "Account #456789123 - Bank of America - Incorrect balance reported"
    }
  ])

  const filteredLetters = letters.filter(letter => {
    const matchesSearch = letter.letterType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         letter.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         letter.trackingNumber.includes(searchTerm) ||
                         letter.disputeType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || letter.status === statusFilter
    const matchesBureau = bureauFilter === "all" || letter.creditBureau === bureauFilter
    return matchesSearch && matchesStatus && matchesBureau
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-800"
      case "in_transit": return "bg-blue-100 text-blue-800"
      case "sent": return "bg-yellow-100 text-yellow-800"
      case "returned": return "bg-red-100 text-red-800"
      case "pending": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered": return <CheckCircle className="h-4 w-4" />
      case "in_transit": return <Truck className="h-4 w-4" />
      case "sent": return <Mail className="h-4 w-4" />
      case "returned": return <AlertCircle className="h-4 w-4" />
      case "pending": return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const totalLetters = letters.length
  const deliveredLetters = letters.filter(l => l.status === "delivered").length
  const inTransitLetters = letters.filter(l => l.status === "in_transit").length
  const pendingLetters = letters.filter(l => l.status === "sent" || l.status === "pending").length
  const returnedLetters = letters.filter(l => l.status === "returned").length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Letter Monitoring</h1>
          <p className="text-gray-600 mt-2">
            Track your dispute letters, monitor delivery status, and manage your credit repair process
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Letters</p>
                  <p className="text-2xl font-bold">{totalLetters}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold">{deliveredLetters}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Truck className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">In Transit</p>
                  <p className="text-2xl font-bold">{inTransitLetters}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{pendingLetters}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Letter Tracking
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {letters.slice(0, 3).map((letter) => (
                      <div key={letter.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{letter.letterType}</h4>
                          <p className="text-sm text-gray-600">{letter.recipient}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500">
                              {letter.trackingNumber}
                            </span>
                            <span className="text-xs text-gray-500">
                              {letter.lastUpdate}
                            </span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(letter.status)}>
                          {letter.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bureau Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Bureau Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["Experian", "Equifax", "TransUnion"].map((bureau) => {
                      const count = letters.filter(l => l.creditBureau === bureau).length
                      return (
                        <div key={bureau} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{bureau}</h4>
                            <p className="text-sm text-gray-600">{count} letters sent</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{count}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Letter Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search letters, tracking numbers, or recipients..."
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
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={bureauFilter} onValueChange={setBureauFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Bureau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Bureaus</SelectItem>
                      <SelectItem value="Experian">Experian</SelectItem>
                      <SelectItem value="Equifax">Equifax</SelectItem>
                      <SelectItem value="TransUnion">TransUnion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Letters List */}
            <Card>
              <CardHeader>
                <CardTitle>Letter Tracking</CardTitle>
                <CardDescription>
                  Monitor the status and delivery of your dispute letters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLetters.map((letter) => (
                    <div key={letter.id} className="border rounded-lg p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h4 className="font-medium text-lg">{letter.letterType}</h4>
                            <Badge className={getStatusColor(letter.status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(letter.status)}
                                <span>{letter.status.replace('_', ' ')}</span>
                              </div>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Recipient</p>
                              <p className="text-sm">{letter.recipient}</p>
                              <p className="text-xs text-gray-500">{letter.recipientAddress}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Tracking Number</p>
                              <p className="text-sm font-mono">{letter.trackingNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Credit Bureau</p>
                              <p className="text-sm">{letter.creditBureau}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Dispute Type</p>
                              <p className="text-sm">{letter.disputeType}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Sent Date</p>
                              <p className="text-sm">{letter.sentDate}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Expected Delivery</p>
                              <p className="text-sm">{letter.expectedDelivery}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Current Location</p>
                              <p className="text-sm">{letter.currentLocation}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>Certified Mail: {letter.certifiedMail ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Package className="h-4 w-4" />
                              <span>Return Receipt: {letter.returnReceipt ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Last Update: {letter.lastUpdate}</span>
                            </div>
                          </div>

                          {letter.notes && (
                            <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                              <p className="text-sm font-medium text-gray-600">Notes</p>
                              <p className="text-sm">{letter.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Letter Analytics</h3>
              <p className="text-gray-600">
                Detailed analytics and reporting for your dispute letters coming soon
              </p>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="text-center py-12">
              <Bell className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delivery Alerts</h3>
              <p className="text-gray-600">
                Set up alerts for letter delivery status and tracking updates
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}