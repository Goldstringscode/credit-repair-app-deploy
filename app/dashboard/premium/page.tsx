"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Gavel,
  Scale,
  Target,
  Star,
  Users,
  TrendingUp,
  Shield,
  Award,
  Clock,
  CheckCircle,
  ArrowRight,
  Phone,
  Video,
  MessageSquare,
  DollarSign,
} from "lucide-react"
import Link from "next/link"

export default function PremiumServicesPage() {
  const services = [
    {
      id: "attorney-review",
      name: "Attorney Review",
      description: "Professional legal review of your credit repair case by licensed attorneys",
      icon: Gavel,
      price: "Starting at $149",
      features: [
        "Licensed attorney review",
        "FCRA compliance check",
        "Legal strategy recommendations",
        "Document review and analysis",
        "Written legal opinion",
        "30-day follow-up support",
      ],
      stats: {
        successRate: "94%",
        avgTime: "2-3 days",
        satisfaction: "4.9/5",
      },
      href: "/dashboard/premium/attorney-review",
      color: "blue",
    },
    {
      id: "legal-strategy",
      name: "Legal Strategy Development",
      description: "Comprehensive strategic planning for complex credit repair cases",
      icon: Scale,
      price: "Starting at $199",
      features: [
        "Multi-phase strategic plan",
        "Risk assessment & mitigation",
        "Cost-benefit analysis",
        "Timeline with milestones",
        "Contingency planning",
        "Implementation roadmap",
      ],
      stats: {
        successRate: "96%",
        avgTime: "5-7 days",
        satisfaction: "4.8/5",
      },
      href: "/dashboard/premium/legal-strategy",
      color: "purple",
    },
    {
      id: "litigation-support",
      name: "Litigation Support",
      description: "Full litigation preparation and support for FCRA lawsuits",
      icon: Target,
      price: "Starting at $499",
      features: [
        "Case strength analysis",
        "Discovery strategy",
        "Settlement evaluation",
        "Trial preparation",
        "Expert witness coordination",
        "Ongoing legal support",
      ],
      stats: {
        successRate: "92%",
        avgTime: "7-10 days",
        satisfaction: "4.9/5",
      },
      href: "/dashboard/premium/litigation-support",
      color: "red",
    },
  ]

  const testimonials = [
    {
      name: "Sarah M.",
      case: "FCRA Violation",
      result: "$15,000 settlement",
      quote:
        "The attorney review service identified violations I never knew existed. The strategic approach led to a significant settlement.",
      rating: 5,
    },
    {
      name: "Michael R.",
      case: "Credit Dispute",
      result: "150-point increase",
      quote:
        "The legal strategy was comprehensive and effective. My credit score improved dramatically in just 3 months.",
      rating: 5,
    },
    {
      name: "Jennifer L.",
      case: "Identity Theft",
      result: "Complete resolution",
      quote: "Professional legal support made all the difference. They handled everything while I focused on my life.",
      rating: 5,
    },
  ]

  const comparisonData = [
    { feature: "Success Rate", diy: "67%", premium: "94%" },
    { feature: "Average Timeline", diy: "6-12 months", premium: "2-4 months" },
    { feature: "Legal Protection", diy: "None", premium: "Full" },
    { feature: "FCRA Compliance", diy: "Basic", premium: "Expert" },
    { feature: "Litigation Support", diy: "No", premium: "Yes" },
    { feature: "Settlement Recovery", diy: "Rare", premium: "Common" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Premium Legal Services</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Professional attorney services and legal strategy development for complex credit repair cases
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Service Overview */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {services.map((service) => {
            const IconComponent = service.icon
            const colorClasses = {
              blue: "border-blue-200 bg-blue-50 text-blue-600",
              purple: "border-purple-200 bg-purple-50 text-purple-600",
              red: "border-red-200 bg-red-50 text-red-600",
            }

            return (
              <Card key={service.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${service.color === "blue" ? "bg-blue-500" : service.color === "purple" ? "bg-purple-500" : "bg-red-500"}`}
                />
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${colorClasses[service.color]}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <Badge className="bg-green-100 text-green-800">{service.price}</Badge>
                  </div>
                  <CardTitle className="text-xl mb-2">{service.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Service Includes:</h4>
                      <ul className="text-sm space-y-1">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-green-600">{service.stats.successRate}</div>
                        <div className="text-gray-600">Success Rate</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-blue-600">{service.stats.avgTime}</div>
                        <div className="text-gray-600">Avg Time</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-purple-600">{service.stats.satisfaction}</div>
                        <div className="text-gray-600">Rating</div>
                      </div>
                    </div>

                    <Link href={service.href}>
                      <Button className="w-full">
                        Get Started
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Why Choose Premium Services */}
        <Card className="mb-12 border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center space-x-2">
              <Award className="h-6 w-6" />
              <span>Why Choose Premium Legal Services?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-800 mb-2">Higher Success Rates</h3>
                <p className="text-sm text-green-600">94% success rate vs 67% DIY approach</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-800 mb-2">Faster Results</h3>
                <p className="text-sm text-blue-600">2-4 months vs 6-12 months average</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-purple-800 mb-2">Legal Protection</h3>
                <p className="text-sm text-purple-600">Attorney-client privilege and legal expertise</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-orange-800 mb-2">Damage Recovery</h3>
                <p className="text-sm text-orange-600">Potential settlements and statutory damages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>DIY vs Premium Legal Services Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4">DIY Approach</th>
                    <th className="text-center py-3 px-4">Premium Legal Services</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4 font-medium">{row.feature}</td>
                      <td className="py-3 px-4 text-center text-red-600">{row.diy}</td>
                      <td className="py-3 px-4 text-center text-green-600 font-semibold">{row.premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Client Testimonials */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Client Success Stories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.case}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">{testimonial.result}</Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">"{testimonial.quote}"</p>
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact and Support */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Need Help Choosing the Right Service?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 mb-6">
              Our legal experts are available to help you determine which premium service is best for your specific
              situation.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Phone className="h-4 w-4 mr-2" />
                Schedule Phone Call
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent">
                <Video className="h-4 w-4 mr-2" />
                Video Consultation
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent">
                <MessageSquare className="h-4 w-4 mr-2" />
                Live Chat Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
