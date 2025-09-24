"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Upload,
  Download,
  FileSpreadsheet,
  Users,
  Send,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Zap,
  Target,
  BarChart3,
} from "lucide-react"

interface BulkRecipient {
  id: string
  name: string
  company: string
  address: string
  city: string
  state: string
  zip: string
  email?: string
  phone?: string
  status: "pending" | "processing" | "sent" | "delivered" | "failed"
  cost: number
  trackingNumber?: string
  errorMessage?: string
}

interface BulkCampaign {
  id: string
  name: string
  template: string
  recipients: BulkRecipient[]
  status: "draft" | "processing" | "completed" | "failed"
  createdAt: string
  totalCost: number
  successRate: number
}

export default function BulkMailPage() {
  const [activeTab, setActiveTab] = useState("create")
  const [bulkData, setBulkData] = useState({
    campaignName: "",
    template: "",
    subject: "",
    content: "",
    services: ["certified"] as string[],
    recipients: [] as BulkRecipient[],
  })

  const [campaigns] = useState<BulkCampaign[]>([
    {
      id: "1",
      name: "Q1 Credit Bureau Disputes",
      template: "Credit Dispute Letter",
      recipients: [],
      status: "completed",
      createdAt: "2024-01-15",
      totalCost: 1247.85,
      successRate: 94.2,
    },
    {
      id: "2",
      name: "Goodwill Letter Campaign",
      template: "Goodwill Letter",
      recipients: [],
      status: "processing",
      createdAt: "2024-01-20",
      totalCost: 567.3,
      successRate: 87.6,
    },
  ])

  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const serviceOptions = [
    { id: "certified", name: "Certified Mail", price: 3.75, required: true },
    { id: "return_receipt", name: "Return Receipt", price: 3.05 },
    { id: "restricted_delivery", name: "Restricted Delivery", price: 5.65 },
    { id: "priority", name: "Priority Mail", price: 8.95 },
  ]

  const templates = [
    { id: "dispute", name: "Credit Dispute Letter", category: "Disputes" },
    { id: "goodwill", name: "Goodwill Letter", category: "Goodwill" },
    { id: "validation", name: "Debt Validation", category: "Collections" },
    { id: "identity_theft", name: "Identity Theft Affidavit", category: "Identity Theft" },
  ]

  const calculateBulkCost = () => {
    const baseCost = 0.68 // First-Class Mail
    const serviceCosts = bulkData.services.reduce((total, serviceId) => {
      const service = serviceOptions.find((s) => s.id === serviceId)
      return total + (service?.price || 0)
    }, 0)
    const costPerLetter = baseCost + serviceCosts
    return costPerLetter * bulkData.recipients.length
  }

  const calculateBulkDiscount = () => {
    const recipientCount = bulkData.recipients.length
    if (recipientCount >= 100) return 0.15 // 15% discount
    if (recipientCount >= 50) return 0.1 // 10% discount
    if (recipientCount >= 25) return 0.05 // 5% discount
    return 0
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Simulate file processing
    setIsProcessing(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsProcessing(false)
          // Mock data for demonstration
          const mockRecipients: BulkRecipient[] = [
            {
              id: "1",
              name: "Experian Information Solutions",
              company: "Experian",
              address: "P.O. Box 4500",
              city: "Allen",
              state: "TX",
              zip: "75013",
              status: "pending",
              cost: 7.43,
            },
            {
              id: "2",
              name: "TransUnion LLC",
              company: "TransUnion",
              address: "P.O. Box 1000",
              city: "Chester",
              state: "PA",
              zip: "19016",
              status: "pending",
              cost: 7.43,
            },
            {
              id: "3",
              name: "Equifax Information Services",
              company: "Equifax",
              address: "P.O. Box 740256",
              city: "Atlanta",
              state: "GA",
              zip: "30374",
              status: "pending",
              cost: 7.43,
            },
          ]
          setBulkData((prev) => ({ ...prev, recipients: mockRecipients }))
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleServiceChange = (serviceId: string, checked: boolean) => {
    if (serviceId === "certified" && !checked) return // Required

    setBulkData((prev) => ({
      ...prev,
      services: checked ? [...prev.services, serviceId] : prev.services.filter((s) => s !== serviceId),
    }))
  }

  const removeRecipient = (recipientId: string) => {
    setBulkData((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((r) => r.id !== recipientId),
    }))
  }

  const processBulkMail = () => {
    setIsProcessing(true)
    // Simulate bulk processing
    console.log("Processing bulk mail:", bulkData)
    setTimeout(() => {
      setIsProcessing(false)
      // Update recipient statuses
    }, 3000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "processing":
        return <Zap className="h-4 w-4 text-blue-500" />
      case "sent":
        return <Send className="h-4 w-4 text-blue-500" />
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
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bulk Mail Center</h1>
              <p className="text-gray-600 mt-1">Send certified mail to multiple recipients efficiently</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-purple-100 text-purple-800">
                <Users className="h-4 w-4 mr-1" />
                Bulk Processing
              </Badge>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">${calculateBulkCost().toFixed(2)}</div>
                <div className="text-sm text-gray-500">
                  {bulkData.recipients.length} recipients • {calculateBulkDiscount() * 100}% discount
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">Create Campaign</TabsTrigger>
            <TabsTrigger value="recipients">Recipients</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Create Campaign Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Campaign Setup */}
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Setup</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="campaignName">Campaign Name *</Label>
                      <Input
                        id="campaignName"
                        value={bulkData.campaignName}
                        onChange={(e) => setBulkData((prev) => ({ ...prev, campaignName: e.target.value }))}
                        placeholder="Q1 2024 Credit Disputes"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template">Template *</Label>
                      <Select
                        value={bulkData.template}
                        onValueChange={(value) => setBulkData((prev) => ({ ...prev, template: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name} - {template.category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject Line *</Label>
                      <Input
                        id="subject"
                        value={bulkData.subject}
                        onChange={(e) => setBulkData((prev) => ({ ...prev, subject: e.target.value }))}
                        placeholder="Credit Report Dispute - Account Verification"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Letter Content *</Label>
                      <Textarea
                        id="content"
                        value={bulkData.content}
                        onChange={(e) => setBulkData((prev) => ({ ...prev, content: e.target.value }))}
                        placeholder="Enter your letter content here. Use {{VARIABLE}} for personalization."
                        rows={10}
                        className="font-mono text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Recipient Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload Recipients
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">Upload Recipient List</p>
                      <p className="text-sm text-gray-600 mb-4">
                        Upload a CSV or Excel file with recipient information
                      </p>
                      <div className="flex items-center justify-center space-x-4">
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download Template
                        </Button>
                        <label htmlFor="file-upload">
                          <Button asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Choose File
                            </span>
                          </Button>
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Processing file...</span>
                          <span className="text-sm text-gray-600">{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}

                    {bulkData.recipients.length > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-900">
                            Successfully loaded {bulkData.recipients.length} recipients
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Mail Services */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mail Services</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {serviceOptions.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={service.id}
                            checked={bulkData.services.includes(service.id)}
                            onCheckedChange={(checked) => handleServiceChange(service.id, checked as boolean)}
                            disabled={service.required}
                          />
                          <div>
                            <Label htmlFor={service.id} className="font-medium">
                              {service.name}
                            </Label>
                            {service.required && <Badge variant="outline">Required</Badge>}
                          </div>
                        </div>
                        <span className="text-sm font-semibold">${service.price}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Bulk Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Bulk Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Cost per letter</span>
                        <span>${(calculateBulkCost() / Math.max(bulkData.recipients.length, 1)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Recipients</span>
                        <span>{bulkData.recipients.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>${calculateBulkCost().toFixed(2)}</span>
                      </div>
                      {calculateBulkDiscount() > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Bulk discount ({calculateBulkDiscount() * 100}%)</span>
                          <span>-${(calculateBulkCost() * calculateBulkDiscount()).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total Cost</span>
                          <span className="text-green-600">
                            ${(calculateBulkCost() * (1 - calculateBulkDiscount())).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-1">Volume Discounts</h4>
                      <div className="text-xs text-blue-800 space-y-1">
                        <p>• 25+ letters: 5% discount</p>
                        <p>• 50+ letters: 10% discount</p>
                        <p>• 100+ letters: 15% discount</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Process Button */}
                <Button
                  onClick={processBulkMail}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                  disabled={
                    bulkData.recipients.length === 0 || !bulkData.campaignName || !bulkData.content || isProcessing
                  }
                >
                  {isProcessing ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Process Bulk Mail
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Recipients Tab */}
          <TabsContent value="recipients" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recipients ({bulkData.recipients.length})
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Import More
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {bulkData.recipients.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
                      <div>Name/Company</div>
                      <div>Address</div>
                      <div>City, State</div>
                      <div>Status</div>
                      <div>Cost</div>
                      <div>Actions</div>
                    </div>
                    {bulkData.recipients.map((recipient) => (
                      <div key={recipient.id} className="grid grid-cols-6 gap-4 items-center py-3 border-b">
                        <div>
                          <p className="font-medium">{recipient.name}</p>
                          {recipient.company && <p className="text-sm text-gray-600">{recipient.company}</p>}
                        </div>
                        <div className="text-sm">{recipient.address}</div>
                        <div className="text-sm">
                          {recipient.city}, {recipient.state} {recipient.zip}
                        </div>
                        <div>
                          <Badge className={getStatusColor(recipient.status)}>
                            {getStatusIcon(recipient.status)}
                            <span className="ml-1 capitalize">{recipient.status}</span>
                          </Badge>
                        </div>
                        <div className="font-semibold text-green-600">${recipient.cost.toFixed(2)}</div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRecipient(recipient.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Recipients Added</h3>
                    <p className="text-gray-600 mb-4">Upload a CSV file or add recipients manually to get started.</p>
                    <Button onClick={() => setActiveTab("create")}>
                      <Upload className="h-4 w-4 mr-2" />
                      Add Recipients
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{campaign.name}</h3>
                          <p className="text-sm text-gray-600">Template: {campaign.template}</p>
                        </div>
                        <Badge className={getStatusColor(campaign.status)}>
                          {getStatusIcon(campaign.status)}
                          <span className="ml-1 capitalize">{campaign.status}</span>
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Created</p>
                          <p className="font-medium">{campaign.createdAt}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Cost</p>
                          <p className="font-medium text-green-600">${campaign.totalCost.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Success Rate</p>
                          <p className="font-medium">{campaign.successRate}%</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
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
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                      <p className="text-3xl font-bold text-gray-900">{campaigns.length}</p>
                    </div>
                    <div className="bg-blue-100 rounded-full p-3">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">
                        ${campaigns.reduce((sum, c) => sum + c.totalCost, 0).toFixed(0)}
                      </p>
                    </div>
                    <div className="bg-green-100 rounded-full p-3">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {(campaigns.reduce((sum, c) => sum + c.successRate, 0) / campaigns.length).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-purple-100 rounded-full p-3">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Processing Time</p>
                      <p className="text-3xl font-bold text-gray-900">2.3h</p>
                    </div>
                    <div className="bg-yellow-100 rounded-full p-3">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Success Rate</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Progress value={campaign.successRate} className="flex-1 h-2" />
                            <span className="text-sm font-semibold">{campaign.successRate}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Revenue</p>
                          <p className="text-lg font-bold text-green-600">${campaign.totalCost.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Template</p>
                          <p className="font-medium">{campaign.template}</p>
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
    </div>
  )
}
