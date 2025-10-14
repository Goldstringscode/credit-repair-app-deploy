import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { 
  Mail, 
  Users, 
  Send, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { Subscription } from '@/lib/subscription-service'

interface BulkEmailModalProps {
  isOpen: boolean
  onClose: () => void
  subscriptions: Subscription[]
  selectedSubscriptions?: Subscription[]
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to {planName}!',
    body: `Hi {customerName},

Welcome to {planName}! We're excited to have you on board.

Your subscription details:
- Plan: {planName}
- Amount: {amount}
- Billing Cycle: {billingCycle}
- Next Billing: {nextBillingDate}

If you have any questions, please don't hesitate to reach out to our support team.

Best regards,
The Credit Repair Team`,
    variables: ['customerName', 'planName', 'amount', 'billingCycle', 'nextBillingDate']
  },
  {
    id: 'billing_reminder',
    name: 'Billing Reminder',
    subject: 'Upcoming Payment - {planName}',
    body: `Hi {customerName},

This is a friendly reminder that your next payment for {planName} is due on {nextBillingDate}.

Payment Details:
- Amount: {amount}
- Payment Method: {paymentMethod}
- Plan: {planName}

If you need to update your payment method or have any questions, please contact us.

Best regards,
The Credit Repair Team`,
    variables: ['customerName', 'planName', 'amount', 'paymentMethod', 'nextBillingDate']
  },
  {
    id: 'payment_failed',
    name: 'Payment Failed',
    subject: 'Payment Failed - Action Required',
    body: `Hi {customerName},

We were unable to process your payment for {planName}.

Payment Details:
- Amount: {amount}
- Payment Method: {paymentMethod}
- Date: {nextBillingDate}

Please update your payment method to continue your subscription. You can do this by logging into your account or contacting our support team.

Best regards,
The Credit Repair Team`,
    variables: ['customerName', 'planName', 'amount', 'paymentMethod', 'nextBillingDate']
  },
  {
    id: 'grace_period_notification',
    name: 'Grace Period Notification',
    subject: 'Grace Period - Payment Method Update Required',
    body: `Hi {customerName},

Your executive account has been converted to a regular subscription. You have {daysRemaining} days remaining in your grace period.

To continue your subscription without interruption, please update your payment method within the next 7 days.

Current Status:
- Plan: {planName}
- Amount: {amount}
- Grace Period Ends: {gracePeriodEndDate}
- Days Remaining: {daysRemaining}

Please log into your account to update your payment method.

Best regards,
The Credit Repair Team`,
    variables: ['customerName', 'planName', 'amount', 'gracePeriodEndDate', 'daysRemaining']
  }
]

