"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Mail,
  Shield,
  Truck,
  Clock,
  DollarSign,
  FileText,
  MapPin,
  User,
  Scale,
  Star,
  AlertTriangle,
} from "lucide-react"

interface MailData {
  recipientName: string
  recipientAddress: string
  senderName: string
  senderAddress: string
  documentType: string
  content: string
  isPremium?: boolean
  attorneyReviewed?: boolean
  trackingLevel?: string
}

export default function CertifiedMailComposePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mailData, setMailData] = useState<MailData>({
    recipientName: "",
    recipientAddress: "",
    senderName: "",
    senderAddress: "",
    documentType: "Credit Dispute Letter",
    content: "",
  })

  const [mailOptions, setMailOptions] = useState({
    returnReceipt: true,
    restrictedDelivery: false,
    adultSignature: false,
    priority: false,
  })

  const [estimatedCost, setEstimatedCost] = useState(8.95)

  // Check if this is from premium dispute
  const isPremiumSource = searchParams.get("source") === "premium-dispute"

  useEffect(() => {
    // Load pre-filled data if coming from premium dispute
    if (isPremiumSource) {
      const premiumData = sessionStorage.getItem("premiumMailData")
      if (premiumData) {
        const data = JSON.parse(premiumData)
        setMailData(data)
        // Update cost for premium service
        setEstimatedCost(12.95)
      }
    }
  }, [isPremiumSource])

  useEffect(() => {
    // Calculate estimated cost based on options
    let cost = 8.95 // Base certified mail cost
    if (mailOptions.returnReceipt) cost += 3.05
    if (mailOptions.restrictedDelivery) cost += 5.5
    if (mailOptions.adultSignature) cost += 6.95
    if (mailOptions.priority) cost += 8.5
    if (isPremiumSource) cost += 4.0 // Premium service fee

    setEstimatedCost(cost)
  }, [mailOptions, isPremiumSource])

  const handleInputChange = (field: keyof MailData, value: string) => {
    setMailData((prev) => ({ ...prev, [field]: value }))
  }

  const handleOptionChange = (option: keyof typeof mailOptions, checked: boolean) => {
    setMailOptions((prev) => ({ ...prev, [option]: checked }))
  }

  const handleSubmit = async () => {
    if (
      !mailData.recipientName ||
      !mailData.recipientAddress ||
      !mailData.senderName ||
      !mailData.senderAddress ||
      !mailData.content
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call to USPS or mail service
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const trackingNumber = `CR${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`

      // Store tracking information
      const trackingData = {
        trackingNumber,
        mailData,
        mailOptions,
        cost: estimatedCost,
        status: "Processing",
        createdAt: new Date().toISOString(),
        isPremium: isPremiumSource,
        attorneyReviewed: mailData.attorneyReviewed || false,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      }

      // Store in localStorage (in real app, this would go to a database)
      const existingTracking = JSON.parse(localStorage.getItem("certifiedMailTracking") || "[]")
      existingTracking.push(trackingData)
      localStorage.setItem("certifiedMailTracking", JSON.stringify(existingTracking))

      // Clear premium mail data from session
      sessionStorage.removeItem("premiumMailData")

      toast({
        title: "Mail Sent Successfully",
        description: `Your certified mail has been processed. Tracking number: ${trackingNumber}`,
      })

      // Navigate to success page
      router.push(`/dashboard/certified-mail/success?tracking=${trackingNumber}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your certified mail. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Certified Mail Compose</h1>
                  <p className="text-gray-600">Send your documents with certified mail tracking</p>
                </div>
              </div>
              {isPremiumSource && (
                <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                  <Shield className="h-4 w-4 mr-1" />
                  Premium Service
                </Badge>
              )}
            </div>

            {isPremiumSource && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Scale className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900">Attorney-Reviewed Document</h3>
                    <p className="text-blue-700 text-sm">
                      This document has been reviewed by licensed attorneys and includes enhanced tracking and legal
                      support.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recipient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Recipient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="recipientName">Recipient Name *</Label>
                    <Input
                      id="recipientName"
                      value={mailData.recipientName}
                      onChange={(e) => handleInputChange("recipientName", e.target.value)}
                      placeholder="Credit Bureau Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipientAddress">Recipient Address *</Label>
                    <Textarea
                      id="recipientAddress"
                      value={mailData.recipientAddress}
                      onChange={(e) => handleInputChange("recipientAddress", e.target.value)}
                      placeholder="P.O. Box 4500, Allen, TX 75013"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Sender Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Sender Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="senderName">Your Name *</Label>
                    <Input
                      id="senderName"
                      value={mailData.senderName}
                      onChange={(e) => handleInputChange("senderName", e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="senderAddress">Your Address *</Label>
                    <Textarea
                      id="senderAddress"
                      value={mailData.senderAddress}
                      onChange={(e) => handleInputChange("senderAddress", e.target.value)}
                      placeholder="123 Main Street, New York, NY 10001"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Document Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Document Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="documentType">Document Type</Label>
                    <Select
                      value={mailData.documentType}
                      onValueChange={(value) => handleInputChange("documentType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Credit Dispute Letter">Credit Dispute Letter</SelectItem>
                        <SelectItem value="Follow-up Letter">Follow-up Letter</SelectItem>
                        <SelectItem value="Escalation Letter">Escalation Letter</SelectItem>
                        <SelectItem value="FCRA Complaint">FCRA Complaint</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="content">Letter Content *</Label>
                    <Textarea
                      id="content"
                      value={mailData.content}
                      onChange={(e) => handleInputChange("content", e.target.value)}
                      placeholder="Enter your letter content here..."
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Mail Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Mail Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="returnReceipt"
                        checked={mailOptions.returnReceipt}
                        onCheckedChange={(checked) => handleOptionChange("returnReceipt", checked as boolean)}
                      />
                      <Label htmlFor="returnReceipt" className="text-sm">
                        Return Receipt (+$3.05)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="restrictedDelivery"
                        checked={mailOptions.restrictedDelivery}
                        onCheckedChange={(checked) => handleOptionChange("restrictedDelivery", checked as boolean)}
                      />
                      <Label htmlFor="restrictedDelivery" className="text-sm">
                        Restricted Delivery (+$5.50)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="adultSignature"
                        checked={mailOptions.adultSignature}
                        onCheckedChange={(checked) => handleOptionChange("adultSignature", checked as boolean)}
                      />
                      <Label htmlFor="adultSignature" className="text-sm">
                        Adult Signature (+$6.95)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="priority"
                        checked={mailOptions.priority}
                        onCheckedChange={(checked) => handleOptionChange("priority", checked as boolean)}
                      />
                      <Label htmlFor="priority" className="text-sm">
                        Priority Express (+$8.50)
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Cost Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Cost Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Certified Mail</span>
                        <span>$8.95</span>
                      </div>
                      {mailOptions.returnReceipt && (
                        <div className="flex justify-between">
                          <span>Return Receipt</span>
                          <span>$3.05</span>
                        </div>
                      )}
                      {mailOptions.restrictedDelivery && (
                        <div className="flex justify-between">
                          <span>Restricted Delivery</span>
                          <span>$5.50</span>
                        </div>
                      )}
                      {mailOptions.adultSignature && (
                        <div className="flex justify-between">
                          <span>Adult Signature</span>
                          <span>$6.95</span>
                        </div>
                      )}
                      {mailOptions.priority && (
                        <div className="flex justify-between">
                          <span>Priority Express</span>
                          <span>$8.50</span>
                        </div>
                      )}
                      {isPremiumSource && (
                        <div className="flex justify-between text-blue-600">
                          <span>Premium Service</span>
                          <span>$4.00</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${estimatedCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Premium Features */}
                {isPremiumSource && (
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center text-blue-600">
                        <Star className="h-5 w-5 mr-2" />
                        Premium Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Scale className="h-4 w-4 text-blue-600" />
                        <span>Attorney-reviewed content</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span>Enhanced tracking</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>Legal timeline monitoring</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-blue-600" />
                        <span>Escalation support</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Delivery Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Delivery Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Processing Time</span>
                      <span>1-2 business days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Time</span>
                      <span>{mailOptions.priority ? "1-2 days" : "2-3 days"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tracking Updates</span>
                      <span>Real-time</span>
                    </div>
                    {isPremiumSource && (
                      <div className="flex justify-between text-blue-600">
                        <span>Legal Support</span>
                        <span>Included</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5 mr-2" />
                      Send Certified Mail
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
