"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { MessagingService } from "@/lib/messaging"
import { ArrowLeft, Send, MessageSquare } from "lucide-react"

export default function MessageAttorneyPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const attorneyId = params.attorneyId as string

  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attorneyInfo, setAttorneyInfo] = useState<any>(null)

  useEffect(() => {
    // In a real app, this would fetch attorney info from the database
    setAttorneyInfo({
      id: attorneyId,
      name: "Sarah Johnson",
      specialties: ["Credit Repair", "Consumer Protection"],
      avatar: "/placeholder.svg?height=40&width=40&text=SJ",
      responseTime: "2-4 hours",
      rating: 4.9,
    })
  }, [attorneyId])

  const handleSendMessage = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both subject and message fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Create new conversation
      const conversation = MessagingService.createConversation(attorneyId, subject.trim(), message.trim())

      toast({
        title: "Message sent!",
        description: "Your message has been sent to the attorney. They will respond soon.",
      })

      // Redirect to messages page
      router.push(`/dashboard/messages`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!attorneyInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Send Message</h1>
          <p className="text-gray-600">Start a conversation with your attorney</p>
        </div>

        {/* Attorney Info Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <img
                src={attorneyInfo.avatar || "/placeholder.svg"}
                alt={attorneyInfo.name}
                className="w-16 h-16 rounded-full"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{attorneyInfo.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{attorneyInfo.specialties.join(", ")}</p>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="text-xs">
                    ⭐ {attorneyInfo.rating} rating
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    📞 Responds in {attorneyInfo.responseTime}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>New Message</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Credit Report Dispute - Experian"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your legal issue in detail. Include any relevant information about your case..."
                className="min-h-[150px] resize-none"
                disabled={isLoading}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Tips for your message:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be specific about your credit repair needs</li>
                <li>• Include relevant dates and account information</li>
                <li>• Mention any documentation you have available</li>
                <li>• Ask specific questions about your case</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage} disabled={isLoading || !subject.trim() || !message.trim()}>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