export default function BulkEmailModal({
  isOpen,
  onClose,
  subscriptions,
  selectedSubscriptions = []
}: BulkEmailModalProps) {
  const [emailData, setEmailData] = useState({
    subject: '',
    body: '',
    template: '',
    priority: 'normal' as 'normal' | 'high' | 'urgent',
    includeSubscriptionDetails: true,
    personalizeEmails: true
  })
  
  const [recipients, setRecipients] = useState<Subscription[]>(selectedSubscriptions)
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{
    sent: number
    failed: number
    errors: string[]
  }>({ sent: 0, failed: 0, errors: [] })
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleTemplateChange = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setEmailData(prev => ({
        ...prev,
        template: templateId,
        subject: template.subject,
        body: template.body
      }))
    }
  }

  const handleAddRecipients = (subscriptionIds: string[]) => {
    const newRecipients = subscriptions.filter(sub => 
      subscriptionIds.includes(sub.id) && !recipients.find(r => r.id === sub.id)
    )
    setRecipients(prev => [...prev, ...newRecipients])
  }

  const handleRemoveRecipient = (subscriptionId: string) => {
    setRecipients(prev => prev.filter(r => r.id !== subscriptionId))
  }

  const handleAddAll = () => {
    setRecipients(subscriptions)
  }

  const handleClearAll = () => {
    setRecipients([])
  }

  const validateEmail = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!emailData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }

    if (!emailData.body.trim()) {
      newErrors.body = 'Email body is required'
    }

    if (recipients.length === 0) {
      newErrors.recipients = 'At least one recipient is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getPersonalizedContent = (subscription: Subscription) => {
    let subject = emailData.subject
    let body = emailData.body

    if (emailData.personalizeEmails) {
      // Replace variables with actual subscription data
      const variables = {
        customerName: subscription.customerName,
        customerEmail: subscription.customerEmail,
        planName: subscription.planName,
        amount: subscription.amount,
        billingCycle: subscription.billingCycle,
        nextBillingDate: subscription.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : 'N/A',
        paymentMethod: subscription.paymentMethod,
        gracePeriodEndDate: subscription.gracePeriodEndDate ? new Date(subscription.gracePeriodEndDate).toLocaleDateString() : 'N/A',
        daysRemaining: subscription.gracePeriodDaysRemaining || 0
      }

      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{${key}}`
        subject = subject.replace(new RegExp(placeholder, 'g'), String(value))
        body = body.replace(new RegExp(placeholder, 'g'), String(value))
      })
    }

    if (emailData.includeSubscriptionDetails) {
      body += `\n\nSubscription Details:
- Customer: ${subscription.customerName}
- Plan: ${subscription.planName}
- Amount: $${subscription.amount}
- Billing Cycle: ${subscription.billingCycle}
- Status: ${subscription.status}
- Next Billing: ${subscription.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : 'N/A'}
- Payment Method: ${subscription.paymentMethod}
- Subscription ID: ${subscription.id}`
    }

    return { subject, body }
  }

  const handleSendBulkEmail = async () => {
    if (!validateEmail()) {
      return
    }

    setSending(true)
    setProgress(0)
    setResults({ sent: 0, failed: 0, errors: [] })

    try {
      console.log('Preparing bulk emails for', recipients.length, 'recipients')
      
      // Simulate bulk email sending for now
      let sent = 0
      let failed = 0
      const errors: string[] = []

      for (let i = 0; i < recipients.length; i++) {
        const subscription = recipients[i]
        const { subject, body } = getPersonalizedContent(subscription)
        
        try {
          // Simulate individual email sending
          await new Promise(resolve => setTimeout(resolve, 500))
          
          console.log(`Sending email to ${subscription.customerEmail}: ${subject}`)
          sent++
        } catch (error) {
          console.error(`Failed to send email to ${subscription.customerEmail}:`, error)
          failed++
          errors.push(`Failed to send to ${subscription.customerEmail}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
        
        // Update progress
        setProgress(Math.round(((i + 1) / recipients.length) * 100))
      }

      setResults({
        sent,
        failed,
        errors
      })

      if (sent > 0) {
        alert(`Bulk email completed! ${sent} emails sent, ${failed} failed.`)
      } else {
        alert(`Failed to send bulk emails. ${errors.join(', ')}`)
      }

    } catch (error) {
      console.error('Error sending bulk emails:', error)
      alert(`Error sending bulk emails: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSending(false)
    }
  }

  const handlePreview = () => {
    if (recipients.length > 0) {
      setShowPreview(true)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Bulk Email
            <Badge variant="secondary">{recipients.length} recipients</Badge>
          </DialogTitle>
          <DialogDescription>
            Send emails to multiple customers at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Email Template</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={emailData.template} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template or create custom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Custom Email</SelectItem>
                  {EMAIL_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Email Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Email Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={emailData.subject}
                    onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Email subject"
                  />
                  {errors.subject && <p className="text-sm text-red-600">{errors.subject}</p>}
                </div>

                <div>
                  <Label htmlFor="body">Message</Label>
                  <Textarea
                    id="body"
                    value={emailData.body}
                    onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Email message"
                    rows={8}
                  />
                  {errors.body && <p className="text-sm text-red-600">{errors.body}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="personalize"
                    checked={emailData.personalizeEmails}
                    onCheckedChange={(checked) => setEmailData(prev => ({ ...prev, personalizeEmails: checked }))}
                  />
                  <Label htmlFor="personalize">Personalize emails with customer data</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeDetails"
                    checked={emailData.includeSubscriptionDetails}
                    onCheckedChange={(checked) => setEmailData(prev => ({ ...prev, includeSubscriptionDetails: checked }))}
                  />
                  <Label htmlFor="includeDetails">Include subscription details</Label>
                </div>
              </CardContent>
            </Card>

            {/* Recipients */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recipients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleAddAll}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearAll}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2">
                  {recipients.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{subscription.customerName}</p>
                        <p className="text-xs text-gray-600">{subscription.customerEmail}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRecipient(subscription.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {errors.recipients && <p className="text-sm text-red-600">{errors.recipients}</p>}
              </CardContent>
            </Card>
          </div>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Email Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={emailData.priority}
                    onValueChange={(value: 'normal' | 'high' | 'urgent') => 
                      setEmailData(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress and Results */}
          {sending && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sending Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sending emails...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {results.sent > 0 || results.failed > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>{results.sent} emails sent successfully</span>
                  </div>
                  {results.failed > 0 && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{results.failed} emails failed</span>
                    </div>
                  )}
                  {results.errors.length > 0 && (
                    <div className="text-sm text-red-600">
                      <p className="font-medium">Errors:</p>
                      <ul className="list-disc list-inside">
                        {results.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSendBulkEmail} disabled={sending}>
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to {recipients.length} recipients
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
