"use client"

import type React from "react"

import { useState } from "react"
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
  Star,
  DollarSign,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
} from "lucide-react"

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
}

interface MLMOnboardingData {
  personalInfo: {
    firstName: string
    lastName: string
    email: string
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

export function MLMOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<MLMOnboardingData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
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

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to MLM Success",
      description: "Start your journey to financial freedom",
      icon: <Rocket className="h-6 w-6" />,
      completed: currentStep > 0,
    },
    {
      id: "personal",
      title: "Personal Information",
      description: "Tell us about yourself",
      icon: <User className="h-6 w-6" />,
      completed: currentStep > 1,
    },
    {
      id: "sponsor",
      title: "Sponsor Verification",
      description: "Connect with your sponsor",
      icon: <Users className="h-6 w-6" />,
      completed: currentStep > 2,
    },
    {
      id: "goals",
      title: "Set Your Goals",
      description: "Define your success metrics",
      icon: <Target className="h-6 w-6" />,
      completed: currentStep > 3,
    },
    {
      id: "preferences",
      title: "Preferences & Training",
      description: "Customize your experience",
      icon: <BookOpen className="h-6 w-6" />,
      completed: currentStep > 4,
    },
    {
      id: "complete",
      title: "Setup Complete",
      description: "You're ready to start earning!",
      icon: <Gift className="h-6 w-6" />,
      completed: currentStep > 5,
    },
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/mlm/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        // Redirect to welcome dashboard
        window.location.href = "/mlm/welcome"
      }
    } catch (error) {
      console.error("Onboarding submission error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const verifySponsor = async () => {
    if (!formData.sponsor.sponsorCode) return

    setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-8">
            <div className="mx-auto w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <Rocket className="h-16 w-16 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-4">Welcome to Your MLM Journey!</h2>
              <p className="text-xl text-gray-600 mb-8">
                You're about to join thousands of successful entrepreneurs building their financial future. This quick
                setup will personalize your experience and connect you with your sponsor.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <DollarSign className="h-8 w-8 text-green-600 mb-3" />
                  <div className="font-semibold text-green-800 mb-2">Multiple Income Streams</div>
                  <div className="text-green-600">7 different ways to earn money</div>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <TrendingUp className="h-8 w-8 text-blue-600 mb-3" />
                  <div className="font-semibold text-blue-800 mb-2">Proven System</div>
                  <div className="text-blue-600">Step-by-step success blueprint</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                  <Users className="h-8 w-8 text-purple-600 mb-3" />
                  <div className="font-semibold text-purple-800 mb-2">Full Support</div>
                  <div className="text-purple-600">Training, tools, and mentorship</div>
                </div>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Personal Information</h2>
              <p className="text-gray-600">Help us personalize your MLM experience</p>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName" className="text-base font-medium">
                    First Name *
                  </Label>
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
                    className="mt-2 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-base font-medium">
                    Last Name *
                  </Label>
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
                    className="mt-2 h-12"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email" className="text-base font-medium">
                    Email Address *
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.personalInfo.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, email: e.target.value },
                        }))
                      }
                      placeholder="your.email@example.com"
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone" className="text-base font-medium">
                    Phone Number *
                  </Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="address" className="text-base font-medium">
                  Address
                </Label>
                <div className="relative mt-2">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city" className="text-base font-medium">
                    City
                  </Label>
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
                    className="mt-2 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-base font-medium">
                    State
                  </Label>
                  <Select
                    value={formData.personalInfo.state}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, state: value },
                      }))
                    }
                  >
                    <SelectTrigger className="mt-2 h-12">
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
                <div>
                  <Label htmlFor="zipCode" className="text-base font-medium">
                    ZIP Code
                  </Label>
                  <Input
                    id="zipCode"
                    value={formData.personalInfo.zipCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, zipCode: e.target.value },
                      }))
                    }
                    placeholder="12345"
                    className="mt-2 h-12"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Sponsor Verification</h2>
              <p className="text-gray-600">Connect with your sponsor to get started</p>
            </div>
            <div className="space-y-6">
              <div>
                <Label htmlFor="sponsorCode" className="text-base font-medium">
                  Sponsor Code *
                </Label>
                <div className="flex gap-3 mt-2">
                  <Input
                    id="sponsorCode"
                    value={formData.sponsor.sponsorCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sponsor: { ...prev.sponsor, sponsorCode: e.target.value },
                      }))
                    }
                    placeholder="Enter sponsor code (e.g., SPONSOR001)"
                    className="flex-1 h-12"
                  />
                  <Button
                    onClick={verifySponsor}
                    disabled={!formData.sponsor.sponsorCode || isLoading}
                    className="px-6 h-12"
                  >
                    {isLoading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </div>
              {formData.sponsor.verified && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-green-800 text-lg">Sponsor Verified!</div>
                      <div className="text-green-600">
                        Your sponsor: <strong>{formData.sponsor.sponsorName}</strong>
                      </div>
                      <div className="text-green-600 text-sm mt-1">
                        Diamond Director • 89% Success Rate • 247 Team Members
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-800 mb-3 text-lg">Don't have a sponsor code?</h3>
                <p className="text-blue-600 mb-4">
                  No problem! We'll connect you with one of our top-performing mentors who will guide you to success.
                  Our mentors have helped thousands of people achieve their financial goals.
                </p>
                <Button variant="outline" className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50">
                  Get Matched with a Mentor
                </Button>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Set Your Goals</h2>
              <p className="text-gray-600">Define what success looks like for you</p>
            </div>
            <div className="space-y-6">
              <div>
                <Label htmlFor="monthlyIncomeGoal" className="text-base font-medium">
                  Monthly Income Goal
                </Label>
                <Select
                  value={formData.goals.monthlyIncomeGoal}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      goals: { ...prev.goals, monthlyIncomeGoal: value },
                    }))
                  }
                >
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue placeholder="Select your income goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500-1000">$500 - $1,000 (Part-time)</SelectItem>
                    <SelectItem value="1000-2500">$1,000 - $2,500 (Side hustle)</SelectItem>
                    <SelectItem value="2500-5000">$2,500 - $5,000 (Serious income)</SelectItem>
                    <SelectItem value="5000-10000">$5,000 - $10,000 (Full-time replacement)</SelectItem>
                    <SelectItem value="10000+">$10,000+ (Financial freedom)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timeCommitment" className="text-base font-medium">
                  Time Commitment (hours per week)
                </Label>
                <Select
                  value={formData.goals.timeCommitment}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      goals: { ...prev.goals, timeCommitment: value },
                    }))
                  }
                >
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue placeholder="How much time can you dedicate?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5-10">5-10 hours (Part-time evenings)</SelectItem>
                    <SelectItem value="10-20">10-20 hours (Serious commitment)</SelectItem>
                    <SelectItem value="20-40">20-40 hours (Full-time focus)</SelectItem>
                    <SelectItem value="40+">40+ hours (All-in entrepreneur)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="experience" className="text-base font-medium">
                  MLM/Network Marketing Experience
                </Label>
                <Select
                  value={formData.goals.experience}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      goals: { ...prev.goals, experience: value },
                    }))
                  }
                >
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue placeholder="Your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Complete beginner (Never done MLM)</SelectItem>
                    <SelectItem value="some">Some experience (Tried before)</SelectItem>
                    <SelectItem value="experienced">Experienced (Multiple companies)</SelectItem>
                    <SelectItem value="expert">Expert/Leader (Top performer)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="motivation" className="text-base font-medium">
                  What motivates you most? (Your "Why")
                </Label>
                <Textarea
                  id="motivation"
                  value={formData.goals.motivation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      goals: { ...prev.goals, motivation: e.target.value },
                    }))
                  }
                  placeholder="Tell us about your motivation... (e.g., financial freedom, family security, debt freedom, dream lifestyle)"
                  rows={4}
                  className="mt-2 resize-none"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <BookOpen className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Preferences & Training</h2>
              <p className="text-gray-600">Customize your learning and communication experience</p>
            </div>
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Preferred Communication Method</Label>
                <Select
                  value={formData.preferences.communicationMethod}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferences: { ...prev.preferences, communicationMethod: value },
                    }))
                  }
                >
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue placeholder="How do you prefer to communicate?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email (Best for detailed information)</SelectItem>
                    <SelectItem value="phone">Phone calls (Direct communication)</SelectItem>
                    <SelectItem value="text">Text messages (Quick updates)</SelectItem>
                    <SelectItem value="video">Video calls (Face-to-face meetings)</SelectItem>
                    <SelectItem value="app">In-app messaging (Real-time chat)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-base font-medium">Training Schedule Preference</Label>
                <Select
                  value={formData.preferences.trainingSchedule}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferences: { ...prev.preferences, trainingSchedule: value },
                    }))
                  }
                >
                  <SelectTrigger className="mt-2 h-12">
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
                <Label className="text-base font-medium mb-3 block">Marketing Interests (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div key={interest} className="flex items-center space-x-3">
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
                      <Label htmlFor={interest} className="text-sm leading-tight cursor-pointer">
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
          <div className="text-center space-y-8">
            <div className="mx-auto w-32 h-32 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <Gift className="h-16 w-16 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-4">Congratulations! 🎉</h2>
              <p className="text-xl text-gray-600 mb-8">
                Your MLM account is now set up and ready to go. You're about to embark on an exciting journey toward
                financial freedom!
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-8">
              <h3 className="font-bold text-2xl mb-6">Your Next Steps:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {[
                  {
                    step: 1,
                    title: "Complete Training",
                    desc: "Start with our beginner course (45 min)",
                    icon: <BookOpen className="h-5 w-5" />,
                  },
                  {
                    step: 2,
                    title: "Set Up Profile",
                    desc: "Customize your marketing materials (10 min)",
                    icon: <User className="h-5 w-5" />,
                  },
                  {
                    step: 3,
                    title: "Connect with Sponsor",
                    desc: "Schedule your first mentoring call (15 min)",
                    icon: <Users className="h-5 w-5" />,
                  },
                  {
                    step: 4,
                    title: "Start Earning",
                    desc: "Make your first referral (30 min)",
                    icon: <DollarSign className="h-5 w-5" />,
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <div className="font-semibold text-lg flex items-center gap-2">
                        {item.icon}
                        {item.title}
                      </div>
                      <div className="text-gray-600">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center gap-3 justify-center mb-2">
                <Gift className="h-6 w-6 text-yellow-600" />
                <div className="font-semibold text-yellow-800 text-lg">Welcome Bonus Unlocked!</div>
              </div>
              <div className="text-yellow-600">
                You've earned a <strong>$50 bonus credit</strong> for completing onboarding!
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">MLM Setup Wizard</h1>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-3 mb-6" />

          {/* Step Indicators */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-4 overflow-x-auto pb-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    index === currentStep
                      ? "bg-purple-100 text-purple-700 scale-105"
                      : index < currentStep
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : index === currentStep ? (
                    step.icon
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                  <span className="font-medium whitespace-nowrap">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl">
              {steps[currentStep].icon}
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription className="text-lg">{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-3 text-lg bg-transparent"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Previous
          </Button>
          <div className="flex gap-3">
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} className="px-6 py-3 text-lg">
                Next Step
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 text-lg"
              >
                {isLoading ? "Setting up..." : "Complete Setup & Start Earning!"}
                <Star className="h-5 w-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
