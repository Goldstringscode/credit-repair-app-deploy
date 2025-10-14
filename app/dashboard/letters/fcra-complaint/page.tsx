"use client"

import { useState } from "react"
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
  Scale,
  User,
  AlertTriangle,
  CheckCircle,
  Download,
  Send,
  Eye,
  Copy,
  Clock,
  Shield,
  Gavel,
  Mail,
} from "lucide-react"

export default function FCRAComplaintPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [complaintType, setComplaintType] = useState("")
  const [generatedComplaint, setGeneratedComplaint] = useState("")
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
    creditReportNumber: "",
  })

  const [complaintInfo, setComplaintInfo] = useState({
    creditBureau: "",
    originalDisputeDate: "",
    responseReceived: "",
    responseDate: "",
    inaccurateItems: [] as string[],
    supportingDocs: [] as string[],
    desiredOutcome: "",
    complaintDetails: "",
    fcraViolation: "",
    damagesAmount: "",
    previousAttempts: "",
  })

  const complaintTypes = [
    {
      id: "no_response",
      name: "No Response to Dispute",
      description: "Credit bureau failed to respond within 30 days",
      icon: Clock,
      color: "bg-red-500",
      severity: "High",
      fee: "$29.99",
    },
    {
      id: "inadequate_investigation",
      name: "Inadequate Investigation",
      description: "Bureau conducted superficial or improper investigation",
      icon: AlertTriangle,
      color: "bg-orange-500",
      severity: "Medium",
      fee: "$29.99",
    },
    {
      id: "refused_correction",
      name: "Refused to Correct Verified Error",
      description: "Bureau acknowledged error but refused to remove it",
      icon: Shield,
      color: "bg-red-600",
      severity: "High",
      fee: "$39.99",
    },
    {
      id: "repeated_violation",
      name: "Repeated FCRA Violations",
      description: "Same incorrect information keeps reappearing",
      icon: Gavel,
      color: "bg-purple-600",
      severity: "High",
      fee: "$49.99",
    },
  ]

  const creditBureaus = [
    { id: "experian", name: "Experian", address: "P.O. Box 4500, Allen, TX 75013" },
    { id: "equifax", name: "Equifax", address: "P.O. Box 740256, Atlanta, GA 30374" },
    { id: "transunion", name: "TransUnion", address: "P.O. Box 2000, Chester, PA 19016" },
  ]

  const fcraViolations = [
    "Section 611 - Failure to conduct reasonable reinvestigation",
    "Section 613 - Failure to provide required notices",
    "Section 615 - Failure to provide adverse action notices",
    "Section 616 - Civil liability for willful noncompliance",
    "Section 617 - Civil liability for negligent noncompliance",
  ]

  const inaccurateItemTypes = [
    "Late payments incorrectly reported",
    "Accounts that don't belong to me",
    "Incorrect account balances",
    "Closed accounts showing as open",
    "Duplicate accounts",
    "Incorrect payment history",
    "Wrong account status",
    "Outdated information beyond 7 years",
  ]

  const generateComplaint = async () => {
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const complaintTemplates = {
      no_response: `${new Date().toLocaleDateString()}

Consumer Financial Protection Bureau
1700 G Street, N.W.
Washington, DC 20552

RE: FCRA Complaint Against ${complaintInfo.creditBureau} - Failure to Respond to Dispute

Dear CFPB,

I am filing this complaint against ${complaintInfo.creditBureau} for violations of the Fair Credit Reporting Act (FCRA), specifically Section 611, which requires credit reporting agencies to conduct reasonable reinvestigations of disputed information within 30 days.

CONSUMER INFORMATION:
Name: ${personalInfo.firstName} ${personalInfo.lastName}
Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.state} ${personalInfo.zipCode}
Phone: ${personalInfo.phone}
Email: ${personalInfo.email}
Last 4 digits of SSN: ${personalInfo.ssnLast4}
Date of Birth: ${personalInfo.dateOfBirth}
${personalInfo.creditReportNumber ? `Credit Report Reference: ${personalInfo.creditReportNumber}` : ""}

COMPLAINT DETAILS:
On ${complaintInfo.originalDisputeDate}, I sent a dispute letter to ${complaintInfo.creditBureau} via certified mail, requesting investigation and correction of the following inaccurate information on my credit report:

INACCURATE ITEMS DISPUTED:
${complaintInfo.inaccurateItems.map((item) => `• ${item}`).join("\n")}

FCRA VIOLATION:
${complaintInfo.creditBureau} has violated Section 611 of the FCRA by failing to:
1. Respond to my dispute within the required 30-day timeframe
2. Conduct a reasonable reinvestigation of the disputed information
3. Provide written results of their investigation

TIMELINE:
- Dispute sent: ${complaintInfo.originalDisputeDate}
- Required response date: ${new Date(new Date(complaintInfo.originalDisputeDate).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
- Days overdue: ${Math.floor((new Date().getTime() - new Date(complaintInfo.originalDisputeDate).getTime()) / (1000 * 60 * 60 * 24)) - 30} days

SUPPORTING DOCUMENTATION:
${
  complaintInfo.supportingDocs.length > 0
    ? complaintInfo.supportingDocs.map((doc) => `• ${doc}`).join("\n")
    : "• Copy of original dispute letter\n• Certified mail receipt\n• Copy of credit report showing inaccurate information"
}

REQUESTED RELIEF:
${
  complaintInfo.desiredOutcome ||
  `I request that the CFPB:
1. Investigate this violation of the FCRA
2. Require ${complaintInfo.creditBureau} to immediately investigate and correct the disputed information
3. Ensure ${complaintInfo.creditBureau} complies with FCRA requirements going forward
4. Consider appropriate enforcement action for this violation`
}

${
  complaintInfo.damagesAmount
    ? `DAMAGES:
I have suffered damages in the amount of $${complaintInfo.damagesAmount} due to this violation, including but not limited to credit denials, higher interest rates, and emotional distress.`
    : ""
}

This complaint is filed under the FCRA and I request a thorough investigation of this matter. I have attempted to resolve this directly with ${complaintInfo.creditBureau} without success.

Thank you for your attention to this matter.

Sincerely,

${personalInfo.firstName} ${personalInfo.lastName}
${personalInfo.phone}
${personalInfo.email}`,

      inadequate_investigation: `${new Date().toLocaleDateString()}

Consumer Financial Protection Bureau
1700 G Street, N.W.
Washington, DC 20552

RE: FCRA Complaint - Inadequate Investigation by ${complaintInfo.creditBureau}

Dear CFPB,

I am filing this complaint against ${complaintInfo.creditBureau} for conducting an inadequate investigation in violation of Section 611 of the Fair Credit Reporting Act.

CONSUMER INFORMATION:
Name: ${personalInfo.firstName} ${personalInfo.lastName}
Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.state} ${personalInfo.zipCode}
Phone: ${personalInfo.phone}
Email: ${personalInfo.email}
Last 4 digits of SSN: ${personalInfo.ssnLast4}

COMPLAINT DETAILS:
On ${complaintInfo.originalDisputeDate}, I disputed inaccurate information with ${complaintInfo.creditBureau}. On ${complaintInfo.responseDate}, they responded claiming their investigation was complete, but their investigation was clearly inadequate and superficial.

EVIDENCE OF INADEQUATE INVESTIGATION:
${complaintInfo.complaintDetails}

INACCURATE ITEMS THAT REMAIN UNCORRECTED:
${complaintInfo.inaccurateItems.map((item) => `• ${item}`).join("\n")}

FCRA VIOLATIONS:
${complaintInfo.creditBureau} violated Section 611 by:
1. Failing to conduct a proper, thorough reinvestigation
2. Not reviewing all relevant information provided
3. Accepting furnisher information without proper verification
4. Failing to correct obviously inaccurate information

The FCRA requires a "reasonable reinvestigation," which means more than simply forwarding my dispute to the data furnisher and accepting their response without question.

REQUESTED RELIEF:
1. Require ${complaintInfo.creditBureau} to conduct a proper, thorough reinvestigation
2. Remove or correct all inaccurate information identified in my dispute
3. Provide detailed documentation of their investigation process
4. Implement procedures to ensure adequate investigations in the future

I have provided substantial evidence supporting my dispute, yet ${complaintInfo.creditBureau} has failed to properly investigate or correct the inaccurate information.

Sincerely,

${personalInfo.firstName} ${personalInfo.lastName}`,

      refused_correction: `${new Date().toLocaleDateString()}

Consumer Financial Protection Bureau
1700 G Street, N.W.
Washington, DC 20552

RE: FCRA Complaint - Refusal to Correct Verified Inaccurate Information

Dear CFPB,

I am filing this complaint against ${complaintInfo.creditBureau} for refusing to correct information they have acknowledged as inaccurate, in violation of the Fair Credit Reporting Act.

CONSUMER INFORMATION:
Name: ${personalInfo.firstName} ${personalInfo.lastName}
Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.state} ${personalInfo.zipCode}
Phone: ${personalInfo.phone}
Email: ${personalInfo.email}

COMPLAINT SUMMARY:
Despite acknowledging that certain information on my credit report is inaccurate, ${complaintInfo.creditBureau} has refused to remove or correct this information, claiming they cannot do so without furnisher cooperation.

VERIFIED INACCURATE INFORMATION:
${complaintInfo.inaccurateItems.map((item) => `• ${item}`).join("\n")}

EVIDENCE OF BUREAU ACKNOWLEDGMENT:
${complaintInfo.complaintDetails}

FCRA VIOLATION:
Section 611(a)(5)(A) of the FCRA requires credit reporting agencies to "promptly delete" information that is found to be "inaccurate or incomplete or cannot be verified." ${complaintInfo.creditBureau} has violated this requirement by refusing to delete information they acknowledge as inaccurate.

LEGAL PRECEDENT:
Federal courts have consistently held that credit reporting agencies have an independent duty to maintain accurate credit reports and cannot simply defer to data furnishers when information is clearly inaccurate.

REQUESTED RELIEF:
1. Immediate removal of all acknowledged inaccurate information
2. Updated credit report reflecting corrections
3. Notification to all parties who received inaccurate information
4. Compliance with FCRA requirements going forward

This refusal to correct acknowledged errors demonstrates willful noncompliance with the FCRA and warrants enforcement action.

Sincerely,

${personalInfo.firstName} ${personalInfo.lastName}`,

      repeated_violation: `${new Date().toLocaleDateString()}

Consumer Financial Protection Bureau
1700 G Street, N.W.
Washington, DC 20552

RE: FCRA Complaint - Pattern of Repeated Violations by ${complaintInfo.creditBureau}

Dear CFPB,

I am filing this complaint against ${complaintInfo.creditBureau} for a pattern of repeated FCRA violations, including the reappearance of previously deleted inaccurate information.

CONSUMER INFORMATION:
Name: ${personalInfo.firstName} ${personalInfo.lastName}
Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.state} ${personalInfo.zipCode}
Phone: ${personalInfo.phone}
Email: ${personalInfo.email}

PATTERN OF VIOLATIONS:
${complaintInfo.creditBureau} has repeatedly violated the FCRA through the following pattern:
1. Initially removing disputed inaccurate information
2. Allowing the same inaccurate information to reappear on subsequent reports
3. Failing to maintain procedures to prevent reappearance of deleted information
4. Requiring multiple disputes for the same inaccurate items

CHRONOLOGY OF VIOLATIONS:
${complaintInfo.previousAttempts}

CURRENT INACCURATE INFORMATION:
${complaintInfo.inaccurateItems.map((item) => `• ${item}`).join("\n")}

FCRA VIOLATIONS:
This pattern violates multiple FCRA provisions:
- Section 611: Failure to maintain reasonable procedures
- Section 613: Failure to provide required notices
- Section 623: Allowing reappearance of deleted information

REQUESTED RELIEF:
1. Permanent removal of all inaccurate information
2. Implementation of procedures to prevent reappearance
3. Monetary damages for repeated violations
4. Enforcement action to prevent future violations

This pattern of repeated violations demonstrates either willful noncompliance or grossly negligent procedures that warrant significant enforcement action.

Sincerely,

${personalInfo.firstName} ${personalInfo.lastName}`,
    }

    setGeneratedComplaint((complaintTemplates as any)[complaintType] || "")
    setIsGenerating(false)
    setCurrentStep(4)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedComplaint)
  }

  const downloadComplaint = () => {
    const element = document.createElement("a")
    const file = new Blob([generatedComplaint], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `fcra-complaint-${complaintType}-${new Date().toISOString().split("T")[0]}.txt`
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
              <Scale className="h-6 w-6 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FCRA Complaint Generator</h1>
                <p className="text-gray-600 mt-1">File complaints against credit bureaus for FCRA violations</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-red-100 text-red-800">Premium Service</Badge>
              <Badge className="bg-green-100 text-green-800">Step {currentStep} of 4</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between mt-4 text-sm text-gray-600">
              <span className={currentStep >= 1 ? "text-red-600 font-medium" : ""}>Complaint Type</span>
              <span className={currentStep >= 2 ? "text-red-600 font-medium" : ""}>Personal Info</span>
              <span className={currentStep >= 3 ? "text-red-600 font-medium" : ""}>Violation Details</span>
              <span className={currentStep >= 4 ? "text-red-600 font-medium" : ""}>Generated Complaint</span>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Complaint Type Selection */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gavel className="h-5 w-5 text-red-600" />
                <span>Choose FCRA Violation Type</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {complaintTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <div
                      key={type.id}
                      className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                        complaintType === type.id ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setComplaintType(type.id)}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`${type.color} rounded-lg p-2`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{type.name}</h3>
                          <div className="flex space-x-2 mt-1">
                            <Badge variant={type.severity === "High" ? "destructive" : "secondary"} className="text-xs">
                              {type.severity} Priority
                            </Badge>
                            <Badge className="text-xs bg-green-100 text-green-800">{type.fee}</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-end mt-8">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!complaintType}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Personal Information */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-red-600" />
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
                <div className="space-y-2">
                  <Label htmlFor="creditReportNumber">Credit Report Reference Number</Label>
                  <Input
                    id="creditReportNumber"
                    value={personalInfo.creditReportNumber}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, creditReportNumber: e.target.value })}
                    placeholder="Optional reference number"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!personalInfo.firstName || !personalInfo.lastName || !personalInfo.address}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Violation Details */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>FCRA Violation Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="creditBureau">Credit Bureau *</Label>
                    <Select
                      value={complaintInfo.creditBureau}
                      onValueChange={(value) => setComplaintInfo({ ...complaintInfo, creditBureau: value })}
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
                    <Label htmlFor="originalDisputeDate">Original Dispute Date *</Label>
                    <Input
                      id="originalDisputeDate"
                      type="date"
                      value={complaintInfo.originalDisputeDate}
                      onChange={(e) => setComplaintInfo({ ...complaintInfo, originalDisputeDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Did you receive a response? *</Label>
                    <RadioGroup
                      value={complaintInfo.responseReceived}
                      onValueChange={(value) => setComplaintInfo({ ...complaintInfo, responseReceived: value })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="response-yes" />
                        <Label htmlFor="response-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="response-no" />
                        <Label htmlFor="response-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {complaintInfo.responseReceived === "yes" && (
                    <div className="space-y-2">
                      <Label htmlFor="responseDate">Response Date</Label>
                      <Input
                        id="responseDate"
                        type="date"
                        value={complaintInfo.responseDate}
                        onChange={(e) => setComplaintInfo({ ...complaintInfo, responseDate: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Inaccurate Items on Credit Report *</Label>
                  <div className="space-y-3 max-h-48 overflow-y-auto border rounded-lg p-4">
                    {inaccurateItemTypes.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={item}
                          checked={complaintInfo.inaccurateItems.includes(item)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setComplaintInfo({
                                ...complaintInfo,
                                inaccurateItems: [...complaintInfo.inaccurateItems, item],
                              })
                            } else {
                              setComplaintInfo({
                                ...complaintInfo,
                                inaccurateItems: complaintInfo.inaccurateItems.filter((i) => i !== item),
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
                  <Label htmlFor="complaintDetails">Detailed Explanation of Violation *</Label>
                  <Textarea
                    id="complaintDetails"
                    value={complaintInfo.complaintDetails}
                    onChange={(e) => setComplaintInfo({ ...complaintInfo, complaintDetails: e.target.value })}
                    placeholder="Provide detailed explanation of how the credit bureau violated the FCRA..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fcraViolation">Specific FCRA Section Violated</Label>
                  <Select
                    value={complaintInfo.fcraViolation}
                    onValueChange={(value) => setComplaintInfo({ ...complaintInfo, fcraViolation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select FCRA violation" />
                    </SelectTrigger>
                    <SelectContent>
                      {fcraViolations.map((violation) => (
                        <SelectItem key={violation} value={violation}>
                          {violation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="damagesAmount">Estimated Damages ($)</Label>
                    <Input
                      id="damagesAmount"
                      type="number"
                      value={complaintInfo.damagesAmount}
                      onChange={(e) => setComplaintInfo({ ...complaintInfo, damagesAmount: e.target.value })}
                      placeholder="Enter estimated damages"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desiredOutcome">Desired Outcome</Label>
                    <Textarea
                      id="desiredOutcome"
                      value={complaintInfo.desiredOutcome}
                      onChange={(e) => setComplaintInfo({ ...complaintInfo, desiredOutcome: e.target.value })}
                      placeholder="What resolution are you seeking?"
                      rows={2}
                    />
                  </div>
                </div>

                {complaintType === "repeated_violation" && (
                  <div className="space-y-2">
                    <Label htmlFor="previousAttempts">Previous Dispute Attempts</Label>
                    <Textarea
                      id="previousAttempts"
                      value={complaintInfo.previousAttempts}
                      onChange={(e) => setComplaintInfo({ ...complaintInfo, previousAttempts: e.target.value })}
                      placeholder="Describe your previous dispute attempts and their outcomes..."
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button
                  onClick={generateComplaint}
                  disabled={
                    !complaintInfo.creditBureau ||
                    !complaintInfo.originalDisputeDate ||
                    !complaintInfo.responseReceived ||
                    complaintInfo.inaccurateItems.length === 0 ||
                    !complaintInfo.complaintDetails ||
                    isGenerating
                  }
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isGenerating ? (
                    <>
                      <Scale className="h-4 w-4 mr-2 animate-spin" />
                      Generating Complaint...
                    </>
                  ) : (
                    <>
                      <Scale className="h-4 w-4 mr-2" />
                      Generate FCRA Complaint
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Generated Complaint */}
        {currentStep === 4 && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Generated FCRA Complaint</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadComplaint}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border rounded-lg p-6 font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {generatedComplaint}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Filing Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      <Send className="h-4 w-4 mr-2" />
                      File with CFPB Online
                    </Button>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Mail className="h-4 w-4 mr-2" />
                      Send via Certified Mail
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Eye className="h-4 w-4 mr-2" />
                      Legal Review Service
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Complaint Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="text-sm font-medium">
                      {complaintTypes.find((t) => t.id === complaintType)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bureau:</span>
                    <span className="text-sm font-medium">{complaintInfo.creditBureau}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Items:</span>
                    <span className="text-sm font-medium">{complaintInfo.inaccurateItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Service Fee:</span>
                    <span className="text-sm font-medium text-green-600">
                      {complaintTypes.find((t) => t.id === complaintType)?.fee}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• File complaint with CFPB within 30 days</li>
                    <li>• Keep copies of all documentation</li>
                    <li>• Monitor your credit report for changes</li>
                    <li>• Follow up on complaint status</li>
                    <li>• Consider legal action if violations continue</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">Revenue Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base Service:</span>
                      <span className="font-semibold">{complaintTypes.find((t) => t.id === complaintType)?.fee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Legal Review:</span>
                      <span className="font-semibold">$49.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CFPB Filing:</span>
                      <span className="font-semibold">$19.99</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-green-800">
                      <span>Total Potential:</span>
                      <span>$99.97</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
