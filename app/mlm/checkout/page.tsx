"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, CreditCard, Shield, Crown, ArrowLeft, Loader2, ArrowRight, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { mlmPricingTiers } from "@/lib/mlm-commission-structure"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

// ── Inner form component (must be inside <Elements>) ─────────────────────────
interface CheckoutFormProps {
  tierId: string
  billing: string
  finalPrice: number
  isAnnual: boolean
  selectedTier: (typeof mlmPricingTiers)[number]
}

function CheckoutForm({ tierId, billing, finalPrice, isAnnual, selectedTier }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [sponsorVerified, setSponsorVerified] = useState<boolean | null>(null)
  const [sponsorInfo, setSponsorInfo] = useState<{ name: string; rank: string; email: string } | null>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    sponsorCode: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const verifySponsor = async (code: string) => {
    if (!code.trim()) {
      setSponsorVerified(null)
      setSponsorInfo(null)
      return
    }

    try {
      const response = await fetch("/api/mlm/verify-sponsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sponsorCode: code }),
      })

      const data = await response.json()

      if (data.success) {
        setSponsorVerified(true)
        setSponsorInfo(data.sponsor)
      } else {
        setSponsorVerified(false)
        setSponsorInfo(null)
      }
    } catch {
      setSponsorVerified(false)
      setSponsorInfo(null)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.sponsorCode) {
        verifySponsor(formData.sponsorCode)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.sponsorCode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setPaymentError(null)

    try {
      // Confirm payment with Stripe Elements
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/mlm/checkout/success`,
        },
        redirect: "if_required",
      })

      if (error) {
        setPaymentError(error.message ?? "Payment failed. Please try again.")
        return
      }

      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        setPaymentError("Payment was not completed. Please try again.")
        return
      }

      // Payment succeeded — complete MLM checkout
      const response = await fetch("/api/mlm/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          tierId,
          billing,
          sponsorCode: formData.sponsorCode,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        }),
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/mlm/checkout/success?user=${data.mlmUser.id}`)
      } else {
        setPaymentError(data.error ?? "Registration failed. Please contact support.")
      }
    } catch {
      setPaymentError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <Separator />

      {/* Sponsor Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Sponsor Information</h3>
        <div>
          <Label htmlFor="sponsorCode">Sponsor Code (Optional)</Label>
          <Input
            id="sponsorCode"
            name="sponsorCode"
            value={formData.sponsorCode}
            onChange={handleInputChange}
            placeholder="Enter your sponsor's code"
          />
          {sponsorVerified === true && sponsorInfo && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-800 font-semibold">Sponsor Verified!</span>
              </div>
              <div className="text-sm text-green-700 mt-1">
                {sponsorInfo.name} - {sponsorInfo.rank} ({sponsorInfo.email})
              </div>
            </div>
          )}
          {sponsorVerified === false && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800 text-sm">
                Sponsor code not found. You can still proceed without a sponsor.
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Payment Information — Stripe Elements */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Payment Information
        </h3>
        <div className="p-4 border rounded-lg bg-white">
          <PaymentElement />
        </div>
      </div>

      {/* Payment error */}
      {paymentError && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{paymentError}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 text-lg"
        disabled={loading || !stripe || !elements}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            Complete Registration - ${finalPrice}
            <ArrowRight className="h-5 w-5 ml-2" />
          </>
        )}
      </Button>

      <div className="text-center text-sm text-gray-600">
        By completing this registration, you agree to our Terms of Service and Privacy Policy. You will be charged $
        {finalPrice} {isAnnual ? "annually" : "monthly"}.
      </div>
    </form>
  )
}

// ── Page skeleton while fetching clientSecret ─────────────────────────────────
function PaymentSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-10 bg-gray-200 rounded" />
      <div className="h-4 bg-gray-200 rounded w-1/4" />
      <div className="h-10 bg-gray-200 rounded" />
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MLMCheckoutPage() {
  const searchParams = useSearchParams()

  const tierId = searchParams.get("tier") || "professional"
  const billing = searchParams.get("billing") || "monthly"

  const selectedTier = mlmPricingTiers.find((tier) => tier.id === tierId) || mlmPricingTiers[1]
  const isAnnual = billing === "annual"
  const monthlyPrice = selectedTier.price
  const annualPrice = Math.round(monthlyPrice * 10) // 2 months free
  const finalPrice = isAnnual ? annualPrice : monthlyPrice

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [intentError, setIntentError] = useState<string | null>(() =>
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      ? "Stripe is not configured. Please contact support."
      : null
  )

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) return
    fetch("/api/mlm/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tierId, billing }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
        } else {
          setIntentError(data.error ?? "Could not initialize payment. Please try again.")
        }
      })
      .catch(() => setIntentError("Could not initialize payment. Please try again."))
  }, [tierId, billing])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/mlm/pricing" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Pricing</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Crown className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                CreditAI MLM
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-600" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedTier.name} Plan</h3>
                      <p className="text-gray-600 text-sm">{selectedTier.description}</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">{isAnnual ? "Annual" : "Monthly"}</Badge>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Plan Price</span>
                      <span>${monthlyPrice}/month</span>
                    </div>
                    {isAnnual && (
                      <>
                        <div className="flex justify-between text-green-600">
                          <span>Annual Discount</span>
                          <span>-${monthlyPrice * 2} (2 months free)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annual Total</span>
                          <span>${annualPrice}/year</span>
                        </div>
                      </>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Today</span>
                    <span>${finalPrice}</span>
                  </div>

                  {/* Commission Preview */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Your Commission Potential</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-green-700">Credit Repair Sales</div>
                        <div className="font-bold text-green-800">{selectedTier.commissionDetails.creditRepair}</div>
                      </div>
                      <div>
                        <div className="text-blue-700">MLM Recruitment</div>
                        <div className="font-bold text-blue-800">{selectedTier.commissionDetails.mlmRecruitment}</div>
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">What&apos;s Included:</h4>
                    <ul className="space-y-1">
                      {selectedTier.features.slice(0, 6).map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Security Badge */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="font-semibold text-green-800">Secure Checkout</div>
                      <div className="text-sm text-green-700">256-bit SSL encryption protects your payment</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Checkout Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Registration</CardTitle>
                </CardHeader>
                <CardContent>
                  {intentError ? (
                    <div className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Payment initialization failed</p>
                        <p className="text-sm mt-1">{intentError}</p>
                      </div>
                    </div>
                  ) : !clientSecret ? (
                    <PaymentSkeleton />
                  ) : (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: { theme: "stripe" },
                      }}
                    >
                      <CheckoutForm
                        tierId={tierId}
                        billing={billing}
                        finalPrice={finalPrice}
                        isAnnual={isAnnual}
                        selectedTier={selectedTier}
                      />
                    </Elements>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
