'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText, 
  Mail,
  Loader2,
  AlertCircle,
  Eye,
  Code
} from 'lucide-react'

interface EditTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (template: any) => void
  template: any | null
}

interface TemplateFormData {
  name: string
  subject: string
  content: string
  type: 'welcome' | 'promotional' | 'transactional' | 'newsletter' | 'custom'
}

const TEMPLATE_TYPES = [
  { id: 'welcome', name: 'Welcome', description: 'Welcome new users' },
  { id: 'promotional', name: 'Promotional', description: 'Marketing and sales emails' },
  { id: 'transactional', name: 'Transactional', description: 'Account and system notifications' },
  { id: 'newsletter', name: 'Newsletter', description: 'Regular updates and content' },
  { id: 'custom', name: 'Custom', description: 'Custom template' }
]

const TEMPLATE_VARIABLES = [
  { variable: '{{name}}', description: 'Recipient name' },
  { variable: '{{email}}', description: 'Recipient email' },
  { variable: '{{credit_score}}', description: 'Current credit score' },
  { variable: '{{upgrade_link}}', description: 'Upgrade link' },
  { variable: '{{unsubscribe_link}}', description: 'Unsubscribe link' }
]

export default function EditTemplateModal({ isOpen, onClose, onSuccess, template }: EditTemplateModalProps) {
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    subject: '',
    content: '',
    type: 'custom'
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewMode, setPreviewMode] = useState(false)

  // Load template data when modal opens
  useEffect(() => {
    if (isOpen && template) {
      setFormData({
        name: template.name || '',
        subject: template.subject || '',
        content: template.content || '',
        type: template.type || 'custom'
      })
    }
  }, [isOpen, template])

  const handleInputChange = (field: keyof TemplateFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!template?.id) return

    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/email/templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: template.id,
          ...formData
        })
      })

      const data = await response.json()

      if (data.success) {
        if (onSuccess) {
          onSuccess(data.data.template)
        }
        
        onClose()
      } else {
        setErrors({ submit: data.error || 'Failed to update template' })
      }
    } catch (error) {
      console.error('Error updating template:', error)
      setErrors({ submit: 'An error occurred while updating the template' })
    } finally {
      setLoading(false)
    }
  }

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = textarea.value
      const before = text.substring(0, start)
      const after = text.substring(end, text.length)
      
      const newContent = before + variable + after
      setFormData(prev => ({ ...prev, content: newContent }))
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length, start + variable.length)
      }, 0)
    }
  }

  const getPreviewContent = () => {
    let preview = formData.content
    // Replace variables with sample data
    preview = preview.replace(/\{\{name\}\}/g, 'John Doe')
    preview = preview.replace(/\{\{email\}\}/g, 'john@example.com')
    preview = preview.replace(/\{\{credit_score\}\}/g, '720')
    preview = preview.replace(/\{\{upgrade_link\}\}/g, '#')
    preview = preview.replace(/\{\{unsubscribe_link\}\}/g, '#')
    return preview
  }

  if (!template) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Edit Email Template
          </DialogTitle>
          <DialogDescription>
            Update your email template content and settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Welcome Email - Day 1"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Template Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: any) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="e.g., Welcome to CreditRepair Pro!"
                  className={errors.subject ? 'border-red-500' : ''}
                />
                {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Email Content *</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Available Variables:</Label>
                    <div className="flex space-x-1">
                      {TEMPLATE_VARIABLES.map((variable) => (
                        <Button
                          key={variable.variable}
                          size="sm"
                          variant="outline"
                          onClick={() => insertVariable(variable.variable)}
                          className="text-xs"
                        >
                          {variable.variable}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Enter your email content here... Use variables like {{name}} for personalization."
                    rows={12}
                    className={errors.content ? 'border-red-500' : ''}
                  />
                  {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                </div>
              </div>
            </div>

            {/* Right Column: Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Preview</Label>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={previewMode ? "default" : "outline"}
                    onClick={() => setPreviewMode(true)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    variant={!previewMode ? "default" : "outline"}
                    onClick={() => setPreviewMode(false)}
                  >
                    <Code className="h-4 w-4 mr-1" />
                    HTML
                  </Button>
                </div>
              </div>

              <Card className="h-96">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{formData.subject || 'Email Subject'}</CardTitle>
                </CardHeader>
                <CardContent className="h-full overflow-y-auto">
                  {previewMode ? (
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
                    />
                  ) : (
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                      {formData.content || 'Email content will appear here...'}
                    </pre>
                  )}
                </CardContent>
              </Card>

              {/* Template Variables Help */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Template Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {TEMPLATE_VARIABLES.map((variable) => (
                      <div key={variable.variable} className="flex justify-between text-xs">
                        <code className="bg-gray-100 px-1 rounded">{variable.variable}</code>
                        <span className="text-gray-500">{variable.description}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Error Display */}
          {errors.submit && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Template'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
