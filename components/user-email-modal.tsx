'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Mail, Loader2 } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  joinDate: string
  lastLogin: string
  subscription: string
  creditScore: number
  phone: string
}

interface EmailModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (userId: string, emailData: any) => void
  user: User | null
}

export default function EmailModal({ isOpen, onClose, onSuccess, user }: EmailModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
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
      const response = await fetch(`/api/admin/users/${user.id}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert(`Email sent successfully to ${user.email}!`)
        onSuccess(user.id, formData)
        setFormData({
          subject: '',
          message: '',
          type: 'general'
        })
        onClose()
      } else {
        const errorData = await response.json()
        alert(`Failed to send email: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

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
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email-subject" className="text-right">Subject *</Label>
              <Input
                id="email-subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="col-span-3"
                placeholder="Email subject"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email-type" className="text-right">Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="email-message" className="text-right mt-2">Message *</Label>
              <Textarea
                id="email-message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="col-span-3"
                placeholder="Email message content"
                rows={6}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.subject || !formData.message}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Email'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
