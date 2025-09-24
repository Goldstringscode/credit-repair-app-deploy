"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CreditCard, Shield, CheckCircle, Scale, FileText, Lock, Star, Clock, Users, TrendingUp } from "lucide-react"

export default function FCRAComplaintCheckout() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const complaintType = searchParams.get("type") || "no_response"

  const [selectedServices, setSelectedServices] = useState({
    complaint: true,
    enhancedDispute: false,
    legalReview: false,
    cfpbFiling: false,
    prioritySupport: false,
    followUp: false,
  })

  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)

  const services = {
    complaint: {
      name: "FCRA Complaint Letter",
      description: "Professional complaint letter with legal citations",
      price: complaintType === "repeated_violation" ? 49.99 : complaintType === "refused_correction" ? 39.99 : 29.99,
      features: [
        "Professional legal formatting",
        "Specific FCRA section citations",
        "Evidence documentation",
        "CFPB-ready format",
      ],
    },
    enhancedDispute: {
      name: "Enhanced Dispute Package",
      description: "Dispute letter + Standard complaint combo",
      price: 22.99,
      features: [
        "Professional dispute letter",
        "Standard complaint letter",
        "FCRA-compliant formatting",
        "Dual-pressure approach",
      ],
    },
    legalReview: {
      name: "Attorney Legal Review",
      description: "Licensed attorney review before filing",
      price: 49.99,
      features: [
        "Licensed attorney review",
        "Legal strategy recommendations",
        "Compliance verification",
        "Success probability assessment",
      ],
    },
    cfpbFiling: {
      name: "CFPB Filing Service",
      description: "Direct filing with Consumer Financial Protection Bureau",
      price: 19.99,
      features: [
        "Direct CFPB portal submission",
        "Filing confirmation receipt",
        "Status tracking updates",
        "Response notifications",
      ],
    },
    prioritySupport: {
      name: "Priority Support",
      description: "24/7 priority customer support",
      price: 14.99,
      features: ["24/7 priority support", "Direct phone access", "Same-day responses", "Dedicated support agent"],
    },
    followUp: {
      name: "Follow-up Service",
      description: "Automated follow-up letters and tracking",
      price: 24.99,
      features: [
        "Automated follow-up letters",
        "Response deadline tracking",
        "Escalation recommendations",
        "Progress monitoring",
      ],
    },
  }

  const calculateTotal = () => {
    let total = 0
    Object.entries(selectedServices).forEach(([key, selected]) => {
      if (selected) {
        total += services[key as keyof typeof services].price
      }
    })
    return total - discount
  }

  const applyPromoCode = () => {
    const promoCodes = {
      FIRST20: 0.2,
      LEGAL50: 50,
      FCRA30: 0.3,
      SAVE25: 25,
    }

    if (promoCodes[promoCode as keyof typeof promoCodes]) {
      const promoValue = promoCodes[promoCode as keyof typeof promoCodes]
      if (promoValue < 1) {
        setDiscount(calculateTotal() * promoValue)
      } else {
        setDiscount(promoValue)
      }
    }
  }

  const processPayment = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Redirect to success page
    router.push("/dashboard/letters/fcra-complaint/success")
  }

  const complaintTypeNames = {
    no_response: "No Response to Dispute",
    inadequate_investigation: "Inadequate Investigation",
    refused_correction: "Refused to Correct Error",
    repeated_violation: "Repeated FCRA Violations",
    enhanced_dispute: "Enhanced Dispute Package",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Scale className="h-6 w-6 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FCRA Complaint Checkout</h1>
              <p className="text-gray-600 mt-1">Complete your FCRA complaint service purchase</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Service Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  <span>Selected Complaint Type</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <h3 className="font-semibold text-red-900">
                      {complaintTypeNames[complaintType as keyof typeof complaintTypeNames]}
                    </h3>
                    <p className="text-sm text-red-700">Professional FCRA complaint letter with legal citations</p>
                  </div>
                  <Badge className="bg-red-600 text-white">${services.complaint.price}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Services</CardTitle>
                <p className="text-sm text-gray-600">Enhance your complaint with professional services</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(services)
                  .slice(1)
                  .map(([key, service]) => (
                    <div key={key} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={key}
                        checked={selectedServices[key as keyof typeof selectedServices]}
                        onCheckedChange={(checked) =>
                          setSelectedServices({
                            ...selectedServices,
                            [key]: checked,
                          })
                        }
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{service.name}</h4>
                          <Badge variant="outline">${service.price}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        <ul className="text-xs text-gray-500 mt-2 space-y-1">
                          {service.features.map((feature, index) => (
                            <li key={index} className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center space-x-2 cursor-pointer">
                      <CreditCard className="h-4 w-4" />
                      <span>Credit/Debit Card</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex items-center space-x-2 cursor-pointer">
                      <Shield className="h-4 w-4" />
                      <span>PayPal</span>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input id="expiryDate" placeholder="MM/YY" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input id="zipCode" placeholder="12345" />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(selectedServices).map(([key, selected]) => {
                  if (!selected) return null
                  const service = services[key as keyof typeof services]
                  return (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm">{service.name}</span>
                      <span className="text-sm font-medium">${service.price}</span>
                    </div>
                  )
                })}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal</span>
                    <span className="text-sm">${(calculateTotal() + discount).toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm">Discount</span>
                      <span className="text-sm">-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promoCode">Promo Code</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="promoCode"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                    />
                    <Button variant="outline" onClick={applyPromoCode}>
                      Apply
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="w-full bg-red-600 hover:bg-red-700"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Lock className="h-4 w-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Complete Purchase - ${calculateTotal().toFixed(2)}
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <Shield className="h-3 w-3" />
                  <span>Secure 256-bit SSL encryption</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Success Guarantee</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-green-700 space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>92% success rate with FCRA complaints</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Average resolution time: 45 days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Over 10,000 successful complaints filed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Average credit score increase: 76 points</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <span>Your complaint letter will be generated immediately</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <span>Legal review (if selected) within 24 hours</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <span>CFPB filing (if selected) within 48 hours</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <span>Track progress in your dashboard</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
