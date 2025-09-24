"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  Users,
  TrendingUp,
  Star,
  CheckCircle,
  Gift,
  Target,
  Globe,
  ArrowRight,
  Zap,
  Shield,
  Award,
} from "lucide-react"
import Link from "next/link"
import { commissionTiers } from "@/lib/affiliate"

export default function AffiliatePage() {
  const features = [
    {
      icon: DollarSign,
      title: "High Commissions",
      description: "Earn 30-45% commission on every successful referral with lifetime recurring revenue potential",
    },
    {
      icon: TrendingUp,
      title: "Growing Market",
      description: "Credit repair is a $4+ billion industry with millions of potential customers",
    },
    {
      icon: Users,
      title: "High Conversion",
      description: "Industry-leading conversion rates with our AI-powered platform and attorney support",
    },
    {
      icon: Star,
      title: "Premium Product",
      description: "Market-leading credit repair platform with cutting-edge AI technology",
    },
    {
      icon: Gift,
      title: "Marketing Support",
      description: "Professional marketing materials, landing pages, and dedicated support",
    },
    {
      icon: Target,
      title: "Real-Time Tracking",
      description: "Advanced analytics dashboard with real-time performance tracking",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Financial Blogger",
      earnings: "$4,200/month",
      quote:
        "The affiliate program has been incredible. The high-quality product practically sells itself, and the support team is amazing.",
    },
    {
      name: "Mike Rodriguez",
      role: "Credit Consultant",
      earnings: "$6,800/month",
      quote:
        "I've tried many affiliate programs, but this one stands out. The commission rates are excellent and payments are always on time.",
    },
    {
      name: "Emily Chen",
      role: "Social Media Influencer",
      earnings: "$3,500/month",
      quote:
        "My audience loves the platform, and I love the recurring commissions. It's a win-win for everyone involved.",
    },
  ]

  const stats = [
    { label: "Active Affiliates", value: "2,500+" },
    { label: "Total Commissions Paid", value: "$2.8M+" },
    { label: "Average Monthly Earnings", value: "$2,400" },
    { label: "Top Affiliate Earnings", value: "$15K/month" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-white/20 text-white mb-6 px-4 py-2">🚀 Now Accepting New Affiliates</Badge>
            <h1 className="text-6xl font-bold mb-6">
              Earn Big with Our
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Affiliate Program
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of successful affiliates earning substantial commissions by promoting the world's most
              advanced AI-powered credit repair platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/affiliate/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
                  Join Now - It's Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/affiliate/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
                >
                  Affiliate Login
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">{stat.value}</div>
                  <div className="text-blue-100 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Why Choose Us */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Partner With Us?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer the most lucrative and supportive affiliate program in the credit repair industry
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Commission Tiers */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Commission Structure</h2>
            <p className="text-xl text-gray-600">Earn more as you grow - our tier system rewards your success</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.values(commissionTiers).map((tier, index) => (
              <Card
                key={index}
                className={`relative ${tier.tier === "gold" ? "border-2 border-yellow-400 shadow-xl scale-105" : ""}`}
              >
                {tier.tier === "gold" && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-yellow-400 text-yellow-900 px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <Badge
                    className={`mx-auto mb-4 ${
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
                  <CardTitle className="text-3xl font-bold text-blue-600">{tier.commissionRate * 100}%</CardTitle>
                  <p className="text-gray-600">
                    {tier.minReferrals === 0 ? "No minimum" : `${tier.minReferrals}+ referrals`}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  {tier.lifetimeCommission && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center text-green-800 text-sm font-medium">
                        <Zap className="h-4 w-4 mr-2" />
                        Lifetime Recurring Revenue
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Success Stories */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600">Hear from our top-performing affiliates</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <blockquote className="text-gray-700 mb-4 italic">"{testimonial.quote}"</blockquote>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="font-semibold text-green-600">{testimonial.earnings}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Start earning in just 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Sign Up Free</h3>
              <p className="text-gray-600">Complete our simple application form and get approved within 24-48 hours</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Promote & Share</h3>
              <p className="text-gray-600">Use our marketing materials and your unique link to promote our services</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Earn Commissions</h3>
              <p className="text-gray-600">
                Get paid monthly for every successful referral with our reliable payment system
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold mb-4">Ready to Start Earning?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join our affiliate program today and start earning substantial commissions with the industry's best
                credit repair platform
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/affiliate/register">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
                    <Shield className="mr-2 h-5 w-5" />
                    Join Free Today
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
                >
                  <Globe className="mr-2 h-5 w-5" />
                  Learn More
                </Button>
              </div>
              <p className="text-sm text-blue-200 mt-4">No setup fees • No monthly costs • Start earning immediately</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
