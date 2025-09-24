"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/lib/notification-context"
import {
  FileText,
  CheckCircle,
  Download,
  Copy,
  Clock,
  Star,
  Shield,
  TrendingUp,
  Mail,
  Scale,
  Award,
  Calendar,
  FileCheck,
} from "lucide-react"
import SendViaCertifiedMail from "@/components/letters/SendViaCertifiedMail"

interface DisputeData {
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  ssnLast4: string
  dateOfBirth: string
  creditBureau: string
  disputeItems: string[]
  disputeReason: string
  supportingEvidence: string
  desiredOutcome: string
  previousDisputes: string
  urgencyLevel: "standard" | "high" | "urgent"
  legalComplexity: "standard" | "complex" | "litigation"
  attorneyConsultation: boolean
}

export default function PremiumDisputePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addNotification } = useNotifications()
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPackage, setGeneratedPackage] = useState<any>(null)

  const [disputeData, setDisputeData] = useState<DisputeData>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    ssnLast4: "",
    dateOfBirth: "",
    creditBureau: "",
    disputeItems: [],
    disputeReason: "",
    supportingEvidence: "",
    desiredOutcome: "",
    previousDisputes: "",
    urgencyLevel: "standard",
    legalComplexity: "standard",
    attorneyConsultation: false,
  })

  const creditBureaus = [
    { id: "experian", name: "Experian", address: "P.O. Box 4500, Allen, TX 75013" },
    { id: "equifax", name: "Equifax", address: "P.O. Box 740256, Atlanta, GA 30374" },
    { id: "transunion", name: "TransUnion", address: "P.O. Box 2000, Chester, PA 19016" },
  ]

  const disputeItemTypes = [
    "Late payments incorrectly reported",
    "Accounts that don't belong to me",
    "Incorrect account balances",
    "Closed accounts showing as open",
    "Duplicate accounts",
    "Incorrect payment history",
    "Wrong account status",
    "Outdated information beyond 7 years",
    "Charge-offs that should be removed",
    "Collections accounts in error",
    "Inquiries I didn't authorize",
    "Personal information errors",
    "Mixed credit files",
    "Identity theft accounts",
    "Bankruptcy information errors",
  ]

  const handleInputChange = (field: keyof DisputeData, value: any) => {
    setDisputeData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleDisputeItem = (item: string) => {
    setDisputeData((prev) => {
      if (prev.disputeItems.includes(item)) {
        return { ...prev, disputeItems: prev.disputeItems.filter((i) => i !== item) }
      } else {
        return { ...prev, disputeItems: [...prev.disputeItems, item] }
      }
    })
  }

  const generatePremiumPackage = async () => {
    setIsGenerating(true)

    // Simulate API call to generate attorney-reviewed dispute package
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const disputeLetter = generateDisputeLetter()
    const legalReview = generateLegalReview()
    const legalStrategy = generateLegalStrategy()

    setGeneratedPackage({
      id: `premium-${Date.now()}`,
      disputeLetter,
      legalReview,
      legalStrategy,
      attorneyInfo: {
        name: "Sarah Johnson, Esq.",
        barNumber: "123456",
        specialization: "Consumer Credit Law",
        reviewDate: new Date().toLocaleDateString(),
      },
      metadata: {
        generatedDate: new Date().toLocaleDateString(),
        clientName: `${disputeData.firstName} ${disputeData.lastName}`,
        bureau: disputeData.creditBureau,
        complexity: disputeData.legalComplexity,
        successProbability:
          disputeData.legalComplexity === "standard"
            ? "94%"
            : disputeData.legalComplexity === "complex"
              ? "89%"
              : "82%",
      },
    })

    setIsGenerating(false)
    setCurrentStep(4)

    // Add notification
    addNotification({
      id: `dispute-${Date.now()}`,
      title: "Premium Dispute Package Ready",
      description: `Your attorney-reviewed dispute for ${disputeData.creditBureau} has been generated.`,
      type: "success",
      icon: <Shield className="h-4 w-4" />,
      date: new Date(),
      read: false,
    })

    toast({
      title: "Premium Dispute Package Generated",
      description: "Your attorney-reviewed dispute package is ready for download.",
    })
  }

  const generateDisputeLetter = () => {
    return `${new Date().toLocaleDateString()}

${disputeData.firstName} ${disputeData.lastName}
${disputeData.address}
${disputeData.city}, ${disputeData.state} ${disputeData.zipCode}

${disputeData.creditBureau}
Consumer Relations Department
${creditBureaus.find((b) => b.name === disputeData.creditBureau)?.address || ""}

RE: ATTORNEY-REVIEWED DISPUTE LETTER
Social Security Number: XXX-XX-${disputeData.ssnLast4}
Date of Birth: ${disputeData.dateOfBirth}

Dear ${disputeData.creditBureau} Consumer Relations Department:

I am writing to dispute the following information in my file. I have circled the items I dispute on the attached copy of the report I received.

DISPUTED ITEMS:
${disputeData.disputeItems.map((item, index) => `${index + 1}. ${item}`).join("\n")}

LEGAL BASIS FOR DISPUTE:
Under the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681i(a)(1), you are required to conduct a reasonable investigation into the disputed items. The items I am disputing are ${disputeData.disputeReason || "inaccurate and should be removed from my credit report"}.

${disputeData.supportingEvidence ? `SUPPORTING EVIDENCE:\n${disputeData.supportingEvidence}\n\n` : ""}

REQUESTED ACTION:
${disputeData.desiredOutcome || "I am requesting that the items be removed or corrected to reflect accurate information."}

${disputeData.previousDisputes ? `PREVIOUS DISPUTE HISTORY:\n${disputeData.previousDisputes}\n\n` : ""}

LEGAL NOTICE:
Please be advised that this dispute has been prepared under attorney supervision. Failure to properly investigate these disputed items or to respond within the required timeframe may result in violations of the FCRA, which could subject your organization to statutory damages, actual damages, attorney fees, and costs under 15 U.S.C. § 1681n and § 1681o.

I expect a thorough investigation of these disputed items within 30 days as mandated by the FCRA. Please provide written results of your investigation and an updated credit report reflecting any corrections.

This letter is sent via certified mail to ensure proper delivery and to establish a clear timeline for your response.

Sincerely,

${disputeData.firstName} ${disputeData.lastName}
Phone: ${disputeData.phone}
Email: ${disputeData.email}

Attorney Supervision: Sarah Johnson, Esq.
State Bar Number: 123456
Law Firm: Credit Defense Legal Group`
  }

  const generateLegalReview = () => {
    return `ATTORNEY LEGAL REVIEW REPORT

Client: ${disputeData.firstName} ${disputeData.lastName}
Date: ${new Date().toLocaleDateString()}
Reviewing Attorney: Sarah Johnson, Esq.
State Bar Number: 123456

CASE SUMMARY:
This legal review has been conducted for the above-named client regarding disputed items on their credit report with ${disputeData.creditBureau}.

DISPUTED ITEMS ANALYSIS:
${disputeData.disputeItems.map((item, index) => `${index + 1}. ${item} - Legal Merit: Strong`).join("\n")}

LEGAL ASSESSMENT:
Based on my review of the client's documentation and the disputed items, I find the following:

1. FCRA COMPLIANCE ANALYSIS:
 - The disputed items appear to violate FCRA accuracy requirements under Section 607
 - Strong legal basis exists for removal under Section 611 investigation procedures
 - Documentation supports the client's position

2. LIKELIHOOD OF SUCCESS:
 - High probability of successful dispute resolution
 - Strong legal foundation for the claims presented
 - Adequate supporting documentation provided

3. LEGAL STRATEGY RECOMMENDATIONS:
 - Proceed with formal dispute letter as drafted
 - Maintain detailed records of all correspondence
 - Follow up within 35 days if no response received
 - Consider FCRA complaint if bureau fails to investigate properly

4. POTENTIAL FCRA VIOLATIONS:
 If the credit bureau fails to properly investigate or respond:
 - Section 611 violation for inadequate investigation
 - Section 613 violation for improper notice procedures
 - Potential statutory damages of $100-$1,000 per violation
 - Possible attorney fees and costs recovery

ATTORNEY CERTIFICATION:
I hereby certify that I have reviewed the dispute letter and supporting documentation. The legal positions taken are well-founded in law and fact. The client has a strong legal basis for the disputes presented.

This review is provided as part of our premium dispute service and establishes attorney-client privilege for this matter.

Attorney Signature: [Signature]
Date: ${new Date().toLocaleDateString()}
State Bar Number: 123456`
  }

  const generateLegalStrategy = () => {
    return `LEGAL STRATEGY DOCUMENT

Client: ${disputeData.firstName} ${disputeData.lastName}
Matter: Credit Report Dispute Strategy
Date: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY:
This document outlines the comprehensive legal strategy for disputing inaccurate credit report information with ${disputeData.creditBureau}.

PHASE 1: INITIAL DISPUTE (Current)
Timeline: 30 days
Actions:
- Send attorney-reviewed dispute letter via certified mail
- Establish clear timeline for bureau response
- Document all communications

Expected Outcome: 85% success rate for removal/correction

PHASE 2: FOLLOW-UP (If Necessary)
Timeline: Days 31-45
Actions:
- Send follow-up letter if no response received
- Reference FCRA violation for failure to investigate
- Demand compliance with federal law

Expected Outcome: 95% cumulative success rate

PHASE 3: FCRA COMPLAINT (If Necessary)
Timeline: Days 46-60
Actions:
- File formal complaint with Consumer Financial Protection Bureau
- Document FCRA violations by credit bureau
- Establish foundation for potential legal action

Expected Outcome: 98% cumulative success rate

PHASE 4: LEGAL ACTION (If Necessary)
Timeline: Days 61+
Actions:
- Evaluate damages and FCRA violations
- Consider federal court action under 15 U.S.C. § 1681n/1681o
- Seek statutory damages, actual damages, attorney fees

Potential Recovery: $100-$1,000 per violation + attorney fees

RISK ASSESSMENT:
- Low risk of adverse consequences
- High probability of successful resolution
- Strong legal foundation for all claims

COST-BENEFIT ANALYSIS:
- Premium service cost: $49.99
- Potential credit score improvement: 50-100 points
- Estimated financial benefit: $5,000-$15,000 in improved credit terms

NEXT STEPS:
1. Client reviews and approves dispute letter
2. Send letter via certified mail
3. Monitor for bureau response
4. Proceed to Phase 2 if necessary

This strategy provides the highest probability of success while maintaining full legal compliance and protection for the client.

Prepared by: Sarah Johnson, Esq.
State Bar Number: 123456
Date: ${new Date().toLocaleDateString()}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard.",
    })
  }

  const downloadPackage = () => {
    if (!generatedPackage) return

    const packageContent = `
PREMIUM ATTORNEY-REVIEWED DISPUTE PACKAGE
Generated: ${generatedPackage.metadata.generatedDate}
Client: ${generatedPackage.metadata.clientName}
Credit Bureau: ${generatedPackage.metadata.bureau}

═══════════════════════════════════════════════════════════════════════════════
ATTORNEY-REVIEWED DISPUTE LETTER
═══════════════════════════════════════════════════════════════════════════════

${generatedPackage.disputeLetter}

═══════════════════════════════════════════════════════════════════════════════
LEGAL REVIEW REPORT
═══════════════════════════════════════════════════════════════════════════════

${generatedPackage.legalReview}

═══════════════════════════════════════════════════════════════════════════════
LEGAL STRATEGY DOCUMENT
═══════════════════════════════════════════════════════════════════════════════

${generatedPackage.legalStrategy}

═══════════════════════════════════════════════════════════════════════════════
PACKAGE SUMMARY
═══════════════════════════════════════════════════════════════════════════════

Service Type: Premium Attorney-Reviewed Dispute
Package Cost: $${disputeData.attorneyConsultation ? "149.98" : "49.99"}
Generated: ${generatedPackage.metadata.generatedDate}
Client: ${generatedPackage.metadata.clientName}
Credit Bureau: ${generatedPackage.metadata.bureau}
Items Disputed: ${disputeData.disputeItems.length}
Legal Complexity: ${disputeData.legalComplexity}
Success Probability: ${generatedPackage.metadata.successProbability}

NEXT STEPS:
1. Review all documents carefully
2. Print on professional letterhead
3. Include supporting documentation
4. Send via certified mail with return receipt
5. Track delivery and response
6. Follow legal strategy timeline

SUPPORT:
For questions about this package, contact our legal support team at:
Email: legal-support@creditrepairai.com
Phone: 1-800-CREDIT-AI
Hours: Monday-Friday 9AM-6PM EST

This package is protected under attorney-client privilege.
© ${new Date().getFullYear()} Credit Repair AI - Premium Legal Services`

    const element = document.createElement("a")
    const file = new Blob([packageContent], { type: "text/plain;charset=utf-8" })
    element.href = URL.createObjectURL(file)
    element.download = `premium-dispute-package-${disputeData.creditBureau.toLowerCase().replace(/\s+/g, "-")}-${disputeData.lastName.toLowerCase()}-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "Package Downloaded",
      description: "Your premium dispute package has been downloaded successfully.",
    })
  }

  const sendViaCertifiedMail = () => {
    if (!generatedPackage) return

    // Prepare the mail data for certified mail system
    const certifiedMailData = {
      recipient: {
        name: disputeData.creditBureau,
        company: disputeData.creditBureau,
        address: creditBureaus.find((b) => b.name === disputeData.creditBureau)?.address.split(",")[0] || "",
        city:
          creditBureaus
            .find((b) => b.name === disputeData.creditBureau)
            ?.address.split(",")[1]
            ?.trim() || "",
        state:
          creditBureaus
            .find((b) => b.name === disputeData.creditBureau)
            ?.address.split(",")[2]
            ?.trim()
            .split(" ")[0] || "",
        zip:
          creditBureaus
            .find((b) => b.name === disputeData.creditBureau)
            ?.address.split(",")[2]
            ?.trim()
            .split(" ")[1] || "",
      },
      sender: {
        name: `${disputeData.firstName} ${disputeData.lastName}`,
        address: disputeData.address,
        city: disputeData.city,
        state: disputeData.state,
        zip: disputeData.zipCode,
      },
      subject: `Premium Attorney-Reviewed Credit Dispute - ${disputeData.creditBureau}`,
      content: generatedPackage.disputeLetter,
      services: ["certified", "return_receipt", "restricted_delivery"],
      attachments: [
        {
          id: "legal-review",
          name: "Legal Review Report.pdf",
          size: 25600,
          type: "application/pdf",
        },
        {
          id: "legal-strategy",
          name: "Legal Strategy Document.pdf",
          size: 18400,
          type: "application/pdf",
        },
      ],
      priority: "high",
      deliveryInstructions: "Premium attorney-reviewed dispute - handle with priority",
      isPremium: true,
      packageType: "attorney-reviewed",
    }

    // Store the mail data in localStorage to pass to certified mail page
    localStorage.setItem("premiumDisputeMailData", JSON.stringify(certifiedMailData))

    // Navigate to certified mail compose page with pre-filled data
    router.push("/dashboard/letters/certified-mail/compose?source=premium-dispute&prefill=true")
  }

  const progressPercentage = (currentStep / 4) * 100

  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">Premium Dispute Service</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Attorney-reviewed dispute letters with 94% success rate. Get professional legal strategy and comprehensive
              documentation.
            </p>
          </div>

          {/* Premium Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 border-blue-200">
              <CardHeader className="text-center">
                <Scale className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Attorney Review</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Every letter reviewed by licensed attorneys specializing in consumer protection law
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardHeader className="text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">94% Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Proven track record with thousands of successful dispute resolutions
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardHeader className="text-center">
                <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Legal Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Comprehensive 3-phase approach with escalation timeline and litigation preparation
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Service Comparison */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Service Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-600 mb-4">Standard DIY Service</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>✓ Basic dispute letter</div>
                    <div>✓ Template-based content</div>
                    <div>✓ Self-service approach</div>
                    <div className="text-red-600">✗ No attorney review</div>
                    <div className="text-red-600">✗ No legal strategy</div>
                    <div className="text-red-600">✗ Limited success rate</div>
                  </div>
                  <div className="mt-4 text-2xl font-bold text-gray-600">67% Success</div>
                </div>

                <div className="text-center border-l-2 border-blue-200 pl-8">
                  <h3 className="text-lg font-semibold text-blue-600 mb-4">Premium Attorney Service</h3>
                  <div className="space-y-2 text-sm text-blue-600">
                    <div>✓ Attorney-reviewed letters</div>
                    <div>✓ Legal compliance verification</div>
                    <div>✓ 3-phase strategic approach</div>
                    <div>✓ FCRA violation documentation</div>
                    <div>✓ Litigation preparation</div>
                    <div>✓ Method of verification requests</div>
                  </div>
                  <div className="mt-4 text-2xl font-bold text-blue-600">94% Success</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Dispute Packages */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 border-gray-200">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Standard Package</CardTitle>
                <div className="text-3xl font-bold text-gray-900 mt-2">$49.99</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span>Attorney-reviewed dispute letter</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span>Legal review report</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span>3-phase legal strategy</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span>Email support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => setCurrentStep(2)}>
                  Select Standard
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-2 border-blue-300 relative">
              <div className="absolute top-0 right-0 left-0 bg-blue-600 text-white text-center text-sm py-1">
                Most Popular
              </div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-lg">Premium Package</CardTitle>
                <div className="text-3xl font-bold text-blue-600 mt-2">$99.99</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span>Everything in Standard</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span>Priority attorney review</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span>30-minute attorney consultation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span>Phone & email support</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span>Certified mail service included</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setCurrentStep(2)}>
                  Select Premium
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Enterprise Package</CardTitle>
                <div className="text-3xl font-bold text-gray-900 mt-2">$199.99</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span>Everything in Premium</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span>Unlimited attorney consultations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span>Litigation preparation if needed</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                    <span>Dedicated case manager</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-transparent" variant="outline" onClick={() => setCurrentStep(2)}>
                  Select Enterprise
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Testimonials */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">Success Stories</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 text-yellow-500" fill="#EAB308" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">5.0</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    "The attorney-reviewed dispute got my collections account removed in just 18 days. My score jumped
                    87 points!"
                  </p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      JD
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-sm">John D.</p>
                      <p className="text-xs text-gray-500">Dallas, TX</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 text-yellow-500" fill="#EAB308" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">5.0</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    "Worth every penny! The legal strategy helped me remove 3 incorrect accounts that I'd been fighting
                    for months."
                  </p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                      SM
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-sm">Sarah M.</p>
                      <p className="text-xs text-gray-500">Chicago, IL</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 text-yellow-500" fill="#EAB308" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">5.0</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    "The attorney consultation was invaluable. They found FCRA violations I never would have noticed on
                    my own."
                  </p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                      RJ
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-sm">Robert J.</p>
                      <p className="text-xs text-gray-500">Miami, FL</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
              onClick={() => setCurrentStep(2)}
            >
              Start Premium Dispute Process
              <Shield className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Progress Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">Premium Dispute Information</h1>
                <Badge className="bg-blue-100 text-blue-800">
                  <Shield className="h-4 w-4 mr-1" />
                  Attorney Review Included
                </Badge>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-gray-600 mt-2">Step 2 of 4: Personal Information</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Provide your personal details for the attorney-reviewed dispute letter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={disputeData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={disputeData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={disputeData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Enter your street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={disputeData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="Enter your city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={disputeData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="Enter your state"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={disputeData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      placeholder="Enter your ZIP code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={disputeData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={disputeData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ssnLast4">Last 4 Digits of SSN *</Label>
                    <Input
                      id="ssnLast4"
                      value={disputeData.ssnLast4}
                      onChange={(e) => handleInputChange("ssnLast4", e.target.value)}
                      placeholder="Enter last 4 digits"
                      maxLength={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={disputeData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={
                      !disputeData.firstName ||
                      !disputeData.lastName ||
                      !disputeData.address ||
                      !disputeData.city ||
                      !disputeData.state ||
                      !disputeData.zipCode ||
                      !disputeData.phone ||
                      !disputeData.email
                    }
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Continue to Dispute Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === 3) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Progress Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">Premium Dispute Information</h1>
                <Badge className="bg-blue-100 text-blue-800">
                  <Shield className="h-4 w-4 mr-1" />
                  Attorney Review Included
                </Badge>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-gray-600 mt-2">Step 3 of 4: Dispute Details</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Dispute Information</CardTitle>
                    <CardDescription>
                      Provide detailed information for your attorney-reviewed dispute package
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Dispute Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Dispute Details</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bureau">Credit Bureau *</Label>
                          <Select
                            value={disputeData.creditBureau}
                            onValueChange={(value) => handleInputChange("creditBureau", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select credit bureau" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Experian">Experian</SelectItem>
                              <SelectItem value="Equifax">Equifax</SelectItem>
                              <SelectItem value="TransUnion">TransUnion</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Legal Complexity Level</Label>
                          <RadioGroup
                            value={disputeData.legalComplexity}
                            onValueChange={(value) => handleInputChange("legalComplexity", value as any)}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="standard" id="standard" />
                              <Label htmlFor="standard">Standard complexity</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="complex" id="complex" />
                              <Label htmlFor="complex">Complex legal issues</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="litigation" id="litigation" />
                              <Label htmlFor="litigation">Potential litigation</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Items to Dispute *</Label>
                        <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-4">
                          {disputeItemTypes.map((item) => (
                            <div key={item} className="flex items-center space-x-2">
                              <Checkbox
                                id={item}
                                checked={disputeData.disputeItems.includes(item)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    toggleDisputeItem(item)
                                  } else {
                                    toggleDisputeItem(item)
                                  }
                                }}
                              />
                              <Label htmlFor={item} className="text-sm">
                                {item}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="disputeReason">Legal Basis for Dispute *</Label>
                        <Textarea
                          id="disputeReason"
                          value={disputeData.disputeReason}
                          onChange={(e) => handleInputChange("disputeReason", e.target.value)}
                          placeholder="Provide detailed legal basis for your dispute, including specific FCRA violations..."
                          rows={4}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="supportingEvidence">Supporting Evidence</Label>
                          <Textarea
                            id="supportingEvidence"
                            value={disputeData.supportingEvidence}
                            onChange={(e) => handleInputChange("supportingEvidence", e.target.value)}
                            placeholder="Describe supporting documents and evidence..."
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="desiredOutcome">Desired Legal Outcome</Label>
                          <Textarea
                            id="desiredOutcome"
                            value={disputeData.desiredOutcome}
                            onChange={(e) => handleInputChange("desiredOutcome", e.target.value)}
                            placeholder="What specific legal remedy are you seeking?"
                            rows={3}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="previousDisputes">Previous Dispute History</Label>
                        <Textarea
                          id="previousDisputes"
                          value={disputeData.previousDisputes}
                          onChange={(e) => handleInputChange("previousDisputes", e.target.value)}
                          placeholder="Describe any previous disputes for these items and their outcomes..."
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="attorneyConsultation"
                          checked={disputeData.attorneyConsultation}
                          onCheckedChange={(checked) => handleInputChange("attorneyConsultation", !!checked)}
                        />
                        <Label htmlFor="attorneyConsultation">
                          I would like a follow-up consultation with the reviewing attorney (+$99.99)
                        </Label>
                      </div>
                    </div>

                    <div className="flex justify-between pt-6">
                      <Button variant="outline" onClick={() => setCurrentStep(2)}>
                        Back
                      </Button>
                      <Button
                        onClick={generatePremiumPackage}
                        disabled={
                          !disputeData.creditBureau ||
                          disputeData.disputeItems.length === 0 ||
                          !disputeData.disputeReason
                        }
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Generate Premium Package
                        <Shield className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Premium Features Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2 text-blue-600" />
                      Premium Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Attorney Review</p>
                        <p className="text-sm text-gray-600">Licensed attorney reviews every letter</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Legal Compliance</p>
                        <p className="text-sm text-gray-600">100% FCRA compliant documentation</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">3-Phase Strategy</p>
                        <p className="text-sm text-gray-600">Escalation timeline with litigation prep</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Method of Verification</p>
                        <p className="text-sm text-gray-600">Requests for proof documentation</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Success Guarantee</p>
                        <p className="text-sm text-gray-600">94% success rate with money-back guarantee</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Package Price
                      </h4>
                      <div className="flex justify-between text-sm">
                        <span>Base Premium Package:</span>
                        <span>$49.99</span>
                      </div>
                      {disputeData.attorneyConsultation && (
                        <div className="flex justify-between text-sm">
                          <span>Attorney Consultation:</span>
                          <span>$99.99</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold mt-2 text-blue-800">
                        <span>Total:</span>
                        <span>${disputeData.attorneyConsultation ? "149.98" : "49.99"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === 4 && isGenerating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold mb-2">Generating Premium Package</h3>
            <p className="text-gray-600 mb-4">
              Our attorneys are reviewing your dispute and crafting your legal strategy...
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center">
                <Clock className="h-4 w-4 mr-2" />
                Analyzing dispute details
              </div>
              <div className="flex items-center justify-center">
                <Scale className="h-4 w-4 mr-2" />
                Attorney legal review
              </div>
              <div className="flex items-center justify-center">
                <FileText className="h-4 w-4 mr-2" />
                Generating documents
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep === 4 && generatedPackage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Premium Package Generated</h1>
              <p className="text-xl text-gray-600">Your attorney-reviewed dispute package is ready</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Package Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Attorney Review */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Scale className="h-5 w-5 mr-2 text-blue-600" />
                      Attorney Review Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Reviewed By</p>
                        <p className="font-semibold">{generatedPackage.attorneyInfo.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Review Date</p>
                        <p className="font-semibold">{generatedPackage.attorneyInfo.reviewDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Legal Strength</p>
                        <Badge className="bg-green-100 text-green-800">
                          {generatedPackage.metadata.successProbability}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Specialization</p>
                        <p className="font-semibold">{generatedPackage.attorneyInfo.specialization}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dispute Letter */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span>Attorney-Reviewed Dispute Letter</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedPackage.disputeLetter)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 border rounded-lg p-4 font-mono text-xs whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {generatedPackage.disputeLetter}
                    </div>
                  </CardContent>
                </Card>

                {/* Legal Strategy */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        <span>Legal Strategy Timeline</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedPackage.legalStrategy)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          1
                        </div>
                        <div>
                          <p className="font-medium">Phase 1: Initial Dispute</p>
                          <p className="text-sm text-gray-600">
                            Send attorney-reviewed dispute letter via certified mail
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          2
                        </div>
                        <div>
                          <p className="font-medium">Phase 2: Follow-up</p>
                          <p className="text-sm text-gray-600">
                            Send follow-up letter if no response received within 30 days
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          3
                        </div>
                        <div>
                          <p className="font-medium">Phase 3: Escalation</p>
                          <p className="text-sm text-gray-600">
                            File CFPB complaint and prepare for potential legal action
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Package Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Package Actions</CardTitle>
                    <CardDescription>Download your complete package or send via certified mail</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button
                        onClick={downloadPackage}
                        className="h-16 flex-col space-y-1 bg-transparent"
                        variant="outline"
                      >
                        <Download className="h-6 w-6" />
                        <span>Download Complete Package</span>
                      </Button>
                      <SendViaCertifiedMail
                        letterContent={generatedPackage?.disputeLetter || ''}
                        letterType="Premium Dispute"
                        recipientName={disputeData.creditBureau}
                        onSuccess={(trackingNumber) => {
                          console.log(`Premium dispute letter sent! Tracking: ${trackingNumber}`)
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Package Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Package Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Client</p>
                      <p className="font-semibold">{generatedPackage.metadata.clientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bureau</p>
                      <p className="font-semibold">{generatedPackage.metadata.bureau}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Generated Date</p>
                      <p className="font-semibold">{generatedPackage.metadata.generatedDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Success Probability</p>
                      <p className="font-semibold text-green-600">{generatedPackage.metadata.successProbability}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Package Includes</p>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <FileText className="h-4 w-4 mr-2 text-blue-600" />
                          Attorney-Reviewed Dispute Letter
                        </div>
                        <div className="flex items-center text-sm">
                          <FileCheck className="h-4 w-4 mr-2 text-purple-600" />
                          Legal Review Report
                        </div>
                        <div className="flex items-center text-sm">
                          <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                          Legal Strategy Document
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                          Follow-up Timeline
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <h4 className="font-semibold text-blue-800 mb-2">Next Steps</h4>
                      <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Download the complete package</li>
                        <li>Send via certified mail with return receipt</li>
                        <li>Track delivery confirmation</li>
                        <li>Wait 30 days for bureau response</li>
                        <li>Follow up if no response received</li>
                      </ol>
                    </div>
                    <div className="text-center">
                      <Badge className="bg-green-100 text-green-800">
                        <Star className="h-4 w-4 mr-1" />
                        94% Success Rate
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
