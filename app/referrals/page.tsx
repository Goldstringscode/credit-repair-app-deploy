"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Share2,
  Users,
  DollarSign,
  Gift,
  Copy,
  Mail,
  MessageSquare,
  Facebook,
  Twitter,
  Trophy,
  CheckCircle,
} from "lucide-react"

export default function ReferralsPage() {
  const [referralCode] = useState("CREDIT2024")
  const [referralLink] = useState("https://creditrepair.com/ref/CREDIT2024")
  const [copied, setCopied] = useState(false)

  const referralStats = {
    totalReferrals: 12,
    successfulReferrals: 8,
    pendingReferrals: 4,
    totalEarnings: 320,
    pendingEarnings: 160,
    nextReward: 500,
  }

  const referralHistory = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      status: "Active",
      signupDate: "2024-01-15",
      reward: 40,
      plan: "Professional",
    },
    {
      id: 2,
      name: "Mike Davis",
      email: "mike@example.com",
      status: "Active",
      signupDate: "2024-01-10",
      reward: 40,
      plan: "Professional",
    },
    {
      id: 3,
      name: "Emily Wilson",
      email: "emily@example.com",
      status: "Pending",
      signupDate: "2024-01-08",
      reward: 40,
      plan: "Basic",
    },
    {
      id: 4,
      name: "David Chen",
      email: "david@example.com",
      status: "Active",
      signupDate: "2024-01-05",
      reward: 80,
      plan: "Premium",
    },
  ]

  const rewardTiers = [
    { referrals: 5, reward: 200, title: "Bronze Referrer", achieved: true },
    { referrals: 10, reward: 500, title: "Silver Referrer", achieved: true },
    { referrals: 25, reward: 1000, title: "Gold Referrer", achieved: false },
    { referrals: 50, reward: 2500, title: "Platinum Referrer", achieved: false },
    { referrals: 100, reward: 5000, title: "Diamond Referrer", achieved: false },
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareViaEmail = () => {
    const subject = "Improve Your Credit Score with This Amazing Tool!"
    const body = `Hi there!\n\nI've been using this incredible credit repair platform and thought you might be interested. They help you dispute negative items, track your progress, and provide expert guidance.\n\nUse my referral link to get started: ${referralLink}\n\nYou'll get a special discount, and I'll earn a small reward too. It's a win-win!\n\nBest regards`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  const shareViaSMS = () => {
    const message = `Check out this amazing credit repair platform! Use my link for a special discount: ${referralLink}`
    window.open(`sms:?body=${encodeURIComponent(message)}`)
  }

  const shareViaFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const shareViaTwitter = () => {
    const text = "Improve your credit score with this amazing platform! Get started with my referral link:"
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const shareViaLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Referral Program</h1>
            <p className="text-xl text-blue-100 mb-6">Earn rewards by helping others improve their credit scores</p>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold">${referralStats.totalEarnings}</div>
                <div className="text-blue-100">Total Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{referralStats.successfulReferrals}</div>
                <div className="text-blue-100">Successful Referrals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">${referralStats.pendingEarnings}</div>
                <div className="text-blue-100">Pending Rewards</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Share Your Link</h3>
                <p className="text-gray-600 text-sm">Share your unique referral link with friends and family</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">2. They Sign Up</h3>
                <p className="text-gray-600 text-sm">Your referrals create an account and choose a paid plan</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Earn Rewards</h3>
                <p className="text-gray-600 text-sm">Get paid for each successful referral that stays active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="share" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="share">Share & Earn</TabsTrigger>
            <TabsTrigger value="history">Referral History</TabsTrigger>
            <TabsTrigger value="rewards">Reward Tiers</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Share Your Link */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Share2 className="h-5 w-5 mr-2" />
                    Share Your Referral Link
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Referral Code</label>
                    <div className="flex space-x-2">
                      <Input value={referralCode} readOnly className="bg-gray-50" />
                      <Button
                        onClick={() => copyToClipboard(referralCode)}
                        variant="outline"
                        className="bg-transparent"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Referral Link</label>
                    <div className="flex space-x-2">
                      <Input value={referralLink} readOnly className="bg-gray-50" />
                      <Button
                        onClick={() => copyToClipboard(referralLink)}
                        variant="outline"
                        className="bg-transparent"
                      >
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
                    <Button onClick={shareViaEmail} variant="outline" className="bg-transparent">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button onClick={shareViaSMS} variant="outline" className="bg-transparent">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      SMS
                    </Button>
                    <Button onClick={shareViaFacebook} variant="outline" className="bg-transparent">
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                    <Button onClick={shareViaTwitter} variant="outline" className="bg-transparent">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Current Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{referralStats.successfulReferrals}</div>
                    <p className="text-gray-600">Successful Referrals</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to next reward</span>
                      <span>{referralStats.successfulReferrals}/15</span>
                    </div>
                    <Progress value={(referralStats.successfulReferrals / 15) * 100} className="h-3" />
                    <p className="text-xs text-gray-500">
                      {15 - referralStats.successfulReferrals} more referrals to unlock Gold tier
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">${referralStats.totalEarnings}</div>
                      <div className="text-sm text-gray-600">Total Earned</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-xl font-bold text-yellow-600">${referralStats.pendingEarnings}</div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Referral Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Referral Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <Gift className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-semibold mb-1">Earn $40-$80</h4>
                    <p className="text-sm text-gray-600">Per successful referral based on their plan</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold mb-1">Help Others</h4>
                    <p className="text-sm text-gray-600">Help friends improve their credit scores</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-semibold mb-1">Unlock Bonuses</h4>
                    <p className="text-sm text-gray-600">Earn milestone bonuses as you refer more</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Referral History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {referralHistory.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{referral.name}</p>
                          <p className="text-sm text-gray-600">{referral.email}</p>
                          <p className="text-xs text-gray-500">Signed up: {referral.signupDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getStatusColor(referral.status)}>{referral.status}</Badge>
                          <Badge variant="outline">{referral.plan}</Badge>
                        </div>
                        <p className="text-sm font-medium text-green-600">${referral.reward} earned</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reward Tiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rewardTiers.map((tier, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        tier.achieved ? "bg-green-50 border-green-200" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            tier.achieved ? "bg-green-100" : "bg-gray-100"
                          }`}
                        >
                          {tier.achieved ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <Trophy className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{tier.title}</h4>
                          <p className="text-sm text-gray-600">{tier.referrals} successful referrals</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">${tier.reward}</p>
                        <p className="text-sm text-gray-600">Bonus reward</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Top Referrers This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { rank: 1, name: "Alex Thompson", referrals: 23, earnings: 920 },
                    { rank: 2, name: "Sarah Martinez", referrals: 19, earnings: 760 },
                    { rank: 3, name: "Mike Johnson", referrals: 15, earnings: 600 },
                    { rank: 4, name: "You", referrals: 8, earnings: 320 },
                    { rank: 5, name: "Lisa Chen", referrals: 7, earnings: 280 },
                  ].map((user, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        user.name === "You" ? "bg-blue-50 border-blue-200" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            user.rank === 1
                              ? "bg-yellow-500"
                              : user.rank === 2
                                ? "bg-gray-400"
                                : user.rank === 3
                                  ? "bg-amber-600"
                                  : "bg-blue-500"
                          }`}
                        >
                          {user.rank}
                        </div>
                        <div>
                          <p className={`font-medium ${user.name === "You" ? "text-blue-600" : ""}`}>{user.name}</p>
                          <p className="text-sm text-gray-600">{user.referrals} referrals</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${user.earnings}</p>
                        <p className="text-sm text-gray-600">earned</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
