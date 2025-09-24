"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Gavel,
  User,
  FileText,
  Clock,
  Star,
  Shield,
  AlertCircle,
  CheckCircle,
  Calendar,
  Upload,
  Eye,
  MessageSquare,
  Scale,
  Award,
  DollarSign,
} from "lucide-react"

export default function AttorneyReviewPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [reviewData, setReviewData] = useState({
    caseType: "",
    urgency: "standard",
    documents: [],
    caseDescription: "",
    legalQuestions: "",
    desiredOutcome: "",
    budget: "",
    preferredAttorney: "",
    consultationType: "document-review",
    scheduledDate: "",
    scheduledTime: "",
  })

  const [attorneys, setAttorneys] = useState([
    {
      id: "atty_001",
      name: "Sarah Mitchell, Esq.",
      specialization: "Consumer Credit Law",
      barNumber: "CA-123456",
      experience: "12 years",
      rating: 4.9,
      reviews: 247,
      hourlyRate: 350,
      availability: "Available Today",
      bio: "Specializes in FCRA violations and consumer credit disputes. Former prosecutor with extensive litigation experience.",
      credentials: ["J.D. Stanford Law", "NACA Certified", "Super Lawyers 2020-2024"],
      successRate: "94%",
      casesWon: 1247,
      languages: ["English", "Spanish"],
      avatar: "/placeholder.svg?height=80&width=80&text=SM",
    },
    {
      id: "atty_002",
      name: "Michael Rodriguez, Esq.",
      specialization: "Credit Repair & Identity Theft",
      barNumber: "TX-789012",
      experience: "8 years",
      rating: 4.8,
      reviews: 189,
      hourlyRate: 275,
      availability: "Available Tomorrow",
      bio: "Expert in identity theft cases and complex credit disputes. Published author on consumer protection law.",
      credentials: ["J.D. UT Law", "FCRA Specialist", "ABA Consumer Law Section"],
      successRate: "91%",
      casesWon: 892,
      languages: ["English", "Spanish", "Portuguese"],
      avatar: "/placeholder.svg?height=80&width=80&text=MR",
    },
    {
      id: "atty_003",
      name: "Jennifer Chen, Esq.",
      specialization: "Financial Services Litigation",
      barNumber: "NY-345678",
      experience: "15 years",
      rating: 4.9,
      reviews: 312,
      hourlyRate: 425,
      availability: "Available This Week",
      bio: "Former BigLaw attorney specializing in class action suits against credit bureaus and financial institutions.",
      credentials: ["J.D. Harvard Law", "NCLC Member", "Martindale-Hubbell AV Rated"],
      successRate: "96%",
      casesWon: 1856,
      languages: ["English", "Mandarin"],
      avatar: "/placeholder.svg?height=80&width=80&text=JC",
    },
  ])

  const serviceTypes = [
    {
      id: "document-review",
      name: "Document Review",
      description: "Attorney reviews your dispute letters and legal documents",
      price: 149,
      duration: "2-3 business days",
      includes: ["Legal accuracy review", "FCRA compliance check", "Recommendations", "Written report"],
    },
    {
      id: "case-consultation",
      name: "Case Consultation",
      description: "30-minute consultation to discuss your credit repair strategy",
      price: 199,
      duration: "30 minutes",
      includes: ["Strategy discussion", "Legal advice", "Next steps plan", "Follow-up email summary"],
    },
    {
      id: "full-representation",
      name: "Full Legal Representation",
      description: "Attorney handles your entire case from start to finish",
      price: 2500,
      duration: "3-6 months",
      includes: ["Complete case management", "All legal filings", "Court representation", "Settlement negotiation"],
    },
    {
      id: "litigation-prep",
      name: "Litigation Preparation",
      description: "Prepare for potential lawsuit against credit bureaus",
      price: 750,
      duration: "1-2 weeks",
      includes: ["Case strength analysis", "Evidence review", "Legal strategy", "Court filing preparation"],
    },
  ]

  const progressPercentage = (currentStep / 4) * 100

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    setReviewData({
      ...reviewData,
      documents: [
        ...reviewData.documents,
        ...files.map((file) => ({ name: file.name, size: file.size, type: file.type })),
      ],
    })
  }

  const submitForReview = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLoading(false)
    setCurrentStep(4)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gavel className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Attorney Review Services</h1>
                <p className="text-gray-600 mt-1">Professional legal review and consultation services</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800">Premium Service</Badge>
              <Badge className="bg-green-100 text-green-800">Step {currentStep} of 4</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Service Overview */}
        <Card className="mb-8 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-6">
              {serviceTypes.map((service) => (
                <div key={service.id} className="text-center">
                  <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Scale className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                  <Badge className="bg-green-100 text-green-800">${service.price}</Badge>
                </div>
              ))}
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
              <span className={currentStep >= 1 ? "text-blue-600 font-medium" : ""}>Service Selection</span>
              <span className={currentStep >= 2 ? "text-blue-600 font-medium" : ""}>Attorney Selection</span>
              <span className={currentStep >= 3 ? "text-blue-600 font-medium" : ""}>Case Details</span>
              <span className={currentStep >= 4 ? "text-blue-600 font-medium" : ""}>Review & Payment</span>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Service Selection */}
        {currentStep === 1 && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span>Select Legal Service</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={reviewData.consultationType}
                    onValueChange={(value) => setReviewData({ ...reviewData, consultationType: value })}
                  >
                    {serviceTypes.map((service) => (
                      <div key={service.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={service.id} id={service.id} />
                          <Label htmlFor={service.id} className="flex-1 cursor-pointer">
                            <div className="p-4 border rounded-lg hover:bg-gray-50">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{service.name}</h4>
                                <Badge className="bg-blue-100 text-blue-800">${service.price}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{service.duration}</span>
                                </span>
                              </div>
                              <div className="mt-3">
                                <p className="text-xs font-medium text-gray-700 mb-1">Includes:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {service.includes.map((item, index) => (
                                    <li key={index} className="flex items-center space-x-1">
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label>Case Urgency</Label>
                      <RadioGroup
                        value={reviewData.urgency}
                        onValueChange={(value) => setReviewData({ ...reviewData, urgency: value })}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="standard" id="standard" />
                          <Label htmlFor="standard">Standard (3-5 business days) - No extra charge</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="expedited" id="expedited" />
                          <Label htmlFor="expedited">Expedited (1-2 business days) - +$99</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="emergency" id="emergency" />
                          <Label htmlFor="emergency">Emergency (Same day) - +$299</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!reviewData.consultationType}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Continue to Attorney Selection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Why Choose Attorney Review?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-green-700 space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">Legal Expertise</h4>
                      <p className="text-xs text-green-600">
                        Licensed attorneys with specialized knowledge in consumer credit law and FCRA regulations.
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">Higher Success Rates</h4>
                      <p className="text-xs text-green-600">
                        Attorney-reviewed cases have 94% higher success rates compared to self-prepared disputes.
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">Legal Protection</h4>
                      <p className="text-xs text-green-600">
                        Attorney-client privilege protects your communications and establishes legal foundation.
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">Litigation Ready</h4>
                      <p className="text-xs text-green-600">
                        Prepares your case for potential FCRA lawsuit with proper documentation and legal strategy.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-3 gap-4 font-semibold border-b pb-2">
                      <span>Feature</span>
                      <span>DIY</span>
                      <span>Attorney Review</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <span>Success Rate</span>
                      <span className="text-red-600">67%</span>
                      <span className="text-green-600">94%</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <span>Legal Protection</span>
                      <span className="text-red-600">None</span>
                      <span className="text-green-600">Full</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <span>FCRA Compliance</span>
                      <span className="text-yellow-600">Basic</span>
                      <span className="text-green-600">Expert</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <span>Litigation Support</span>
                      <span className="text-red-600">No</span>
                      <span className="text-green-600">Yes</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <span>Average Time</span>
                      <span className="text-yellow-600">45 days</span>
                      <span className="text-green-600">21 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Attorney Selection */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Select Your Attorney</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-1 gap-6">
                  {attorneys.map((attorney) => (
                    <div key={attorney.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={attorney.id}
                          id={attorney.id}
                          checked={reviewData.preferredAttorney === attorney.id}
                          onClick={() => setReviewData({ ...reviewData, preferredAttorney: attorney.id })}
                        />
                        <Label htmlFor={attorney.id} className="flex-1 cursor-pointer">
                          <div className="p-6 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-start space-x-4">
                              <img
                                src={attorney.avatar || "/placeholder.svg"}
                                alt={attorney.name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold text-lg">{attorney.name}</h4>
                                    <p className="text-blue-600 font-medium">{attorney.specialization}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="flex items-center space-x-1 mb-1">
                                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                      <span className="font-semibold">{attorney.rating}</span>
                                      <span className="text-gray-500">({attorney.reviews} reviews)</span>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">{attorney.availability}</Badge>
                                  </div>
                                </div>

                                <p className="text-gray-600 mb-4">{attorney.bio}</p>

                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-sm">
                                      <Scale className="h-4 w-4 text-gray-400" />
                                      <span>Bar Number: {attorney.barNumber}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                      <Clock className="h-4 w-4 text-gray-400" />
                                      <span>{attorney.experience} experience</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                      <DollarSign className="h-4 w-4 text-gray-400" />
                                      <span>${attorney.hourlyRate}/hour</span>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-sm">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      <span>Success Rate: {attorney.successRate}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                      <Award className="h-4 w-4 text-blue-500" />
                                      <span>{attorney.casesWon} cases won</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                      <MessageSquare className="h-4 w-4 text-gray-400" />
                                      <span>Languages: {attorney.languages.join(", ")}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <h5 className="font-medium text-gray-900">Credentials & Certifications</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {attorney.credentials.map((credential, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {credential}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={!reviewData.preferredAttorney}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Continue to Case Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Case Details */}
        {currentStep === 3 && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Case Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="caseType">Case Type *</Label>
                    <Select
                      value={reviewData.caseType}
                      onValueChange={(value) => setReviewData({ ...reviewData, caseType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select case type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit-dispute">Credit Report Dispute</SelectItem>
                        <SelectItem value="identity-theft">Identity Theft</SelectItem>
                        <SelectItem value="fcra-violation">FCRA Violation</SelectItem>
                        <SelectItem value="debt-validation">Debt Validation</SelectItem>
                        <SelectItem value="collection-harassment">Collection Harassment</SelectItem>
                        <SelectItem value="bankruptcy">Bankruptcy Issues</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caseDescription">Case Description *</Label>
                    <Textarea
                      id="caseDescription"
                      value={reviewData.caseDescription}
                      onChange={(e) => setReviewData({ ...reviewData, caseDescription: e.target.value })}
                      placeholder="Provide detailed description of your case, including timeline, parties involved, and current status..."
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalQuestions">Specific Legal Questions</Label>
                    <Textarea
                      id="legalQuestions"
                      value={reviewData.legalQuestions}
                      onChange={(e) => setReviewData({ ...reviewData, legalQuestions: e.target.value })}
                      placeholder="What specific legal questions do you have? What legal advice are you seeking?"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desiredOutcome">Desired Outcome</Label>
                    <Textarea
                      id="desiredOutcome"
                      value={reviewData.desiredOutcome}
                      onChange={(e) => setReviewData({ ...reviewData, desiredOutcome: e.target.value })}
                      placeholder="What outcome are you hoping to achieve? What would success look like for your case?"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Range</Label>
                    <Select
                      value={reviewData.budget}
                      onValueChange={(value) => setReviewData({ ...reviewData, budget: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-500">Under $500</SelectItem>
                        <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                        <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                        <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                        <SelectItem value="over-5000">Over $5,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-5 w-5 text-blue-600" />
                    <span>Document Upload</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload relevant documents (credit reports, correspondence, etc.)
                      </p>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                      />
                      <Label htmlFor="file-upload">
                        <Button variant="outline" className="cursor-pointer bg-transparent">
                          Choose Files
                        </Button>
                      </Label>
                    </div>

                    {reviewData.documents.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Uploaded Documents:</h4>
                        {reviewData.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{doc.name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {(doc.size / 1024 / 1024).toFixed(2)} MB
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Selected Attorney</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviewData.preferredAttorney && (
                    <div className="space-y-4">
                      {(() => {
                        const attorney = attorneys.find((a) => a.id === reviewData.preferredAttorney)
                        return attorney ? (
                          <div className="flex items-start space-x-4">
                            <img
                              src={attorney.avatar || "/placeholder.svg"}
                              alt={attorney.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <h4 className="font-semibold">{attorney.name}</h4>
                              <p className="text-blue-600 text-sm">{attorney.specialization}</p>
                              <div className="flex items-center space-x-1 mt-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-sm">{attorney.rating}</span>
                                <span className="text-gray-500 text-sm">({attorney.reviews} reviews)</span>
                              </div>
                            </div>
                          </div>
                        ) : null
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {(() => {
                      const service = serviceTypes.find((s) => s.id === reviewData.consultationType)
                      return service ? (
                        <>
                          <div className="flex justify-between">
                            <span>{service.name}:</span>
                            <span className="font-semibold">${service.price}</span>
                          </div>
                          {reviewData.urgency === "expedited" && (
                            <div className="flex justify-between">
                              <span>Expedited Service:</span>
                              <span className="font-semibold">$99</span>
                            </div>
                          )}
                          {reviewData.urgency === "emergency" && (
                            <div className="flex justify-between">
                              <span>Emergency Service:</span>
                              <span className="font-semibold">$299</span>
                            </div>
                          )}
                          <hr />
                          <div className="flex justify-between font-bold text-blue-600">
                            <span>Total:</span>
                            <span>
                              $
                              {service.price +
                                (reviewData.urgency === "expedited" ? 99 : 0) +
                                (reviewData.urgency === "emergency" ? 299 : 0)}
                            </span>
                          </div>
                        </>
                      ) : null
                    })()}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800 flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Important Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-yellow-700 space-y-2">
                  <p>• Attorney-client privilege applies to all communications</p>
                  <p>• Review will be completed within specified timeframe</p>
                  <p>• Additional consultation time can be purchased separately</p>
                  <p>• All documents are securely stored and encrypted</p>
                  <p>• Refund available if unsatisfied with service quality</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Navigation */}
        {currentStep === 3 && (
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              Back
            </Button>
            <Button
              onClick={submitForReview}
              disabled={!reviewData.caseType || !reviewData.caseDescription || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Submitting for Review...
                </>
              ) : (
                <>
                  <Gavel className="h-4 w-4 mr-2" />
                  Submit for Attorney Review
                </>
              )}
            </Button>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <div className="text-center space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-8">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-800 mb-2">Review Submitted Successfully!</h2>
                <p className="text-green-700 mb-6">
                  Your case has been submitted for attorney review. You will receive a detailed legal analysis within
                  the specified timeframe.
                </p>

                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-800">What Happens Next:</h4>
                    <ul className="text-sm text-green-700 space-y-2">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Attorney receives your case within 1 hour</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Detailed legal review begins immediately</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>You'll receive email updates on progress</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Complete legal analysis delivered on time</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-800">Your Review Includes:</h4>
                    <ul className="text-sm text-green-700 space-y-2">
                      <li className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Comprehensive legal analysis report</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>FCRA compliance assessment</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Strategic recommendations</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Next steps action plan</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-center space-x-4 mt-8">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Eye className="h-4 w-4 mr-2" />
                    View Case Status
                  </Button>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Follow-up
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
