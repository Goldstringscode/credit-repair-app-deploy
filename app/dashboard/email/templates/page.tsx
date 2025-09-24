"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Plus,
  Eye,
  Edit,
  Copy,
  Trash2,
  Search,
  Filter,
  FileText,
  Image,
  Link,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Quote,
  Code,
  Palette,
  Layout,
  Type,
  Save,
  Download,
  Upload
} from "lucide-react"

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  category: string
  isDefault: boolean
  createdAt: string
  lastUsed?: string
  usageCount: number
  tags: string[]
  preview: string
}

export default function EmailTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  // Mock data
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: "1",
      name: "Welcome Email",
      subject: "Welcome to Credit Repair AI!",
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to Credit Repair AI! 🎉</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your journey to better credit starts now</p>
          </div>
          
          <div style="padding: 30px 20px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi {{firstName}},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Welcome to Credit Repair AI! We're excited to help you improve your credit score and achieve your financial goals.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>Complete your credit profile</li>
                <li>Upload your credit reports</li>
                <li>Start your first dispute</li>
                <li>Track your progress</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{dashboardUrl}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Get Started</a>
            </div>
          </div>
        </div>
      `,
      category: "transactional",
      isDefault: true,
      createdAt: "2024-01-01",
      lastUsed: "2024-01-15",
      usageCount: 45,
      tags: ["welcome", "onboarding"],
      preview: "Welcome email with onboarding steps and call-to-action button"
    },
    {
      id: "2",
      name: "Credit Score Update",
      subject: "Your Credit Score Has Improved!",
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Great News! 📈</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your credit score has improved</p>
          </div>
          
          <div style="padding: 30px 20px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi {{firstName}},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We have great news! Your credit score has improved by {{scoreChange}} points and is now {{newScore}}.
            </p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #155724; margin-top: 0;">Score Summary</h3>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Previous Score:</span>
                <span style="font-weight: bold;">{{oldScore}}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>New Score:</span>
                <span style="font-weight: bold; color: #28a745;">{{newScore}}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Change:</span>
                <span style="font-weight: bold; color: #28a745;">+{{scoreChange}} points</span>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{dashboardUrl}}" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Full Report</a>
            </div>
          </div>
        </div>
      `,
      category: "transactional",
      isDefault: true,
      createdAt: "2024-01-01",
      lastUsed: "2024-01-18",
      usageCount: 23,
      tags: ["credit", "update", "score"],
      preview: "Credit score improvement notification with score details and progress tracking"
    },
    {
      id: "3",
      name: "Monthly Newsletter",
      subject: "Credit Tips & Updates - {{month}} {{year}}",
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%); padding: 40px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Credit Tips & Updates</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">{{month}} {{year}} Newsletter</p>
          </div>
          
          <div style="padding: 30px 20px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi {{firstName}},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Here are this month's top credit tips and updates to help you on your credit repair journey.
            </p>
            
            <div style="margin: 30px 0;">
              <h3 style="color: #333; margin-bottom: 15px;">💡 This Month's Tips</h3>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="color: #333; margin-top: 0;">Tip 1: Check Your Credit Reports Regularly</h4>
                <p style="color: #666; margin-bottom: 0;">Review your credit reports from all three bureaus monthly to catch errors early.</p>
              </div>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="color: #333; margin-top: 0;">Tip 2: Pay Bills On Time</h4>
                <p style="color: #666; margin-bottom: 0;">Payment history is the most important factor in your credit score calculation.</p>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{dashboardUrl}}" style="background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Read More Tips</a>
            </div>
          </div>
        </div>
      `,
      category: "newsletter",
      isDefault: false,
      createdAt: "2024-01-05",
      lastUsed: "2024-01-20",
      usageCount: 12,
      tags: ["newsletter", "tips", "monthly"],
      preview: "Monthly newsletter with credit tips and educational content"
    },
    {
      id: "4",
      name: "Dispute Letter Reminder",
      subject: "Don't Forget to Send Your Dispute Letters",
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #fd7e14 0%, #e8590c 100%); padding: 40px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Reminder: Send Your Dispute Letters 📮</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Don't let your disputes expire</p>
          </div>
          
          <div style="padding: 30px 20px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi {{firstName}},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This is a friendly reminder that you have {{disputeCount}} dispute letters ready to send. Don't let your disputes expire!
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">⚠️ Important Reminder</h3>
              <p style="color: #856404; margin-bottom: 0;">
                Dispute letters must be sent within 30 days of identifying the error. Don't miss your opportunity to improve your credit!
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{dashboardUrl}}" style="background: linear-gradient(135deg, #fd7e14 0%, #e8590c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Send Dispute Letters</a>
            </div>
          </div>
        </div>
      `,
      category: "marketing",
      isDefault: false,
      createdAt: "2024-01-10",
      usageCount: 0,
      tags: ["reminder", "dispute", "urgent"],
      preview: "Reminder email to send dispute letters with urgency messaging"
    }
  ])

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "transactional": return "bg-blue-100 text-blue-800"
      case "marketing": return "bg-purple-100 text-purple-800"
      case "newsletter": return "bg-green-100 text-green-800"
      case "promotional": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleDuplicate = (template: EmailTemplate) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString().split('T')[0],
      usageCount: 0
    }
    setTemplates(prev => [newTemplate, ...prev])
  }

  const handleDelete = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Email Templates</h1>
            <p className="text-gray-600">
              Create and manage your email templates
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </Button>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Template</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="transactional">Transactional</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">{template.name}</h3>
                  {template.isDefault && (
                    <Badge variant="outline" className="text-xs">Default</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template)
                      setIsPreviewOpen(true)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template)
                      setIsEditorOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {!template.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                  <p className="text-xs text-gray-500">{template.preview}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Used {template.usageCount} times
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="text-xs text-gray-500">
                  Created: {template.createdAt}
                  {template.lastUsed && (
                    <span> • Last used: {template.lastUsed}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Subject:</strong> {selectedTemplate.subject}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <strong>Category:</strong> {selectedTemplate.category}
                </div>
                <div 
                  className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.content }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={selectedTemplate.name}
                    onChange={(e) => setSelectedTemplate(prev => prev ? {...prev, name: e.target.value} : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="templateSubject">Subject</Label>
                  <Input
                    id="templateSubject"
                    value={selectedTemplate.subject}
                    onChange={(e) => setSelectedTemplate(prev => prev ? {...prev, subject: e.target.value} : null)}
                  />
                </div>
              </div>
              
              <div>
                <Label>Template Content</Label>
                <div className="border rounded-lg">
                  {/* Editor Toolbar */}
                  <div className="border-b p-2 flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Underline className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-300" />
                    <Button variant="ghost" size="sm">
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <AlignRight className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-300" />
                    <Button variant="ghost" size="sm">
                      <List className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Image className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-300" />
                    <Button variant="ghost" size="sm">
                      <Code className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Content Editor */}
                  <Textarea
                    value={selectedTemplate.content}
                    onChange={(e) => setSelectedTemplate(prev => prev ? {...prev, content: e.target.value} : null)}
                    className="min-h-96 border-0 resize-none"
                    placeholder="Enter your template content here..."
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsEditorOpen(false)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
