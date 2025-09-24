"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  Download,
  Mail,
  Eye,
  Calendar,
  Clock,
  FileText,
  Star,
  Share2,
  Bell,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

export default function FCRAComplaintSuccess() {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + 2
      })
    }, 100)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (progress >= 25) setCurrentStep(2)
    if (progress >= 50) setCurrentStep(3)
    if (progress >= 75) setCurrentStep(4)
    if (progress >= 100) setCurrentStep(5)
  }, [progress])

  const orderDetails = {
    orderId: "FCRA-2024-001234",
    date: new Date().toLocaleDateString(),
    amount: "$79.97",
    services: ["FCRA Complaint Letter - No Response Violation", "Attorney Legal Review", "CFPB Filing Service"],
    estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  }

  const timeline = [
    {
      step: 1,
      title: "Order Confirmed",
      description: "Payment processed successfully",
      status: "completed",
      time: "Just now",
    },
    {
      step: 2,
      title: "Complaint Generation",
      description: "AI generating your personalized complaint letter",
      status: currentStep >= 2 ? "completed" : "pending",
      time: currentStep >= 2 ? "2 minutes ago" : "In progress",
    },
    {
      step: 3,
      title: "Legal Review Queued",
      description: "Attorney review scheduled within 24 hours",
      status: currentStep >= 3 ? "completed" : "pending",
      time: currentStep >= 3 ? "5 minutes ago" : "Pending",
    },
    {
      step: 4,
      title: "CFPB Filing Prepared",
      description: "Complaint prepared for CFPB submission",
      status: currentStep >= 4 ? "completed" : "pending",
      time: currentStep >= 4 ? "8 minutes ago" : "Pending",
    },
    {
      step: 5,
      title: "Ready for Review",
      description: "Your complaint is ready for final review",
      status: currentStep >= 5 ? "completed" : "pending",
      time: currentStep >= 5 ? "10 minutes ago" : "Pending",
    },
  ]

  const nextSteps = [
    {
      title: "Review Your Complaint",
      description: "Review the generated complaint letter before filing",
      action: "Review Now",
      icon: Eye,
      urgent: true,
    },
    {
      title: "Schedule Legal Consultation",
      description: "Book a call with our attorney for strategy discussion",
      action: "Schedule Call",
      icon: Calendar,
      urgent: false,
    },
    {
      title: "Track CFPB Filing",
      description: "Monitor your complaint status with the CFPB",
      action: "Track Status",
      icon: FileText,
      urgent: false,
    },
    {
      title: "Monitor Credit Reports",
      description: "Watch for changes after filing your complaint",
      action: "View Reports",
      icon: Bell,
      urgent: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FCRA Complaint Order Complete</h1>
              <p className="text-gray-600 mt-1">Your complaint is being processed</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Success Banner */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-green-900">Payment Successful!</h2>
                <p className="text-green-700">
                  Your FCRA complaint order has been confirmed. Order ID: <strong>{orderDetails.orderId}</strong>
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-900">{orderDetails.amount}</div>
                <div className="text-sm text-green-700">Total Paid</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Progress and Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>Processing Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-gray-600">{progress}% Complete</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="text-sm text-gray-600">
                    {progress < 100 ? "Processing your complaint..." : "Your complaint is ready for review!"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((item) => (
                    <div key={item.step} className="flex items-start space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          item.status === "completed"
                            ? "bg-green-600 text-white"
                            : item.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {item.status === "completed" ? <CheckCircle className="h-4 w-4" /> : item.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{item.title}</h4>
                          <span className="text-xs text-gray-500">{item.time}</span>
                        </div>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <p className="text-sm text-gray-600">Actions you can take to maximize your success</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nextSteps.map((step, index) => {
                    const Icon = step.icon
                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          step.urgent ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-5 w-5 ${step.urgent ? "text-red-600" : "text-blue-600"}`} />
                          <div>
                            <h4 className="font-semibold">{step.title}</h4>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {step.urgent && <Badge className="bg-red-600 text-white">Urgent</Badge>}
                          <Button
                            variant={step.urgent ? "default" : "outline"}
                            size="sm"
                            className={step.urgent ? "bg-red-600 hover:bg-red-700" : ""}
                          >
                            {step.action}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary and Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Order ID:</span>
                    <span className="font-mono">{orderDetails.orderId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Date:</span>
                    <span>{orderDetails.date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Amount:</span>
                    <span className="font-semibold">{orderDetails.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Est. Completion:</span>
                    <span>{orderDetails.estimatedCompletion}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Services Included:</h4>
                  {orderDetails.services.map((service, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-red-600 hover:bg-red-700" disabled={progress < 100}>
                  <Eye className="h-4 w-4 mr-2" />
                  {progress < 100 ? "Generating..." : "Review Complaint"}
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Copy
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Progress
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Success Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-700 space-y-2">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 mt-0.5" />
                  <span>Keep all documentation organized and accessible</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 mt-0.5" />
                  <span>Respond promptly to any requests for additional information</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 mt-0.5" />
                  <span>Monitor your credit reports for changes</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 mt-0.5" />
                  <span>Follow up if you don't receive a response within 30 days</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/support">
                  <Button variant="outline" className="w-full bg-transparent">
                    Contact Support
                  </Button>
                </Link>
                <Link href="/docs/fcra-complaints">
                  <Button variant="outline" className="w-full bg-transparent">
                    View Documentation
                  </Button>
                </Link>
                <Link href="/dashboard/letters">
                  <Button variant="outline" className="w-full bg-transparent">
                    Back to Letters
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
