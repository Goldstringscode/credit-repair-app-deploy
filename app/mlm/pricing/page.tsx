"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Star, Zap, Shield, Crown, ArrowRight, TrendingUp, Award, DollarSign } from "lucide-react"
import Link from "next/link"
import { mlmPricingTiers, mlmRanks, commissionExamples, levelCommissionRates } from "@/lib/mlm-commission-structure"

export default function MLMPricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)

  const calculateAnnualPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 10) // 2 months free
  }

  const calculateMonthlySavings = (monthlyPrice: number) => {
    return Math.round((monthlyPrice * 12 - calculateAnnualPrice(monthlyPrice)) / 12)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Crown className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                CreditAI MLM
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline">Back to Main Site</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Start Your MLM Empire
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join thousands of entrepreneurs building wealth through our proven MLM credit repair system. Earn
            commissions on multiple product lines with increasing rates as you advance.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${!isAnnual ? "text-gray-900 font-semibold" : "text-gray-500"}`}>Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} className="data-[state=checked]:bg-purple-600" />
            <span className={`text-sm ${isAnnual ? "text-gray-900 font-semibold" : "text-gray-500"}`}>Annual</span>
            {isAnnual && <Badge className="bg-green-100 text-green-800 ml-2">Save 2 months!</Badge>}
          </div>

          {/* Success Stats */}
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">$2.4M+</div>
              <div className="text-gray-600">Total Commissions Paid</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">15,000+</div>
              <div className="text-gray-600">Active MLM Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">$4,250</div>
              <div className="text-gray-600">Average Monthly Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">50%</div>
              <div className="text-gray-600">Max Commission Rate</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="pricing" className="max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="pricing">Pricing Plans</TabsTrigger>
            <TabsTrigger value="commissions">Commission Structure</TabsTrigger>
            <TabsTrigger value="ranks">Rank System</TabsTrigger>
            <TabsTrigger value="examples">Earning Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="pricing" className="space-y-8">
            {/* Pricing Cards */}
            <div className="grid lg:grid-cols-3 gap-8">
              {mlmPricingTiers.map((tier, index) => {
                const Icon = index === 0 ? Shield : index === 1 ? Star : Zap
                const displayPrice = isAnnual ? Math.round(calculateAnnualPrice(tier.price) / 12) : tier.price
                const savings = isAnnual ? calculateMonthlySavings(tier.price) : 0

                return (
                  <Card
                    key={tier.id}
                    className={`relative ${
                      tier.popular
                        ? "border-2 border-purple-500 shadow-2xl scale-105 bg-gradient-to-b from-white to-purple-50"
                        : "border border-gray-200 hover:shadow-xl bg-white"
                    } transition-all duration-300`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 text-sm font-semibold">
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-4">
                        <div
                          className={`p-4 rounded-full bg-gradient-to-r ${
                            tier.popular ? "from-purple-100 to-blue-100" : "from-gray-100 to-gray-200"
                          }`}
                        >
                          <Icon className={`h-8 w-8 ${tier.popular ? "text-purple-600" : "text-gray-600"}`} />
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                      <p className="text-gray-600 mt-2">{tier.description}</p>

                      <div className="mt-6">
                        <div className="flex items-baseline justify-center">
                          <span className="text-5xl font-bold text-gray-900">${displayPrice}</span>
                          <span className="text-gray-600 ml-2">/month</span>
                        </div>
                        {isAnnual && savings > 0 && (
                          <p className="text-sm text-green-600 font-semibold mt-1">Save ${savings}/month</p>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Commission Breakdown */}
                      <div className="space-y-3 mb-6">
                        <h4 className="font-semibold text-center mb-3">Commission Rates</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between p-2 bg-blue-50 rounded">
                            <span>Credit Repair:</span>
                            <span className="font-semibold text-blue-600">{tier.commissionDetails.creditRepair}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-green-50 rounded">
                            <span>MLM Recruitment:</span>
                            <span className="font-semibold text-green-600">
                              {tier.commissionDetails.mlmRecruitment}
                            </span>
                          </div>
                          <div className="flex justify-between p-2 bg-purple-50 rounded">
                            <span>Training Courses:</span>
                            <span className="font-semibold text-purple-600">
                              {tier.commissionDetails.trainingCourses}
                            </span>
                          </div>
                          <div className="flex justify-between p-2 bg-orange-50 rounded">
                            <span>Certified Mail:</span>
                            <span className="font-semibold text-orange-600">
                              {tier.commissionDetails.certifiedMail}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-semibold">Max Levels</span>
                          <Badge variant="outline">{tier.maxLevels === -1 ? "Unlimited" : tier.maxLevels}</Badge>
                        </div>
                      </div>

                      <ul className="space-y-3 mb-8">
                        {tier.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-3">
                            <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Link href={`/mlm/checkout?tier=${tier.id}&billing=${isAnnual ? "annual" : "monthly"}`}>
                        <Button
                          className={`w-full ${
                            tier.popular
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                              : "bg-gray-900 hover:bg-gray-800"
                          } text-white`}
                          size="lg"
                        >
                          Start {tier.name}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Multi-Level Commission Structure</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Earn commissions on multiple product lines with decreasing rates as levels go deeper. Higher ranks
                unlock bonus multipliers.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Level Commission Rates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Commission by Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {levelCommissionRates.slice(0, 7).map((level) => (
                      <div key={level.level} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-semibold">Level {level.level}</div>
                          <div className="text-sm text-gray-600">{level.description}</div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">{Math.round(level.rate * 100)}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Product Commission Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Product Commission Rates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <div className="font-semibold text-blue-900">Credit Repair Subscriptions</div>
                      <div className="text-sm text-blue-700 mb-2">
                        Monthly recurring revenue from credit repair services
                      </div>
                      <div className="text-2xl font-bold text-blue-600">25-35% Base Rate</div>
                    </div>

                    <div className="p-4 border rounded-lg bg-green-50">
                      <div className="font-semibold text-green-900">MLM Member Recruitment</div>
                      <div className="text-sm text-green-700 mb-2">
                        One-time commission for recruiting new MLM members
                      </div>
                      <div className="text-2xl font-bold text-green-600">40% Base Rate</div>
                    </div>

                    <div className="p-4 border rounded-lg bg-purple-50">
                      <div className="font-semibold text-purple-900">Training Courses</div>
                      <div className="text-sm text-purple-700 mb-2">Commission from training course sales</div>
                      <div className="text-2xl font-bold text-purple-600">30% Base Rate</div>
                    </div>

                    <div className="p-4 border rounded-lg bg-orange-50">
                      <div className="font-semibold text-orange-900">Certified Mail Services</div>
                      <div className="text-sm text-orange-700 mb-2">Commission from certified mail usage</div>
                      <div className="text-2xl font-bold text-orange-600">15% Base Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ranks" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">MLM Rank Advancement System</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Advance through 6 ranks to unlock higher commission bonuses and deeper earning levels. Each rank
                requires specific achievements.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mlmRanks.map((rank) => (
                <Card key={rank.id} className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: rank.color }} />
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 rounded-full" style={{ backgroundColor: `${rank.color}20` }}>
                        <Award className="h-8 w-8" style={{ color: rank.color }} />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{rank.name}</CardTitle>
                    <Badge variant="outline">Level {rank.level}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: rank.color }}>
                          +{Math.round(rank.commissionBonus * 100)}% Bonus
                        </div>
                        <div className="text-sm text-gray-600">Commission Multiplier</div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-semibold">Requirements:</div>
                        <div className="text-xs space-y-1">
                          <div>Personal Sales: ${rank.requirements.personalSales.toLocaleString()}</div>
                          <div>Team Sales: ${rank.requirements.teamSales.toLocaleString()}</div>
                          <div>Active Downlines: {rank.requirements.activeDownlines}</div>
                          {rank.requirements.timeInRank && (
                            <div>Time in Rank: {rank.requirements.timeInRank} months</div>
                          )}
                        </div>
                      </div>

                      <div className="text-center">
                        <Badge variant="outline">
                          Max {rank.maxLevels === -1 ? "Unlimited" : rank.maxLevels} Levels
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="examples" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Real Earning Examples</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                See exactly how much you can earn with different sales scenarios and rank bonuses.
              </p>
            </div>

            <div className="space-y-6">
              {commissionExamples.map((example, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{example.scenario}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-gray-600">Starter Plan</div>
                        <div className="text-xl font-bold text-green-600">{example.starter}</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="font-semibold text-blue-600">Professional Plan</div>
                        <div className="text-xl font-bold text-blue-600">{example.professional}</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="font-semibold text-purple-600">Enterprise Plan</div>
                        <div className="text-xl font-bold text-purple-600">{example.enterprise}</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                        <div className="font-semibold text-orange-600">With Rank Bonus</div>
                        <div className="text-sm font-bold text-red-600">{example.withRankBonus}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Monthly Earning Potential */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Earning Potential</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">$2,500</div>
                    <div className="text-sm text-gray-600">Conservative Estimate</div>
                    <div className="text-xs text-gray-500 mt-2">5 credit repair sales + 2 MLM recruits</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">$8,750</div>
                    <div className="text-sm text-gray-600">Realistic Target</div>
                    <div className="text-xs text-gray-500 mt-2">15 credit repair sales + 5 MLM recruits</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">$25,000+</div>
                    <div className="text-sm text-gray-600">Top Performer</div>
                    <div className="text-xs text-gray-500 mt-2">Large team with Presidential Diamond rank</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
