"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  MessageCircle,
  Phone,
  Mail,
  BookOpen,
  HelpCircle,
  Clock,
  Star,
  ArrowRight,
  Users,
  PlayCircle,
} from "lucide-react"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
  tags: string[]
}

interface SupportTicket {
  id: string
  subject: string
  status: "open" | "in_progress" | "resolved"
  priority: "low" | "medium" | "high"
  created: string
  lastUpdate: string
  category: string
}

interface VideoTutorial {
  id: string
  title: string
  description: string
  duration: string
  category: string
  thumbnail: string
  views: number
  rating: number
}

const mockFAQs: FAQItem[] = [
  {
    id: "1",
    question: "How long does it take to see credit score improvements?",
    answer:
      "Most users see initial improvements within 30-60 days of starting their credit repair journey. Significant improvements (50+ points) typically occur within 3-6 months with consistent effort and proper strategy implementation.",
    category: "Credit Scores",
    helpful: 245,
    tags: ["timeline", "results", "expectations"],
  },
  {
    id: "2",
    question: "What documents do I need to upload for AI analysis?",
    answer:
      "Upload your most recent credit reports from all three bureaus (Experian, Equifax, TransUnion), bank statements, and any correspondence from creditors or collection agencies. Our AI will analyze these documents to identify dispute opportunities.",
    category: "Document Upload",
    helpful: 189,
    tags: ["documents", "upload", "analysis"],
  },
  {
    id: "3",
    question: "How does the AI dispute letter generation work?",
    answer:
      "Our AI analyzes your credit reports, identifies inaccuracies or questionable items, and generates personalized dispute letters based on FCRA guidelines and proven strategies. Each letter is tailored to your specific situation and the type of dispute.",
    category: "Dispute Letters",
    helpful: 312,
    tags: ["AI", "disputes", "letters"],
  },
  {
    id: "4",
    question: "Is my personal information secure?",
    answer:
      "Yes, we use bank-level encryption (256-bit SSL) to protect all your data. Your information is stored securely and never shared with third parties without your explicit consent. We're SOC 2 compliant and follow strict data protection protocols.",
    category: "Security",
    helpful: 156,
    tags: ["security", "privacy", "encryption"],
  },
  {
    id: "5",
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes, you can cancel your subscription at any time from your account settings. There are no cancellation fees, and you'll retain access to your account until the end of your current billing period.",
    category: "Billing",
    helpful: 98,
    tags: ["billing", "cancellation", "subscription"],
  },
]

const mockTickets: SupportTicket[] = [
  {
    id: "TICK-001",
    subject: "Dispute letter not generating properly",
    status: "in_progress",
    priority: "medium",
    created: "2024-01-15",
    lastUpdate: "2024-01-16",
    category: "Technical",
  },
  {
    id: "TICK-002",
    subject: "Question about credit utilization calculation",
    status: "resolved",
    priority: "low",
    created: "2024-01-10",
    lastUpdate: "2024-01-12",
    category: "General",
  },
]

const mockTutorials: VideoTutorial[] = [
  {
    id: "1",
    title: "Getting Started with CreditAI Pro",
    description: "Complete walkthrough of setting up your account and uploading your first credit report",
    duration: "8:45",
    category: "Getting Started",
    thumbnail: "/placeholder.svg?height=120&width=200&text=Tutorial+1",
    views: 15420,
    rating: 4.8,
  },
  {
    id: "2",
    title: "Understanding Your Credit Report Analysis",
    description: "Learn how to interpret AI analysis results and identify dispute opportunities",
    duration: "12:30",
    category: "Credit Analysis",
    thumbnail: "/placeholder.svg?height=120&width=200&text=Tutorial+2",
    views: 12890,
    rating: 4.9,
  },
  {
    id: "3",
    title: "Generating Effective Dispute Letters",
    description: "Step-by-step guide to creating and customizing AI-generated dispute letters",
    duration: "15:20",
    category: "Dispute Process",
    thumbnail: "/placeholder.svg?height=120&width=200&text=Tutorial+3",
    views: 18750,
    rating: 4.7,
  },
  {
    id: "4",
    title: "Tracking Your Progress",
    description: "How to monitor your credit improvement and measure success",
    duration: "6:15",
    category: "Progress Tracking",
    thumbnail: "/placeholder.svg?height=120&width=200&text=Tutorial+4",
    views: 9340,
    rating: 4.6,
  },
]

