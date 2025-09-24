"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { findAttorneyById, type Attorney } from "@/lib/attorney-network"
import { ArrowLeft, Clock, CreditCard, Phone, Mail, CheckCircle, Star, MapPin } from "lucide-react"

interface ConsultationType {
  id: string
  name: string
  duration: number
  price: number
  description: string
}

const consultationTypes: ConsultationType[] = [
  {
    id: "initial",
    name: "Initial Consultation",
    duration: 30,
    price: 75,
    description: "Free case evaluation and strategy discussion",
  },
  {
    id: "case-review",
    name: "Comprehensive Case Review",
    duration: 60,
    price: 350,
    description: "Detailed analysis of your credit reports and legal options",
  },
  {
    id: "strategy",
    name: "Legal Strategy Session",
    duration: 90,
    price: 525,
    description: "In-depth strategy planning and action plan development",
  },
]

export default function BookConsultationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [attorney, setAttorney] = useState<Attorney | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form data
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationType | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [clientInfo, setClientInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    caseDescription: "",
    urgency: "medium",
    preferredContact: "email",
    agreedToTerms: false,
  })

  useEffect(() => {
    const attorneyId = params.attorneyId as string
    const foundAttorney = findAttorneyById(attorneyId)
    setAttorney(foundAttorney || null)
    setLoading(false)
  }, [params.attorneyId])

  const handleConsultationSelect = (consultation: ConsultationType) => {
    setSelectedConsultation(consultation)
    setCurrentStep(2)
  }

  const handleClientInfoSubmit = () => {
    if (!clientInfo.firstName || !clientInfo.lastName || !clientInfo.email || !clientInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }
    setCurrentStep(3)
  }

  const handleBookingSubmit = async () => {
    if (!selectedConsultation || !selectedDate || !selectedTime || !clientInfo.agreedToTerms) {
      toast({
        title: "Incomplete Booking",
        description: "Please complete all steps and agree to terms.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Consultation Booked!",
        description: "You'll receive a confirmation email shortly.",
      })

      // Redirect to success page
      router.push(`/dashboard/attorneys/${attorney?.id}/book/success`)
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        slots.push(time)
      }
    }
    return slots
  }

  const generateDateOptions = () => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split("T")[0])
    }
    return dates
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!attorney) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Attorney Not Found</h3>
            <p className="text-gray-600 mb-4">The attorney you're trying to book with doesn't exist.</p>
            <Button onClick={() => router.push("/dashboard/attorneys")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Attorneys
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="outline" onClick={() => router.push(`/dashboard/attorneys/${attorney.id}`)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${step < currentStep ? "bg-blue-600" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Select Consultation Type */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Consultation Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {consultationTypes.map((consultation) => (
                    <div
                      key={consultation.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedConsultation?.id === consultation.id ? "border-blue-600 bg-blue-50" : "border-gray-200"
                      }`}
                      onClick={() => handleConsultationSelect(consultation)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{consultation.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {consultation.duration} min
                          </Badge>
                          <Badge className="bg-green-100 text-green-800">${consultation.price}</Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{consultation.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Client Information */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={clientInfo.firstName}
                        onChange={(e) => setClientInfo({ ...clientInfo, firstName: e.target.value })}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={clientInfo.lastName}
                        onChange={(e) => setClientInfo({ ...clientInfo, lastName: e.target.value })}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={clientInfo.email}
                        onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={clientInfo.phone}
                        onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="caseDescription">Case Description</Label>
                    <Textarea
                      id="caseDescription"
                      value={clientInfo.caseDescription}
                      onChange={(e) => setClientInfo({ ...clientInfo, caseDescription: e.target.value })}
                      placeholder="Briefly describe your credit repair needs..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Case Urgency</Label>
                    <RadioGroup
                      value={clientInfo.urgency}
                      onValueChange={(value) => setClientInfo({ ...clientInfo, urgency: value })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="low" id="low" />
                        <Label htmlFor="low">Low - No rush</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium">Medium - Within a few weeks</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="high" />
                        <Label htmlFor="high">High - Urgent, ASAP</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Preferred Contact Method</Label>
                    <Select
                      value={clientInfo.preferredContact}
                      onValueChange={(value) => setClientInfo({ ...clientInfo, preferredContact: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="text">Text Message</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Back
                    </Button>
                    <Button onClick={handleClientInfoSubmit}>Continue</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Schedule & Confirm */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Schedule & Confirm</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Select Date</Label>
                      <Select value={selectedDate} onValueChange={setSelectedDate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a date" />
                        </SelectTrigger>
                        <SelectContent>
                          {generateDateOptions().map((date) => (
                            <SelectItem key={date} value={date}>
                              {new Date(date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="time">Select Time</Label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a time" />
                        </SelectTrigger>
                        <SelectContent>
                          {generateTimeSlots().map((time) => (
                            <SelectItem key={time} value={time}>
                              {time} ({attorney.location.timezone})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold">Booking Summary</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>Consultation Type:</span>
                        <span className="font-medium">{selectedConsultation?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{selectedConsultation?.duration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date & Time:</span>
                        <span>
                          {selectedDate && selectedTime
                            ? `${new Date(selectedDate).toLocaleDateString()} at ${selectedTime}`
                            : "Not selected"}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total Cost:</span>
                        <span>${selectedConsultation?.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={clientInfo.agreedToTerms}
                      onCheckedChange={(checked) => setClientInfo({ ...clientInfo, agreedToTerms: checked as boolean })}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </a>
                    </Label>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Back
                    </Button>
                    <Button
                      onClick={handleBookingSubmit}
                      disabled={submitting || !clientInfo.agreedToTerms}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Booking...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Confirm & Pay ${selectedConsultation?.price}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Attorney Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Attorney</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={attorney.profileImage || "/placeholder.svg"}
                      alt={attorney.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{attorney.name}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span>
                          {attorney.rating} ({attorney.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>
                        {attorney.location.city}, {attorney.location.state}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{attorney.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{attorney.email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What to Expect */}
              <Card>
                <CardHeader>
                  <CardTitle>What to Expect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Confidential consultation</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Case evaluation and strategy</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Next steps discussion</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>No obligation to proceed</span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-gray-600 mb-3">Having trouble booking? Our support team is here to help.</p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
