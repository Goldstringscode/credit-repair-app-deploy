import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, Zap, Shield, Users, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Credit Repair AI</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/billing" className="text-gray-600 hover:text-gray-900">
                Billing
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/support" className="text-gray-600 hover:text-gray-900">
                Support
              </Link>
            </nav>
            <div className="flex space-x-4">
              <Button variant="outline" asChild>
                <Link href="/login">Beta Access</Link>
              </Button>
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Beta Notice */}
          <div className="mb-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
              🔒 Beta Version - Trusted Users Only
            </div>
          </div>
          
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Credit Repair
            <span className="text-blue-600"> Made Simple</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload your credit reports, get AI-powered analysis, and generate professional dispute letters
            automatically. Take control of your credit score with our advanced platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard/reports/upload">
                <Upload className="mr-2 h-5 w-5" />
                Upload Credit Report
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/test-setup">
                <Zap className="mr-2 h-5 w-5" />
                Test Setup
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/test-emails">
                <FileText className="mr-2 h-5 w-5" />
                Test Emails
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Repair Your Credit</h3>
            <p className="text-lg text-gray-600">
              Our comprehensive platform provides all the tools and resources you need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <FileText className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>AI Report Analysis</CardTitle>
                <CardDescription>
                  Upload PDF or image credit reports and get instant AI-powered analysis with structured data extraction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• OCR text extraction</li>
                  <li>• Credit score detection</li>
                  <li>• Account identification</li>
                  <li>• Negative item flagging</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Automated Dispute Letters</CardTitle>
                <CardDescription>
                  Generate professional, legally compliant dispute letters automatically based on your credit report
                  analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• FCRA compliant templates</li>
                  <li>• Personalized content</li>
                  <li>• Bureau-specific formatting</li>
                  <li>• Certified mail integration</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  Monitor your credit repair progress with detailed analytics and milestone tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Score improvement tracking</li>
                  <li>• Dispute status monitoring</li>
                  <li>• Timeline visualization</li>
                  <li>• Success rate analytics</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Professional Network</CardTitle>
                <CardDescription>
                  Connect with certified credit repair professionals and attorneys for complex cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Attorney consultations</li>
                  <li>• Expert case reviews</li>
                  <li>• Legal strategy guidance</li>
                  <li>• Professional referrals</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Credit Monitoring</CardTitle>
                <CardDescription>
                  Real-time credit monitoring with alerts for changes and potential identity theft protection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 24/7 credit monitoring</li>
                  <li>• Instant change alerts</li>
                  <li>• Identity theft protection</li>
                  <li>• Monthly score updates</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Educational Resources</CardTitle>
                <CardDescription>
                  Comprehensive training materials and courses to help you understand and improve your credit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Interactive courses</li>
                  <li>• Video tutorials</li>
                  <li>• Credit building strategies</li>
                  <li>• Legal rights education</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Start Repairing Your Credit?</h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who have successfully improved their credit scores
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/dashboard/reports/upload">Get Started Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-blue-400 mr-2" />
                <span className="text-lg font-bold">Credit Repair AI</span>
              </div>
              <p className="text-gray-400">Professional credit repair solutions powered by artificial intelligence.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/reports/upload" className="hover:text-white">
                    Upload Reports
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/letters" className="hover:text-white">
                    Dispute Letters
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/monitoring" className="hover:text-white">
                    Credit Monitoring
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/support" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/support/ai-chat" className="hover:text-white">
                    AI Chat Support
                  </Link>
                </li>
                <li>
                  <Link href="/test-setup" className="hover:text-white">
                    System Status
                  </Link>
                </li>
                <li>
                  <Link href="/test-emails" className="hover:text-white">
                    Email Testing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/docs/api" className="hover:text-white">
                    API Documentation
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Credit Repair AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
