"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User } from "lucide-react"

interface Message {
  id: number
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content:
        "Hi! I'm your AI credit repair assistant. I can help you with dispute strategies, explain credit reports, generate dispute letters, and answer any questions about improving your credit score. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        content: getAIResponse(inputMessage),
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("credit score") || input.includes("score")) {
      return "Your credit score is calculated based on several factors: payment history (35%), credit utilization (30%), length of credit history (15%), credit mix (10%), and new credit (10%). To improve your score, focus on paying bills on time, keeping credit utilization below 30%, and disputing any inaccurate items on your report."
    }

    if (input.includes("dispute") || input.includes("remove")) {
      return "To dispute items on your credit report, you'll need to: 1) Identify inaccurate items, 2) Gather supporting documentation, 3) Send dispute letters to credit bureaus, 4) Follow up on responses. I can help generate personalized dispute letters for your specific situation. What type of item would you like to dispute?"
    }

    if (input.includes("letter") || input.includes("template")) {
      return "I can generate customized dispute letters for various situations including: late payments, charge-offs, collections, identity theft, and inaccurate personal information. Each letter is tailored to your specific case and follows FCRA guidelines. Would you like me to create a dispute letter for a specific item?"
    }

    return "I understand you're asking about credit repair. I'm here to help with dispute strategies, credit score improvement tips, letter generation, and answering questions about the credit repair process. Could you be more specific about what you'd like help with?"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-blue-600" />
              <span>AI Credit Repair Assistant</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={message.sender === "ai" ? "bg-blue-100" : "bg-gray-100"}>
                        {message.sender === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask me anything about credit repair..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="max-w-4xl mx-auto mt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="p-4 h-auto text-left bg-transparent"
              onClick={() => setInputMessage("How can I improve my credit score?")}
            >
              <div>
                <p className="font-medium">Improve Credit Score</p>
                <p className="text-sm text-gray-600">Get personalized tips</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="p-4 h-auto text-left bg-transparent"
              onClick={() => setInputMessage("Generate a dispute letter for late payment")}
            >
              <div>
                <p className="font-medium">Generate Dispute Letter</p>
                <p className="text-sm text-gray-600">AI-powered templates</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="p-4 h-auto text-left bg-transparent"
              onClick={() => setInputMessage("Explain my credit report")}
            >
              <div>
                <p className="font-medium">Understand Credit Report</p>
                <p className="text-sm text-gray-600">Learn the basics</p>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
