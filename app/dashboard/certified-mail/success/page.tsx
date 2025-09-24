"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Mail, Download, Eye, Copy, Calendar, MapPin, Truck, Bell, Share2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function MailSuccessPage() {
  const searchParams = useSearchParams()
  const trackingNumber = searchParams.get("tracking") || "9405511206213123456789"

  const copyTrackingNumber = () => {
    navigator.clipboard.writeText(trackingNumber)
  }

  const mailDetails = {
    recipient: "Experian Information Solutions",
    address: "P.O. Box 4500, Allen, TX 75013",
    subject: "Credit Report Dispute - Account Verification Required",
    services: ["Certified Mail", "Return Receipt"],
    cost: "$6.50",
    estimatedDelivery: "January 25, 2024",
    sentDate: new Date().toLocaleDateString(),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mail Sent Successfully!</h1>
            <p className="text-gray-600">Your certified mail has been processed and is on its way</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <span>Tracking Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-blue-900">Tracking Number</h3>
                        <p className="font-mono text-lg text-blue-800">{trackingNumber}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={copyTrackingNumber}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Calendar className="h-6 w-6 mx-auto text-gray-600 mb-2" />
                      <h4 className="font-semibold text-sm">Sent Date</h4>
                      <p className="text-sm text-gray-600">{mailDetails.sentDate}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Truck className="h-6 w-6 mx-auto text-gray-600 mb-2" />
                      <h4 className="font-semibold text-sm">Status</h4>
                      <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Calendar className="h-6 w-6 mx-auto text-gray-600 mb-2" />
                      <h4 className="font-semibold text-sm">Est. Delivery</h4>
                      <p className="text-sm text-gray-600">{mailDetails.estimatedDelivery}</p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button className="flex-1">
                      <Truck className="h-4 w-4 mr-2" />
                      Track on USPS.com
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Bell className="h-4 w-4 mr-2" />
                      Set Delivery Alerts
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mail Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span>Mail Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Recipient</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium">{mailDetails.recipient}</div>
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {mailDetails.address}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Services</h4>
                      <div className="space-y-2">
                        {mailDetails.services.map((service, index) => (
                          <Badge key={index} variant="outline" className="mr-2">
                            {service}
                          </Badge>
                        ))}
                        <div className="text-sm text-gray-600 mt-2">
                          Total Cost: <span className="font-semibold text-green-600">{mailDetails.cost}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Subject</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{mailDetails.subject}</p>
                  </div>

                  <div className="flex space-x-4">
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Eye className="h-4 w-4 mr-2" />
                      View Letter
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/certified-mail/compose">
                  <Button className="w-full bg-transparent" variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Another Letter
                  </Button>
                </Link>
                <Link href="/dashboard/certified-mail">
                  <Button className="w-full bg-transparent" variant="outline">
                    <Truck className="h-4 w-4 mr-2" />
                    View All Mail
                  </Button>
                </Link>
                <Link href="/dashboard/letters/cfpb-complaint">
                  <Button className="w-full bg-transparent" variant="outline">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    File CFPB Complaint
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="text-sm space-y-3 text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="font-bold text-blue-600">1.</span>
                    <span>Monitor tracking status for delivery updates</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-bold text-blue-600">2.</span>
                    <span>Wait for delivery confirmation (1-3 business days)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-bold text-blue-600">3.</span>
                    <span>Credit bureau has 30 days to investigate</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-bold text-blue-600">4.</span>
                    <span>If no response after 30 days, file CFPB complaint</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-bold text-blue-600">5.</span>
                    <span>Check credit report for updates after resolution</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Success Tips */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Success Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-green-700 space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Keep your tracking number safe</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Save delivery confirmation as proof</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Follow up if no response in 35 days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Document all correspondence</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
