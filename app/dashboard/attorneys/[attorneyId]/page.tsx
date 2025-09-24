"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { attorneyNetwork, type Attorney } from "@/lib/attorney-network"
import {
  Star,
  MapPin,
  Clock,
  Scale,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Award,
  MessageSquare,
  ArrowLeft,
  Shield,
  BookOpen,
  Users,
  TrendingUp,
} from "lucide-react"

export default function AttorneyProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [attorney, setAttorney] = useState<Attorney | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const attorneyId = params.attorneyId as string
    const foundAttorney = attorneyNetwork.find((a) => a.id === attorneyId)
    setAttorney(foundAttorney || null)
    setLoading(false)
  }, [params.attorneyId])

  const handleBookConsultation = () => {
    if (!attorney) return

    // Navigate to booking page with attorney pre-selected
    router.push(`/dashboard/attorneys/${attorney.id}/book`)
  }

  const handleSendMessage = () => {
    if (!attorney) return

    // Navigate to messaging interface
    router.push(`/dashboard/attorneys/${attorney.id}/message`)
  }

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "busy":
        return "bg-yellow-100 text-yellow-800"
      case "offline":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "elite":
        return "bg-purple-100 text-purple-800"
      case "premium":
        return "bg-blue-100 text-blue-800"
      case "standard":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
            <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Attorney Not Found</h3>
            <p className="text-gray-600 mb-4">The attorney you're looking for doesn't exist or has been removed.</p>
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
        <Button variant="outline" onClick={() => router.push("/dashboard/attorneys")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Attorneys
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Attorney Profile */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6 mb-6">
                  <img
                    src={attorney.profileImage || "/placeholder.svg"}
                    alt={attorney.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h1 className="text-3xl font-bold text-gray-900">{attorney.name}</h1>
                      <div className="flex items-center space-x-2">
                        <Badge className={getAvailabilityColor(attorney.availability.status)}>
                          {attorney.availability.status}
                        </Badge>
                        <Badge className={getTierColor(attorney.premiumTier)}>{attorney.premiumTier}</Badge>
                        {attorney.verified && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className="font-semibold">{attorney.rating}</span>
                        <span className="ml-1">({attorney.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center">
                        <Scale className="h-5 w-5 mr-2" />
                        <span>{attorney.experience} years experience</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        <span>
                          {attorney.location.city}, {attorney.location.state}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-6">{attorney.bio}</p>

                    <div className="flex items-center space-x-4">
                      <Button onClick={handleBookConsultation} className="bg-blue-600 hover:bg-blue-700">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Consultation (${attorney.consultationFee})
                      </Button>
                      <Button variant="outline" onClick={handleSendMessage}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Information Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Specializations</h4>
                      <div className="flex flex-wrap gap-2">
                        {attorney.specializations.map((spec, index) => (
                          <Badge key={index} variant="outline">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Case Types</h4>
                      <div className="flex flex-wrap gap-2">
                        {attorney.caseTypes.map((type, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Credentials & Certifications</h4>
                      <div className="space-y-2">
                        {attorney.credentials.map((cred, index) => (
                          <div key={index} className="flex items-center">
                            <Award className="h-4 w-4 text-blue-600 mr-2" />
                            <span>{cred}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Languages</h4>
                      <p className="text-gray-600">{attorney.languages.join(", ")}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Bar Information</h4>
                      <p className="text-gray-600">
                        Licensed in {attorney.state} (Bar #: {attorney.barNumber})
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experience">
                <Card>
                  <CardHeader>
                    <CardTitle>Experience & Track Record</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-green-600">{attorney.successRate}%</div>
                          <div className="text-sm text-green-700">Success Rate</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-blue-600">
                            {attorney.casesHandled.toLocaleString()}
                          </div>
                          <div className="text-sm text-blue-700">Cases Handled</div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <Scale className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-purple-600">{attorney.experience}</div>
                          <div className="text-sm text-purple-700">Years Experience</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                          <div className="text-lg font-bold text-orange-600">{attorney.responseTime}</div>
                          <div className="text-sm text-orange-700">Response Time</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Mock reviews */}
                      {[
                        {
                          id: 1,
                          client: "John D.",
                          rating: 5,
                          date: "2024-01-15",
                          review:
                            "Excellent attorney! Sarah helped me remove 3 incorrect items from my credit report. Her knowledge of FCRA law is outstanding and she kept me informed throughout the entire process.",
                        },
                        {
                          id: 2,
                          client: "Maria S.",
                          rating: 5,
                          date: "2024-01-10",
                          review:
                            "Professional, knowledgeable, and responsive. Got results faster than I expected. Highly recommend for anyone dealing with credit report issues.",
                        },
                        {
                          id: 3,
                          client: "Robert K.",
                          rating: 4,
                          date: "2024-01-05",
                          review:
                            "Great experience working with Sarah. She explained everything clearly and helped me understand my rights under the FCRA. Very satisfied with the outcome.",
                        },
                      ].map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{review.client}</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= review.rating ? "text-yellow-500" : "text-gray-300"}`}
                                    fill={star <= review.rating ? "#EAB308" : "none"}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <p className="text-gray-700">{review.review}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="availability">
                <Card>
                  <CardHeader>
                    <CardTitle>Availability & Scheduling</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-semibold">Current Status</h4>
                          <p className="text-sm text-gray-600">
                            {attorney.availability.status === "available"
                              ? "Available for new consultations"
                              : attorney.availability.status === "busy"
                                ? "Currently busy with existing cases"
                                : "Currently offline"}
                          </p>
                        </div>
                        <Badge className={getAvailabilityColor(attorney.availability.status)}>
                          {attorney.availability.status}
                        </Badge>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Next Available</h4>
                        <p className="text-blue-700">
                          {attorney.availability.nextAvailable.toLocaleDateString()} at{" "}
                          {attorney.availability.nextAvailable.toLocaleTimeString()} ({attorney.availability.timezone})
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Consultation Types</h4>
                          <ul className="space-y-2 text-sm">
                            <li>• Initial Consultation (30 min) - ${attorney.consultationFee}</li>
                            <li>• Case Review (60 min) - ${attorney.hourlyRate}</li>
                            <li>• Strategy Session (90 min) - ${Math.round(attorney.hourlyRate * 1.5)}</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Response Times</h4>
                          <ul className="space-y-2 text-sm">
                            <li>• Email: {attorney.responseTime}</li>
                            <li>• Phone: Within 4 hours</li>
                            <li>• Emergency: Within 1 hour</li>
                          </ul>
                        </div>
                      </div>

                      <Button onClick={handleBookConsultation} className="w-full bg-blue-600 hover:bg-blue-700">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Consultation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Quick Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span>{attorney.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">{attorney.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">
                      {attorney.location.city}, {attorney.location.state} {attorney.location.zipCode}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Hourly Rate:</span>
                    <span className="font-semibold">${attorney.hourlyRate}/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consultation:</span>
                    <span className="font-semibold">${attorney.consultationFee}</span>
                  </div>
                  <Separator />
                  <div className="text-sm text-gray-600">
                    <p>• Free initial case evaluation</p>
                    <p>• Flexible payment plans available</p>
                    <p>• No hidden fees</p>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle>Trust & Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Licensed & Verified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Background Checked</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Professional Insurance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Continuing Education</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
