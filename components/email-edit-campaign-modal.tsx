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
  Mail, 
  Send, 
  Calendar,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface EditCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (campaign: any) => void
  campaign: any | null
}

interface CampaignFormData {
  name: string
  subject: string
  content: string
  template: string
  recipients: number
  scheduledFor: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
}

const TEMPLATE_TYPES = [
  { id: 'welcome', name: 'Welcome Series' },
  { id: 'newsletter', name: 'Newsletter' },
  { id: 'promotional', name: 'Promotional' },
  { id: 'transactional', name: 'Transactional' },
  { id: 'custom', name: 'Custom' }
]

export default function EditCampaignModal({ isOpen, onClose, onSuccess, campaign }: EditCampaignModalProps) {
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    subject: '',
    content: '',
    template: '',
    recipients: 0,
    scheduledFor: '',
    status: 'draft'
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(1)
  const [templates, setTemplates] = useState<any[]>([])

  // Load campaign data when modal opens
  useEffect(() => {
    if (isOpen && campaign) {
      setFormData({
        name: campaign.name || '',
        subject: campaign.subject || '',
        content: campaign.content || '',
        template: campaign.template || '',
        recipients: campaign.recipients || 0,
        scheduledFor: campaign.scheduledFor ? new Date(campaign.scheduledFor).toISOString().slice(0, 16) : '',
        status: campaign.status || 'draft'
      })
    }
  }, [isOpen, campaign])

  // Load templates when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email/templates')
      const data = await response.json()
      if (data.success) {
        setTemplates(data.data.templates)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const handleInputChange = (field: keyof CampaignFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    }

    if (formData.recipients <= 0) {
      newErrors.recipients = 'Recipients must be greater than 0'
    }

    if (formData.status === 'scheduled' && !formData.scheduledFor) {
      newErrors.scheduledFor = 'Scheduled date is required for scheduled campaigns'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!campaign?.id) return

    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/email/campaigns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: campaign.id,
          ...formData
        })
      })

      const data = await response.json()

      if (data.success) {
        if (onSuccess) {
          onSuccess(data.data.campaign)
        }
        
        onClose()
      } else {
        setErrors({ submit: data.error || 'Failed to update campaign' })
      }
    } catch (error) {
      console.error('Error updating campaign:', error)
      setErrors({ submit: 'An error occurred while updating the campaign' })
    } finally {
      setLoading(false)
    }
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

  if (!campaign) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Edit Email Campaign
          </DialogTitle>
          <DialogDescription>
            Update your email campaign settings and content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Campaign Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Welcome Series - Day 1"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Select value={formData.template} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template (optional)" />
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
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Enter your email content here..."
                  rows={8}
                  className={errors.content ? 'border-red-500' : ''}
                />
                {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Audience & Scheduling */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Audience & Scheduling</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipients">Number of Recipients *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="recipients"
                      type="number"
                      value={formData.recipients}
                      onChange={(e) => handleInputChange('recipients', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      className={errors.recipients ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleInputChange('recipients', 9999)}
                      className="whitespace-nowrap"
                    >
                      All Users
                    </Button>
                  </div>
                  {errors.recipients && <p className="text-sm text-red-500">{errors.recipients}</p>}
                  <p className="text-xs text-gray-500">
                    Enter 0 for draft, or use "All Users" to send to everyone
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Campaign Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: any) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="sending">Sending</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.status === 'scheduled' && (
                <div className="space-y-2">
                  <Label htmlFor="scheduledFor">Schedule Date & Time</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => handleInputChange('scheduledFor', e.target.value)}
                    className={errors.scheduledFor ? 'border-red-500' : ''}
                  />
                  {errors.scheduledFor && <p className="text-sm text-red-500">{errors.scheduledFor}</p>}
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Campaign Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold">{formData.subject || 'Email Subject'}</p>
                    <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
                      {formData.content || 'Email content will appear here...'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Error Display */}
          {errors.submit && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex space-x-2">
              {step > 1 ? (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  Previous
                </Button>
              ) : (
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              {step < 2 ? (
                <Button onClick={() => setStep(step + 1)}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Campaign'
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2">
            {[1, 2].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-3 h-3 rounded-full ${
                  stepNumber <= step ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
