'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { userService, type User } from '@/lib/user-service'
import { 
  Mail, 
  User, 
  Send,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface EmailModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (userId: string, emailData: any) => void
  user: User | null
}

interface EmailFormData {
  subject: string
  message: string
  type: string
}

const EMAIL_TYPES = [
  { id: 'general', name: 'General', description: 'General communication' },
  { id: 'notification', name: 'Notification', description: 'System notification' },
  { id: 'marketing', name: 'Marketing', description: 'Marketing communication' },
  { id: 'support', name: 'Support', description: 'Customer support' },
  { id: 'billing', name: 'Billing', description: 'Billing related' }
]

export default function EmailModal({ isOpen, onClose, onSuccess, user }: EmailModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<EmailFormData>({
    subject: '',
    message: '',
    type: 'general'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.subject || !formData.message) {
      alert('Subject and message are required')
      return
    }

    if (!user) return

    setLoading(true)
    
    try {
      console.log('Sending email to user:', user.id, formData)
      const response = await userService.sendEmailToUser(user.id, formData)
      
      if (response.success) {
        console.log('Email sent successfully')
        alert(`Email sent successfully to ${user.email}!`)
        onSuccess?.(user.id, formData)
        setFormData({
          subject: '',
          message: '',
          type: 'general'
        })
        onClose()
      } else {
        console.error('Failed to send email:', response.error)
        alert(`Failed to send email: ${response.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof EmailFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const selectedType = EMAIL_TYPES.find(type => type.id === formData.type)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Email
          </DialogTitle>
          <DialogDescription>
            Send an email to {user?.name} ({user?.email})
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 py-4">
            {/* Recipient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recipient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                    <div className="text-xs text-gray-400">Role: {user?.role} | Status: {user?.status}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-subject">Subject *</Label>
                  <Input
                    id="email-subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Enter email subject"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-type">Email Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMAIL_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} - {type.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-message">Message *</Label>
                  <Textarea
                    id="email-message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Enter your message here..."
                    rows={6}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Email Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">To:</span>
                    <span className="font-medium">{user?.name} &lt;{user?.email}&gt;</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Subject:</span>
                    <span className="font-medium">{formData.subject || 'No subject'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="font-medium">{selectedType?.name || 'General'}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-gray-600">Message Preview:</span>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                      {formData.message || 'No message content'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.subject || !formData.message}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Email...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}