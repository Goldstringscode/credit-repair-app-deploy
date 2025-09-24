"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Circle,
  User,
  Target,
  Users,
  Rocket,
  Gift,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"

interface OnboardingStep {
  id: string
  title: string
  shortTitle: string
  description: string
  icon: React.ReactNode
  completed: boolean
}

interface MLMOnboardingData {
  personalInfo: {
    firstName: string
    lastName: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  goals: {
    monthlyIncomeGoal: string
    timeCommitment: string
    experience: string
    motivation: string
  }
  preferences: {
    communicationMethod: string
    trainingSchedule: string
    marketingInterests: string[]
  }
  sponsor: {
    sponsorCode: string
    sponsorName: string
    verified: boolean
  }
}

export function MobileMLMOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showStepMenu, setShowStepMenu] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [formData, setFormData] = useState<MLMOnboardingData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
    goals: {
      monthlyIncomeGoal: "",
      timeCommitment: "",
      experience: "",
      motivation: "",
    },
    preferences: {
      communicationMethod: "",
      trainingSchedule: "",
      marketingInterests: [],
    },
    sponsor: {
      sponsorCode: "",
      sponsorName: "",
      verified: false,
    },
  })

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to MLM Success",
      shortTitle: "Welcome",
      description: "Start your journey to financial freedom",
      icon: <Rocket className="h-5 w-5" />,
      completed: currentStep > 0,
    },
    {
      id: "personal",
      title: "Personal Information",
      shortTitle: "Personal",
      description: "Tell us about yourself",
      icon: <User className="h-5 w-5" />,
      completed: currentStep > 1,
    },
    {
      id: "sponsor",
      title: "Sponsor Verification",
      shortTitle: "Sponsor",
      description: "Connect with your sponsor",
      icon: <Users className="h-5 w-5" />,
      completed: currentStep > 2,
    },
    {
      id: "goals",
      title: "Set Your Goals",
      shortTitle: "Goals",
      description: "Define your success metrics",
      icon: <Target className="h-5 w-5" />,
      completed: currentStep > 3,
    },
    {
      id: "preferences",
      title: "Preferences & Training",
      shortTitle: "Preferences",
      description: "Customize your experience",
      icon: <BookOpen className="h-5 w-5" />,
      completed: currentStep > 4,
    },
    {
      id: "complete",
      title: "Setup Complete",
      shortTitle: "Complete",
      description: "You're ready to start earning!",
      icon: <Gift className="h-5 w-5" />,
      completed: currentStep > 5,
    },
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setShowStepMenu(false)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setShowStepMenu(false)
    }
  }

  const handleComplete = async () => {
    try {
      const response = await fetch("/api/mlm/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        window.location.href = "/mlm/dashboard"
      }
    } catch (error) {
      console.error("Onboarding submission error:", error)
    }
  }

  const verifySponsor = async () => {
    if (!formData.sponsor.sponsorCode) return

    try {
      const response = await fetch(`/api/mlm/verify-sponsor?code=${formData.sponsor.sponsorCode}`)
      const data = await response.json()

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          sponsor: {
            ...prev.sponsor,
            sponsorName: data.sponsor.name,
            verified: true,
          },
        }))
      }
    } catch (error) {
      console.error("Sponsor verification error:", error)
    }
  }

  const renderMobileStepIndicator = () => (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setShowStepMenu(!showStepMenu)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700"
        >
          {showStepMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].shortTitle}
        </button>
        <Badge variant="outline" className="text-xs">
          {Math.round(progress)}%
        </Badge>
      </div>
      <Progress value={progress} className="h-1" />

      {showStepMenu && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 py-2">
            <div className="grid grid-cols-2 gap-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => {
                    setCurrentStep(index)
                    setShowStepMenu(false)
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                    index === currentStep
                      ? "bg-purple-100 text-purple-700"
                      : index < currentStep
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-50 text-gray-500"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  ) : index === currentStep ? (
                    step.icon
                  ) : (
                    <Circle className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="text-xs font-medium">{step.shortTitle}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderDesktopStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">MLM Setup Wizard</h1>
        <Badge variant="outline">
          Step {currentStep + 1} of {steps.length}
        </Badge>
      </div>
      <Progress value={progress} className="h-2 mb-6" />

      <div className="flex justify-center">
        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                index === currentStep
                  ? "bg-purple-100 text-purple-700"
                  : index < currentStep
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
              }`}
            >
              {step.completed ? (
                <CheckCircle className="h-4 w-4" />
              ) : index === currentStep ? (
                step.icon
              ) : (
                <Circle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium whitespace-nowrap">{step.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <Rocket className="h-10 w-10 md:h-12 md:w-12 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Welcome to Your MLM Journey!</h2>
              <p className="text-gray-600 text-base md:text-lg mb-6">
                You're about to join thousands of successful entrepreneurs building their financial future. This quick
                setup will personalize your experience and connect you with your sponsor.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="font-semibold text-green-800">Multiple Income Streams</div>
                  <div className="text-green-600">7 different ways to earn money</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="font-semibold text-blue-800">Proven System</div>
                  <div className="text-blue-600">Step-by-step success blueprint</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="font-semibold text-purple-800">Full Support</div>
                  <div className="text-purple-600">Training, tools, and mentorship</div>
                </div>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Personal Information</h2>
              <p className="text-gray-600">Help us personalize your MLM experience</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.personalInfo.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, firstName: e.target.value },
                      }))
                    }
                    placeholder="Enter your first name"
                    className="text-base" // Prevents zoom on iOS
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.personalInfo.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, lastName: e.target.value },
                      }))
                    }
                    placeholder="Enter your last name"
                    className="text-base"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.personalInfo.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, phone: e.target.value },
                    }))
                  }
                  placeholder="(555) 123-4567"
                  className="text-base"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.personalInfo.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, address: e.target.value },
                    }))
                  }
                  placeholder="Street address"
                  className="text-base"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.personalInfo.city}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, city: e.target.value },
                      }))
                    }
                    placeholder="City"
                    className="text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={formData.personalInfo.state}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, state: value },
                      }))
                    }
                  >
                    <SelectTrigger className="text-base">
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AL">Alabama</SelectItem>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Sponsor Verification</h2>
              <p className="text-gray-600">Connect with your sponsor to get started</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sponsorCode">Sponsor Code *</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="sponsorCode"
                    value={formData.sponsor.sponsorCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sponsor: { ...prev.sponsor, sponsorCode: e.target.value },
                      }))
                    }
                    placeholder="Enter sponsor code"
                    className="text-base flex-1"
                  />
                  <Button onClick={verifySponsor} variant="outline" className="w-full sm:w-auto bg-transparent">
                    Verify
                  </Button>
                </div>
              </div>
              {formData.sponsor.verified && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-green-800">Sponsor Verified!</div>
                      <div className="text-green-600 text-sm">
                        Your sponsor: <strong>{formData.sponsor.sponsorName}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Don't have a sponsor code?</h3>
                <p className="text-blue-600 text-sm mb-3">
                  No problem! We'll connect you with one of our top-performing mentors who will guide you to success.
                </p>
                <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
                  Get Matched with a Mentor
                </Button>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Set Your Goals</h2>
              <p className="text-gray-600">Define what success looks like for you</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="monthlyIncomeGoal">Monthly Income Goal</Label>
                <Select
                  value={formData.goals.monthlyIncomeGoal}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      goals: { ...prev.goals, monthlyIncomeGoal: value },
                    }))
                  }
                >
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="Select your income goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                    <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                    <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                    <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                    <SelectItem value="10000+">$10,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timeCommitment">Time Commitment (hours per week)</Label>
                <Select
                  value={formData.goals.timeCommitment}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      goals: { ...prev.goals, timeCommitment: value },
                    }))
                  }
                >
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="How much time can you dedicate?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5-10">5-10 hours (Part-time)</SelectItem>
                    <SelectItem value="10-20">10-20 hours (Serious)</SelectItem>
                    <SelectItem value="20-40">20-40 hours (Full-time)</SelectItem>
                    <SelectItem value="40+">40+ hours (All-in)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="experience">MLM/Network Marketing Experience</Label>
                <Select
                  value={formData.goals.experience}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      goals: { ...prev.goals, experience: value },
                    }))
                  }
                >
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="Your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Complete beginner</SelectItem>
                    <SelectItem value="some">Some experience</SelectItem>
                    <SelectItem value="experienced">Experienced</SelectItem>
                    <SelectItem value="expert">Expert/Leader</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="motivation">What motivates you most?</Label>
                <Textarea
                  id="motivation"
                  value={formData.goals.motivation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      goals: { ...prev.goals, motivation: e.target.value },
                    }))
                  }
                  placeholder="Tell us about your why..."
                  rows={3}
                  className="text-base resize-none"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Preferences & Training</h2>
              <p className="text-gray-600">Customize your learning and communication experience</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Preferred Communication Method</Label>
                <Select
                  value={formData.preferences.communicationMethod}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferences: { ...prev.preferences, communicationMethod: value },
                    }))
                  }
                >
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="How do you prefer to communicate?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone calls</SelectItem>
                    <SelectItem value="text">Text messages</SelectItem>
                    <SelectItem value="video">Video calls</SelectItem>
                    <SelectItem value="app">In-app messaging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Training Schedule Preference</Label>
                <Select
                  value={formData.preferences.trainingSchedule}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferences: { ...prev.preferences, trainingSchedule: value },
                    }))
                  }
                >
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="When do you prefer training?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (6-10 AM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12-5 PM)</SelectItem>
                    <SelectItem value="evening">Evening (6-9 PM)</SelectItem>
                    <SelectItem value="weekend">Weekends</SelectItem>
                    <SelectItem value="flexible">Flexible/Self-paced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Marketing Interests (Select all that apply)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {[
                    "Social Media Marketing",
                    "Email Marketing",
                    "Content Creation",
                    "Video Marketing",
                    "Webinar Hosting",
                    "Networking Events",
                    "Referral Programs",
                    "Influencer Partnerships",
                  ].map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={formData.preferences.marketingInterests.includes(interest)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData((prev) => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                marketingInterests: [...prev.preferences.marketingInterests, interest],
                              },
                            }))
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                marketingInterests: prev.preferences.marketingInterests.filter((i) => i !== interest),
                              },
                            }))
                          }
                        }}
                      />
                      <Label htmlFor={interest} className="text-sm leading-tight">
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <Gift className="h-10 w-10 md:h-12 md:w-12 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Congratulations! 🎉</h2>
              <p className="text-gray-600 text-base md:text-lg mb-6">
                Your MLM account is now set up and ready to go. You're about to embark on an exciting journey toward
                financial freedom!
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 md:p-6">
              <h3 className="font-bold text-lg mb-4">Your Next Steps:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {[
                  { step: 1, title: "Complete Training", desc: "Start with our beginner course" },
                  { step: 2, title: "Set Up Profile", desc: "Customize your marketing materials" },
                  { step: 3, title: "Connect with Sponsor", desc: "Schedule your first mentoring call" },
                  { step: 4, title: "Start Earning", desc: "Make your first referral" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{item.title}</div>
                      <div className="text-xs text-gray-600">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 justify-center">
                <Gift className="h-5 w-5 text-yellow-600" />
                <div className="font-semibold text-yellow-800">Welcome Bonus Unlocked!</div>
              </div>
              <div className="text-yellow-600 text-sm mt-1">
                You've earned a $50 bonus credit for completing onboarding!
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderMobileNavigation = () => (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2 bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex gap-2">
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} className="flex items-center gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="bg-gradient-to-r from-purple-600 to-blue-600">
              Complete Setup!
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  const renderDesktopNavigation = () => (
    <div className="flex justify-between">
      <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
        Previous
      </Button>
      <div className="flex gap-2">
        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext}>Next Step</Button>
        ) : (
          <Button onClick={handleComplete} className="bg-gradient-to-r from-purple-600 to-blue-600">
            Complete Setup & Start Earning!
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className={`${isMobile ? "" : "max-w-4xl mx-auto px-4 py-8"}`}>
        {isMobile ? renderMobileStepIndicator() : renderDesktopStepIndicator()}

        {/* Step Content */}
        <div className={`${isMobile ? "px-4 py-6" : ""}`}>
          <Card className={`${isMobile ? "border-0 shadow-none bg-transparent" : "mb-8"}`}>
            <CardHeader className={isMobile ? "px-0 pb-4" : ""}>
              <CardTitle className="flex items-center gap-2">
                {!isMobile && steps[currentStep].icon}
                {steps[currentStep].title}
              </CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "px-0" : ""}>{renderStepContent()}</CardContent>
          </Card>
        </div>

        {/* Navigation */}
        {isMobile ? renderMobileNavigation() : renderDesktopNavigation()}
      </div>
    </div>
  )
}
