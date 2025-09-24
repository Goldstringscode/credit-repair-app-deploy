"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { WorkflowEngine } from "@/lib/workflow-engine"
import {
  User,
  FileText,
  Target,
  MessageSquare,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Phone,
  Mail,
} from "lucide-react"

interface OnboardingData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  ssn: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }

  // Financial Information
  currentCreditScore: string
  targetCreditScore: string
  annualIncome: string
  monthlyDebt: string
  homeOwnership: string

  // Goals and Priorities
  primaryGoals: string[]
  timeline: string
  urgentItems: string[]
  additionalNotes: string

  // Communication Preferences
  preferredContact: string
  contactTimes: string[]
  emailUpdates: boolean
  smsUpdates: boolean
  callReminders: boolean

  // Document Upload
  documentsUploaded: string[]
  documentsRequired: string[]

  // Service Selection
  selectedServices: string[]
  addOnServices: string[]
  estimatedCost: number
}

const initialData: OnboardingData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  ssn: "",
  address: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
  },
  currentCreditScore: "",
  targetCreditScore: "",
  annualIncome: "",
  monthlyDebt: "",
  homeOwnership: "",
  primaryGoals: [],
  timeline: "",
  urgentItems: [],
  additionalNotes: "",
  preferredContact: "",
  contactTimes: [],
  emailUpdates: true,
  smsUpdates: false,
  callReminders: true,
  documentsUploaded: [],
  documentsRequired: [
    "Government-issued ID",
    "Social Security Card",
    "Proof of Address",
    "Credit Reports (all 3 bureaus)",
    "Recent Pay Stubs",
    "Bank Statements",
  ],
  selectedServices: [],
  addOnServices: [],
  estimatedCost: 0,
}