export default function HelpPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [newTicketSubject, setNewTicketSubject] = useState("")

  const filteredFAQs = mockFAQs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["all", ...Array.from(new Set(mockFAQs.map((faq) => faq.category)))]

  const handleCreateTicket = () => {
    if (!newTicketSubject.trim()) {
      toast({
        title: "Subject required",
        description: "Please enter a subject for your support ticket",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Support ticket created",
      description: "We'll respond within 24 hours. Ticket ID: TICK-003",
    })
    setNewTicketSubject("")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-100 text-blue-800">Open</Badge>
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Normal</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-600">Get the help you need to succeed with your credit repair journey</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <Badge className="bg-green-100 text-green-800">
            <Clock className="h-3 w-3 mr-1" />
            24/7 Support
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search frequently asked questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <Card key={faq.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg pr-4">{faq.question}</CardTitle>
                    <Badge variant="outline">{faq.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {faq.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{faq.helpful} found helpful</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search terms or browse all categories</p>
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockTutorials.map((tutorial) => (
              <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={tutorial.thumbnail || "/placeholder.svg"}
                    alt={tutorial.title}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="h-12 w-12 text-white opacity-80 hover:opacity-100 cursor-pointer" />
                  </div>
                  <Badge className="absolute top-2 right-2 bg-black bg-opacity-70 text-white">
                    {tutorial.duration}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                  <CardDescription>{tutorial.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span>{tutorial.views.toLocaleString()} views</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{tutorial.rating}</span>
                      </div>
                    </div>
                    <Badge variant="outline">{tutorial.category}</Badge>
                  </div>
                  <Button className="w-full mt-4">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Watch Tutorial
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          {/* Create New Ticket */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-blue-500" />
                Create Support Ticket
              </CardTitle>
              <CardDescription>Get personalized help from our support team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Describe your issue briefly..."
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Average response time: 2-4 hours
                </div>
                <Button onClick={handleCreateTicket}>Create Ticket</Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>Your Support Tickets</CardTitle>
              <CardDescription>Track the status of your support requests</CardDescription>
            </CardHeader>
            <CardContent>
              {mockTickets.length > 0 ? (
                <div className="space-y-4">
                  {mockTickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{ticket.subject}</span>
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span>#{ticket.id}</span>
                          <span className="mx-2">•</span>
                          <span>Created: {ticket.created}</span>
                          <span className="mx-2">•</span>
                          <span>Last update: {ticket.lastUpdate}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No support tickets</h3>
                  <p className="text-gray-600">You haven't created any support tickets yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Live Chat */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-green-500" />
                  Live Chat
                </CardTitle>
                <CardDescription>Get instant help from our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600">Available now</span>
                </div>
                <p className="text-sm text-gray-600">Average response time: Under 2 minutes</p>
                <Button className="w-full">Start Chat</Button>
              </CardContent>
            </Card>

            {/* Phone Support */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-blue-500" />
                  Phone Support
                </CardTitle>
                <CardDescription>Speak directly with a credit specialist</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <p className="font-medium">1-800-CREDIT-AI</p>
                  <p className="text-gray-600">Mon-Fri: 8AM-8PM EST</p>
                  <p className="text-gray-600">Sat-Sun: 10AM-6PM EST</p>
                </div>
                <Button className="w-full bg-transparent" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              </CardContent>
            </Card>

            {/* Email Support */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-purple-500" />
                  Email Support
                </CardTitle>
                <CardDescription>Send us a detailed message</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <p className="font-medium">support@creditaipro.com</p>
                  <p className="text-gray-600">Response within 24 hours</p>
                </div>
                <Button className="w-full bg-transparent" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
              <CardDescription>More ways to get help and learn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                    Knowledge Base
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="#" className="text-blue-600 hover:underline flex items-center">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Credit Repair Fundamentals
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-blue-600 hover:underline flex items-center">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Understanding Credit Reports
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-blue-600 hover:underline flex items-center">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Dispute Process Guide
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-blue-600 hover:underline flex items-center">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Legal Rights & FCRA
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center">
                    <Users className="h-4 w-4 mr-2 text-green-500" />
                    Community
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="#" className="text-blue-600 hover:underline flex items-center">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        User Forum
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-blue-600 hover:underline flex items-center">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Success Stories
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-blue-600 hover:underline flex items-center">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Expert Webinars
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-blue-600 hover:underline flex items-center">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Facebook Group
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
