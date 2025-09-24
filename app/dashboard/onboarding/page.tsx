"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { User, CreditCard, Target, FileText, CheckCircle, ArrowRight, ArrowLeft, Home } from "lucide-react"

interface OnboardingData {
  personalInfo: {
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
  }
  creditGoals: {
    primaryGoal: string
    targetScore: number
    timeframe: string
    specificNeeds: string[]
    urgentIssues: string
  }
  currentSituation: {
    currentScores: {
      experian: number | null
      equifax: number | null
      transunion: number | null
    }
    majorIssues: string[]
    recentChanges: string
    bankruptcyHistory: boolean
    foreclosureHistory: boolean
  }
  preferences: {
    communicationMethod: string
    reminderFrequency: string
    privacyLevel: string
    marketingOptIn: boolean
  }
}

const initialData: OnboardingData = {
  personalInfo: {
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
  },
  creditGoals: {
    primaryGoal: "",
    targetScore: 750,
    timeframe: "",
    specificNeeds: [],
    urgentIssues: "",
  },
  currentSituation: {
    currentScores: {
      experian: null,
      equifax: null,
      transunion: null,
    },
    majorIssues: [],
    recentChanges: "",
    bankruptcyHistory: false,
    foreclosureHistory: false,
  },
  preferences: {
    communicationMethod: "",
    reminderFrequency: "",
    privacyLevel: "",
    marketingOptIn: false,
  },
}

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const updateData = (section: keyof OnboardingData, updates: any) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates,
      },
    }))
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Welcome to Credit Repair AI!",
        description: "Your profile has been created successfully. Let's start improving your credit!",
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

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <User className="h-12 w-12 mx-auto text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
        <p className="text-gray-600">Let's start with your basic information</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={data.personalInfo.firstName}
            onChange={(e) => updateData("personalInfo", { firstName: e.target.value })}
            placeholder="Enter your first name"
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={data.personalInfo.lastName}
            onChange={(e) => updateData("personalInfo", { lastName: e.target.value })}
            placeholder="Enter your last name"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={data.personalInfo.email}
            onChange={(e) => updateData("personalInfo", { email: e.target.value })}
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={data.personalInfo.phone}
            onChange={(e) => updateData("personalInfo", { phone: e.target.value })}
            placeholder="(555) 123-4567"
            required
          />
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={data.personalInfo.dateOfBirth}
            onChange={(e) => updateData("personalInfo", { dateOfBirth: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="ssn">Social Security Number *</Label>
          <Input
            id="ssn"
            type="password"
            value={data.personalInfo.ssn}
            onChange={(e) => updateData("personalInfo", { ssn: e.target.value })}
            placeholder="XXX-XX-XXXX"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Encrypted and secure</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Home className="h-5 w-5 mr-2" />
          Address Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              value={data.personalInfo.address.street}
              onChange={(e) =>
                updateData("personalInfo", {
                  address: { ...data.personalInfo.address, street: e.target.value },
                })
              }
              placeholder="123 Main Street"
              required
            />
          </div>
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={data.personalInfo.address.city}
              onChange={(e) =>
                updateData("personalInfo", {
                  address: { ...data.personalInfo.address, city: e.target.value },
                })
              }
              placeholder="City"
              required
            />
          </div>
          <div>
            <Label htmlFor="state">State *</Label>
            <Select
              value={data.personalInfo.address.state}
              onValueChange={(value) =>
                updateData("personalInfo", {
                  address: { ...data.personalInfo.address, state: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="TX">Texas</SelectItem>
                <SelectItem value="NY">New York</SelectItem>
                <SelectItem value="FL">Florida</SelectItem>
                <SelectItem value="IL">Illinois</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="zipCode">ZIP Code *</Label>
            <Input
              id="zipCode"
              value={data.personalInfo.address.zipCode}
              onChange={(e) =>
                updateData("personalInfo", {
                  address: { ...data.personalInfo.address, zipCode: e.target.value },
                })
              }
              placeholder="12345"
              required
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target className="h-12 w-12 mx-auto text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Credit Goals</h2>
        <p className="text-gray-600">What do you want to achieve with your credit?</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="primaryGoal">Primary Goal *</Label>
          <Select
            value={data.creditGoals.primaryGoal}
            onValueChange={(value) => updateData("creditGoals", { primaryGoal: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your primary goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buy-home">Buy a Home</SelectItem>
              <SelectItem value="buy-car">Buy a Car</SelectItem>
              <SelectItem value="get-credit-card">Get Better Credit Cards</SelectItem>
              <SelectItem value="lower-rates">Lower Interest Rates</SelectItem>
              <SelectItem value="remove-negatives">Remove Negative Items</SelectItem>
              <SelectItem value="build-credit">Build Credit History</SelectItem>
              <SelectItem value="business-credit">Business Credit</SelectItem>
              <SelectItem value="general-improvement">General Improvement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="targetScore">Target Credit Score</Label>
          <div className="flex items-center space-x-4">
            <Input
              id="targetScore"
              type="number"
              min="300"
              max="850"
              value={data.creditGoals.targetScore}
              onChange={(e) => updateData("creditGoals", { targetScore: Number.parseInt(e.target.value) })}
              className="w-24"
            />
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1">Score Range</div>
              <div className="flex space-x-2">
                <Badge variant={data.creditGoals.targetScore >= 800 ? "default" : "outline"}>Excellent (800+)</Badge>
                <Badge variant={data.creditGoals.targetScore >= 740 ? "default" : "outline"}>Very Good (740-799)</Badge>
                <Badge variant={data.creditGoals.targetScore >= 670 ? "default" : "outline"}>Good (670-739)</Badge>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="timeframe">Desired Timeframe *</Label>
          <Select
            value={data.creditGoals.timeframe}
            onValueChange={(value) => updateData("creditGoals", { timeframe: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="How quickly do you need results?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-month">Within 1 Month (Urgent)</SelectItem>
              <SelectItem value="3-months">Within 3 Months</SelectItem>
              <SelectItem value="6-months">Within 6 Months</SelectItem>
              <SelectItem value="1-year">Within 1 Year</SelectItem>
              <SelectItem value="no-rush">No Rush</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Specific Needs (Select all that apply)</Label>
          <div className="grid md:grid-cols-2 gap-3 mt-2">
            {[
              "Remove late payments",
              "Remove collections",
              "Remove charge-offs",
              "Dispute inaccurate information",
              "Increase credit limits",
              "Add positive accounts",
              "Identity theft recovery",
              "Bankruptcy recovery",
            ].map((need) => (
              <div key={need} className="flex items-center space-x-2">
                <Checkbox
                  id={need}
                  checked={data.creditGoals.specificNeeds.includes(need)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateData("creditGoals", {
                        specificNeeds: [...data.creditGoals.specificNeeds, need],
                      })
                    } else {
                      updateData("creditGoals", {
                        specificNeeds: data.creditGoals.specificNeeds.filter((n) => n !== need),
                      })
                    }
                  }}
                />
                <Label htmlFor={need} className="text-sm">
                  {need}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="urgentIssues">Urgent Issues or Special Circumstances</Label>
          <Textarea
            id="urgentIssues"
            value={data.creditGoals.urgentIssues}
            onChange={(e) => updateData("creditGoals", { urgentIssues: e.target.value })}
            placeholder="Describe any urgent credit issues or special circumstances..."
            rows={3}
          />
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CreditCard className="h-12 w-12 mx-auto text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Current Credit Situation</h2>
        <p className="text-gray-600">Help us understand your current credit status</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Current Credit Scores (if known)</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="experianScore">Experian Score</Label>
              <Input
                id="experianScore"
                type="number"
                min="300"
                max="850"
                value={data.currentSituation.currentScores.experian || ""}
                onChange={(e) =>
                  updateData("currentSituation", {
                    currentScores: {
                      ...data.currentSituation.currentScores,
                      experian: e.target.value ? Number.parseInt(e.target.value) : null,
                    },
                  })
                }
                placeholder="e.g., 650"
              />
            </div>
            <div>
              <Label htmlFor="equifaxScore">Equifax Score</Label>
              <Input
                id="equifaxScore"
                type="number"
                min="300"
                max="850"
                value={data.currentSituation.currentScores.equifax || ""}
                onChange={(e) =>
                  updateData("currentSituation", {
                    currentScores: {
                      ...data.currentSituation.currentScores,
                      equifax: e.target.value ? Number.parseInt(e.target.value) : null,
                    },
                  })
                }
                placeholder="e.g., 650"
              />
            </div>
            <div>
              <Label htmlFor="transunionScore">TransUnion Score</Label>
              <Input
                id="transunionScore"
                type="number"
                min="300"
                max="850"
                value={data.currentSituation.currentScores.transunion || ""}
                onChange={(e) =>
                  updateData("currentSituation", {
                    currentScores: {
                      ...data.currentSituation.currentScores,
                      transunion: e.target.value ? Number.parseInt(e.target.value) : null,
                    },
                  })
                }
                placeholder="e.g., 650"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Don't worry if you don't know these - we'll help you get them!</p>
        </div>

        <div>
          <Label>Major Credit Issues (Select all that apply)</Label>
          <div className="grid md:grid-cols-2 gap-3 mt-2">
            {[
              "Late payments",
              "Collections accounts",
              "Charge-offs",
              "Bankruptcies",
              "Foreclosures",
              "Tax liens",
              "High credit utilization",
              "Too many inquiries",
              "Identity theft",
              "Inaccurate information",
            ].map((issue) => (
              <div key={issue} className="flex items-center space-x-2">
                <Checkbox
                  id={issue}
                  checked={data.currentSituation.majorIssues.includes(issue)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateData("currentSituation", {
                        majorIssues: [...data.currentSituation.majorIssues, issue],
                      })
                    } else {
                      updateData("currentSituation", {
                        majorIssues: data.currentSituation.majorIssues.filter((i) => i !== issue),
                      })
                    }
                  }}
                />
                <Label htmlFor={issue} className="text-sm">
                  {issue}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="recentChanges">Recent Credit Changes or Events</Label>
          <Textarea
            id="recentChanges"
            value={data.currentSituation.recentChanges}
            onChange={(e) => updateData("currentSituation", { recentChanges: e.target.value })}
            placeholder="Describe any recent changes to your credit (new accounts, paid off debts, etc.)"
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Credit History</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bankruptcyHistory"
                checked={data.currentSituation.bankruptcyHistory}
                onCheckedChange={(checked) => updateData("currentSituation", { bankruptcyHistory: checked as boolean })}
              />
              <Label htmlFor="bankruptcyHistory">I have filed for bankruptcy</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="foreclosureHistory"
                checked={data.currentSituation.foreclosureHistory}
                onCheckedChange={(checked) =>
                  updateData("currentSituation", { foreclosureHistory: checked as boolean })
                }
              />
              <Label htmlFor="foreclosureHistory">I have had a foreclosure</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <FileText className="h-12 w-12 mx-auto text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Preferences & Settings</h2>
        <p className="text-gray-600">Customize your experience</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="communicationMethod">Preferred Communication Method *</Label>
          <Select
            value={data.preferences.communicationMethod}
            onValueChange={(value) => updateData("preferences", { communicationMethod: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="How would you like us to contact you?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="text">Text Messages</SelectItem>
              <SelectItem value="app">In-App Notifications Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="reminderFrequency">Reminder Frequency *</Label>
          <Select
            value={data.preferences.reminderFrequency}
            onValueChange={(value) => updateData("preferences", { reminderFrequency: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="How often should we remind you about tasks?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="as-needed">Only When Necessary</SelectItem>
              <SelectItem value="never">Never</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="privacyLevel">Privacy Level *</Label>
          <Select
            value={data.preferences.privacyLevel}
            onValueChange={(value) => updateData("preferences", { privacyLevel: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose your privacy level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard - Share data to improve service</SelectItem>
              <SelectItem value="enhanced">Enhanced - Limit data sharing</SelectItem>
              <SelectItem value="maximum">Maximum - Minimal data sharing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Additional Preferences</h3>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="marketingOptIn"
              checked={data.preferences.marketingOptIn}
              onCheckedChange={(checked) => updateData("preferences", { marketingOptIn: checked as boolean })}
            />
            <Label htmlFor="marketingOptIn" className="text-sm">
              I would like to receive marketing emails about new features and credit tips
            </Label>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• We'll analyze your information and create a personalized action plan</li>
            <li>• You'll receive your first credit improvement recommendations</li>
            <li>• Our AI will start monitoring your credit for changes</li>
            <li>• You can begin generating dispute letters immediately</li>
          </ul>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
              <Badge variant="outline">
                Step {currentStep} of {totalSteps}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Personal Info</span>
              <span>Credit Goals</span>
              <span>Current Situation</span>
              <span>Preferences</span>
            </div>
          </div>

          {/* Step Content */}
          <Card>
            <CardContent className="p-8">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i + 1 <= currentStep ? "bg-blue-600" : "bg-gray-300"}`}
                />
              ))}
            </div>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext} className="flex items-center">
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Profile...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
