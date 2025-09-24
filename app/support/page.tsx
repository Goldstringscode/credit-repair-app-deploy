"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageCircle,
  Phone,
  Mail,
  Video,
  Clock,
  Send,
  Search,
  ChevronDown,
  ChevronRight,
  User,
  CheckCircle,
  HelpCircle,
  FileText,
  BookOpen,
  Headphones,
  Calendar,
} from "lucide-react"

export default function SupportPage() {
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "support",
      message: "Hi! I'm Sarah from Credit Repair AI support. How can I help you today?",
      timestamp: "2:30 PM",
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const faqCategories = [
    {
      id: "getting-started",
      name: "Getting Started",
      questions: [
        {
          id: 1,
          question: "How do I get started with credit repair?",
          answer:
            "Start by signing up for an account and connecting your credit monitoring. We'll analyze your credit report and create a personalized action plan to improve your score.",
        },
        {
          id: 2,
          question: "How long does credit repair take?",
          answer:
            "Credit repair typically takes 3-6 months to see significant results. However, some improvements can be seen within 30-60 days depending on your specific situation.",
        },
        {
          id: 3,
          question: "What documents do I need?",
          answer:
            "You'll need your Social Security number, government-issued ID, and recent credit reports from all three bureaus (Experian, Equifax, TransUnion).",
        },
      ],
    },
    {
      id: "disputes",
      name: "Credit Disputes",
      questions: [
        {
          id: 4,
          question: "How do I dispute an error on my credit report?",
          answer:
            "Use our dispute letter generator to create professional dispute letters. We'll guide you through identifying errors and submitting disputes to the credit bureaus.",
        },
        {
          id: 5,
          question: "What happens after I submit a dispute?",
          answer:
            "Credit bureaus have 30 days to investigate your dispute. They'll contact the creditor to verify the information and update your report accordingly.",
        },
      ],
    },
    {
      id: "billing",
      name: "Billing & Subscriptions",
      questions: [
        {
          id: 6,
          question: "Can I cancel my subscription anytime?",
          answer:
            "Yes, you can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your current billing period.",
        },
        {
          id: 7,
          question: "Do you offer refunds?",
          answer:
            "We offer a 30-day money-back guarantee for new subscribers. If you're not satisfied within the first 30 days, contact support for a full refund.",
        },
      ],
    },
    {
      id: "technical",
      name: "Technical Support",
      questions: [
        {
          id: 8,
          question: "Why can't I access my account?",
          answer:
            "Try resetting your password first. If that doesn't work, clear your browser cache or try a different browser. Contact support if the issue persists.",
        },
        {
          id: 9,
          question: "Is my data secure?",
          answer:
            "Yes, we use bank-level encryption and security measures to protect your personal and financial information. We're SOC 2 compliant and never sell your data.",
        },
      ],
    },
    {
      id: "legal",
      name: "Legal Questions",
      questions: [
        {
          id: 10,
          question: "What are my rights under the FCRA?",
          answer:
            "The Fair Credit Reporting Act gives you the right to dispute inaccurate information, receive free credit reports annually, and be notified when adverse actions are taken based on your credit report.",
        },
      ],
    },
  ]

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const userMessage = {
      id: chatMessages.length + 1,
      sender: "user",
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setChatMessages([...chatMessages, userMessage])
    setNewMessage("")

    // Simulate support response
    setTimeout(() => {
      const supportResponse = {
        id: chatMessages.length + 2,
        sender: "support",
        message:
          "Thanks for your message! I'm looking into this for you. Is there anything specific about your credit report you'd like me to help with?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setChatMessages((prev) => [...prev, supportResponse])
    }, 2000)
  }

  const filteredFaqs = faqCategories
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">How can we help you?</h1>
        <p className="text-gray-600">Get support from our credit repair experts</p>
      </div>

      {/* Quick Contact Options */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-3">Chat with our support team</p>
            <Badge className="bg-green-100 text-green-800">Online</Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Phone Support</h3>
            <p className="text-sm text-gray-600 mb-3">(555) 123-4567</p>
            <Badge className="bg-blue-100 text-blue-800">Mon-Fri 9AM-6PM</Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Email Support</h3>
            <p className="text-sm text-gray-600 mb-3">support@creditrepairai.com</p>
            <Badge className="bg-gray-100 text-gray-800">24-48 hour response</Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-4">
              <Video className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Video Call</h3>
            <p className="text-sm text-gray-600 mb-3">Schedule a consultation</p>
            <Badge className="bg-orange-100 text-orange-800">By Appointment</Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chat" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">Live Chat</TabsTrigger>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Live Chat Tab */}
        <TabsContent value="chat">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Live Chat Support
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Sarah is online</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6 h-96 overflow-y-auto">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex gap-3 max-w-xs ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                          <div
                            className={`p-2 rounded-full ${message.sender === "user" ? "bg-blue-100" : "bg-gray-100"}`}
                          >
                            {message.sender === "user" ? (
                              <User className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Headphones className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div
                              className={`p-3 rounded-lg ${
                                message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{message.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Support Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Credit Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Consultation
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View User Guide
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Support Tickets Tab */}
        <TabsContent value="tickets">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Support Ticket</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="Brief description of your issue" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <select id="priority" className="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Please provide detailed information about your issue..."
                      rows={4}
                    />
                  </div>
                  <Button>Submit Ticket</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Recent Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Credit score not updating</h4>
                        <p className="text-sm text-gray-600">Ticket #12345 • Created 2 days ago</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Dispute letter question</h4>
                        <p className="text-sm text-gray-600">Ticket #12344 • Created 5 days ago</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Be Specific</h4>
                      <p className="text-sm text-gray-600">Provide detailed information about your issue</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Include Screenshots</h4>
                      <p className="text-sm text-gray-600">Visual aids help us understand the problem</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Response Time</h4>
                      <p className="text-sm text-gray-600">We respond within 24 hours on business days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq">
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search frequently asked questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-6">
              {filteredFaqs.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" />
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.questions.map((faq) => (
                        <div key={faq.id} className="border rounded-lg">
                          <button
                            className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                            onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                          >
                            <span className="font-medium">{faq.question}</span>
                            {expandedFaq === faq.id ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          {expandedFaq === faq.id && (
                            <div className="p-4 pt-0 border-t">
                              <p className="text-gray-600">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  User Guides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <a href="#" className="block p-3 border rounded-lg hover:bg-gray-50">
                    <h4 className="font-medium">Getting Started Guide</h4>
                    <p className="text-sm text-gray-600">Complete walkthrough for new users</p>
                  </a>
                  <a href="#" className="block p-3 border rounded-lg hover:bg-gray-50">
                    <h4 className="font-medium">Dispute Process Guide</h4>
                    <p className="text-sm text-gray-600">Step-by-step dispute instructions</p>
                  </a>
                  <a href="#" className="block p-3 border rounded-lg hover:bg-gray-50">
                    <h4 className="font-medium">Credit Building Tips</h4>
                    <p className="text-sm text-gray-600">Strategies to improve your score</p>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-green-600" />
                  Video Tutorials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <a href="#" className="block p-3 border rounded-lg hover:bg-gray-50">
                    <h4 className="font-medium">Platform Overview</h4>
                    <p className="text-sm text-gray-600">5 min • Introduction to features</p>
                  </a>
                  <a href="#" className="block p-3 border rounded-lg hover:bg-gray-50">
                    <h4 className="font-medium">Creating Dispute Letters</h4>
                    <p className="text-sm text-gray-600">8 min • Letter generation walkthrough</p>
                  </a>
                  <a href="#" className="block p-3 border rounded-lg hover:bg-gray-50">
                    <h4 className="font-medium">Reading Credit Reports</h4>
                    <p className="text-sm text-gray-600">12 min • Understanding your report</p>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Downloads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <a href="#" className="block p-3 border rounded-lg hover:bg-gray-50">
                    <h4 className="font-medium">Credit Report Template</h4>
                    <p className="text-sm text-gray-600">PDF • Blank credit report form</p>
                  </a>
                  <a href="#" className="block p-3 border rounded-lg hover:bg-gray-50">
                    <h4 className="font-medium">Dispute Letter Templates</h4>
                    <p className="text-sm text-gray-600">ZIP • Collection of letter templates</p>
                  </a>
                  <a href="#" className="block p-3 border rounded-lg hover:bg-gray-50">
                    <h4 className="font-medium">Credit Laws Cheat Sheet</h4>
                    <p className="text-sm text-gray-600">PDF • FCRA, FDCPA quick reference</p>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