const steps = [
  { id: 1, title: "Personal Information", icon: User },
  { id: 2, title: "Financial Details", icon: CreditCard },
  { id: 3, title: "Goals & Priorities", icon: Target },
  { id: 4, title: "Communication", icon: MessageSquare },
  { id: 5, title: "Documents", icon: FileText },
  { id: 6, title: "Review & Complete", icon: CheckCircle },
]

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const updateData = (field: string, value: any) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const updateNestedData = (parent: string, field: string, value: any) => {
    setData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof OnboardingData],
        [field]: value,
      },
    }))
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return data.firstName && data.lastName && data.email && data.phone
      case 2:
        return data.currentCreditScore && data.annualIncome
      case 3:
        return data.primaryGoals.length > 0 && data.timeline
      case 4:
        return data.preferredContact
      case 5:
        return data.documentsUploaded.length >= 3
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Create a new case and trigger onboarding workflow
      const caseId = `case_${Date.now()}`
      const clientId = `client_${Date.now()}`

      // In a real app, this would save to database
      console.log("Onboarding data:", data)

      // Create workflow instance
      const workflow = WorkflowEngine.createWorkflowInstance("onboarding-standard", caseId, clientId, "sarah-johnson")

      toast({
        title: "Onboarding Complete!",
        description: `Welcome ${data.firstName}! Your case has been created and our team will contact you within 24 hours.`,
      })

      // Reset form
      setData(initialData)
      setCurrentStep(1)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / steps.length) * 100

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={data.firstName}
                  onChange={(e) => updateData("firstName", e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={data.lastName}
                  onChange={(e) => updateData("lastName", e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => updateData("email", e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => updateData("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={data.dateOfBirth}
                  onChange={(e) => updateData("dateOfBirth", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ssn">Social Security Number</Label>
                <Input
                  id="ssn"
                  type="password"
                  value={data.ssn}
                  onChange={(e) => updateData("ssn", e.target.value)}
                  placeholder="XXX-XX-XXXX"
                />
              </div>
            </div>

            <div>
              <Label>Address</Label>
              <div className="space-y-3 mt-2">
                <Input
                  value={data.address.street}
                  onChange={(e) => updateNestedData("address", "street", e.target.value)}
                  placeholder="Street Address"
                />
                <div className="grid md:grid-cols-3 gap-3">
                  <Input
                    value={data.address.city}
                    onChange={(e) => updateNestedData("address", "city", e.target.value)}
                    placeholder="City"
                  />
                  <Input
                    value={data.address.state}
                    onChange={(e) => updateNestedData("address", "state", e.target.value)}
                    placeholder="State"
                  />
                  <Input
                    value={data.address.zipCode}
                    onChange={(e) => updateNestedData("address", "zipCode", e.target.value)}
                    placeholder="ZIP Code"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentScore">Current Credit Score *</Label>
                <Select
                  value={data.currentCreditScore}
                  onValueChange={(value) => updateData("currentCreditScore", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your current score range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300-499">300-499 (Poor)</SelectItem>
                    <SelectItem value="500-579">500-579 (Poor)</SelectItem>
                    <SelectItem value="580-669">580-669 (Fair)</SelectItem>
                    <SelectItem value="670-739">670-739 (Good)</SelectItem>
                    <SelectItem value="740-799">740-799 (Very Good)</SelectItem>
                    <SelectItem value="800-850">800-850 (Excellent)</SelectItem>
                    <SelectItem value="unknown">I don't know</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="targetScore">Target Credit Score</Label>
                <Select
                  value={data.targetCreditScore}
                  onValueChange={(value) => updateData("targetCreditScore", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="What's your goal?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="600+">600+ (Fair)</SelectItem>
                    <SelectItem value="670+">670+ (Good)</SelectItem>
                    <SelectItem value="740+">740+ (Very Good)</SelectItem>
                    <SelectItem value="800+">800+ (Excellent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="income">Annual Income *</Label>
                <Select value={data.annualIncome} onValueChange={(value) => updateData("annualIncome", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select income range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-25k">Under $25,000</SelectItem>
                    <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                    <SelectItem value="50k-75k">$50,000 - $75,000</SelectItem>
                    <SelectItem value="75k-100k">$75,000 - $100,000</SelectItem>
                    <SelectItem value="100k-150k">$100,000 - $150,000</SelectItem>
                    <SelectItem value="over-150k">Over $150,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="monthlyDebt">Monthly Debt Payments</Label>
                <Select value={data.monthlyDebt} onValueChange={(value) => updateData("monthlyDebt", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select debt range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-500">Under $500</SelectItem>
                    <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                    <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
                    <SelectItem value="2000-3000">$2,000 - $3,000</SelectItem>
                    <SelectItem value="over-3000">Over $3,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="homeOwnership">Home Ownership Status</Label>
              <Select value={data.homeOwnership} onValueChange={(value) => updateData("homeOwnership", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your housing situation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="own">Own my home</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="live-with-family">Live with family</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>Primary Goals * (Select all that apply)</Label>
              <div className="grid md:grid-cols-2 gap-3 mt-3">
                {[
                  "Buy a home",
                  "Refinance mortgage",
                  "Get a car loan",
                  "Qualify for credit cards",
                  "Lower interest rates",
                  "Remove negative items",
                  "Increase credit limits",
                  "Build credit history",
                ].map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={data.primaryGoals.includes(goal)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateData("primaryGoals", [...data.primaryGoals, goal])
                        } else {
                          updateData(
                            "primaryGoals",
                            data.primaryGoals.filter((g) => g !== goal),
                          )
                        }
                      }}
                    />
                    <Label htmlFor={goal} className="text-sm">
                      {goal}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="timeline">Timeline *</Label>
              <Select value={data.timeline} onValueChange={(value) => updateData("timeline", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="When do you need results?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asap">As soon as possible</SelectItem>
                  <SelectItem value="3-months">Within 3 months</SelectItem>
                  <SelectItem value="6-months">Within 6 months</SelectItem>
                  <SelectItem value="1-year">Within 1 year</SelectItem>
                  <SelectItem value="flexible">I'm flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Urgent Items (Select any that apply)</Label>
              <div className="grid md:grid-cols-2 gap-3 mt-3">
                {[
                  "Collections accounts",
                  "Late payments",
                  "Charge-offs",
                  "Bankruptcies",
                  "Foreclosures",
                  "Identity theft",
                  "Incorrect personal info",
                  "Duplicate accounts",
                ].map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <Checkbox
                      id={item}
                      checked={data.urgentItems.includes(item)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateData("urgentItems", [...data.urgentItems, item])
                        } else {
                          updateData(
                            "urgentItems",
                            data.urgentItems.filter((i) => i !== item),
                          )
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

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={data.additionalNotes}
                onChange={(e) => updateData("additionalNotes", e.target.value)}
                placeholder="Tell us anything else that might help us serve you better..."
                rows={4}
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="preferredContact">Preferred Contact Method *</Label>
              <Select value={data.preferredContact} onValueChange={(value) => updateData("preferredContact", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="How would you like us to contact you?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="text">Text/SMS</SelectItem>
                  <SelectItem value="portal">Client Portal Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Best Times to Contact (Select all that apply)</Label>
              <div className="grid md:grid-cols-2 gap-3 mt-3">
                {["Morning (8AM-12PM)", "Afternoon (12PM-5PM)", "Evening (5PM-8PM)", "Weekends"].map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox
                      id={time}
                      checked={data.contactTimes.includes(time)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateData("contactTimes", [...data.contactTimes, time])
                        } else {
                          updateData(
                            "contactTimes",
                            data.contactTimes.filter((t) => t !== time),
                          )
                        }
                      }}
                    />
                    <Label htmlFor={time} className="text-sm">
                      {time}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Notification Preferences</Label>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailUpdates"
                  checked={data.emailUpdates}
                  onCheckedChange={(checked) => updateData("emailUpdates", checked)}
                />
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <Label htmlFor="emailUpdates" className="text-sm">
                    Email updates on case progress
                  </Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="smsUpdates"
                  checked={data.smsUpdates}
                  onCheckedChange={(checked) => updateData("smsUpdates", checked)}
                />
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  <Label htmlFor="smsUpdates" className="text-sm">
                    SMS notifications for important updates
                  </Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="callReminders"
                  checked={data.callReminders}
                  onCheckedChange={(checked) => updateData("callReminders", checked)}
                />
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-purple-500" />
                  <Label htmlFor="callReminders" className="text-sm">
                    Phone reminders for appointments
                  </Label>
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label>Required Documents</Label>
              <p className="text-sm text-gray-600 mb-4">
                Please upload the following documents to get started. You can upload more later through your client
                portal.
              </p>

              <div className="space-y-3">
                {data.documentsRequired.map((doc) => (
                  <div key={doc} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="text-sm">{doc}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {data.documentsUploaded.includes(doc) ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Simulate document upload
                            updateData("documentsUploaded", [...data.documentsUploaded, doc])
                            toast({
                              title: "Document Uploaded",
                              description: `${doc} has been uploaded successfully`,
                            })
                          }}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Document Security</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      All documents are encrypted and stored securely. We use bank-level security to protect your
                      personal information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Get Started!</h3>
              <p className="text-gray-600">
                Please review your information below and submit to begin your credit repair journey.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span>
                      {data.firstName} {data.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span>{data.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span>{data.phone}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Score:</span>
                    <span>{data.currentCreditScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target Score:</span>
                    <span>{data.targetCreditScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Income:</span>
                    <span>{data.annualIncome}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Goals & Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Primary Goals:</span>
                    <div className="mt-1">
                      {data.primaryGoals.map((goal) => (
                        <span
                          key={goal}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timeline:</span>
                    <span>{data.timeline}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Documents & Communication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Documents Uploaded:</span>
                    <span>
                      {data.documentsUploaded.length} of {data.documentsRequired.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preferred Contact:</span>
                    <span className="capitalize">{data.preferredContact}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">What Happens Next?</h4>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li>• You'll receive a welcome email with your case number</li>
                    <li>• Our team will review your documents within 24 hours</li>
                    <li>• We'll schedule your initial consultation call</li>
                    <li>• Your personalized credit repair strategy will be created</li>
                    <li>• We'll begin working on your case immediately</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Client Onboarding</CardTitle>
            <div className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent>
          {/* Step Navigation */}
          <div className="flex items-center justify-between mb-8 overflow-x-auto">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : isCompleted
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && <ArrowRight className="h-4 w-4 text-gray-300 mx-2" />}
                </div>
              )
            })}
          </div>

          {/* Step Content */}
          <div className="mb-8">{renderStepContent()}</div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep === steps.length ? (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Complete Onboarding
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!validateCurrentStep()}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
