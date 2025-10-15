interface EmailData {
  to: string
  subject: string
  body: string
  template?: string
  priority?: 'normal' | 'high' | 'urgent'
  from?: string
}

interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
  details?: string
}

class EmailService {
  private baseUrl: string

  constructor() {
    // Use window.location.origin for client-side, fallback to env var for server-side
    if (typeof window !== 'undefined') {
      this.baseUrl = window.location.origin
    } else {
      this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }
  }

  // Get the appropriate welcome template based on subscription plan
  getWelcomeTemplateForPlan(planName: string, isExecutiveAccount: boolean = false): string {
    if (isExecutiveAccount) {
      return 'executive_welcome'
    }

    const plan = planName.toLowerCase()
    
    if (plan.includes('basic')) {
      return 'basic_welcome'
    } else if (plan.includes('premium')) {
      return 'premium_welcome'
    } else if (plan.includes('pro')) {
      return 'pro_welcome'
    } else if (plan.includes('enterprise')) {
      return 'enterprise_welcome'
    } else if (plan.includes('executive')) {
      return 'executive_welcome'
    }
    
    // Default to basic welcome for unknown plans
    return 'basic_welcome'
  }

  async sendEmail(emailData: EmailData): Promise<EmailResponse> {
    try {
      console.log('📧 EmailService: Sending email to', emailData.to)
      console.log('📧 EmailService: Base URL', this.baseUrl)
      console.log('📧 EmailService: Full URL', `${this.baseUrl}/api/email/send`)

      const response = await fetch(`${this.baseUrl}/api/email/send`, {
      method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify({ 
          to: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          template: emailData.template,
          priority: emailData.priority || 'normal',
          from: emailData.from
        })
      })

      console.log('📧 EmailService: Response status', response.status)
      console.log('📧 EmailService: Response ok', response.ok)

      const result = await response.json()
      console.log('📧 EmailService: Response result', result)

      if (result.success) {
        console.log('📧 EmailService: Email sent successfully', result.data)
        return {
          success: true,
          messageId: result.data.messageId
        }
    } else {
        console.error('📧 EmailService: Email sending failed', result.error)
        return {
          success: false,
          error: result.error,
          details: result.details
        }
    }
  } catch (error) {
      console.error('📧 EmailService: Email sending error', error)
      console.error('📧 EmailService: Error details', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        baseUrl: this.baseUrl
      })
      return {
        success: false,
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Template-based email sending
  async sendTemplateEmail(
    to: string, 
    template: string, 
    variables: Record<string, any> = {},
    priority: 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<EmailResponse> {
    const templates = {
      welcome: {
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
      billing_reminder: {
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
      payment_failed: {
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
      grace_period_notification: {
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
The Credit Repair Team`
      },
      executive_welcome: {
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
      basic_welcome: {
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
      premium_welcome: {
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
      pro_welcome: {
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
      enterprise_welcome: {
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
      }
    }

    const templateData = templates[template as keyof typeof templates]
    if (!templateData) {
      return {
        success: false,
        error: `Template '${template}' not found`
      }
    }

    // Replace variables in template
    let subject = templateData.subject
    let body = templateData.body

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value))
      body = body.replace(new RegExp(placeholder, 'g'), String(value))
    })

    return this.sendEmail({
      to,
      subject,
      body,
      template,
      priority
    })
  }

  // Bulk email sending
  async sendBulkEmails(
    emails: Array<{ to: string; subject: string; body: string }>,
    priority: 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = await Promise.allSettled(
      emails.map(email => this.sendEmail({ ...email, priority }))
    )

    let success = 0
    let failed = 0
    const errors: string[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        success++
      } else {
        failed++
        const error = result.status === 'rejected' 
          ? result.reason 
          : result.value.error || 'Unknown error'
        errors.push(`Email ${index + 1} (${emails[index].to}): ${error}`)
      }
    })

    return { success, failed, errors }
  }
}

export const emailService = new EmailService()
export type { EmailData, EmailResponse }