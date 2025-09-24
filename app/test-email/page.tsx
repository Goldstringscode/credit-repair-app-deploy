"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function TestEmailPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastSent, setLastSent] = useState("")
  const { toast } = useToast()

  const sendTestEmail = async (type: string, additionalData = {}) => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          to: email,
          data: {
            userName: "Test User",
            resetToken: "test-token-123",
            letterType: "Credit Bureau Dispute",
            planName: "Professional",
            bureau: "Experian",
            oldScore: 650,
            newScore: 720,
            amount: 49.99,
            ...additionalData,
          },
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setLastSent(type)
        toast({
          title: "Success! 🎉",
          description: `${type} email sent successfully to ${email}`,
        })
      } else {
        throw new Error(result.error || "Failed to send email")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send email. Check your configuration.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const envStatus = {
    resendKey: !!process.env.RESEND_API_KEY,
    fromEmail: !!process.env.FROM_EMAIL,
    appUrl: !!process.env.NEXT_PUBLIC_APP_URL,
  }

  const allConfigured = Object.values(envStatus).every(Boolean)

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📧 Test Email Service
              {allConfigured ? (
                <Badge variant="default">Ready</Badge>
              ) : (
                <Badge variant="destructive">Not Configured</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Test Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@example.com"
              />
            </div>

            <div className="grid gap-2">
              <Button
                onClick={() => sendTestEmail("welcome")}
                disabled={loading || !allConfigured}
                className="w-full justify-start"
              >
                🎉 Send Welcome Email
                {lastSent === "welcome" && (
                  <Badge variant="secondary" className="ml-2">
                    Sent
                  </Badge>
                )}
              </Button>

              <Button
                onClick={() => sendTestEmail("password-reset")}
                disabled={loading || !allConfigured}
                variant="outline"
                className="w-full justify-start"
              >
                🔐 Send Password Reset
                {lastSent === "password-reset" && (
                  <Badge variant="secondary" className="ml-2">
                    Sent
                  </Badge>
                )}
              </Button>

              <Button
                onClick={() => sendTestEmail("dispute-letter")}
                disabled={loading || !allConfigured}
                variant="outline"
                className="w-full justify-start"
              >
                📝 Send Dispute Letter Notification
                {lastSent === "dispute-letter" && (
                  <Badge variant="secondary" className="ml-2">
                    Sent
                  </Badge>
                )}
              </Button>

              <Button
                onClick={() => sendTestEmail("credit-score-update")}
                disabled={loading || !allConfigured}
                variant="outline"
                className="w-full justify-start"
              >
                📊 Send Credit Score Update
                {lastSent === "credit-score-update" && (
                  <Badge variant="secondary" className="ml-2">
                    Sent
                  </Badge>
                )}
              </Button>

              <Button
                onClick={() => sendTestEmail("subscription-confirmation")}
                disabled={loading || !allConfigured}
                variant="outline"
                className="w-full justify-start"
              >
                💳 Send Subscription Confirmation
                {lastSent === "subscription-confirmation" && (
                  <Badge variant="secondary" className="ml-2">
                    Sent
                  </Badge>
                )}
              </Button>
            </div>

            {loading && <div className="text-center text-sm text-gray-600">Sending email... ⏳</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔧 Configuration Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">RESEND_API_KEY</span>
                {envStatus.resendKey ? (
                  <Badge variant="default">✅ Set</Badge>
                ) : (
                  <Badge variant="destructive">❌ Missing</Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">FROM_EMAIL</span>
                {envStatus.fromEmail ? (
                  <Badge variant="default">✅ Set</Badge>
                ) : (
                  <Badge variant="destructive">❌ Missing</Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">NEXT_PUBLIC_APP_URL</span>
                {envStatus.appUrl ? (
                  <Badge variant="default">✅ Set</Badge>
                ) : (
                  <Badge variant="destructive">❌ Missing</Badge>
                )}
              </div>
            </div>

            {!allConfigured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Setup Required:</strong> Add missing environment variables to your .env.local file.
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Resend provides 3,000 free emails per month and doesn't require domain
                verification for testing.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <strong>🚀 Quick Setup:</strong>
                <br />
                1. Sign up at resend.com
                <br />
                2. Get your API key
                <br />
                3. Add to .env.local
                <br />
                4. Test emails here!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
