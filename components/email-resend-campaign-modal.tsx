'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Mail, 
  Send, 
  Users,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface ResendCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (campaign: any) => void
  campaign: any | null
}

interface ResendFormData {
  resendType: 'same_audience' | 'new_audience' | 'custom'
  recipients: number
  scheduledFor: string
  status: 'immediate' | 'scheduled'
}

export default function ResendCampaignModal({ isOpen, onClose, onSuccess, campaign }: ResendCampaignModalProps) {
  const [formData, setFormData] = useState<ResendFormData>({
    resendType: 'same_audience',
    recipients: 0,
    scheduledFor: '',
    status: 'immediate'
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof ResendFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.resendType === 'new_audience' && formData.recipients <= 0) {
      newErrors.recipients = 'Number of recipients must be greater than 0'
    }

    if (formData.status === 'scheduled' && !formData.scheduledFor) {
      newErrors.scheduledFor = 'Scheduled date is required for scheduled resends'
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
      let updateData: any = {
        status: 'sending'
      }

      // Handle different resend types
      if (formData.resendType === 'new_audience') {
        updateData.recipients = formData.recipients
        updateData.sent = 0
        updateData.opened = 0
        updateData.clicked = 0
      }

      if (formData.status === 'scheduled') {
        updateData.status = 'scheduled'
        updateData.scheduledFor = formData.scheduledFor
      }

      const response = await fetch('/api/admin/email/campaigns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: campaign.id,
          ...updateData
        })
      })

      const data = await response.json()

      if (data.success) {
        if (onSuccess) {
          onSuccess(data.data.campaign)
        }
        
        // Reset form
        setFormData({
          resendType: 'same_audience',
          recipients: 0,
          scheduledFor: '',
          status: 'immediate'
        })
        setErrors({})
        onClose()
      } else {
        setErrors({ submit: data.error || 'Failed to resend campaign' })
      }
    } catch (error) {
      console.error('Error resending campaign:', error)
      setErrors({ submit: 'An error occurred while resending the campaign' })
    } finally {
      setLoading(false)
    }
  }

  if (!campaign) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Resend Campaign
          </DialogTitle>
          <DialogDescription>
            Resend "{campaign.name}" to your audience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold">{campaign.subject}</p>
                <div className="text-sm text-gray-600 max-h-20 overflow-y-auto">
                  {campaign.content}
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Originally sent to: {campaign.recipients} recipients</span>
                  <span>Opens: {campaign.opened}</span>
                  <span>Clicks: {campaign.clicked}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resend Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resend Options</h3>
            
            <div className="space-y-4">
              <Label className="text-sm font-medium">Resend Type</Label>
              <RadioGroup
                value={formData.resendType}
                onValueChange={(value: any) => handleInputChange('resendType', value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="same_audience" id="same_audience" />
                  <Label htmlFor="same_audience" className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Same Audience</div>
                        <div className="text-sm text-gray-500">Resend to the same {campaign.recipients} recipients</div>
                      </div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new_audience" id="new_audience" />
                  <Label htmlFor="new_audience" className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <div>
                        <div className="font-medium">New Audience</div>
                        <div className="text-sm text-gray-500">Resend to a different number of recipients</div>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {formData.resendType === 'new_audience' && (
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
                </div>
              )}

              <div className="space-y-4">
                <Label className="text-sm font-medium">Send Timing</Label>
                <RadioGroup
                  value={formData.status}
                  onValueChange={(value: any) => handleInputChange('status', value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="immediate" id="immediate" />
                    <Label htmlFor="immediate" className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Send className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Send Immediately</div>
                          <div className="text-sm text-gray-500">Resend the campaign right now</div>
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="scheduled" id="scheduled" />
                    <Label htmlFor="scheduled" className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Schedule for Later</div>
                          <div className="text-sm text-gray-500">Resend at a specific date and time</div>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

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
              </div>
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
                  Resending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Resend Campaign
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
