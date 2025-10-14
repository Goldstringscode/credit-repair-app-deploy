"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotifications } from "@/lib/notification-context"
import { 
  Bell, 
  Settings, 
  TestTube, 
  Eye, 
  Copy, 
  Edit,
  Plus,
  Trash2,
  Search,
  Filter
} from "lucide-react"

interface NotificationTemplate {
  id: string
  name: string
  description: string
  category: string
  type: 'success' | 'info' | 'warning' | 'error'
  priority: 'low' | 'medium' | 'high'
  title: string
  message: string
  icon?: string
  actions?: Array<{
    label: string
    action: string
    variant?: string
  }>
  variables?: string[]
  sound?: string
  vibration?: boolean
  autoExpire?: number
}

export default function NotificationTemplatesPage() {
  const { addNotification } = useNotifications()
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<NotificationTemplate[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null)
  const [testData, setTestData] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load templates
  useEffect(() => {
    loadTemplates()
  }, [])

  // Filter templates
  useEffect(() => {
    let filtered = templates

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredTemplates(filtered)
  }, [templates, selectedCategory, searchQuery])

  const loadTemplates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/notifications/templates')
      const data = await response.json()
      
      if (data.success) {
        setTemplates(data.templates)
      } else {
        console.error('Failed to load templates:', data.error)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const testTemplate = async (template: NotificationTemplate) => {
    try {
      const response = await fetch('/api/notifications/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template.id,
          data: testData
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        addNotification({
          title: "Template Test Successful! ✅",
          message: `Successfully tested template: ${template.name}`,
          type: "success",
          priority: "medium",
          category: "system",
          read: false
        })
      } else {
        addNotification({
          title: "Template Test Failed ❌",
          message: `Failed to test template: ${result.error}`,
          type: "error",
          priority: "high",
          category: "system",
          read: false
        })
      }
    } catch (error) {
      console.error('Error testing template:', error)
      addNotification({
        title: "Template Test Error ❌",
        message: "An error occurred while testing the template",
        type: "error",
        priority: "high",
        category: "system",
        read: false
      })
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      credit: 'bg-blue-100 text-blue-800',
      training: 'bg-green-100 text-green-800',
      system: 'bg-gray-100 text-gray-800',
      payment: 'bg-yellow-100 text-yellow-800',
      milestone: 'bg-purple-100 text-purple-800',
      alert: 'bg-red-100 text-red-800',
      dispute: 'bg-orange-100 text-orange-800',
      fcra: 'bg-indigo-100 text-indigo-800',
      mail: 'bg-pink-100 text-pink-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getTypeColor = (type: string) => {
    const colors = {
      success: 'bg-green-100 text-green-800',
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const categories = Array.from(new Set(templates.map(t => t.category)))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading notification templates...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Bell className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Notification Templates</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Manage and test notification templates for all system events
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{templates.length}</p>
                    <p className="text-sm text-gray-600">Total Templates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{categories.length}</p>
                    <p className="text-sm text-gray-600">Categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TestTube className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{filteredTemplates.length}</p>
                    <p className="text-sm text-gray-600">Filtered</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{selectedTemplate ? 1 : 0}</p>
                    <p className="text-sm text-gray-600">Selected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Templates</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name, description, or title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="md:w-48">
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                      <Badge className={getTypeColor(template.type)}>
                        {template.type}
                      </Badge>
                      <Badge className={getPriorityColor(template.priority)}>
                        {template.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Title:</h4>
                      <p className="text-sm bg-gray-50 p-2 rounded">{template.title}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Message:</h4>
                      <p className="text-sm bg-gray-50 p-2 rounded">{template.message}</p>
                    </div>
                    {template.variables && template.variables.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Variables:</h4>
                        <div className="flex flex-wrap gap-1">
                          {template.variables.map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedTemplate(template)}
                        variant="outline"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => testTemplate(template)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <TestTube className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600">
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Try adjusting your filters to see more templates.'
                    : 'No notification templates are available.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

