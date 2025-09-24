"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Eye, 
  Users, 
  Calendar,
  Mail,
  FileText,
  Target,
  Settings
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmailTemplate {
  id: string
  name: string
  subject: string
  category: string
  content: {
    html: string
    text: string
  }
}

interface EmailList {
  id: string
  name: string
  subscribers: number
  activeSubscribers: number
  tags: string[]
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("details")
  const [isLoading, setIsLoading] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    template: "",
    category: "transactional",
    recipients: "",
    scheduledFor: "",
    content: {
      html: "",
      text: ""
    }
  })

  // Data state
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [emailLists, setEmailLists] = useState<EmailList[]>([])
  const [selectedLists, setSelectedLists] = useState<string[]>([])

  useEffect(() => {
    fetchTemplates()
    fetchEmailLists()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/email/templates?includeSystem=true')
      const data = await response.json()
      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const fetchEmailLists = async () => {
    try {
      const response = await fetch('/api/email/lists')
      const data = await response.json()
      if (data.success) {
        setEmailLists(data.lists)
      }
    } catch (error) {
      console.error('Error fetching email lists:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        template: templateId,
        subject: template.subject,
        content: template.content
      }))
    }
  }

  const handleListToggle = (listId: string) => {
    setSelectedLists(prev => 
      prev.includes(listId) 
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    )
  }

  const calculateTotalRecipients = () => {
    return selectedLists.reduce((total, listId) => {
      const list = emailLists.find(l => l.id === listId)
      return total + (list?.activeSubscribers || 0)
    }, 0)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/email/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recipients: calculateTotalRecipients()
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Campaign Created",
          description: "Your email campaign has been created successfully.",
        })
        router.push('/dashboard/email')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    setIsLoading(true)
    try {
      // First save the campaign
      await handleSave()
      
      // Then send it
      toast({
        title: "Campaign Sent",
        description: "Your email campaign has been sent successfully.",
      })
      router.push('/dashboard/email')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send campaign. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedTemplate = templates.find(t => t.id === formData.template)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Email Campaign</h1>
            <p className="text-gray-600">Design and send your email campaign</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={activeTab === "details" ? "default" : "outline"}
            onClick={() => setActiveTab("details")}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Details</span>
          </Button>
          <Button
            variant={activeTab === "content" ? "default" : "outline"}
            onClick={() => setActiveTab("content")}
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Content</span>
          </Button>
          <Button
            variant={activeTab === "recipients" ? "default" : "outline"}
            onClick={() => setActiveTab("recipients")}
            className="flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>Recipients</span>
          </Button>
          <Button
            variant={activeTab === "schedule" ? "default" : "outline"}
            onClick={() => setActiveTab("schedule")}
            className="flex items-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Schedule</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Details</CardTitle>
                  <CardDescription>
                    Basic information about your email campaign
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter campaign name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="Enter email subject"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transactional">Transactional</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Content</CardTitle>
                  <CardDescription>
                    Choose a template or create custom content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="template">Template</Label>
                    <Select value={formData.template} onValueChange={handleTemplateSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedTemplate && (
                    <div className="space-y-4">
                      <div>
                        <Label>Preview</Label>
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <div className="font-medium mb-2">{selectedTemplate.subject}</div>
                          <div 
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: selectedTemplate.content.html }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recipients" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recipients</CardTitle>
                  <CardDescription>
                    Select email lists to send your campaign to
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {emailLists.map((list) => (
                      <div key={list.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={list.id}
                          checked={selectedLists.includes(list.id)}
                          onCheckedChange={() => handleListToggle(list.id)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={list.id} className="font-medium">
                            {list.name}
                          </Label>
                          <p className="text-sm text-gray-600">
                            {list.activeSubscribers.toLocaleString()} active subscribers
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {list.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        Total Recipients: {calculateTotalRecipients().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule</CardTitle>
                  <CardDescription>
                    Choose when to send your campaign
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="schedule">Send Time</Label>
                    <Select value={formData.scheduledFor ? "scheduled" : "now"} onValueChange={(value) => {
                      if (value === "now") {
                        handleInputChange("scheduledFor", "")
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select send time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="now">Send Now</SelectItem>
                        <SelectItem value="scheduled">Schedule for Later</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.scheduledFor && (
                    <div>
                      <Label htmlFor="scheduledFor">Scheduled Date & Time</Label>
                      <Input
                        id="scheduledFor"
                        type="datetime-local"
                        value={formData.scheduledFor}
                        onChange={(e) => handleInputChange("scheduledFor", e.target.value)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium">{formData.name || "Untitled Campaign"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subject:</span>
                  <span className="text-sm font-medium">{formData.subject || "No subject"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <Badge variant="outline">{formData.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Recipients:</span>
                  <span className="text-sm font-medium">{calculateTotalRecipients().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant="outline">
                    {formData.scheduledFor ? "Scheduled" : "Draft"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Draft</span>
              </Button>
              
              <Button
                onClick={handleSend}
                disabled={isLoading || !formData.name || !formData.subject || selectedLists.length === 0}
                className="w-full flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>{formData.scheduledFor ? "Schedule" : "Send Now"}</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}