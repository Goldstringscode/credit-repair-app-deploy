"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { User, CreditCard, FileText, Target, CheckCircle, ArrowRight, Upload, Shield, TrendingUp } from 'lucide-react'

interface OnboardingData {
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
    ssn: string
    dateOfBirth: string
  }
  creditGoals: {
    currentScore: string
    targetScore: string
    timeframe: string
    primaryGoal: string
    urgency: string
  }
  creditHistory: {
    hasDisputed: boolean
    previousDisputes: string
    knownIssues: string[]
    bankruptcyHistory: string
    collections: boolean
  }
  preferences: {
    communicationMethod: string
    notifications: boolean
    autoDispute: boolean
    premiumFeatures: boolean
  }
}

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      ssn: "",
      dateOfBirth: "",
    },
    creditGoals: {
      currentScore: "",
      targetScore: "",
      timeframe: "",
      primaryGoal: "",
      urgency: "",
    },
    creditHistory: {
      hasDisputed: false,
      previousDisputes: "",
      knownIssues: [],
      bankruptcyHistory: "none",
      collections: false,
    },
    preferences: {
      communicationMethod: "email",
      notifications: true,
      autoDispute: false,
      premiumFeatures: false,
    },
  })

  const totalSteps = 4
  const progressPercentage = (currentStep / totalSteps) * 100

  const handleInputChange = (section: keyof OnboardingData, field: string, value: any) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleArrayToggle = (section: keyof OnboardingData, field: string, value: string) => {
    setData((prev) => {
      const currentArray = (prev[section] as any)[field] || []
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item: string) => item !== value)
        : [...currentArray, value]
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray,
        },
      }
    })
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to save onboarding data")
      }

      toast({
        title: "Welcome to CreditAI Pro!",
        description: "Your profile has been set up successfully.",
      })

      router.push("/dashboard")
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

  const knownIssuesOptions = [
    "Late payments",
    "Collections accounts",
    "Charge-offs",
    "High credit utilization",
    "Incorrect personal information",
    "Accounts that don't belong to me",
    "Duplicate accounts",
    "Outdated information",
    "Identity theft",
    "Bankruptcy errors",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-10 w-10 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Welcome to CreditAI Pro</h1>
          </div>
          <p className="text-gray-600">Let's set up your personalized credit repair journey</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-500">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={data.personalInfo.firstName}
                    onChange={(e) => handleInputChange("personalInfo", "firstName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={data.personalInfo.lastName}
                    onChange={(e) => handleInputChange("personalInfo", "lastName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.personalInfo.email}
                    onChange={(e) => handleInputChange("personalInfo", "email", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={data.personalInfo.phone}
                    onChange={(e) => handleInputChange("personalInfo", "phone", e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={data.personalInfo.address}
                    onChange={(e) => handleInputChange("personalInfo", "address", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={data.personalInfo.city}
                    onChange={(e) => handleInputChange("personalInfo", "city", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={data.personalInfo.state}
                    onChange={(e) => handleInputChange("personalInfo", "state", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={data.personalInfo.zipCode}
                    onChange={(e) => handleInputChange("personalInfo", "zipCode", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={data.personalInfo.dateOfBirth}
                    onChange={(e) => handleInputChange("personalInfo", "dateOfBirth", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ssn">Last 4 digits of SSN *</Label>
                  <Input
                    id="ssn"
                    value={data.personalInfo.ssn}
                    onChange={(e) => handleInputChange("personalInfo", "ssn", e.target.value)}
                    maxLength={4}
                    placeholder="1234"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Credit Goals */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Credit Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="currentScore">Current Credit Score (if known)</Label>
                  <Select
                    value={data.creditGoals.currentScore}
                    onValueChange={(value) => handleInputChange("creditGoals", "currentScore", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select current score range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unknown">I don't know</SelectItem>
                      <SelectItem value="300-579">300-579 (Poor)</SelectItem>
                      <SelectItem value="580-669">580-669 (Fair)</SelectItem>
                      <SelectItem value="670-739">670-739 (Good)</SelectItem>
                      <SelectItem value="740-799">740-799 (Very Good)</SelectItem>
                      <SelectItem value="800-850">800-850 (Excellent)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetScore">Target Credit Score</Label>
                  <Select
                    value={data.creditGoals.targetScore}
                    onValueChange={(value) => handleInputChange("creditGoals", "targetScore", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target score" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="650+">650+ (Fair)</SelectItem>
                      <SelectItem value="700+">700+ (Good)</SelectItem>
                      <SelectItem value="750+">750+ (Very Good)</SelectItem>
                      <SelectItem value="800+">800+ (Excellent)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timeframe">Desired Timeframe</Label>
                  <Select
                    value={data.creditGoals.timeframe}
                    onValueChange={(value) => handleInputChange("creditGoals", "timeframe", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3-months">3 months</SelectItem>
                      <SelectItem value="6-months">6 months</SelectItem>
                      <SelectItem value="12-months">12 months</SelectItem>
                      <SelectItem value="18-months">18+ months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="urgency">How urgent is this?</Label>
                  <Select
                    value={data.creditGoals.urgency}
                    onValueChange={(value) => handleInputChange("creditGoals", "urgency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Not urgent</SelectItem>
                      <SelectItem value="medium">Somewhat urgent</SelectItem>
                      <SelectItem value="high">Very urgent</SelectItem>
                      <SelectItem value="critical">Critical (buying home/car soon)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="primaryGoal">Primary Goal</Label>
                <Select
                  value={data.creditGoals.primaryGoal}
                  onValueChange={(value) => handleInputChange("creditGoals", "primaryGoal", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="What's your main goal?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy-home">Buy a home</SelectItem>
                    <SelectItem value="buy-car">Buy a car</SelectItem>
                    <SelectItem value="get-credit-card">Get approved for credit cards</SelectItem>
                    <SelectItem value="lower-interest">Lower interest rates</SelectItem>
                    <SelectItem value="remove-negatives">Remove negative items</SelectItem>
                    <SelectItem value="general-improvement">General credit improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Credit History */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Credit History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Have you disputed credit items before?</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasDisputed"
                      checked={data.creditHistory.hasDisputed}
                      onCheckedChange={(checked) => handleInputChange("creditHistory", "hasDisputed", !!checked)}
                    />
                    <Label htmlFor="hasDisputed">Yes, I have disputed items before</Label>
                  </div>
                </div>
              </div>

              {data.creditHistory.hasDisputed && (
                <div>
                  <Label htmlFor="previousDisputes">Tell us about your previous disputes</Label>
                  <Textarea
                    id="previousDisputes"
                    value={data.creditHistory.previousDisputes}
                    onChange={(e) => handleInputChange("creditHistory", "previousDisputes", e.target.value)}
                    placeholder="What did you dispute? What were the results?"
                    rows={3}
                  />
                </div>
              )}

              <div>
                <Label>Known Issues on Your Credit Report</Label>
                <p className="text-sm text-gray-600 mb-3">Select all that apply:</p>
                <div className="grid md:grid-cols-2 gap-3">
                  {knownIssuesOptions.map((issue) => (
                    <div key={issue} className="flex items-center space-x-2">
                      <Checkbox
                        id={issue}
                        checked={data.creditHistory.knownIssues.includes(issue)}
                        onCheckedChange={() => handleArrayToggle("creditHistory", "knownIssues", issue)}
                      />
                      <Label htmlFor={issue} className="text-sm">{issue}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="bankruptcyHistory">Bankruptcy History</Label>
                <Select
                  value={data.creditHistory.bankruptcyHistory}
                  onValueChange={(value) => handleInputChange("creditHistory", "bankruptcyHistory", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No bankruptcy</SelectItem>
                    <SelectItem value="chapter7">Chapter 7 (within 10 years)</SelectItem>
                    <SelectItem value="chapter13">Chapter 13 (within 7 years)</SelectItem>
                    <SelectItem value="discharged">Bankruptcy discharged</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="collections"
                  checked={data.creditHistory.collections}
                  onCheckedChange={(checked) => handleInputChange("creditHistory", "collections", !!checked)}
                />
                <Label htmlFor="collections">I have accounts in collections</Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Preferences */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                Preferences & Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="communicationMethod">Preferred Communication Method</Label>
                <Select
                  value={data.preferences.communicationMethod}
                  onValueChange={(value) => handleInputChange("preferences", "communicationMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">Text Messages</SelectItem>
                    <SelectItem value="phone">Phone Calls</SelectItem>
                    <SelectItem value="app">In-App Notifications Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifications"
                    checked={data.preferences.notifications}
                    onCheckedChange={(checked) => handleInputChange("preferences", "notifications", !!checked)}
                  />
                  <Label htmlFor="notifications">Send me credit score updates and progress notifications</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoDispute"
                    checked={data.preferences.autoDispute}
                    onCheckedChange={(checked) => handleInputChange("preferences", "autoDispute", !!checked)}
                  />
                  <Label htmlFor="autoDispute">Enable automatic dispute generation for obvious errors</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="premiumFeatures"
                    checked={data.preferences.premiumFeatures}
                    onCheckedChange={(checked) => handleInputChange("preferences", "premiumFeatures", !!checked)}
                  />
                  <Label htmlFor="premiumFeatures">I'm interested in premium features (attorney review, certified mail)</Label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• We'll analyze your credit profile and create a personalized action plan</li>
                  <li>• You'll get access to AI-powered dispute letter generation</li>
                  <li>• Track your progress with real-time credit monitoring</li>
                  <li>• Get expert guidance every step of the way</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="bg-transparent"
          >
            Previous
          </Button>
          
          {currentStep < totalSteps ? (
            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Setting up...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Setup
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
