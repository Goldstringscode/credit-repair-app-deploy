"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LettersSkeleton } from "@/components/loading-skeletons"
import {
  FileText,
  Plus,
  Send,
  Eye,
  Download,
  Wand2,
  AlertTriangle,
  Scale,
  TrendingUp,
  Shield,
  Gavel,
  Star,
} from "lucide-react"
import Link from "next/link"

export default function LettersPage() {
  const [loading, setLoading] = useState(true)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <LettersSkeleton />
  }

  const recentLetters = [
    {
      id: 1,
      title: "Late Payment Dispute - Capital One",
      type: "Standard Dispute",
      status: "Sent",
      date: "2024-01-15",
      recipient: "Experian",
      trackingNumber: "9405511206213123456789",
      canFileComplaint: true,
      daysSinceSent: 25,
    },
    {
      id: 2,
      title: "Enhanced Dispute Package - Chase",
      type: "Enhanced Dispute",
      status: "Delivered",
      date: "2024-01-12",
      recipient: "Equifax",
      trackingNumber: "9405511206213123456790",
      canFileComplaint: false,
      daysSinceSent: 28,
    },
    {
      id: 3,
      title: "FCRA Complaint - TransUnion Violation",
      type: "FCRA Complaint",
      status: "Filed with CFPB",
      date: "2024-01-10",
      recipient: "Consumer Financial Protection Bureau",
      trackingNumber: "CFPB-2024-001234",
      canFileComplaint: false,
      daysSinceSent: 30,
    },
    {
      id: 4,
      title: "Premium Attorney Review - Discover",
      type: "Premium Dispute",
      status: "Under Review",
      date: "2024-01-08",
      recipient: "TransUnion",
      trackingNumber: "9405511206213123456791",
      canFileComplaint: false,
      daysSinceSent: 32,
    },
    {
      id: 5,
      title: "Standard Dispute - Collections Account",
      type: "Standard Dispute",
      status: "No Response",
      date: "2023-12-15",
      recipient: "Experian",
      trackingNumber: "9405511206213123456792",
      canFileComplaint: true,
      daysSinceSent: 45,
    },
  ]

  const templates = [
    { name: "Late Payment Dispute", description: "Challenge incorrect late payment records", successRate: "87%" },
    { name: "Charge-off Dispute", description: "Dispute charge-off accounts", successRate: "82%" },
    { name: "Collection Account", description: "Challenge collection accounts", successRate: "79%" },
    { name: "Identity Theft", description: "Report fraudulent accounts", successRate: "94%" },
    { name: "Inaccurate Balance", description: "Correct wrong balance amounts", successRate: "85%" },
    { name: "Duplicate Account", description: "Remove duplicate listings", successRate: "91%" },
  ]

  const fcraComplaintReasons = [
    {
      title: "No Response After 30 Days",
      description: "Credit bureau failed to respond to your dispute within the required timeframe",
      severity: "High",
      price: "$29.99",
    },
    {
      title: "Inadequate Investigation",
      description: "Bureau conducted superficial investigation without proper verification",
      severity: "Medium",
      price: "$29.99",
    },
    {
      title: "Refused to Remove Verified Errors",
      description: "Bureau acknowledged error but refused to correct your credit report",
      severity: "High",
      price: "$39.99",
    },
    {
      title: "Repeated Inaccurate Information",
      description: "Same incorrect information keeps reappearing after removal",
      severity: "High",
      price: "$49.99",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Sent":
        return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>
      case "Delivered":
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>
      case "Filed with CFPB":
        return <Badge className="bg-purple-100 text-purple-800">Filed with CFPB</Badge>
      case "Under Review":
        return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>
      case "No Response":
        return <Badge className="bg-red-100 text-red-800">No Response</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dispute Letters</h1>
              <p className="text-gray-600 mt-1">Manage and send your credit dispute letters</p>
            </div>
            <Link href="/dashboard/letters/generate">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Generate New Letter
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Link href="/dashboard/letters/generate">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
              <CardContent className="p-6 text-center">
                <Wand2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Standard Dispute</h3>
                <p className="text-gray-600 text-sm mb-3">Basic dispute letter for inaccurate items</p>
                <Badge className="bg-blue-100 text-blue-800">$9.99</Badge>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/letters/enhanced-dispute">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-200 bg-orange-50">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Enhanced Dispute</h3>
                <p className="text-gray-600 text-sm mb-3">Dispute + Standard Complaint combo</p>
                <Badge className="bg-orange-100 text-orange-800">$22.99</Badge>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/letters/premium-dispute">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-200 bg-purple-50">
              <CardContent className="p-6 text-center">
                <Gavel className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Premium Dispute</h3>
                <p className="text-gray-600 text-sm mb-3">Attorney-reviewed dispute letters</p>
                <Badge className="bg-purple-100 text-purple-800">$49.99</Badge>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/letters/fcra-complaint">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <Scale className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">FCRA Complaint</h3>
                <p className="text-gray-600 text-sm mb-3">File complaints against credit bureaus</p>
                <Badge className="bg-red-100 text-red-800">$29.99 - $49.99</Badge>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/letters/tracking">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <Send className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Track Letters</h3>
                <p className="text-gray-600 text-sm mb-3">Monitor sent letters & delivery status</p>
                <Badge className="bg-green-100 text-green-800">Free</Badge>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Enhanced Dispute Section */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <Shield className="h-5 w-5" />
              <span>Enhanced Dispute Letters - Stronger Results</span>
              <Badge className="bg-orange-600 text-white">94% Success Rate</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Why Choose Enhanced Disputes?</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                    <div className="w-2 h-2 rounded-full mt-2 bg-orange-500" />
                    <div>
                      <p className="font-medium text-sm">Higher Success Rate</p>
                      <p className="text-xs text-gray-600">94% success vs 78% with standard disputes alone</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                    <div className="w-2 h-2 rounded-full mt-2 bg-orange-500" />
                    <div>
                      <p className="font-medium text-sm">Faster Resolution</p>
                      <p className="text-xs text-gray-600">Average 21 days vs 35 days for standard disputes</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                    <div className="w-2 h-2 rounded-full mt-2 bg-orange-500" />
                    <div>
                      <p className="font-medium text-sm">Legal Pressure</p>
                      <p className="text-xs text-gray-600">Standard complaint adds legal weight to your dispute</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                    <div className="w-2 h-2 rounded-full mt-2 bg-orange-500" />
                    <div>
                      <p className="font-medium text-sm">Professional Format</p>
                      <p className="text-xs text-gray-600">FCRA-compliant language that bureaus take seriously</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                    Enhanced Dispute Package
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Standard Dispute Letter:</span>
                      <span className="text-gray-500 line-through">$9.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Standard Complaint Add-on:</span>
                      <span className="text-gray-500 line-through">$15.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Professional Formatting:</span>
                      <span className="text-gray-500 line-through">$5.99</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-orange-600">
                      <span>Enhanced Package:</span>
                      <span>$22.99</span>
                    </div>
                    <div className="text-xs text-green-600 font-medium">Save $8.98 vs individual services</div>
                  </div>
                </div>
                <Link href="/dashboard/letters/enhanced-dispute">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    <Shield className="h-4 w-4 mr-2" />
                    Create Enhanced Dispute
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Dispute Section */}
        <Card className="mb-8 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-800">
              <Gavel className="h-5 w-5" />
              <span>Premium Attorney-Reviewed Disputes</span>
              <Badge className="bg-purple-600 text-white">Professional Service</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Premium Features:</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                    <div className="w-2 h-2 rounded-full mt-2 bg-purple-500" />
                    <div>
                      <p className="font-medium text-sm">Attorney Review</p>
                      <p className="text-xs text-gray-600">Licensed attorney reviews every letter before sending</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                    <div className="w-2 h-2 rounded-full mt-2 bg-purple-500" />
                    <div>
                      <p className="font-medium text-sm">Legal Strategy</p>
                      <p className="text-xs text-gray-600">Customized legal approach for complex disputes</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                    <div className="w-2 h-2 rounded-full mt-2 bg-purple-500" />
                    <div>
                      <p className="font-medium text-sm">Priority Support</p>
                      <p className="text-xs text-gray-600">Direct access to legal team for questions</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                    <div className="w-2 h-2 rounded-full mt-2 bg-purple-500" />
                    <div>
                      <p className="font-medium text-sm">Success Guarantee</p>
                      <p className="text-xs text-gray-600">Money-back guarantee if unsuccessful</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Star className="h-4 w-4 mr-2 text-purple-600" />
                    Premium Service Pricing
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Attorney Review:</span>
                      <span className="font-semibold">$29.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Enhanced Dispute Package:</span>
                      <span className="font-semibold">$22.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Priority Support:</span>
                      <span className="text-gray-500 line-through">$19.99</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-purple-600">
                      <span>Premium Package:</span>
                      <span>$49.99</span>
                    </div>
                    <div className="text-xs text-green-600 font-medium">Save $22.97 vs individual services</div>
                  </div>
                </div>
                <Link href="/dashboard/letters/premium-dispute">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Gavel className="h-4 w-4 mr-2" />
                    Get Premium Service
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FCRA Complaint Section */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span>FCRA Complaint Letters - Escalate Your Disputes</span>
              <Badge className="bg-red-600 text-white">Government Filing</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">When to File an FCRA Complaint:</h4>
                <div className="space-y-3">
                  {fcraComplaintReasons.map((reason, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          reason.severity === "High" ? "bg-red-500" : "bg-yellow-500"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{reason.title}</p>
                          <Badge className="text-xs bg-green-100 text-green-800">{reason.price}</Badge>
                        </div>
                        <p className="text-xs text-gray-600">{reason.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Scale className="h-4 w-4 mr-2 text-red-600" />
                    FCRA Services Pricing
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Basic FCRA Complaint:</span>
                      <span className="font-semibold">$29.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Complex Violation:</span>
                      <span className="font-semibold">$39.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Repeated Violations:</span>
                      <span className="font-semibold">$49.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Legal Review Add-on:</span>
                      <span className="font-semibold">$49.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CFPB Filing Service:</span>
                      <span className="font-semibold">$19.99</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Full Package:</span>
                      <span className="text-green-600">Up to $119.97</span>
                    </div>
                  </div>
                </div>
                <Link href="/dashboard/letters/fcra-complaint">
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <Scale className="h-4 w-4 mr-2" />
                    File FCRA Complaint
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Letters */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Letters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLetters.map((letter) => (
                  <div key={letter.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{letter.title}</p>
                        <p className="text-sm text-gray-600">To: {letter.recipient}</p>
                        <p className="text-xs text-gray-500">
                          {letter.date} • {letter.daysSinceSent} days ago
                        </p>
                        {letter.canFileComplaint && letter.daysSinceSent >= 30 && (
                          <div className="mt-2">
                            <Link href="/dashboard/letters/cfpb-complaint">
                              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                File CFPB Complaint
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(letter.status)}
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Letter Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Letter Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates.map((template, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{template.name}</p>
                        <Badge className="text-xs bg-green-100 text-green-800">{template.successRate}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Use Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-6 gap-6 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">12</div>
              <p className="text-sm text-gray-600">Standard Letters</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600">8</div>
              <p className="text-sm text-gray-600">Enhanced Disputes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">3</div>
              <p className="text-sm text-gray-600">Premium Disputes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600">15</div>
              <p className="text-sm text-gray-600">Letters Sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600">3</div>
              <p className="text-sm text-gray-600">FCRA Complaints</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-teal-600">94%</div>
              <p className="text-sm text-gray-600">Success Rate</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
