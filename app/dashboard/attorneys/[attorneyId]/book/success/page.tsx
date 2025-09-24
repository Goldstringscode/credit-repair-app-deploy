"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { findAttorneyById, type Attorney } from "@/lib/attorney-network"
import { CheckCircle, Calendar, Clock, Phone, Mail, MessageSquare, Download, Home } from "lucide-react"

export default function BookingSuccessPage() {
  const params = useParams()
  const router = useRouter()
  const [attorney, setAttorney] = useState<Attorney | null>(null)
  const [bookingDetails, setBookingDetails] = useState({
    consultationType: "Initial Consultation",
    date: "January 25, 2024",
    time: "2:00 PM PST",
    duration: "30 minutes",
    cost: 75,
    confirmationNumber: "CONS-2024-001",
    meetingLink: "https://meet.example.com/consultation-001",
  })

  useEffect(() => {
    const attorneyId = params.attorneyId as string
    const foundAttorney = findAttorneyById(attorneyId)
    setAttorney(foundAttorney || null)
  }, [params.attorneyId])

  const handleDownloadConfirmation = () => {
    // In a real app, this would generate and download a PDF confirmation
    const confirmationData = {
      attorney: attorney?.name,
      ...bookingDetails,
    }

    const blob = new Blob([JSON.stringify(confirmationData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `consultation-confirmation-${bookingDetails.confirmationNumber}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!attorney) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Consultation Booked!</h1>
            <p className="text-gray-600">Your consultation with {attorney.name} has been successfully scheduled.</p>
          </div>

          {/* Booking Confirmation */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Booking Confirmation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Confirmation Number</span>
                </div>
                <p className="text-green-700 font-mono text-lg">{bookingDetails.confirmationNumber}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Attorney</h4>
                  <div className="flex items-center space-x-3">
                    <img
                      src={attorney.profileImage || "/placeholder.svg"}
                      alt={attorney.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{attorney.name}</p>
                      <p className="text-sm text-gray-600">{attorney.specializations[0]}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Consultation Type</h4>
                  <Badge variant="outline" className="text-sm">
                    {bookingDetails.consultationType}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-sm text-gray-600">
                      {bookingDetails.date} at {bookingDetails.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-sm text-gray-600">{bookingDetails.duration}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Meeting Details</h4>
                <p className="text-blue-700 text-sm mb-2">
                  You'll receive a video call link 15 minutes before your consultation.
                </p>
                <p className="text-blue-700 text-sm font-mono break-all">{bookingDetails.meetingLink}</p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-semibold">Total Cost:</span>
                <span className="text-xl font-bold text-green-600">${bookingDetails.cost}</span>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Confirmation Email</h4>
                    <p className="text-sm text-gray-600">
                      You'll receive a detailed confirmation email with all the meeting information.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Prepare for Your Consultation</h4>
                    <p className="text-sm text-gray-600">
                      Gather your credit reports, identification, and any relevant documents.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Join the Meeting</h4>
                    <p className="text-sm text-gray-600">
                      Click the meeting link 5 minutes before your scheduled time.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Attorney Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span>{attorney.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span>{attorney.email}</span>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  If you need to reschedule or have any questions, please contact the attorney directly or use our
                  messaging system.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleDownloadConfirmation} variant="outline" className="flex-1 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Download Confirmation
            </Button>
            <Button
              onClick={() => router.push(`/dashboard/attorneys/${attorney.id}/message`)}
              variant="outline"
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message Attorney
            </Button>
            <Button onClick={() => router.push("/dashboard")} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Additional Information */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Important Reminders</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Please join the meeting on time to make the most of your consultation</li>
              <li>• Have your credit reports and relevant documents ready</li>
              <li>• Prepare a list of questions you'd like to discuss</li>
              <li>• If you need to cancel, please do so at least 24 hours in advance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
