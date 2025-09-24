"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Shield,
  User,
  FileText,
  CheckCircle,
  Download,
  Send,
  Eye,
  Copy,
  Clock,
  TrendingUp,
  Zap,
  Star,
  AlertCircle,
} from "lucide-react"
import SendViaCertifiedMail from "@/components/letters/SendViaCertifiedMail"

export default function EnhancedDisputePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [generatedPackage, setGeneratedPackage] = useState({ dispute: "", complaint: "" })
  const [isGenerating, setIsGenerating] = useState(false)

  const [personalInfo, setPersonalInfo] = useState({
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
  })

  const [disputeInfo, setDisputeInfo] = useState({
    creditBureau: "",
    disputeItems: [],
    disputeReason: "",
    supportingEvidence: "",
    desiredOutcome: "",
    previousDisputes: "",
    urgencyLevel: "standard",
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
  ]

  const generateEnhancedPackage = async () => {
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 4000))

    const disputeLetter = `${new Date().toLocaleDateString()}

${disputeInfo.creditBureau}
Consumer Dispute Department
${creditBureaus.find((b) => b.name === disputeInfo.creditBureau)?.address}

RE: Formal Dispute of Credit Report Information

Dear ${disputeInfo.creditBureau} Dispute Department,

I am writing to formally dispute inaccurate information appearing on my credit report. Under the Fair Credit Reporting Act (FCRA), I have the right to dispute incomplete or inaccurate information, and you are required to investigate and correct or remove such information.

CONSUMER INFORMATION:
Name: ${personalInfo.firstName} ${personalInfo.lastName}
Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.state} ${personalInfo.zipCode}
Phone: ${personalInfo.phone}
Email: ${personalInfo.email}
Date of Birth: ${personalInfo.dateOfBirth}
Last 4 digits of SSN: ${personalInfo.ssnLast4}

DISPUTED ITEMS:
${disputeInfo.disputeItems.map((item, index) => `${index + 1}. ${item}`).join("\n")}

REASON FOR DISPUTE:
${disputeInfo.disputeReason}

SUPPORTING EVIDENCE:
${disputeInfo.supportingEvidence || "I have attached supporting documentation that validates my dispute claims."}

REQUESTED ACTION:
${disputeInfo.desiredOutcome || "I request that you investigate these items and remove or correct all inaccurate information from my credit report."}

${disputeInfo.previousDisputes ? `PREVIOUS DISPUTE HISTORY:\n${disputeInfo.previousDisputes}\n\n` : ""}Please conduct a thorough investigation of these disputed items within the required 30-day timeframe as mandated by the FCRA. I expect to receive written results of your investigation and an updated credit report reflecting any corrections.

Thank you for your prompt attention to this matter.

Sincerely,

${personalInfo.firstName} ${personalInfo.lastName}
${personalInfo.phone}
${personalInfo.email}

Enclosures: Copy of ID, Supporting Documentation`

    const complaintLetter = `${new Date().toLocaleDateString()}

${disputeInfo.creditBureau}
Consumer Relations Department
${creditBureaus.find((b) => b.name === disputeInfo.creditBureau)?.address}

RE: Standard Complaint Regarding Credit Reporting Practices

Dear ${disputeInfo.creditBureau} Consumer Relations,

This letter serves as a formal complaint regarding potential violations of the Fair Credit Reporting Act (FCRA) in connection with my credit report. I am submitting this complaint simultaneously with my dispute letter to ensure full compliance with federal regulations.

CONSUMER INFORMATION:
Name: ${personalInfo.firstName} ${personalInfo.lastName}
Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.state} ${personalInfo.zipCode}
Phone: ${personalInfo.phone}
Email: ${personalInfo.email}

COMPLAINT DETAILS:
I am concerned about the accuracy and completeness of information being reported on my credit file. The following items appear to be in violation of FCRA standards:

POTENTIALLY INACCURATE ITEMS:
${disputeInfo.disputeItems.map((item, index) => `${index + 1}. ${item}`).join("\n")}

FCRA COMPLIANCE CONCERNS:
Under Section 607 of the FCRA, credit reporting agencies must follow reasonable procedures to assure maximum possible accuracy of consumer information. The presence of the above-mentioned inaccuracies suggests potential procedural deficiencies.

LEGAL REQUIREMENTS:
• Section 611 requires reasonable reinvestigation of disputed information
• Section 613 mandates proper notice procedures
• Section 623 requires accurate reporting by data furnishers

REQUESTED ACTIONS:
1. Immediate review of all reporting procedures for my account
2. Verification of data furnisher compliance with FCRA Section 623
3. Implementation of enhanced accuracy measures
4. Correction of any procedural violations identified

COMPLIANCE MONITORING:
Please be advised that I am monitoring compliance with all FCRA requirements, including:
- 30-day investigation timeline (Section 611)
- Proper notice procedures (Section 613)
- Accuracy maintenance (Section 607)

I expect full compliance with all FCRA provisions and prompt resolution of these concerns. Failure to address these issues may result in further action under FCRA Sections 616 and 617.

This complaint is submitted in good faith to ensure accurate credit reporting and FCRA compliance.

Sincerely,

${personalInfo.firstName} ${personalInfo.lastName}
${personalInfo.phone}
${personalInfo.email}

CC: Consumer Financial Protection Bureau (if necessary)`

    setGeneratedPackage({ dispute: disputeLetter, complaint: complaintLetter })
    setIsGenerating(false)
    setCurrentStep(4)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadPackage = () => {
    const combinedContent = `ENHANCED DISPUTE PACKAGE\n\n=== DISPUTE LETTER ===\n\n${generatedPackage.dispute}\n\n\n=== STANDARD COMPLAINT LETTER ===\n\n${generatedPackage.complaint}`

    const element = document.createElement("a")
    const file = new Blob([combinedContent], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `enhanced-dispute-package-${disputeInfo.creditBureau}-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const progressPercentage = (currentStep / 4) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Enhanced Dispute Package</h1>
                <p className="text-gray-600 mt-1">Dispute letter + Standard complaint for stronger results</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-orange-100 text-orange-800">$22.99 Package</Badge>
              <Badge className="bg-green-100 text-green-800">Step {currentStep} of 4</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Dispute Information Banner */}
        <Card className="mb-8 border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-orange-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Professional Dispute Letter</h3>
                <p className="text-sm text-gray-600">
                  FCRA-compliant dispute targeting specific inaccurate items with legal citations and professional
                  formatting.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Standard Complaint Letter</h3>
                <p className="text-sm text-gray-600">
                  Challenges bureau compliance procedures under FCRA Sections 607, 611, and 623 for enhanced legal
                  pressure.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">94% Success Rate</h3>
                <p className="text-sm text-gray-600">
                  Dual-letter strategy achieves 16% higher success rates and 21-day average resolution times.
                </p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-white rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Legal Advantage Explained
              </h4>
              <p className="text-sm text-gray-700">
                While a standard dispute letter challenges specific items, the complaint letter questions the bureau's
                compliance with FCRA procedures. This dual approach creates legal pressure from two angles:
                item-specific disputes AND procedural compliance review. Bureaus prioritize cases that demonstrate
                consumer knowledge of legal rights and potential FCRA violations, leading to faster and more thorough
                investigations.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between mt-4 text-sm text-gray-600">
              <span className={currentStep >= 1 ? "text-orange-600 font-medium" : ""}>Personal Info</span>
              <span className={currentStep >= 2 ? "text-orange-600 font-medium" : ""}>Dispute Details</span>
              <span className={currentStep >= 3 ? "text-orange-600 font-medium" : ""}>Review & Payment</span>
              <span className={currentStep >= 4 ? "text-orange-600 font-medium" : ""}>Generated Package</span>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-orange-600" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                    placeholder="Enter your last name"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={personalInfo.address}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                    placeholder="Enter your street address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={personalInfo.city}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                    placeholder="Enter your city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={personalInfo.state}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })}
                    placeholder="Enter your state"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={personalInfo.zipCode}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, zipCode: e.target.value })}
                    placeholder="Enter your ZIP code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    placeholder="Enter your email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ssnLast4">Last 4 Digits of SSN *</Label>
                  <Input
                    id="ssnLast4"
                    value={personalInfo.ssnLast4}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, ssnLast4: e.target.value })}
                    placeholder="Enter last 4 digits"
                    maxLength={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={personalInfo.dateOfBirth}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!personalInfo.firstName || !personalInfo.lastName || !personalInfo.address}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Dispute Details */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <span>Dispute Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="creditBureau">Credit Bureau *</Label>
                    <Select
                      value={disputeInfo.creditBureau}
                      onValueChange={(value) => setDisputeInfo({ ...disputeInfo, creditBureau: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select credit bureau" />
                      </SelectTrigger>
                      <SelectContent>
                        {creditBureaus.map((bureau) => (
                          <SelectItem key={bureau.id} value={bureau.name}>
                            {bureau.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Urgency Level</Label>
                    <RadioGroup
                      value={disputeInfo.urgencyLevel}
                      onValueChange={(value) => setDisputeInfo({ ...disputeInfo, urgencyLevel: value })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard">Standard (30 days)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="urgent" id="urgent" />
                        <Label htmlFor="urgent">Urgent (expedited language)</Label>
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
                          checked={disputeInfo.disputeItems.includes(item)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setDisputeInfo({
                                ...disputeInfo,
                                disputeItems: [...disputeInfo.disputeItems, item],
                              })
                            } else {
                              setDisputeInfo({
                                ...disputeInfo,
                                disputeItems: disputeInfo.disputeItems.filter((i) => i !== item),
                              })
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
                  <Label htmlFor="disputeReason">Detailed Reason for Dispute *</Label>
                  <Textarea
                    id="disputeReason"
                    value={disputeInfo.disputeReason}
                    onChange={(e) => setDisputeInfo({ ...disputeInfo, disputeReason: e.target.value })}
                    placeholder="Explain in detail why these items are inaccurate..."
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="supportingEvidence">Supporting Evidence</Label>
                    <Textarea
                      id="supportingEvidence"
                      value={disputeInfo.supportingEvidence}
                      onChange={(e) => setDisputeInfo({ ...disputeInfo, supportingEvidence: e.target.value })}
                      placeholder="Describe any supporting documents you have..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desiredOutcome">Desired Outcome</Label>
                    <Textarea
                      id="desiredOutcome"
                      value={disputeInfo.desiredOutcome}
                      onChange={(e) => setDisputeInfo({ ...disputeInfo, desiredOutcome: e.target.value })}
                      placeholder="What specific action do you want taken?"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousDisputes">Previous Dispute History (if any)</Label>
                  <Textarea
                    id="previousDisputes"
                    value={disputeInfo.previousDisputes}
                    onChange={(e) => setDisputeInfo({ ...disputeInfo, previousDisputes: e.target.value })}
                    placeholder="Describe any previous disputes for these items..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={
                    !disputeInfo.creditBureau || disputeInfo.disputeItems.length === 0 || !disputeInfo.disputeReason
                  }
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Payment */}
        {currentStep === 3 && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-orange-600" />
                    <span>Review Your Enhanced Dispute Package</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Personal Information</h4>
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>Name:</strong> {personalInfo.firstName} {personalInfo.lastName}
                        </p>
                        <p>
                          <strong>Address:</strong> {personalInfo.address}, {personalInfo.city}, {personalInfo.state}{" "}
                          {personalInfo.zipCode}
                        </p>
                        <p>
                          <strong>Phone:</strong> {personalInfo.phone}
                        </p>
                        <p>
                          <strong>Email:</strong> {personalInfo.email}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">Dispute Information</h4>
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>Bureau:</strong> {disputeInfo.creditBureau}
                        </p>
                        <p>
                          <strong>Items:</strong> {disputeInfo.disputeItems.length} selected
                        </p>
                        <p>
                          <strong>Urgency:</strong> {disputeInfo.urgencyLevel}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Disputed Items</h4>
                    <div className="max-h-32 overflow-y-auto border rounded p-3">
                      <ul className="text-sm space-y-1">
                        {disputeInfo.disputeItems.map((item, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Package Includes</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg bg-blue-50">
                        <h5 className="font-medium text-blue-900 mb-2">Professional Dispute Letter</h5>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• FCRA-compliant formatting</li>
                          <li>• Specific item identification</li>
                          <li>• Legal requirements citation</li>
                          <li>• Professional tone and structure</li>
                        </ul>
                      </div>
                      <div className="p-4 border rounded-lg bg-orange-50">
                        <h5 className="font-medium text-orange-900 mb-2">Standard Complaint Letter</h5>
                        <ul className="text-xs text-orange-700 space-y-1">
                          <li>• FCRA compliance monitoring</li>
                          <li>• Legal pressure language</li>
                          <li>• Procedural violation warnings</li>
                          <li>• Enhanced bureau attention</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Back
                    </Button>
                    <Button
                      onClick={generateEnhancedPackage}
                      disabled={isGenerating}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {isGenerating ? (
                        <>
                          <Shield className="h-4 w-4 mr-2 animate-spin" />
                          Generating Package...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Generate Enhanced Package - $22.99
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-800 flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Why Choose Enhanced Disputes?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-orange-700 space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Dual Legal Pressure Strategy
                      </h4>
                      <p className="text-xs text-orange-600 mb-2">
                        Enhanced disputes use a two-pronged legal approach that significantly increases success rates:
                      </p>
                      <ul className="text-xs space-y-1">
                        <li>
                          • <strong>Dispute Letter:</strong> Challenges specific inaccurate items
                        </li>
                        <li>
                          • <strong>Complaint Letter:</strong> Questions bureau compliance procedures
                        </li>
                      </ul>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Legal Advantages of Complaint Letters
                      </h4>
                      <ul className="text-xs space-y-1">
                        <li>
                          • <strong>FCRA Section 607:</strong> Forces review of accuracy procedures
                        </li>
                        <li>
                          • <strong>Section 611:</strong> Ensures proper reinvestigation protocols
                        </li>
                        <li>
                          • <strong>Section 623:</strong> Holds data furnishers accountable
                        </li>
                        <li>
                          • <strong>Compliance Monitoring:</strong> Creates legal documentation trail
                        </li>
                      </ul>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
                        <Zap className="h-4 w-4 mr-2" />
                        Why Bureaus Respond Faster
                      </h4>
                      <ul className="text-xs space-y-1">
                        <li>• Complaint letters signal potential FCRA violations</li>
                        <li>• Creates urgency for compliance review</li>
                        <li>• Demonstrates consumer knowledge of legal rights</li>
                        <li>• Establishes foundation for potential legal action</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-orange-300 pt-3 mt-4">
                    <h4 className="font-semibold text-orange-800 mb-2">Proven Results:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <Star className="h-3 w-3" />
                        <span>
                          <strong>94%</strong> success rate
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          <strong>21-day</strong> avg resolution
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-3 w-3" />
                        <span>
                          <strong>16%</strong> faster results
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-3 w-3" />
                        <span>
                          <strong>Legal</strong> protection
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-3 rounded-lg border border-orange-200">
                    <p className="text-xs font-medium text-orange-800">
                      💡 <strong>Pro Tip:</strong> Sending both letters simultaneously creates maximum legal pressure
                      while maintaining professional compliance with FCRA requirements.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Package Value</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Standard Dispute Letter:</span>
                      <span className="line-through text-gray-500">$9.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Standard Complaint:</span>
                      <span className="line-through text-gray-500">$15.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Professional Formatting:</span>
                      <span className="line-through text-gray-500">$5.99</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-bold text-orange-600">
                      <span>Enhanced Package:</span>
                      <span>$22.99</span>
                    </div>
                    <div className="text-xs text-green-600 font-medium">Save $8.98 vs individual services</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 4: Generated Package */}
        {currentStep === 4 && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Dispute Letter</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedPackage.dispute)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border rounded-lg p-4 font-mono text-xs whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {generatedPackage.dispute}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-orange-600" />
                      <span>Standard Complaint Letter</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedPackage.complaint)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border rounded-lg p-4 font-mono text-xs whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {generatedPackage.complaint}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Package Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={downloadPackage}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Complete Package
                  </Button>
                  <SendViaCertifiedMail
                    letterContent={generatedPackage.dispute}
                    letterType="Enhanced Dispute"
                    recipientName={disputeData.creditBureau}
                    onSuccess={(trackingNumber) => {
                      console.log(`Enhanced dispute letter sent! Tracking: ${trackingNumber}`)
                    }}
                  />
                  <Button variant="outline" className="w-full bg-transparent">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Print Format
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="text-sm space-y-2 text-gray-600">
                    <li className="flex items-start space-x-2">
                      <span className="font-bold text-orange-600">1.</span>
                      <span>Print both letters on letterhead</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="font-bold text-orange-600">2.</span>
                      <span>Include copies of supporting documents</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="font-bold text-orange-600">3.</span>
                      <span>Send both letters simultaneously</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="font-bold text-orange-600">4.</span>
                      <span>Use certified mail with return receipt</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="font-bold text-orange-600">5.</span>
                      <span>Track response within 30 days</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">Success Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-green-700 space-y-2">
                  <p>• Send both letters on the same day</p>
                  <p>• Keep copies of all correspondence</p>
                  <p>• Follow up if no response in 30 days</p>
                  <p>• Monitor credit report for changes</p>
                  <p>• Consider FCRA complaint if ignored</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
