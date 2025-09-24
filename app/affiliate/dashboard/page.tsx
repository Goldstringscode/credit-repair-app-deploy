"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DollarSign,
  Users,
  TrendingUp,
  Copy,
  Download,
  Eye,
  CreditCard,
  Star,
  CheckCircle,
  Clock,
  ExternalLink,
  Share2,
  Mail,
  MessageSquare,
  Facebook,
  Twitter,
} from "lucide-react"
import { mockAffiliate, commissionTiers } from "@/lib/affiliate"

export default function AffiliateDashboard() {
  const [copied, setCopied] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("30")

  const affiliate = mockAffiliate
  const currentTier = commissionTiers[affiliate.tier]
  const nextTier = commissionTiers["gold"] // Next tier for silver

  const affiliateLink = `https://creditrepair.com/ref/${affiliate.affiliateCode}`

  const recentReferrals = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      status: "converted",
      signupDate: "2024-01-20",
      plan: "Professional",
      commission: 23.7,
      conversionDate: "2024-01-22",
    },
    {
      id: 2,
      name: "Mike Davis",
      email: "mike@example.com",
      status: "pending",
      signupDate: "2024-01-18",
      plan: "Basic",
      commission: 11.7,
      conversionDate: null,
    },
    {
      id: 3,
      name: "Emily Wilson",
      email: "emily@example.com",
      status: "converted",
      signupDate: "2024-01-15",
      plan: "Premium",
      commission: 38.7,
      conversionDate: "2024-01-16",
    },
    {
      id: 4,
      name: "David Chen",
      email: "david@example.com",
      status: "converted",
      signupDate: "2024-01-12",
      plan: "Professional",
      commission: 23.7,
      conversionDate: "2024-01-14",
    },
  ]

  const marketingMaterials = [
    {
      id: 1,
      type: "banner",
      name: "Credit Repair Hero Banner",
      size: "728x90",
      format: "PNG",
      clicks: 1250,
      conversions: 23,
    },
    {
      id: 2,
      type: "email",
      name: "Welcome Email Template",
      size: "HTML",
      format: "HTML",
      clicks: 890,
      conversions: 18,
    },
    {
      id: 3,
      type: "social",
      name: "Social Media Kit",
      size: "Multiple",
      format: "ZIP",
      clicks: 650,
      conversions: 12,
    },
    {
      id: 4,
      type: "landing",
      name: "Custom Landing Page",
      size: "Responsive",
      format: "URL",
      clicks: 2100,
      conversions: 45,
    },
  ]

  const paymentHistory = [
    {
      id: 1,
      date: "2024-01-15",
      amount: 450.0,
      method: "PayPal",
      status: "completed",
      referrals: 8,
    },
    {
      id: 2,
      date: "2023-12-15",
      amount: 380.5,
      method: "PayPal",
      status: "completed",
      referrals: 6,
    },
    {
      id: 3,
      date: "2023-11-15",
      amount: 290.0,
      method: "PayPal",
      status: "completed",
      referrals: 5,
    },
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "converted":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "bg-amber-100 text-amber-800"
      case "silver":
        return "bg-gray-100 text-gray-800"
      case "gold":
        return "bg-yellow-100 text-yellow-800"
      case "platinum":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const shareViaEmail = () => {
    const subject = "Transform Your Credit Score with AI-Powered Credit Repair"
    const body = `Hi there!\n\nI wanted to share an incredible credit repair platform that's been helping people improve their credit scores using AI technology.\n\nThey offer:\n• AI-powered dispute letter generation\n• Attorney-reviewed legal documents\n• Certified mail service\n• 24/7 support\n• Money-back guarantee\n\nCheck it out here: ${affiliateLink}\n\nBest regards`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  const shareViaSMS = () => {
    const message = `Improve your credit score with AI-powered credit repair! Check out this platform: ${affiliateLink}`
    window.open(`sms:?body=${encodeURIComponent(message)}`)
  }

  const shareViaFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(affiliateLink)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const shareViaTwitter = () => {
    const text = "Transform your credit score with AI-powered credit repair! 🚀"
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(affiliateLink)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const shareViaLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(affiliateLink)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Affiliate Dashboard</h1>
              <p className="text-blue-100">Welcome back! Here's your performance overview</p>
            </div>
            <div className="text-right">
              <Badge className={`${getTierColor(affiliate.tier)} mb-2`}>{affiliate.tier.toUpperCase()} AFFILIATE</Badge>
              <div className="text-sm text-blue-100">Member since {affiliate.joinDate.toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">${affiliate.totalEarnings.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2 text-xs text-gray-500">+12.5% from last month</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Referrals</p>
                  <p className="text-2xl font-bold text-blue-600">{affiliate.activeReferrals}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2 text-xs text-gray-500">{affiliate.totalReferrals} total referrals</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{(affiliate.conversionRate * 100).toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-2 text-xs text-gray-500">Above average (45%)</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Earnings</p>
                  <p className="text-2xl font-bold text-orange-600">${affiliate.pendingEarnings.toFixed(2)}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="mt-2 text-xs text-gray-500">Next payout: Jan 31st</div>
            </CardContent>
          </Card>
        </div>

        {/* Tier Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Tier Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Current: {currentTier.tier.toUpperCase()} Affiliate</h4>
                  <p className="text-sm text-gray-600">{currentTier.commissionRate * 100}% commission rate</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">Next: GOLD Affiliate</p>
                  <p className="text-sm text-gray-600">{nextTier.commissionRate * 100}% commission rate</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to Gold tier</span>
                  <span>
                    {affiliate.totalReferrals}/{nextTier.minReferrals}
                  </span>
                </div>
                <Progress value={(affiliate.totalReferrals / nextTier.minReferrals) * 100} className="h-3" />
                <p className="text-xs text-gray-500">
                  {nextTier.minReferrals - affiliate.totalReferrals} more referrals to unlock Gold tier benefits
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <h5 className="font-medium">Current Benefits:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {currentTier.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium">Gold Tier Benefits:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {nextTier.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Affiliate Link */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Share2 className="h-5 w-5 mr-2" />
                    Your Affiliate Link
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Affiliate Code</label>
                    <div className="flex space-x-2">
                      <Input value={affiliate.affiliateCode} readOnly className="bg-gray-50" />
                      <Button onClick={() => copyToClipboard(affiliate.affiliateCode)} variant="outline">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Referral Link</label>
                    <div className="flex space-x-2">
                      <Input value={affiliateLink} readOnly className="bg-gray-50" />
                      <Button onClick={() => copyToClipboard(affiliateLink)} variant="outline">
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {copied && (
                    <div className="text-sm text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Copied to clipboard!
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <Button onClick={shareViaEmail} variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button onClick={shareViaSMS} variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      SMS
                    </Button>
                    <Button onClick={shareViaFacebook} variant="outline">
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                    <Button onClick={shareViaTwitter} variant="outline">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Clicks This Month</p>
                      <p className="text-xl font-bold text-blue-600">1,247</p>
                    </div>
                    <Eye className="h-8 w-8 text-blue-600" />
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Conversions</p>
                      <p className="text-xl font-bold text-green-600">18</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>

                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Avg. Commission</p>
                      <p className="text-xl font-bold text-purple-600">$27.50</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Referrals</CardTitle>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReferrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{referral.name}</p>
                          <p className="text-sm text-gray-600">{referral.email}</p>
                          <p className="text-xs text-gray-500">
                            Signed up: {referral.signupDate}
                            {referral.conversionDate && ` • Converted: ${referral.conversionDate}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getStatusColor(referral.status)}>{referral.status}</Badge>
                          <Badge variant="outline">{referral.plan}</Badge>
                        </div>
                        <p className="text-sm font-medium text-green-600">
                          ${referral.commission.toFixed(2)} commission
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Marketing Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {marketingMaterials.map((material) => (
                    <div key={material.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{material.name}</h4>
                        <Badge variant="outline">{material.type}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1 mb-3">
                        <p>Size: {material.size}</p>
                        <p>Format: {material.format}</p>
                        <p>Clicks: {material.clicks.toLocaleString()}</p>
                        <p>Conversions: {material.conversions}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Use
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Total Paid</p>
                      <p className="text-xl font-bold text-green-600">${affiliate.paidEarnings.toFixed(2)}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>

                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Pending Payment</p>
                      <p className="text-xl font-bold text-yellow-600">${affiliate.pendingEarnings.toFixed(2)}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>

                  <div className="pt-4">
                    <Button className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Request Payout
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paymentHistory.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">${payment.amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">{payment.date}</p>
                          <p className="text-xs text-gray-500">{payment.referrals} referrals</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 mb-1">{payment.status}</Badge>
                          <p className="text-xs text-gray-500">{payment.method}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Method</label>
                  <Select value={affiliate.paymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">PayPal Email</label>
                  <Input value={affiliate.paymentDetails.email || ""} placeholder="your-paypal@email.com" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum Payout Amount</label>
                  <Select defaultValue="50">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">$25</SelectItem>
                      <SelectItem value="50">$50</SelectItem>
                      <SelectItem value="100">$100</SelectItem>
                      <SelectItem value="250">$250</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
