"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  AlertTriangle,
  User,
  FileText,
  CheckCircle,
  Download,
  Send,
  Eye,
  Copy,
  Clock,
  Shield,
  Scale,
  Mail,
  Star,
} from "lucide-react"

export default function CFPBComplaintPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [generatedComplaint, setGeneratedComplaint] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Get pre-filled data from URL parameters (from recent letters)
  const prefilledLetter = searchParams.get("letter")
  const prefilledBureau = searchParams.get("bureau")
  const prefilledDate = searchParams.get("date")

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

  const [complaintInfo, setComplaintInfo] = useState({
    creditBureau: prefilledBureau || "",
    originalDisputeDate: prefilledDate || "",
    responseReceived: "",
    responseDate: "",
    complaintType: "no_response",
    violationDetails: "",
    damagesAmount: "",
    desiredOutcome: "",
    supportingDocs: [],
  })

  const complaintTypes = [
    {
      id: "no_response",
      name: "No Response After 30 Days",
      description: "Credit bureau failed to respond within required timeframe",
      severity: "High",
      fee: "$19.99",
    },
    {
      id: "inadequate_investigation",
      name: "Inadequate Investigation",
      description: "Bureau conducted superficial investigation",
      severity: "Medium",
      fee: "$19.99",
    },
    {
      id: "refused_correction",
      name: "Refused to Correct Verified Error",
      description: "Bureau acknowledged error but refused removal",
      severity: "High",
      fee: "$29.99",
    },
    {
      id: "repeated_violation",
      name: "Repeated FCRA Violations",
      description: "Same incorrect information keeps reappearing",
      severity: "High",
      fee: "$39.99",
    },
  ]

  const creditBureaus = [
    { id: "experian", name: "Experian" },
    { id: "equifax", name: "Equifax" },
    { id: "transunion", name: "TransUnion" },
  ]

  const generateComplaint = async () => {
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const complaintTemplate = `${new Date().toLocaleDateString()}

Consumer Financial Protection Bureau
1700 G Street, N.W.
Washington, DC 20552

RE: FCRA Complaint Against ${complaintInfo.creditBureau} - ${complaintTypes.find((t) => t.id === complaintInfo.complaintType)?.name}

Dear CFPB,

I am filing this formal complaint against ${complaintInfo.creditBureau} for violations of the Fair Credit Reporting Act (FCRA). This complaint is submitted after exhausting direct resolution attempts with the credit reporting agency.

CONSUMER INFORMATION:
Name: ${personalInfo.firstName} ${personalInfo.lastName}
Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.state} ${personalInfo.zipCode}
Phone: ${personalInfo.phone}
Email: ${personalInfo.email}
Last 4 digits of SSN: ${personalInfo.ssnLast4}
Date of Birth: ${personalInfo.dateOfBirth}

COMPLAINT DETAILS:
Original Dispute Date: ${complaintInfo.originalDisputeDate}
Credit Bureau: ${complaintInfo.creditBureau}
Response Received: ${complaintInfo.responseReceived}
${complaintInfo.responseDate ? `Response Date: ${complaintInfo.responseDate}` : ""}

FCRA VIOLATION:
${complaintInfo.violationDetails}

TIMELINE OF EVENTS:
1. Dispute sent to ${complaintInfo.creditBureau} on ${complaintInfo.originalDisputeDate}
2. ${complaintInfo.responseReceived === "yes" ? `Inadequate response received on ${complaintInfo.responseDate}` : "No response received within required 30-day timeframe"}
3. Follow-up attempts made with no satisfactory resolution
4. Filing this CFPB complaint as required escalation

LEGAL BASIS:
This complaint is based on violations of:
• FCRA Section 611 - Procedure in case of disputed accuracy
• FCRA Section 607 - Compliance procedures
• FCRA Section 613 - Public record information for employment purposes

REQUESTED RELIEF:
${
  complaintInfo.desiredOutcome ||
  `I request that the CFPB:
1. Investigate this FCRA violation
2. Require ${complaintInfo.creditBureau} to properly investigate my dispute
3. Ensure compliance with federal law
4. Consider appropriate enforcement action`
}

${
  complaintInfo.damagesAmount
    ? `DAMAGES:
I have suffered damages in the amount of $${complaintInfo.damagesAmount} due to this FCRA violation, including but not limited to credit denials, higher interest rates, and emotional distress.`
    : ""
}

SUPPORTING DOCUMENTATION:
• Copy of original dispute letter
• Certified mail receipt
• Copy of credit report showing inaccurate information
• ${complaintInfo.responseReceived === "yes" ? "Copy of inadequate response from credit bureau" : "Documentation showing no response received"}
${complaintInfo.supportingDocs.length > 0 ? complaintInfo.supportingDocs.map((doc) => `• ${doc}`).join("\n") : ""}

This complaint is filed in good faith to ensure compliance with the Fair Credit Reporting Act and to protect my rights as a consumer.

I request a thorough investigation of this matter and appropriate action to ensure ${complaintInfo.creditBureau} complies with federal law.

Sincerely,

${personalInfo.firstName} ${personalInfo.lastName}
${personalInfo.phone}
${personalInfo.email}

Complaint Reference: CFPB-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    setGeneratedComplaint(complaintTemplate)
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
    element.download = `cfpb-complaint-${complaintInfo.creditBureau}-${new Date().toISOString().split("T")[0]}.txt`
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
                <h1 className="text-2xl font-bold text-gray-900">CFPB Complaint Generator</h1>
                <p className="text-gray-600 mt-1">File complaints with Consumer Financial Protection Bureau</p>
                {prefilledLetter && (
                  <Badge className="mt-2 bg-blue-100 text-blue-800">Pre-filled from recent letter</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-red-100 text-red-800">Government Filing</Badge>
              <Badge className="bg-green-100 text-green-800">Step {currentStep} of 4</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Information Banner */}
        <Card className="mb-8 border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-orange-50">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-red-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Scale className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Government Filing</h3>
                <p className="text-sm text-gray-600">
                  Official complaint filed directly with the Consumer Financial Protection Bureau for FCRA violations.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-red-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Legal Protection</h3>
                <p className="text-sm text-gray-600">
                  Creates official record of FCRA violations and establishes foundation for potential legal action.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-red-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Star className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">High Success Rate</h3>
                <p className="text-sm text-gray-600">
                  CFPB complaints have a 92% success rate in resolving credit reporting disputes and violations.
                </p>
              </div>
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
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Choose FCRA Violation Type</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {complaintTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                      complaintInfo.complaintType === type.id
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setComplaintInfo({ ...complaintInfo, complaintType: type.id })}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-red-500 rounded-lg p-2">
                        <AlertTriangle className="h-5 w-5 text-white" />
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
                ))}
              </div>
              <div className="flex justify-end mt-8">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!complaintInfo.complaintType}
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
                <FileText className="h-5 w-5 text-red-600" />
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
                        <Label htmlFor="response-yes">Yes, but inadequate</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="response-no" />
                        <Label htmlFor="response-no">No response received</Label>
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
                  <Label htmlFor="violationDetails">Detailed Explanation of FCRA Violation *</Label>
                  <Textarea
                    id="violationDetails"
                    value={complaintInfo.violationDetails}
                    onChange={(e) => setComplaintInfo({ ...complaintInfo, violationDetails: e.target.value })}
                    placeholder="Provide detailed explanation of how the credit bureau violated the FCRA..."
                    rows={4}
                  />
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
                    !complaintInfo.violationDetails ||
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
                      Generate CFPB Complaint
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
                      <span>Generated CFPB Complaint</span>
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
                    Preview & Edit
                  </Button>
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
                      {complaintTypes.find((t) => t.id === complaintInfo.complaintType)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bureau:</span>
                    <span className="text-sm font-medium">{complaintInfo.creditBureau}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Dispute Date:</span>
                    <span className="text-sm font-medium">{complaintInfo.originalDisputeDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Service Fee:</span>
                    <span className="text-sm font-medium text-green-600">
                      {complaintTypes.find((t) => t.id === complaintInfo.complaintType)?.fee}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="text-sm space-y-2 text-gray-600">
                    <li className="flex items-start space-x-2">
                      <span className="font-bold text-red-600">1.</span>
                      <span>Review complaint for accuracy</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="font-bold text-red-600">2.</span>
                      <span>File complaint with CFPB online</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="font-bold text-red-600">3.</span>
                      <span>Keep copies of all documentation</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="font-bold text-red-600">4.</span>
                      <span>Monitor complaint status</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="font-bold text-red-600">5.</span>
                      <span>Follow up on resolution</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">Success Statistics</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-green-700 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>92% success rate with CFPB complaints</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Average resolution time: 45 days</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Government investigation and oversight</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4" />
                    <span>Creates legal documentation trail</span>
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
