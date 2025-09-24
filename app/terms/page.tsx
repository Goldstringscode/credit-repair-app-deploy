import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"
import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">CreditAI Pro</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Terms of Service</CardTitle>
              <p className="text-gray-600">Last updated: January 1, 2024</p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using CreditAI Pro ("Service"), you accept and agree to be bound by the terms and
                provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                CreditAI Pro is a credit repair platform that provides AI-powered dispute letter generation, credit
                monitoring, and related services to help users improve their credit scores.
              </p>

              <h2>3. User Responsibilities</h2>
              <ul>
                <li>You must provide accurate and complete information when creating your account</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You agree to use the service only for lawful purposes</li>
                <li>You will not attempt to gain unauthorized access to our systems</li>
              </ul>

              <h2>4. Service Availability</h2>
              <p>
                We strive to maintain high availability of our service, but we do not guarantee uninterrupted access. We
                may temporarily suspend service for maintenance or updates.
              </p>

              <h2>5. Payment Terms</h2>
              <ul>
                <li>Subscription fees are billed monthly or annually as selected</li>
                <li>All fees are non-refundable except as required by law or our money-back guarantee</li>
                <li>We may change pricing with 30 days notice to existing subscribers</li>
              </ul>

              <h2>6. Money-Back Guarantee</h2>
              <p>
                We offer a 120% money-back guarantee if you don't see credit score improvement within 90 days of active
                service usage, subject to our guarantee terms and conditions.
              </p>

              <h2>7. Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and
                protect your personal information.
              </p>

              <h2>8. Intellectual Property</h2>
              <p>
                All content, features, and functionality of the service are owned by CreditAI Pro and are protected by
                copyright, trademark, and other intellectual property laws.
              </p>

              <h2>9. Limitation of Liability</h2>
              <p>
                CreditAI Pro shall not be liable for any indirect, incidental, special, consequential, or punitive
                damages resulting from your use of the service.
              </p>

              <h2>10. Termination</h2>
              <p>
                Either party may terminate this agreement at any time. Upon termination, your right to use the service
                will cease immediately.
              </p>

              <h2>11. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of significant changes via
                email or through the service.
              </p>

              <h2>12. Contact Information</h2>
              <p>If you have any questions about these Terms of Service, please contact us at:</p>
              <ul>
                <li>Email: legal@creditaipro.com</li>
                <li>Phone: 1-800-CREDIT-AI</li>
                <li>Address: 123 Credit Street, Finance City, FC 12345</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
