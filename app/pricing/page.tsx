import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Shield, Zap, Gift } from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"


export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: 0,
      period: "month",
      description: "Try it out with one dispute letter, on us",
      features: [
        "1 AI-powered dispute letter per month",
        "Manual credit report entry",
        "Email support",
        "Credit education resources",
        "You only pay for certified mail shipping",
      ],
      buttonText: "Get Started Free",
      popular: false,
      icon: Gift,
    },
    {
      name: "Basic",
      price: 39,
      period: "month",
      description: "Perfect for getting started with credit repair",
      features: [
        "AI-powered dispute letter generation",
        "Basic credit score tracking",
        "Email support",
        "Up to 5 disputes per month",
        "Credit education resources",
        "Mobile app access",
      ],
      buttonText: "Start Basic Plan",
      popular: false,
      icon: Shield,
    },
    {
      name: "Professional",
      price: 79,
      period: "month",
      description: "Most popular plan for serious credit repair",
      features: [
        "Everything in Basic",
        "Unlimited dispute letters",
        "24/7 AI chat support",
        "Advanced credit analytics",
        "Priority processing",
        "Phone support",
        "Credit monitoring alerts",
        "Personalized action plans",
      ],
      buttonText: "Start Professional Plan",
      popular: true,
      icon: Star,
    },
    {
      name: "Premium",
      price: 129,
      period: "month",
      description: "Complete credit repair solution with expert support",
      features: [
        "Everything in Professional",
        "Dedicated credit specialist",
        "Legal document review",
        "Identity theft protection",
        "Credit builder recommendations",
        "Mortgage readiness reports",
        "120% money-back guarantee",
        "White-glove service",
      ],
      buttonText: "Start Premium Plan",
      popular: false,
      icon: Zap,
    },
  ]


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <SiteHeader />


      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Choose Your Credit Repair Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Start improving your credit score today with our AI-powered platform. Try it free, or unlock more with a
            paid plan backed by our 120% money-back guarantee.
          </p>


          {/* Money Back Guarantee Badge */}
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">120% Money-Back Guarantee on Paid Plans</span>
          </div>
        </div>


        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <Card
                key={index}
                className={`relative ${
                  plan.popular
                    ? "border-2 border-blue-500 shadow-xl scale-105"
                    : "border border-gray-200 hover:shadow-lg"
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                )}


                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${plan.popular ? "bg-blue-100" : "bg-gray-100"}`}>
                      <Icon className={`h-8 w-8 ${plan.popular ? "text-blue-600" : "text-gray-600"}`} />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                </CardHeader>


                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>


                  <Link href={plan.price === 0 ? "/signup" : `/checkout?plan=${plan.name.toLowerCase()}`}>
                    <Button
                      className={`w-full ${
                        plan.popular ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-900 hover:bg-gray-800"
                      }`}
                      size="lg"
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>


        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                question: "What's included in the 120% money-back guarantee?",
                answer:
                  "If you don't see improvement in your credit score within 90 days, we'll refund 120% of what you paid. No questions asked. This applies to paid plans only, since the Free plan has no charge to refund.",
              },
              {
                question: "Can I cancel my subscription anytime?",
                answer:
                  "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.",
              },
              {
                question: "How quickly will I see results?",
                answer:
                  "Most customers see improvements within 30-60 days. Results vary based on your specific credit situation and the accuracy of disputed items.",
              },
              {
                question: "Is my personal information secure?",
                answer:
                  "Absolutely. We use bank-level encryption and security measures to protect your personal and financial information.",
              },
              {
                question: "What does the Free plan actually cost?",
                answer:
                  "The Free plan itself is $0 — you're never charged for the subscription. The only cost is certified mail shipping when you're ready to send your dispute letter, charged separately at the time you send it.",
              },
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

