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
import { Subscription } from '@/lib/subscription-service'
import { emailService } from '@/lib/email-service'
import { 
  Mail, 
  Send, 
  User, 
  FileText, 
  Paperclip,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Calendar,
  CreditCard
} from 'lucide-react'

interface EmailComposerModalProps {
  isOpen: boolean
  onClose: () => void
  subscription: Subscription | null
  onSend: (emailData: EmailData) => void
}

interface EmailData {
  to: string
  subject: string
  body: string
  template?: string
  includeSubscriptionDetails: boolean
  priority: 'normal' | 'high' | 'urgent'
  attachments?: string[]
}

const EMAIL_TEMPLATES = [
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
The Credit Repair Team`
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
The Credit Repair Team`
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
The Credit Repair Team`
  },
  {
    id: 'subscription_cancelled',
    name: 'Subscription Cancelled',
    subject: 'Subscription Cancelled - {planName}',
    body: `Hi {customerName},

Your {planName} subscription has been cancelled as requested.

Cancellation Details:
- Plan: {planName}
- Cancellation Date: {cancellationDate}
- Access Until: {accessUntil}

You will continue to have access to your account until the end of your current billing period.

If you have any questions or would like to reactivate your subscription, please contact us.

Best regards,
The Credit Repair Team`
  },
  {
    id: 'executive_welcome',
    name: 'Executive Welcome',
    subject: 'Welcome to Executive Plan - Premium Access Granted!',
    body: `Hi {customerName},

🎉 Congratulations! You've been granted Executive Plan access to our Credit Repair App.

As an Executive member, you now have:
- Unlimited access to all premium features
- Priority customer support
- Advanced credit monitoring tools
- Exclusive executive resources
- No monthly fees - completely FREE

Your Executive Benefits:
- Plan: Executive Plan (FREE)
- Status: Active
- Access Level: Premium Executive
- Support: Priority Executive Support

You can now access all premium features without any restrictions. Our executive support team is available to assist you with any questions or needs.

Welcome to the executive tier!

Best regards,
The Credit Repair Team`
  },
  {
    id: 'basic_welcome',
    name: 'Basic Welcome',
    subject: 'Welcome to Basic Plan - Get Started Today!',
    body: `Hi {customerName},

Welcome to our Basic Plan! We're excited to help you start your credit repair journey.

Your Basic Plan includes:
- Essential credit monitoring tools
- Basic dispute letter templates
- Monthly credit score tracking
- Email support
- Access to our knowledge base

Your Subscription Details:
- Plan: Basic Plan
- Amount: {amount}
- Billing Cycle: {billingCycle}
- Next Billing: {nextBillingDate}

You can upgrade to Premium or Executive plans anytime to unlock more features and priority support.

Best regards,
The Credit Repair Team`
  },
  {
    id: 'premium_welcome',
    name: 'Premium Welcome',
    subject: 'Welcome to Premium Plan - Advanced Features Unlocked!',
    body: `Hi {customerName},

Welcome to our Premium Plan! You now have access to our advanced credit repair tools and features.

Your Premium Plan includes:
- Advanced credit monitoring and alerts
- Premium dispute letter templates
- Weekly credit score tracking
- Priority email support
- Advanced analytics and reporting
- Custom credit repair strategies

Your Subscription Details:
- Plan: Premium Plan
- Amount: {amount}
- Billing Cycle: {billingCycle}
- Next Billing: {nextBillingDate}

You can upgrade to Executive plan anytime to unlock unlimited access and priority support.

Best regards,
The Credit Repair Team`
  },
  {
    id: 'pro_welcome',
    name: 'Pro Welcome',
    subject: 'Welcome to Pro Plan - Professional Tools Activated!',
    body: `Hi {customerName},

Welcome to our Pro Plan! You now have access to professional-grade credit repair tools.

Your Pro Plan includes:
- Professional credit monitoring suite
- Advanced dispute letter generation
- Daily credit score tracking
- Priority phone support
- Advanced analytics dashboard
- Professional credit repair strategies
- Credit bureau dispute tracking

Your Subscription Details:
- Plan: Pro Plan
- Amount: {amount}
- Billing Cycle: {billingCycle}
- Next Billing: {nextBillingDate}

You can upgrade to Executive plan anytime to unlock unlimited access and executive support.

Best regards,
The Credit Repair Team`
  },
  {
    id: 'enterprise_welcome',
    name: 'Enterprise Welcome',
    subject: 'Welcome to Enterprise Plan - Business Solutions Active!',
    body: `Hi {customerName},

Welcome to our Enterprise Plan! You now have access to our comprehensive business credit repair solutions.

Your Enterprise Plan includes:
- Enterprise-grade credit monitoring
- Bulk dispute letter generation
- Real-time credit score tracking
- Dedicated account manager
- Advanced business analytics
- White-label solutions
- API access for integrations
- Custom reporting and dashboards

Your Subscription Details:
- Plan: Enterprise Plan
- Amount: {amount}
- Billing Cycle: {billingCycle}
- Next Billing: {nextBillingDate}

Your dedicated account manager will contact you within 24 hours to set up your enterprise features.

Best regards,
The Credit Repair Team`
  },
  {
    id: 'custom',
    name: 'Custom Email',
    subject: '',
    body: ''
  }
]

export default function EmailComposerModal({
  isOpen,
  onClose,
  subscription
}: EmailComposerModalProps) {
  const [emailData, setEmailData] = useState<EmailData>({
    to: '',
    subject: '',
    body: '',
    template: '',
    includeSubscriptionDetails: true,
    priority: 'normal',
    attachments: []
  })
  const [sending, setSending] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewMode, setPreviewMode] = useState(false)

  React.useEffect(() => {
    if (subscription && isOpen) {
      // Determine the appropriate welcome template based on the subscription
      let welcomeTemplate = 'welcome' // Default fallback
      
      if (subscription.isExecutiveAccount) {
        welcomeTemplate = 'executive_welcome'
      } else {
        const planName = subscription.planName?.toLowerCase() || ''
        if (planName.includes('basic')) {
          welcomeTemplate = 'basic_welcome'
        } else if (planName.includes('premium')) {
          welcomeTemplate = 'premium_welcome'
        } else if (planName.includes('pro')) {
          welcomeTemplate = 'pro_welcome'
        } else if (planName.includes('enterprise')) {
          welcomeTemplate = 'enterprise_welcome'
        } else if (planName.includes('executive')) {
          welcomeTemplate = 'executive_welcome'
        }
      }

      // Auto-select the appropriate welcome template
      const template = EMAIL_TEMPLATES.find(t => t.id === welcomeTemplate)
      if (template) {
        const processedSubject = processTemplate(template.subject)
        const processedBody = processTemplate(template.body)
        
        setEmailData(prev => ({
          ...prev,
          to: subscription.customerEmail,
          template: welcomeTemplate,
          subject: processedSubject,
          body: processedBody
        }))
      } else {
        // Fallback to basic welcome if template not found
        setEmailData(prev => ({
          ...prev,
          to: subscription.customerEmail,
          template: 'welcome'
        }))
      }
    }
  }, [subscription, isOpen])

  const handleTemplateChange = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      const processedSubject = processTemplate(template.subject)
      const processedBody = processTemplate(template.body)
      
      setEmailData(prev => ({
        ...prev,
        template: templateId,
        subject: processedSubject,
        body: processedBody
      }))
    }
  }

  const processTemplate = (text: string) => {
    if (!subscription) return text
    
    return text
      .replace(/{customerName}/g, subscription.customerName)
      .replace(/{planName}/g, subscription.planName)
      .replace(/{billingCycle}/g, subscription.billingCycle)
      .replace(/{paymentMethod}/g, subscription.paymentMethod)
      .replace(/{amount}/g, `$${subscription.amount}`)
      .replace(/{nextBillingDate}/g, subscription.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : 'N/A')
      .replace(/{cancellationDate}/g, new Date().toLocaleDateString())
      .replace(/{accessUntil}/g, subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A')
  }

  const validateEmail = () => {
    const newErrors: Record<string, string> = {}

    if (!emailData.to.trim()) {
      newErrors.to = 'Recipient email is required'
    } else if (!/\S+@\S+\.\S+/.test(emailData.to)) {
      newErrors.to = 'Please enter a valid email address'
    }
    if (!emailData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }
    if (!emailData.body.trim()) {
      newErrors.body = 'Email body is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSend = async () => {
    if (!validateEmail()) {
      return
    }

    setSending(true)
    try {
      console.log('📧 Sending email:', {
        to: emailData.to,
        subject: emailData.subject,
        template: emailData.template,
        priority: emailData.priority
      })

      // Use the email service to send the email
      const result = await emailService.sendEmail({
        to: emailData.to,
        subject: emailData.subject,
        body: getFinalBody(),
        template: emailData.template,
        priority: emailData.priority
      })

      if (result.success) {
        console.log('📧 Email sent successfully:', result.messageId)
        alert(`Email sent successfully to ${emailData.to}!`)
        onClose()
      } else {
        console.error('📧 Email sending failed:', result.error)
        alert(`Failed to send email: ${result.error}`)
      }
    } catch (error) {
      console.error('📧 Email sending error:', error)
      alert(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSending(false)
    }
  }

  const getSubscriptionDetails = () => {
    if (!subscription) return ''
    
    return `
Subscription Details:
- Customer: ${subscription.customerName}
- Plan: ${subscription.planName}
- Amount: $${subscription.amount}
- Billing Cycle: ${subscription.billingCycle}
- Status: ${subscription.status}
- Next Billing: ${subscription.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : 'N/A'}
- Payment Method: ${subscription.paymentMethod}
- Subscription ID: ${subscription.id}
`
  }

  const getFinalBody = () => {
    let body = emailData.body
    if (emailData.includeSubscriptionDetails) {
      body += '\n\n' + getSubscriptionDetails()
    }
    return body
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Compose Email
          </DialogTitle>
          <DialogDescription>
            Send an email to {subscription?.customerName || 'customer'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Email Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={emailData.template} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an email template" />
                </SelectTrigger>
                <SelectContent>
                  {EMAIL_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Email Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    value={emailData.to}
                    onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="customer@example.com"
                  />
                  {errors.to && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {errors.to}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={emailData.priority} onValueChange={(value: any) => setEmailData(prev => ({ ...prev, priority: value }))}>
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

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject"
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> {errors.subject}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  value={emailData.body}
                  onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Type your message here..."
                  rows={8}
                />
                {errors.body && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> {errors.body}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="includeSubscriptionDetails"
                  checked={emailData.includeSubscriptionDetails}
                  onCheckedChange={(checked) => setEmailData(prev => ({ ...prev, includeSubscriptionDetails: checked }))}
                />
                <Label htmlFor="includeSubscriptionDetails">
                  Include subscription details in email
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Email Preview
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode ? 'Edit' : 'Preview'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {previewMode ? (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="space-y-2 mb-4">
                    <div><strong>To:</strong> {emailData.to}</div>
                    <div><strong>Subject:</strong> {emailData.subject}</div>
                    <div><strong>Priority:</strong> <Badge variant="outline">{emailData.priority}</Badge></div>
                  </div>
                  <div className="whitespace-pre-wrap text-sm">
                    {getFinalBody()}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  Click "Preview" to see how the email will look to the recipient.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
