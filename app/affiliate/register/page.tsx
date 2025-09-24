"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, TrendingUp, Star, CheckCircle, Gift, Target, CreditCard } from "lucide-react"
import { commissionTiers } from "@/lib/affiliate"

export default function AffiliateRegister() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    website: "",
    company: "",
    experience: "",
    audience: "",
    promotion: "",
    paymentMethod: "",
    paymentEmail: "",
    agreeTerms: false,
    agreeMarketing: false,
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  const benefits = [
    {
      icon: DollarSign,
      title: "High Commissions",
      description: "Earn 30-45% commission on every successful referral",
    },
    {
      icon: TrendingUp,
      title: "Recurring Revenue",
      description: "Lifetime commissions on Gold and Platinum tiers",
    },
    {
      icon: Users,
      title: "Growing Market",
      description: "Credit repair is a $4+ billion industry",
    },
    {
      icon: Star,
      title: "Premium Product",
      description: "AI-powered platform with attorney support",
    },
    {
      icon: Gift,
      title: "Marketing Support",
      description: "Professional materials and landing pages",
    },
    {
      icon: Target,
      title: "High Conversion",
      description: "Industry-leading conversion rates",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">Join Our Affiliate Program</h1>
            <p className="text-xl text-blue-100 mb-8">
              Partner with the leading AI-powered credit repair platform and earn substantial commissions
            </p>
            <div className="flex items-center justify-center space-x-8 text-center">
              <div>
                <div className="text-3xl font-bold">30-45%</div>
                <div className="text-blue-100">Commission Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold">$2,500+</div>
                <div className="text-blue-100">Avg Monthly Earnings</div>
              </div>
              <div>
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-blue-100">Support</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Benefits Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Why Partner With Us?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <benefit.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Commission Tiers */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Commission Tiers</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.values(commissionTiers).map((tier, index) => (
              <Card key={index} className={tier.tier === "gold" ? "border-yellow-300 shadow-lg" : ""}>
                <CardHeader className="text-center">
                  <Badge
                    className={`mx-auto mb-2 ${
                      tier.tier === "bronze"
                        ? "bg-amber-100 text-amber-800"
                        : tier.tier === "silver"
                          ? "bg-gray-100 text-gray-800"
                          : tier.tier === "gold"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {tier.tier.toUpperCase()}
                  </Badge>
                  <CardTitle className="text-2xl">{tier.commissionRate * 100}%</CardTitle>
                  <p className="text-sm text-gray-600">{tier.minReferrals}+ referrals</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {tier.benefits.slice(0, 3).map((benefit, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Registration Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">
              Affiliate Registration - Step {currentStep} of {totalSteps}
            </CardTitle>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Personal Information
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website/Social Media</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://your-website.com"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company/Organization</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Marketing Experience
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Marketing Experience *</Label>
                    <Select onValueChange={(value) => handleInputChange("experience", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                        <SelectItem value="advanced">Advanced (5+ years)</SelectItem>
                        <SelectItem value="expert">Expert (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience *</Label>
                    <Select onValueChange={(value) => handleInputChange("audience", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Who is your audience?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consumers">General Consumers</SelectItem>
                        <SelectItem value="financial">Financial Services</SelectItem>
                        <SelectItem value="real-estate">Real Estate</SelectItem>
                        <SelectItem value="credit-repair">Credit Repair Industry</SelectItem>
                        <SelectItem value="bloggers">Bloggers/Influencers</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promotion">How will you promote our services? *</Label>
                    <Textarea
                      id="promotion"
                      placeholder="Describe your marketing strategy, channels, and expected reach..."
                      value={formData.promotion}
                      onChange={(e) => handleInputChange("promotion", e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Information
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Preferred Payment Method *</Label>
                    <Select onValueChange={(value) => handleInputChange("paymentMethod", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentEmail">PayPal Email (if selected)</Label>
                    <Input
                      id="paymentEmail"
                      type="email"
                      placeholder="your-paypal@email.com"
                      value={formData.paymentEmail}
                      onChange={(e) => handleInputChange("paymentEmail", e.target.value)}
                    />
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeTerms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeTerms", checked as boolean)}
                      />
                      <Label htmlFor="agreeTerms" className="text-sm">
                        I agree to the{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          Terms and Conditions
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          Affiliate Agreement
                        </a>{" "}
                        *
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeMarketing"
                        checked={formData.agreeMarketing}
                        onCheckedChange={(checked) => handleInputChange("agreeMarketing", checked as boolean)}
                      />
                      <Label htmlFor="agreeMarketing" className="text-sm">
                        I agree to receive marketing communications and affiliate updates
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}

                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep} className="ml-auto">
                    Next Step
                  </Button>
                ) : (
                  <Button type="submit" className="ml-auto" disabled={!formData.agreeTerms}>
                    Submit Application
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">How much can I earn?</h4>
                <p className="text-gray-600">
                  Top affiliates earn $5,000+ per month. Your earnings depend on your marketing efforts, audience size,
                  and conversion rates. We provide all the tools and support you need to succeed.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">When do I get paid?</h4>
                <p className="text-gray-600">
                  Payments are processed monthly on the 15th for the previous month's earnings. Minimum payout is $50.
                  We support PayPal, bank transfer, and check payments.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">What marketing materials do you provide?</h4>
                <p className="text-gray-600">
                  We provide banners, email templates, landing pages, social media content, and more. All materials are
                  professionally designed and optimized for conversions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
