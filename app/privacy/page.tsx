import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
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
              <CardTitle className="text-3xl">Privacy Policy</CardTitle>
              <p className="text-gray-600">Last updated: January 1, 2024</p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h2>1. Information We Collect</h2>

              <h3>Personal Information</h3>
              <ul>
                <li>Name, email address, phone number</li>
                <li>Billing and payment information</li>
                <li>Social Security Number (for credit report access)</li>
                <li>Date of birth and address</li>
              </ul>

              <h3>Credit Information</h3>
              <ul>
                <li>Credit reports from all three bureaus</li>
                <li>Credit scores and monitoring data</li>
                <li>Account information and payment history</li>
                <li>Dispute history and outcomes</li>
              </ul>

              <h3>Usage Information</h3>
              <ul>
                <li>Service usage patterns and preferences</li>
                <li>Device information and IP addresses</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <ul>
                <li>Provide credit repair and monitoring services</li>
                <li>Generate dispute letters and communicate with credit bureaus</li>
                <li>Process payments and manage your account</li>
                <li>Send service updates and notifications</li>
                <li>Improve our services and develop new features</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2>3. Information Sharing</h2>
              <p>We do not sell your personal information. We may share information with:</p>
              <ul>
                <li>
                  <strong>Credit Bureaus:</strong> To submit disputes and monitor changes
                </li>
                <li>
                  <strong>Service Providers:</strong> Third parties who help us operate our service
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with mergers or acquisitions
                </li>
              </ul>

              <h2>4. Data Security</h2>
              <p>We implement industry-standard security measures including:</p>
              <ul>
                <li>256-bit SSL encryption for data transmission</li>
                <li>Encrypted data storage with access controls</li>
                <li>Regular security audits and monitoring</li>
                <li>Employee training on data protection</li>
                <li>Multi-factor authentication for account access</li>
              </ul>

              <h2>5. Your Rights and Choices</h2>
              <ul>
                <li>
                  <strong>Access:</strong> Request copies of your personal information
                </li>
                <li>
                  <strong>Correction:</strong> Update or correct inaccurate information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal information
                </li>
                <li>
                  <strong>Portability:</strong> Receive your data in a portable format
                </li>
                <li>
                  <strong>Opt-out:</strong> Unsubscribe from marketing communications
                </li>
              </ul>

              <h2>6. Cookies and Tracking</h2>
              <p>We use cookies and similar technologies to:</p>
              <ul>
                <li>Remember your preferences and settings</li>
                <li>Analyze service usage and performance</li>
                <li>Provide personalized content and recommendations</li>
                <li>Prevent fraud and enhance security</li>
              </ul>

              <h2>7. Data Retention</h2>
              <p>
                We retain your information for as long as necessary to provide services and comply with legal
                obligations. Credit-related information may be retained for up to 7 years as required by financial
                regulations.
              </p>

              <h2>8. International Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure
                appropriate safeguards are in place to protect your information.
              </p>

              <h2>9. Children's Privacy</h2>
              <p>
                Our service is not intended for individuals under 18 years of age. We do not knowingly collect personal
                information from children under 18.
              </p>

              <h2>10. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of significant changes via email
                or through our service.
              </p>

              <h2>11. Contact Us</h2>
              <p>If you have questions about this privacy policy or our data practices, contact us at:</p>
              <ul>
                <li>Email: privacy@creditaipro.com</li>
                <li>Phone: 1-800-CREDIT-AI</li>
                <li>Address: 123 Credit Street, Finance City, FC 12345</li>
              </ul>

              <h2>12. State-Specific Rights</h2>

              <h3>California Residents (CCPA)</h3>
              <p>California residents have additional rights including:</p>
              <ul>
                <li>Right to know what personal information is collected</li>
                <li>Right to delete personal information</li>
                <li>Right to opt-out of sale of personal information</li>
                <li>Right to non-discrimination for exercising privacy rights</li>
              </ul>

              <h3>European Residents (GDPR)</h3>
              <p>European residents have rights under GDPR including:</p>
              <ul>
                <li>Right of access to personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
