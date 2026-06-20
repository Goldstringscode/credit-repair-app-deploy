"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Shield, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useNotifications } from "@/lib/notification-context"

type VerificationState = "verifying" | "verified" | "failed"

export default function CheckoutSuccessPage() {
  const { addNotification } = useNotifications()
  const searchParams = useSearchParams()
  const [state, setState] = useState<VerificationState>("verifying")

  useEffect(() => {
    // This page must never claim a payment succeeded on its own say-so — it
    // always asks Stripe (via our server) whether the PaymentIntent actually
    // succeeded before showing success UI or firing any notification.
    const paymentIntentId = searchParams.get("paymentIntentId")

    if (!paymentIntentId) {
      setState("failed")
      return
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `/api/stripe/payments/verify?paymentIntentId=${encodeURIComponent(paymentIntentId)}`
        )
        const json = await res.json()

        if (!res.ok || !json.success || json.paymentIntent?.status !== "succeeded") {
          setState("failed")
          return
        }

        setState("verified")

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
      } catch (error) {
        console.error("Payment verification failed:", error)
        setState("failed")
      }
    }

    verify()
  }, [searchParams, addNotification])

  if (state === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-500" />
          <p className="text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    )
  }

  if (state === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-red-700">We couldn't confirm this payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">
              We weren't able to verify a successful payment for this session. If you were charged,
              no further action is needed — please contact support and we'll sort it out. If you
              haven't completed checkout yet, you can try again below.
            </p>
            <div className="space-y-3">
              <Link href="/pricing">
                <Button className="w-full" size="lg">
                  Back to Plans
                </Button>
              </Link>
              <Link href="/dashboard/billing">
                <Button variant="outline" className="w-full bg-transparent">
                  Go to Billing
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
