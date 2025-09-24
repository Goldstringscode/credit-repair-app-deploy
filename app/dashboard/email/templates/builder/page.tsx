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
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Code, 
  Palette, 
  Type, 
  Image, 
  Layout,
  Mail,
  FileText,
  Settings
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TemplateBlock {
  id: string
  type: 'text' | 'image' | 'button' | 'divider' | 'spacer'
  content: string
  styles: Record<string, string>
  position: number
}

export default function TemplateBuilderPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("design")
  const [isLoading, setIsLoading] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // Form state
  const [templateData, setTemplateData] = useState({
    name: "",
    subject: "",
    category: "transactional",
    description: ""
  })

  // Template blocks
  const [blocks, setBlocks] = useState<TemplateBlock[]>([
    {
      id: "1",
      type: "text",
      content: "Welcome to our service!",
      styles: {
        fontSize: "24px",
        fontWeight: "bold",
        color: "#333333",
        textAlign: "center",
        padding: "20px"
      },
      position: 0
    }
  ])

  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)

  const addBlock = (type: TemplateBlock['type']) => {
    const newBlock: TemplateBlock = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
      position: blocks.length
    }
    setBlocks(prev => [...prev, newBlock])
  }

  const getDefaultContent = (type: TemplateBlock['type']): string => {
    switch (type) {
      case 'text': return 'New text block'
      case 'image': return 'https://via.placeholder.com/600x300'
      case 'button': return 'Click Here'
      case 'divider': return ''
      case 'spacer': return ''
      default: return ''
    }
  }

  const getDefaultStyles = (type: TemplateBlock['type']): Record<string, string> => {
    switch (type) {
      case 'text':
        return {
          fontSize: "16px",
          color: "#333333",
          padding: "10px"
        }
      case 'image':
        return {
          width: "100%",
          height: "auto",
          padding: "10px"
        }
      case 'button':
        return {
          backgroundColor: "#007bff",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "4px",
          textAlign: "center",
          display: "inline-block",
          textDecoration: "none"
        }
      case 'divider':
        return {
          height: "1px",
          backgroundColor: "#cccccc",
          margin: "20px 0"
        }
      case 'spacer':
        return {
          height: "20px"
        }
      default:
        return {}
    }
  }

  const updateBlock = (blockId: string, updates: Partial<TemplateBlock>) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    ))
  }

  const deleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId))
    if (selectedBlock === blockId) {
      setSelectedBlock(null)
    }
  }

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const newBlocks = [...prev]
      const index = newBlocks.findIndex(block => block.id === blockId)
      if (index === -1) return prev

      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= newBlocks.length) return prev

      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]]
      return newBlocks
    })
  }

  const generateHTML = () => {
    const htmlBlocks = blocks.map(block => {
      const styleString = Object.entries(block.styles)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ')

      switch (block.type) {
        case 'text':
          return `<div style="${styleString}">${block.content}</div>`
        case 'image':
          return `<img src="${block.content}" style="${styleString}" alt="Image" />`
        case 'button':
          return `<a href="#" style="${styleString}">${block.content}</a>`
        case 'divider':
          return `<hr style="${styleString}" />`
        case 'spacer':
          return `<div style="${styleString}"></div>`
        default:
          return ''
      }
    }).join('\n')

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${templateData.subject}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: #ffffff; border-radius: 8px; overflow: hidden; }
  </style>
</head>
<body>
  <div class="container">
    ${htmlBlocks}
  </div>
</body>
</html>`
  }

  const generateText = () => {
    return blocks
      .filter(block => block.type === 'text' || block.type === 'button')
      .map(block => block.content)
      .join('\n\n')
  }

  const handleSave = async () => {
    if (!templateData.name.trim() || !templateData.subject.trim()) {
      toast({
        title: "Error",
        description: "Please fill in the template name and subject.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/email/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...templateData,
          content: {
            html: generateHTML(),
            text: generateText()
          }
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Template saved successfully.",
        })
        router.push('/dashboard/email')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedBlockData = blocks.find(block => block.id === selectedBlock)

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
            <h1 className="text-3xl font-bold">Email Template Builder</h1>
            <p className="text-gray-600">Create beautiful email templates with our drag-and-drop builder</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={activeTab === "design" ? "default" : "outline"}
            onClick={() => setActiveTab("design")}
            className="flex items-center space-x-2"
          >
            <Layout className="h-4 w-4" />
            <span>Design</span>
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "outline"}
            onClick={() => setActiveTab("settings")}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
          <Button
            variant={activeTab === "preview" ? "default" : "outline"}
            onClick={() => setActiveTab("preview")}
            className="flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </Button>
          <Button
            variant={activeTab === "code" ? "default" : "outline"}
            onClick={() => setActiveTab("code")}
            className="flex items-center space-x-2"
          >
            <Code className="h-4 w-4" />
            <span>Code</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="design" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template Builder</CardTitle>
                  <CardDescription>
                    Drag and drop blocks to build your email template
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 min-h-[400px] bg-gray-50">
                    {blocks.map((block, index) => (
                      <div
                        key={block.id}
                        className={`border-2 rounded p-2 mb-2 cursor-pointer ${
                          selectedBlock === block.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedBlock(block.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{block.type}</Badge>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                moveBlock(block.id, 'up')
                              }}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                moveBlock(block.id, 'down')
                              }}
                              disabled={index === blocks.length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteBlock(block.id)
                              }}
                              className="text-red-500"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                        <div
                          style={block.styles}
                          dangerouslySetInnerHTML={{
                            __html: block.type === 'text' || block.type === 'button' 
                              ? block.content 
                              : block.type === 'image' 
                                ? `<img src="${block.content}" style="max-width: 100%; height: auto;" alt="Image" />`
                                : block.type === 'divider'
                                  ? '<hr />'
                                  : '<div style="height: 20px;"></div>'
                          }}
                        />
                      </div>
                    ))}
                    {blocks.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <Layout className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No blocks added yet. Add some blocks to get started.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template Settings</CardTitle>
                  <CardDescription>
                    Configure your template details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={templateData.name}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter template name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input
                      id="subject"
                      value={templateData.subject}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter email subject"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={templateData.category} onValueChange={(value) => setTemplateData(prev => ({ ...prev, category: value }))}>
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
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={templateData.description}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter template description"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    See how your template will look
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-white">
                    <div dangerouslySetInnerHTML={{ __html: generateHTML() }} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generated Code</CardTitle>
                  <CardDescription>
                    HTML code for your template
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{generateHTML()}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* Block Library */}
          <Card>
            <CardHeader>
              <CardTitle>Add Blocks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addBlock('text')}
              >
                <Type className="h-4 w-4 mr-2" />
                Text
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addBlock('image')}
              >
                <Image className="h-4 w-4 mr-2" />
                Image
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addBlock('button')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Button
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addBlock('divider')}
              >
                <div className="h-4 w-4 mr-2 border-t-2 border-gray-400" />
                Divider
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addBlock('spacer')}
              >
                <div className="h-4 w-4 mr-2 bg-gray-300" />
                Spacer
              </Button>
            </CardContent>
          </Card>

          {/* Block Properties */}
          {selectedBlockData && (
            <Card>
              <CardHeader>
                <CardTitle>Block Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={selectedBlockData.content}
                    onChange={(e) => updateBlock(selectedBlockData.id, { content: e.target.value })}
                    placeholder="Enter content"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Styles</Label>
                  {Object.entries(selectedBlockData.styles).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Input
                        value={key}
                        readOnly
                        className="w-20 text-xs"
                      />
                      <Input
                        value={value}
                        onChange={(e) => updateBlock(selectedBlockData.id, {
                          styles: { ...selectedBlockData.styles, [key]: e.target.value }
                        })}
                        className="flex-1 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
