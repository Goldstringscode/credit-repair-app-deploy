"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Shield, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useNotifications } from "@/lib/notification-context"

export default function CheckoutSuccessPage() {
  const { addNotification } = useNotifications()

  useEffect(() => {
    // Send payment success notification
    const sendPaymentNotification = async () => {
      await addNotification({
        title: "Payment Successful! 🎉",
        message: "Welcome to CreditAI Pro! Your subscription is now active and you have access to all premium features.",
        type: "success",
        priority: "high",
        read: false,
        actions: [
          {
            label: "Go to Dashboard",
            action: "navigate_dashboard",
            variant: "default"
          },
          {
            label: "Start AI Chat",
            action: "navigate_ai_chat",
            variant: "outline"
          }
        ]
      })
    }

    sendPaymentNotification()
  }, [addNotification])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl text-green-800">Payment Successful!</CardTitle>
          <p className="text-gray-600 mt-2">Welcome to CreditAI Pro</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Confirmation email sent to your inbox</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Account activated and ready to use</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>AI assistant is ready to help you</span>
              </li>
            </ul>
          </div>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">Protected by 120% Money-Back Guarantee</span>
            </div>

            <div className="space-y-3">
              <Link href="/dashboard">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>

              <Link href="/support/ai-chat">
                <Button variant="outline" className="w-full bg-transparent">
                  Start Chat with AI Assistant
                </Button>
              </Link>
            </div>
          </div>

          <div className="border-t pt-4 text-center text-sm text-gray-600">
            <p>Need help getting started? Contact our support team at</p>
            <p className="font-semibold">support@creditaipro.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
