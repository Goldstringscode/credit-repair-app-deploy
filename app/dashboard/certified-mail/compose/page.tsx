"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Mail,
  User,
  FileText,
  Send,
  Eye,
  Download,
  Calculator,
  MapPin,
  Building,
  Clock,
  DollarSign,
  Truck,
  Shield,
  CheckCircle,
  AlertCircle,
  Plus,
  Package,
  Star,
} from "lucide-react"

interface MailService {
  id: string
  name: string
  description: string
  price: number
  deliveryTime: string
  tracking: boolean
  signature: boolean
  insurance: number
  recommended?: boolean
}

interface Recipient {
  name: string
  company: string
  address: string
  city: string
  state: string
  zipCode: string
}

export default function ComposeMailPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)

  const [mailData, setMailData] = useState({
    recipient: {
      name: "",
      company: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
    sender: {
      name: "",
      company: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
    content: {
      subject: "",
      body: "",
      template: "",
    },
    services: [],
    attachments: [],
    priority: "standard",
    deliveryInstructions: "",
  })

  const [estimatedCost, setEstimatedCost] = useState(0)
  const [estimatedDelivery, setEstimatedDelivery] = useState("")

  const mailServices: MailService[] = [
    {
      id: "certified",
      name: "Certified Mail",
      description: "Provides proof of mailing and delivery",
      price: 3.75,
      deliveryTime: "1-3 business days",
      tracking: true,
      signature: false,
      insurance: 0,
      recommended: true,
    },
    {
      id: "certified_return_receipt",
      name: "Certified Mail + Return Receipt",
      description: "Certified mail with signed delivery confirmation",
      price: 6.5,
      deliveryTime: "1-3 business days",
      tracking: true,
      signature: true,
      insurance: 0,
      recommended: true,
    },
    {
      id: "registered",
      name: "Registered Mail",
      description: "Maximum security for valuable items",
      price: 15.75,
      deliveryTime: "2-5 business days",
      tracking: true,
      signature: true,
      insurance: 50,
    },
    {
      id: "priority_express",
      name: "Priority Mail Express",
      description: "Overnight delivery with tracking",
      price: 28.95,
      deliveryTime: "1-2 business days",
      tracking: true,
      signature: true,
      insurance: 100,
    },
    {
      id: "restricted_delivery",
      name: "Restricted Delivery",
      description: "Only delivered to addressee",
      price: 9.35,
      deliveryTime: "Add-on service",
      tracking: false,
      signature: true,
      insurance: 0,
    },
  ]

  const letterTemplates = [
    {
      id: "dispute",
      name: "Credit Dispute Letter",
      subject: "Formal Credit Report Dispute",
      preview: "Dear Credit Bureau,\n\nI am writing to formally dispute the following information...",
    },
    {
      id: "goodwill",
      name: "Goodwill Letter",
      subject: "Goodwill Request for Account Review",
      preview: "Dear [Creditor],\n\nI hope this letter finds you well. I am writing as a long-standing customer...",
    },
    {
      id: "validation",
      name: "Debt Validation Letter",
      subject: "Debt Validation Request",
      preview: "Dear Debt Collector,\n\nThis letter is sent in response to a notice I received from you...",
    },
    {
      id: "cease_desist",
      name: "Cease and Desist",
      subject: "Cease and Desist Communication Request",
      preview: "You are hereby notified under provisions of Public Law 95-109...",
    },
  ]

  const calculateCost = () => {
    const baseCost = 0.68 // First-Class Mail stamp
    let serviceCosts = 0

    mailData.services.forEach((serviceId) => {
      const service = mailServices.find((s) => s.id === serviceId)
      if (service) {
        serviceCosts += service.price
      }
    })

    const totalCost = baseCost + serviceCosts
    setEstimatedCost(totalCost)

    // Calculate estimated delivery
    if (mailData.services.includes("priority_express")) {
      setEstimatedDelivery("1-2 business days")
    } else if (mailData.services.includes("certified") || mailData.services.includes("certified_return_receipt")) {
      setEstimatedDelivery("1-3 business days")
    } else if (mailData.services.includes("registered")) {
      setEstimatedDelivery("2-5 business days")
    } else {
      setEstimatedDelivery("3-5 business days")
    }
  }

  const handleServiceToggle = (serviceId: string) => {
    const newServices = mailData.services.includes(serviceId)
      ? mailData.services.filter((id) => id !== serviceId)
      : [...mailData.services, serviceId]

    setMailData({ ...mailData, services: newServices })
  }

  const loadTemplate = (templateId: string) => {
    const template = letterTemplates.find((t) => t.id === templateId)
    if (template) {
      setMailData({
        ...mailData,
        content: {
          ...mailData.content,
          subject: template.subject,
          body: template.preview,
          template: templateId,
        },
      })
    }
  }

  const validateAddress = async (address: Recipient) => {
    // Simulate USPS address validation
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      valid: true,
      standardized: address,
      suggestions: [],
    }
  }

  const submitMail = async () => {
    setIsGenerating(true)

    // Simulate mail processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Generate tracking number
    const trackingNumber = `9405511206213${Math.random().toString().substr(2, 9)}`

    setIsGenerating(false)

    // Redirect to success page with tracking info
    router.push(`/dashboard/certified-mail/success?tracking=${trackingNumber}`)
  }

  const progressPercentage = (currentStep / 4) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Compose Certified Mail</h1>
                <p className="text-gray-600 mt-1">
                  Send professional letters with USPS tracking and delivery confirmation
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800">USPS Certified</Badge>
              <Badge className="bg-green-100 text-green-800">Step {currentStep} of 4</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between mt-4 text-sm text-gray-600">
              <span className={currentStep >= 1 ? "text-blue-600 font-medium" : ""}>Recipient</span>
              <span className={currentStep >= 2 ? "text-blue-600 font-medium" : ""}>Content</span>
              <span className={currentStep >= 3 ? "text-blue-600 font-medium" : ""}>Services</span>
              <span className={currentStep >= 4 ? "text-blue-600 font-medium" : ""}>Review & Send</span>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Recipient Information */}
        {currentStep === 1 && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span>Recipient Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="manual" className="space-y-6">
                    <TabsList>
                      <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                      <TabsTrigger value="addressbook">Address Book</TabsTrigger>
                      <TabsTrigger value="template">Quick Templates</TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual" className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="recipientName">Full Name *</Label>
                          <Input
                            id="recipientName"
                            value={mailData.recipient.name}
                            onChange={(e) =>
                              setMailData({
                                ...mailData,
                                recipient: { ...mailData.recipient, name: e.target.value },
                              })
                            }
                            placeholder="Enter recipient's full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="recipientCompany">Company/Organization</Label>
                          <Input
                            id="recipientCompany"
                            value={mailData.recipient.company}
                            onChange={(e) =>
                              setMailData({
                                ...mailData,
                                recipient: { ...mailData.recipient, company: e.target.value },
                              })
                            }
                            placeholder="Enter company name (optional)"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="recipientAddress">Street Address *</Label>
                        <Input
                          id="recipientAddress"
                          value={mailData.recipient.address}
                          onChange={(e) =>
                            setMailData({
                              ...mailData,
                              recipient: { ...mailData.recipient, address: e.target.value },
                            })
                          }
                          placeholder="Enter street address"
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="recipientCity">City *</Label>
                          <Input
                            id="recipientCity"
                            value={mailData.recipient.city}
                            onChange={(e) =>
                              setMailData({
                                ...mailData,
                                recipient: { ...mailData.recipient, city: e.target.value },
                              })
                            }
                            placeholder="Enter city"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="recipientState">State *</Label>
                          <Input
                            id="recipientState"
                            value={mailData.recipient.state}
                            onChange={(e) =>
                              setMailData({
                                ...mailData,
                                recipient: { ...mailData.recipient, state: e.target.value },
                              })
                            }
                            placeholder="Enter state"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="recipientZip">ZIP Code *</Label>
                          <Input
                            id="recipientZip"
                            value={mailData.recipient.zipCode}
                            onChange={(e) =>
                              setMailData({
                                ...mailData,
                                recipient: { ...mailData.recipient, zipCode: e.target.value },
                              })
                            }
                            placeholder="Enter ZIP code"
                          />
                        </div>
                      </div>

                      <Button variant="outline" className="w-full bg-transparent">
                        <MapPin className="h-4 w-4 mr-2" />
                        Validate Address with USPS
                      </Button>
                    </TabsContent>

                    <TabsContent value="addressbook">
                      <div className="text-center py-12">
                        <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Address Book</h3>
                        <p className="text-gray-600 mb-6">Select from your saved addresses</p>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Manage Address Book
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="template">
                      <div className="space-y-4">
                        <h3 className="font-semibold">Common Recipients</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {[
                            { name: "Experian", address: "P.O. Box 4500, Allen, TX 75013" },
                            { name: "Equifax", address: "P.O. Box 740256, Atlanta, GA 30374" },
                            { name: "TransUnion", address: "P.O. Box 2000, Chester, PA 19016" },
                            {
                              name: "Consumer Financial Protection Bureau",
                              address: "1700 G Street, N.W., Washington, DC 20552",
                            },
                          ].map((recipient, index) => (
                            <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                              <h4 className="font-medium">{recipient.name}</h4>
                              <p className="text-sm text-gray-600">{recipient.address}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end mt-8">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!mailData.recipient.name || !mailData.recipient.address || !mailData.recipient.city}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Continue to Content
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Address Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                    <div className="font-semibold">{mailData.recipient.name || "[Recipient Name]"}</div>
                    {mailData.recipient.company && <div>{mailData.recipient.company}</div>}
                    <div>{mailData.recipient.address || "[Street Address]"}</div>
                    <div>
                      {mailData.recipient.city || "[City]"}, {mailData.recipient.state || "[State]"}{" "}
                      {mailData.recipient.zipCode || "[ZIP]"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Use full legal names for best delivery results</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Include company name for business addresses</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Validate addresses to avoid delivery issues</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Use ZIP+4 codes when available</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Content */}
        {currentStep === 2 && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Letter Content</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="compose" className="space-y-6">
                    <TabsList>
                      <TabsTrigger value="compose">Compose</TabsTrigger>
                      <TabsTrigger value="templates">Templates</TabsTrigger>
                      <TabsTrigger value="upload">Upload Document</TabsTrigger>
                    </TabsList>

                    <TabsContent value="compose" className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject Line *</Label>
                        <Input
                          id="subject"
                          value={mailData.content.subject}
                          onChange={(e) =>
                            setMailData({
                              ...mailData,
                              content: { ...mailData.content, subject: e.target.value },
                            })
                          }
                          placeholder="Enter letter subject"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="body">Letter Content *</Label>
                        <Textarea
                          id="body"
                          value={mailData.content.body}
                          onChange={(e) =>
                            setMailData({
                              ...mailData,
                              content: { ...mailData.content, body: e.target.value },
                            })
                          }
                          placeholder="Enter your letter content..."
                          rows={12}
                          className="font-mono"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Save Draft
                        </Button>
                        <span className="text-sm text-gray-500">{mailData.content.body.length} characters</span>
                      </div>
                    </TabsContent>

                    <TabsContent value="templates" className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        {letterTemplates.map((template) => (
                          <div key={template.id} className="p-4 border rounded-lg hover:bg-gray-50">
                            <h4 className="font-medium mb-2">{template.name}</h4>
                            <p className="text-sm text-gray-600 mb-3">{template.subject}</p>
                            <div className="bg-gray-50 p-3 rounded text-xs font-mono mb-3 max-h-20 overflow-hidden">
                              {template.preview}
                            </div>
                            <Button size="sm" onClick={() => loadTemplate(template.id)}>
                              Use Template
                            </Button>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="upload">
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Document</h3>
                        <p className="text-gray-600 mb-6">Upload a PDF, Word document, or text file</p>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!mailData.content.subject || !mailData.content.body}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Continue to Services
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Letter Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="text-sm font-mono whitespace-pre-wrap">
                      <div className="font-bold mb-2">{mailData.content.subject || "[Subject Line]"}</div>
                      <div className="text-gray-600 mb-4">To: {mailData.recipient.name || "[Recipient]"}</div>
                      <div>{mailData.content.body || "[Letter content will appear here...]"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Writing Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-start space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>Keep your letter professional and concise</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>Include specific account numbers and dates</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>State your request clearly and directly</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>Reference relevant laws when applicable</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Mail Services */}
        {currentStep === 3 && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span>Mail Services</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mailServices.map((service) => (
                      <div
                        key={service.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          mailData.services.includes(service.id)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleServiceToggle(service.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              checked={mailData.services.includes(service.id)}
                              onChange={() => handleServiceToggle(service.id)}
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold">{service.name}</h3>
                                {service.recommended && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">Recommended</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{service.deliveryTime}</span>
                                </div>
                                {service.tracking && (
                                  <div className="flex items-center space-x-1">
                                    <Truck className="h-4 w-4" />
                                    <span>Tracking</span>
                                  </div>
                                )}
                                {service.signature && (
                                  <div className="flex items-center space-x-1">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Signature</span>
                                  </div>
                                )}
                                {service.insurance > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <Shield className="h-4 w-4" />
                                    <span>${service.insurance} Insurance</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">${service.price.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Additional Options</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority Level</Label>
                        <Select
                          value={mailData.priority}
                          onValueChange={(value) => setMailData({ ...mailData, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="expedited">Expedited</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instructions">Special Delivery Instructions</Label>
                        <Textarea
                          id="instructions"
                          value={mailData.deliveryInstructions}
                          onChange={(e) => setMailData({ ...mailData, deliveryInstructions: e.target.value })}
                          placeholder="Any special instructions for delivery..."
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        calculateCost()
                        setCurrentStep(4)
                      }}
                      disabled={mailData.services.length === 0}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Review & Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5" />
                    <span>Cost Calculator</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Base Postage:</span>
                      <span>$0.68</span>
                    </div>
                    {mailData.services.map((serviceId) => {
                      const service = mailServices.find((s) => s.id === serviceId)
                      return service ? (
                        <div key={serviceId} className="flex justify-between text-sm">
                          <span>{service.name}:</span>
                          <span>${service.price.toFixed(2)}</span>
                        </div>
                      ) : null
                    })}
                    <hr />
                    <div className="flex justify-between font-semibold">
                      <span>Total Cost:</span>
                      <span className="text-green-600">${estimatedCost.toFixed(2)}</span>
                    </div>
                    {estimatedDelivery && (
                      <div className="text-sm text-gray-600">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Estimated delivery: {estimatedDelivery}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Service Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>
                      <strong>Certified Mail</strong> - Best for most credit disputes
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>
                      <strong>Return Receipt</strong> - Proof of delivery signature
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>
                      <strong>Registered Mail</strong> - For high-value documents
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>
                      <strong>Priority Express</strong> - When time is critical
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 4: Review & Send */}
        {currentStep === 4 && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Review Your Mail</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Recipient</h4>
                      <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                        <div className="font-semibold">{mailData.recipient.name}</div>
                        {mailData.recipient.company && <div>{mailData.recipient.company}</div>}
                        <div>{mailData.recipient.address}</div>
                        <div>
                          {mailData.recipient.city}, {mailData.recipient.state} {mailData.recipient.zipCode}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Services Selected</h4>
                      <div className="space-y-2">
                        {mailData.services.map((serviceId) => {
                          const service = mailServices.find((s) => s.id === serviceId)
                          return service ? (
                            <div key={serviceId} className="flex items-center justify-between text-sm">
                              <span>{service.name}</span>
                              <span className="text-green-600">${service.price.toFixed(2)}</span>
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Letter Content</h4>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                      <div className="font-semibold mb-2">{mailData.content.subject}</div>
                      <div className="text-sm font-mono whitespace-pre-wrap">{mailData.content.body}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms" className="text-sm">
                      I confirm that the information is accurate and I authorize sending this mail via USPS
                    </Label>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                      Back
                    </Button>
                    <Button onClick={submitMail} disabled={isGenerating} className="bg-green-600 hover:bg-green-700">
                      {isGenerating ? (
                        <>
                          <Send className="h-4 w-4 mr-2 animate-spin" />
                          Processing Mail...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Mail - ${estimatedCost.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Final Cost</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Base Postage:</span>
                      <span>$0.68</span>
                    </div>
                    {mailData.services.map((serviceId) => {
                      const service = mailServices.find((s) => s.id === serviceId)
                      return service ? (
                        <div key={serviceId} className="flex justify-between text-sm">
                          <span>{service.name}:</span>
                          <span>${service.price.toFixed(2)}</span>
                        </div>
                      ) : null
                    })}
                    <hr />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-green-600">${estimatedCost.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What Happens Next?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="text-sm space-y-2 text-gray-600">
                    <li className="flex items-start space-x-2">
                      <span className="font-bold text-blue-600">1.</span>
                      <span>Your letter is processed and prepared for mailing</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="font-bold text-blue-600">2.</span>
                      <span>Mail is sent via USPS with selected services</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="font-bold text-blue-600">3.</span>
                      <span>You receive tracking number for monitoring</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="font-bold text-blue-600">4.</span>
                      <span>Delivery confirmation when mail is received</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="font-bold text-blue-600">5.</span>
                      <span>Digital copies stored in your account</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">Success Guarantee</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-green-700 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>USPS certified delivery tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Professional formatting and presentation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Digital copies for your records</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Full refund if mail is undeliverable</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
