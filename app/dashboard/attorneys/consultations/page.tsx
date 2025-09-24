"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  Clock,
  Video,
  Phone,
  FileText,
  Star,
  MapPin,
  Search,
  Filter,
  Download,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface Consultation {
  id: string
  attorneyId: string
  attorneyName: string
  attorneyImage: string
  attorneyRating: number
  consultationType: string
  date: string
  time: string
  duration: number
  status: "upcoming" | "completed" | "cancelled" | "rescheduled"
  meetingType: "video" | "phone" | "in-person"
  meetingLink?: string
  cost: number
  notes?: string
  documents?: string[]
  canReschedule: boolean
  canCancel: boolean
}

// Mock data
const mockConsultations: Consultation[] = [
  {
    id: "1",
    attorneyId: "sarah-johnson",
    attorneyName: "Sarah Johnson",
    attorneyImage: "/placeholder.svg?height=100&width=100&text=SJ",
    attorneyRating: 4.9,
    consultationType: "Initial Consultation",
    date: "2024-01-25",
    time: "14:00",
    duration: 30,
    status: "upcoming",
    meetingType: "video",
    meetingLink: "https://meet.example.com/consultation-1",
    cost: 75,
    canReschedule: true,
    canCancel: true,
  },
  {
    id: "2",
    attorneyId: "michael-chen",
    attorneyName: "Michael Chen",
    attorneyImage: "/placeholder.svg?height=100&width=100&text=MC",
    attorneyRating: 4.8,
    consultationType: "Case Review",
    date: "2024-01-20",
    time: "10:00",
    duration: 60,
    status: "completed",
    meetingType: "video",
    cost: 350,
    notes: "Discussed FCRA violations and next steps for dispute process.",
    documents: ["case-summary.pdf", "dispute-strategy.pdf"],
    canReschedule: false,
    canCancel: false,
  },
  {
    id: "3",
    attorneyId: "jennifer-martinez",
    attorneyName: "Jennifer Martinez",
    attorneyImage: "/placeholder.svg?height=100&width=100&text=JM",
    attorneyRating: 4.9,
    consultationType: "Strategy Session",
    date: "2024-01-15",
    time: "16:00",
    duration: 90,
    status: "cancelled",
    meetingType: "phone",
    cost: 525,
    canReschedule: false,
    canCancel: false,
  },
]

export default function ConsultationsPage() {
  const { toast } = useToast()
  const [consultations, setConsultations] = useState<Consultation[]>(mockConsultations)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("upcoming")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "rescheduled":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      case "rescheduled":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "phone":
        return <Phone className="h-4 w-4" />
      case "in-person":
        return <MapPin className="h-4 w-4" />
      default:
        return <Video className="h-4 w-4" />
    }
  }

  const filteredConsultations = consultations.filter((consultation) => {
    const matchesSearch =
      consultation.attorneyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.consultationType.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTab = activeTab === "all" || consultation.status === activeTab

    return matchesSearch && matchesTab
  })

  const handleJoinMeeting = (consultation: Consultation) => {
    if (consultation.meetingLink) {
      window.open(consultation.meetingLink, "_blank")
    } else {
      toast({
        title: "Meeting Link Not Available",
        description: "Please contact the attorney directly.",
        variant: "destructive",
      })
    }
  }

  const handleReschedule = (consultationId: string) => {
    toast({
      title: "Reschedule Request",
      description: "You'll be redirected to reschedule your consultation.",
    })
    // In a real app, this would navigate to a reschedule page
  }

  const handleCancel = (consultationId: string) => {
    toast({
      title: "Consultation Cancelled",
      description: "Your consultation has been cancelled. You'll receive a refund within 3-5 business days.",
    })

    setConsultations((prev) =>
      prev.map((consultation) =>
        consultation.id === consultationId ? { ...consultation, status: "cancelled" as const } : consultation,
      ),
    )
  }

  const handleDownloadDocument = (document: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${document}...`,
    })
    // In a real app, this would trigger a file download
  }

  const getTabCounts = () => {
    return {
      all: consultations.length,
      upcoming: consultations.filter((c) => c.status === "upcoming").length,
      completed: consultations.filter((c) => c.status === "completed").length,
      cancelled: consultations.filter((c) => c.status === "cancelled").length,
    }
  }

  const tabCounts = getTabCounts()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Consultations</h1>
          <p className="text-gray-600">Manage your attorney consultations and access meeting materials</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by attorney name or consultation type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Consultation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({tabCounts.all})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({tabCounts.upcoming})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({tabCounts.completed})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({tabCounts.cancelled})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredConsultations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No consultations found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm
                      ? "Try adjusting your search criteria."
                      : "You don't have any consultations in this category yet."}
                  </p>
                  <Button onClick={() => (window.location.href = "/dashboard/attorneys")}>Find an Attorney</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredConsultations.map((consultation) => (
                  <Card key={consultation.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <img
                            src={consultation.attorneyImage || "/placeholder.svg"}
                            alt={consultation.attorneyName}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="text-xl font-semibold mb-1">{consultation.consultationType}</h3>
                            <p className="text-gray-600 mb-2">with {consultation.attorneyName}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                <span>{consultation.attorneyRating}</span>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>
                                  {new Date(consultation.date).toLocaleDateString()} at {consultation.time}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{consultation.duration} min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(consultation.status)}>
                            {getStatusIcon(consultation.status)}
                            <span className="ml-1 capitalize">{consultation.status}</span>
                          </Badge>
                          <Badge variant="outline">
                            {getMeetingTypeIcon(consultation.meetingType)}
                            <span className="ml-1 capitalize">{consultation.meetingType}</span>
                          </Badge>
                        </div>
                      </div>

                      {consultation.notes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
                          <p className="text-gray-700 text-sm">{consultation.notes}</p>
                        </div>
                      )}

                      {consultation.documents && consultation.documents.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                          <div className="flex flex-wrap gap-2">
                            {consultation.documents.map((document, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadDocument(document)}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                {document}
                                <Download className="h-3 w-3 ml-1" />
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Cost: </span>
                          <span>${consultation.cost}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {consultation.status === "upcoming" && (
                            <>
                              {consultation.meetingLink && (
                                <Button
                                  onClick={() => handleJoinMeeting(consultation)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Video className="h-4 w-4 mr-2" />
                                  Join Meeting
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Message
                              </Button>
                              {consultation.canReschedule && (
                                <Button variant="outline" size="sm" onClick={() => handleReschedule(consultation.id)}>
                                  Reschedule
                                </Button>
                              )}
                              {consultation.canCancel && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancel(consultation.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Cancel
                                </Button>
                              )}
                            </>
                          )}
                          {consultation.status === "completed" && (
                            <>
                              <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Message
                              </Button>
                              <Button variant="outline" size="sm">
                                Book Follow-up
                              </Button>
                            </>
                          )}
                          {consultation.status === "cancelled" && (
                            <Button variant="outline" size="sm">
                              Book New Consultation
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{tabCounts.all}</div>
              <div className="text-sm text-gray-600">Total Consultations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{tabCounts.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">{tabCounts.upcoming}</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                ${consultations.reduce((total, c) => total + c.cost, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
