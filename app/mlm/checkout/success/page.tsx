"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  Crown,
  Gift,
  Users,
  BookOpen,
  TrendingUp,
  Mail,
  Smartphone,
  ArrowRight,
  Copy,
  Share2,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function MLMCheckoutSuccessPage() {
  const [referralCode, setReferralCode] = useState("")
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Generate referral code (in production, this would come from the API)
    const code = `CREDIT${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    setReferralCode(code)
  }, [])

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const shareReferralLink = () => {
    const referralLink = `https://creditai.com/signup?ref=${referralCode}`
    if (navigator.share) {
      navigator.share({
        title: "Join CreditAI MLM",
        text: "Start your credit repair MLM business today!",
        url: referralLink,
      })
    } else {
      navigator.clipboard.writeText(referralLink)
      toast({
        title: "Link Copied!",
        description: "Referral link copied to clipboard",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to CreditAI MLM! 🎉</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Congratulations! Your MLM registration is complete. You're now part of our exclusive network of credit
              repair entrepreneurs.
            </p>
          </div>

          {/* Success Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <Gift className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-800 mb-1">Welcome Bonus</h3>
                <p className="text-2xl font-bold text-green-600">$50</p>
                <p className="text-sm text-green-700">Added to your account</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-blue-800 mb-1">Commission Rate</h3>
                <p className="text-2xl font-bold text-blue-600">40%</p>
                <p className="text-sm text-blue-700">On all referrals</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-purple-800 mb-1">Max Levels</h3>
                <p className="text-2xl font-bold text-purple-600">7</p>
                <p className="text-sm text-purple-700">Deep commission</p>
              </CardContent>
            </Card>
          </div>

          {/* Referral Code Card */}
          <Card className="mb-8 bg-gradient-to-r from-purple-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Crown className="h-6 w-6" />
                <span>Your Unique Referral Code</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Your Referral Code</p>
                    <p className="text-2xl font-bold font-mono">{referralCode}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={copyReferralCode}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={shareReferralLink}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-sm opacity-90">
                Share this code with potential referrals to earn commissions on their subscriptions and build your MLM
                network.
              </p>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Next Steps to Success</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-purple-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Complete Your Profile</h4>
                      <p className="text-sm text-gray-600">Set up your MLM profile and customize your referral page</p>
                      <Link href="/mlm/profile">
                        <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                          Setup Profile
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Access Training Materials</h4>
                      <p className="text-sm text-gray-600">Learn proven strategies to build your MLM business</p>
                      <Link href="/mlm/training">
                        <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                          Start Training
                          <BookOpen className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-green-600">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Make Your First Referral</h4>
                      <p className="text-sm text-gray-600">Share your referral code and earn your first commission</p>
                      <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={shareReferralLink}>
                        Share Now
                        <Share2 className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-orange-600">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Download Mobile App</h4>
                      <p className="text-sm text-gray-600">Manage your MLM business on the go</p>
                      <Link href="/mlm/mobile">
                        <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                          Get App
                          <Smartphone className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-red-600">5</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Join Community</h4>
                      <p className="text-sm text-gray-600">Connect with other successful MLM entrepreneurs</p>
                      <Link href="/mlm/community">
                        <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                          Join Community
                          <Users className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-yellow-600">6</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Track Your Progress</h4>
                      <p className="text-sm text-gray-600">Monitor your earnings and team growth</p>
                      <Link href="/mlm/dashboard">
                        <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                          View Dashboard
                          <TrendingUp className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-800">
                  <Mail className="h-5 w-5" />
                  <span>Check Your Email</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 mb-4">We've sent you a welcome email with:</p>
                <ul className="space-y-1 text-sm text-blue-600">
                  <li>• Your login credentials</li>
                  <li>• Getting started guide</li>
                  <li>• Marketing materials</li>
                  <li>• Training schedule</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <Gift className="h-5 w-5" />
                  <span>Welcome Bonus</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 mb-4">
                  Your $50 welcome bonus has been added to your account and can be used for:
                </p>
                <ul className="space-y-1 text-sm text-green-600">
                  <li>• Platform credits</li>
                  <li>• Marketing materials</li>
                  <li>• Additional training</li>
                  <li>• Certified mail services</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/mlm/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Go to MLM Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/mlm/training">
                <Button variant="outline" size="lg">
                  Start Training
                  <BookOpen className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-600">
              Questions? Contact our MLM support team at{" "}
              <a href="mailto:mlm-support@creditai.com" className="text-purple-600 hover:underline">
                mlm-support@creditai.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
