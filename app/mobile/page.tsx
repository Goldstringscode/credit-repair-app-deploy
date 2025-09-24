"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Star, Shield, Zap, Bell, CreditCard, BarChart3, CheckCircle, Apple, Play } from "lucide-react"

export default function MobilePage() {
  const features = [
    {
      icon: CreditCard,
      title: "Credit Monitoring",
      description: "Real-time credit score updates and alerts on your phone",
    },
    {
      icon: Bell,
      title: "Push Notifications",
      description: "Instant notifications for important credit changes",
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Visual charts and graphs to track your improvement",
    },
    {
      icon: Shield,
      title: "Secure Access",
      description: "Biometric login and bank-level security",
    },
    {
      icon: Zap,
      title: "Quick Actions",
      description: "Generate dispute letters and check reports instantly",
    },
    {
      icon: Smartphone,
      title: "Offline Access",
      description: "View your data even without internet connection",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      rating: 5,
      comment: "The mobile app makes it so easy to track my progress on the go!",
      avatar: "SJ",
    },
    {
      name: "Mike Davis",
      rating: 5,
      comment: "Love getting instant notifications when my score changes.",
      avatar: "MD",
    },
    {
      name: "Emily Wilson",
      rating: 5,
      comment: "Clean interface and super fast. Much better than the website!",
      avatar: "EW",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-white/20 text-white mb-4">
                <Star className="h-3 w-3 mr-1" />
                4.9 Rating • 50K+ Downloads
              </Badge>
              <h1 className="text-5xl font-bold mb-6">
                Credit Repair
                <br />
                <span className="text-blue-200">On The Go</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Take control of your credit score anywhere, anytime. Our mobile app puts powerful credit repair tools
                right in your pocket.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-black hover:bg-gray-800 text-white">
                  <Apple className="h-5 w-5 mr-2" />
                  Download for iOS
                </Button>
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                  <Play className="h-5 w-5 mr-2" />
                  Get it on Google Play
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Free to download</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Works offline</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Secure & private</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <div className="w-64 h-[500px] bg-gray-900 rounded-[3rem] mx-auto p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                    {/* Mock phone screen */}
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-20 flex items-center justify-center">
                      <div className="text-white font-semibold">Credit Score: 742</div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-16 bg-blue-50 rounded-lg"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-12 bg-green-50 rounded"></div>
                        <div className="h-12 bg-purple-50 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute top-10 -left-4 bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div className="absolute bottom-20 -right-4 bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need in One App</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our mobile app includes all the powerful features from our web platform, optimized for your smartphone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">See It In Action</h2>
            <p className="text-gray-600">Take a look at our beautiful, intuitive interface</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Dashboard", description: "Overview of your credit health" },
              { title: "Progress Tracking", description: "Visual charts and analytics" },
              { title: "Dispute Letters", description: "Generate letters on the go" },
            ].map((screen, index) => (
              <div key={index} className="text-center">
                <div className="w-48 h-96 bg-gray-900 rounded-3xl mx-auto p-2 mb-4 shadow-xl">
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl"></div>
                </div>
                <h3 className="font-semibold text-lg mb-1">{screen.title}</h3>
                <p className="text-gray-600 text-sm">{screen.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Users Are Saying</h2>
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-gray-600">4.9 out of 5 stars</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">{testimonial.avatar}</span>
                    </div>
                    <span className="font-medium">{testimonial.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Take Control?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are improving their credit scores with our mobile app.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-black hover:bg-gray-800 text-white">
              <Apple className="h-5 w-5 mr-2" />
              Download for iOS
            </Button>
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              <Play className="h-5 w-5 mr-2" />
              Get it on Google Play
            </Button>
          </div>

          <p className="text-blue-100 text-sm">
            Free to download • Available worldwide • Works with your existing account
          </p>
        </div>
      </section>
    </div>
  )
}
