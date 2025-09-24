"use client"

import { useState } from "react"
import { AttorneyConversationList } from "@/components/attorney/attorney-conversation-list"
import { AttorneyChatInterface } from "@/components/attorney/attorney-chat-interface"
import { AttorneyDashboardStats } from "@/components/attorney/attorney-dashboard-stats"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, BarChart3, Settings, Users } from "lucide-react"

export default function AttorneyDashboardPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("messages")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attorney Dashboard</h1>
        <p className="text-gray-600">Manage your client communications and cases</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Messages</span>
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Clients</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AttorneyDashboardStats />
        </TabsContent>

        <TabsContent value="messages">
          <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
            {/* Conversation List */}
            <div className="lg:col-span-1">
              <AttorneyConversationList
                selectedConversationId={selectedConversationId || undefined}
                onSelectConversation={setSelectedConversationId}
              />
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2">
              {selectedConversationId ? (
                <AttorneyChatInterface conversationId={selectedConversationId} />
              ) : (
                <Card className="h-full">
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                      <p className="text-gray-600">Choose a client conversation to start messaging</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Management</h3>
                <p className="text-gray-600">Client management features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Attorney Settings</h3>
                <p className="text-gray-600">Settings and preferences coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
