export interface DunningEmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  variables: string[]
  priority: 'low' | 'medium' | 'high'
  category: 'payment_failed' | 'payment_retry' | 'final_notice' | 'subscription_suspended' | 'subscription_canceled'
}

export class DunningEmailTemplates {
  private templates: Map<string, DunningEmailTemplate> = new Map()

  constructor() {
    this.initializeTemplates()
  }

  private initializeTemplates(): void {
    const templates: DunningEmailTemplate[] = [
      {
        id: 'payment_failed_1',
        name: 'First Payment Failure',
        subject: 'Payment Failed - Action Required',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Payment Failed - Action Required</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .content { padding: 20px 0; }
              .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
              .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Payment Failed - Action Required</h1>
              </div>
              <div class="content">
                <p>Dear {{customerName}},</p>
                
                <div class="alert">
                  <strong>Important:</strong> We were unable to process your payment for your {{planName}} subscription.
                </div>
                
                <p>We attempted to charge your payment method on {{paymentDate}} for the amount of {{amount}}, but the payment failed.</p>
                
                <p><strong>What you need to do:</strong></p>
                <ul>
                  <li>Update your payment method in your account settings</li>
                  <li>Ensure sufficient funds are available</li>
                  <li>Check that your card hasn't expired</li>
                </ul>
                
                <p>We'll automatically retry your payment in {{nextRetryDays}} days. If the payment continues to fail, your subscription may be suspended.</p>
                
                <a href="{{updatePaymentUrl}}" class="button">Update Payment Method</a>
                
                <p>If you have any questions or need assistance, please contact our support team.</p>
                
                <p>Thank you for your continued business.</p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>© 2024 Credit Repair Pro. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: `
          Payment Failed - Action Required
          
          Dear {{customerName}},
          
          IMPORTANT: We were unable to process your payment for your {{planName}} subscription.
          
          We attempted to charge your payment method on {{paymentDate}} for the amount of {{amount}}, but the payment failed.
          
          What you need to do:
          - Update your payment method in your account settings
          - Ensure sufficient funds are available
          - Check that your card hasn't expired
          
          We'll automatically retry your payment in {{nextRetryDays}} days. If the payment continues to fail, your subscription may be suspended.
          
          Update Payment Method: {{updatePaymentUrl}}
          
          If you have any questions or need assistance, please contact our support team.
          
          Thank you for your continued business.
          
          This is an automated message. Please do not reply to this email.
          © 2024 Credit Repair Pro. All rights reserved.
        `,
        variables: ['customerName', 'planName', 'paymentDate', 'amount', 'nextRetryDays', 'updatePaymentUrl'],
        priority: 'high',
        category: 'payment_failed'
      },
      {
        id: 'payment_failed_2',
        name: 'Second Payment Failure',
        subject: 'Payment Failed - Final Notice',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Payment Failed - Final Notice</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .content { padding: 20px 0; }
              .button { display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
              .alert { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⚠️ Payment Failed - Final Notice</h1>
              </div>
              <div class="content">
                <p>Dear {{customerName}},</p>
                
                <div class="alert">
                  <strong>URGENT:</strong> This is your final notice regarding the failed payment for your {{planName}} subscription.
                </div>
                
                <p>We have attempted to process your payment {{attemptNumber}} times without success. The most recent attempt was on {{paymentDate}} for {{amount}}.</p>
                
                <p><strong>Immediate action required:</strong></p>
                <ul>
                  <li>Update your payment method immediately</li>
                  <li>Contact your bank to ensure the card is active</li>
                  <li>Verify billing address matches your card</li>
                </ul>
                
                <p>If we don't receive payment within {{nextRetryDays}} days, your subscription will be suspended and you'll lose access to all premium features.</p>
                
                <a href="{{updatePaymentUrl}}" class="button">Update Payment Method Now</a>
                
                <p>If you're experiencing financial difficulties, please contact our support team to discuss payment options.</p>
                
                <p>We value your business and want to help you maintain your subscription.</p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>© 2024 Credit Repair Pro. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: `
          Payment Failed - Final Notice
          
          Dear {{customerName}},
          
          URGENT: This is your final notice regarding the failed payment for your {{planName}} subscription.
          
          We have attempted to process your payment {{attemptNumber}} times without success. The most recent attempt was on {{paymentDate}} for {{amount}}.
          
          Immediate action required:
          - Update your payment method immediately
          - Contact your bank to ensure the card is active
          - Verify billing address matches your card
          
          If we don't receive payment within {{nextRetryDays}} days, your subscription will be suspended and you'll lose access to all premium features.
          
          Update Payment Method: {{updatePaymentUrl}}
          
          If you're experiencing financial difficulties, please contact our support team to discuss payment options.
          
          We value your business and want to help you maintain your subscription.
          
          This is an automated message. Please do not reply to this email.
          © 2024 Credit Repair Pro. All rights reserved.
        `,
        variables: ['customerName', 'planName', 'attemptNumber', 'paymentDate', 'amount', 'nextRetryDays', 'updatePaymentUrl'],
        priority: 'high',
        category: 'payment_failed'
      },
      {
        id: 'payment_failed_3',
        name: 'Final Payment Failure',
        subject: 'Subscription Suspended - Payment Required',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Subscription Suspended - Payment Required</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc3545; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .content { padding: 20px 0; }
              .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
              .alert { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚫 Subscription Suspended</h1>
              </div>
              <div class="content">
                <p>Dear {{customerName}},</p>
                
                <div class="alert">
                  <strong>NOTICE:</strong> Your {{planName}} subscription has been suspended due to payment failure.
                </div>
                
                <p>After {{maxAttempts}} failed payment attempts, we have suspended your subscription effective immediately.</p>
                
                <p><strong>What this means:</strong></p>
                <ul>
                  <li>You no longer have access to premium features</li>
                  <li>Your account data is preserved</li>
                  <li>You can reactivate by updating your payment method</li>
                </ul>
                
                <p>To reactivate your subscription:</p>
                <ol>
                  <li>Update your payment method</li>
                  <li>We'll process the payment immediately</li>
                  <li>Your access will be restored</li>
                </ol>
                
                <a href="{{updatePaymentUrl}}" class="button">Reactivate Subscription</a>
                
                <p>If you don't take action within {{gracePeriodDays}} days, your subscription will be permanently canceled and your data may be deleted.</p>
                
                <p>We're here to help if you need assistance.</p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>© 2024 Credit Repair Pro. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: `
          Subscription Suspended - Payment Required
          
          Dear {{customerName}},
          
          NOTICE: Your {{planName}} subscription has been suspended due to payment failure.
          
          After {{maxAttempts}} failed payment attempts, we have suspended your subscription effective immediately.
          
          What this means:
          - You no longer have access to premium features
          - Your account data is preserved
          - You can reactivate by updating your payment method
          
          To reactivate your subscription:
          1. Update your payment method
          2. We'll process the payment immediately
          3. Your access will be restored
          
          Reactivate Subscription: {{updatePaymentUrl}}
          
          If you don't take action within {{gracePeriodDays}} days, your subscription will be permanently canceled and your data may be deleted.
          
          We're here to help if you need assistance.
          
          This is an automated message. Please do not reply to this email.
          © 2024 Credit Repair Pro. All rights reserved.
        `,
        variables: ['customerName', 'planName', 'maxAttempts', 'updatePaymentUrl', 'gracePeriodDays'],
        priority: 'high',
        category: 'subscription_suspended'
      },
      {
        id: 'subscription_canceled',
        name: 'Subscription Canceled',
        subject: 'Subscription Canceled - Data Retention Notice',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Subscription Canceled</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #6c757d; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .content { padding: 20px 0; }
              .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Subscription Canceled</h1>
              </div>
              <div class="content">
                <p>Dear {{customerName}},</p>
                
                <p>Your {{planName}} subscription has been permanently canceled due to persistent payment failures.</p>
                
                <p><strong>Important information:</strong></p>
                <ul>
                  <li>Your account data will be retained for {{dataRetentionDays}} days</li>
                  <li>You can reactivate your subscription at any time</li>
                  <li>All premium features are now disabled</li>
                </ul>
                
                <p>If you'd like to reactivate your subscription, please contact our support team or visit your account settings.</p>
                
                <a href="{{reactivateUrl}}" class="button">Reactivate Subscription</a>
                
                <p>Thank you for being a valued customer. We hope to serve you again in the future.</p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>© 2024 Credit Repair Pro. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: `
          Subscription Canceled
          
          Dear {{customerName}},
          
          Your {{planName}} subscription has been permanently canceled due to persistent payment failures.
          
          Important information:
          - Your account data will be retained for {{dataRetentionDays}} days
          - You can reactivate your subscription at any time
          - All premium features are now disabled
          
          If you'd like to reactivate your subscription, please contact our support team or visit your account settings.
          
          Reactivate Subscription: {{reactivateUrl}}
          
          Thank you for being a valued customer. We hope to serve you again in the future.
          
          This is an automated message. Please do not reply to this email.
          © 2024 Credit Repair Pro. All rights reserved.
        `,
        variables: ['customerName', 'planName', 'dataRetentionDays', 'reactivateUrl'],
        priority: 'medium',
        category: 'subscription_canceled'
      }
    ]

    templates.forEach(template => {
      this.templates.set(template.id, template)
    })
  }

  /**
   * Get email template by ID
   */
  getTemplate(templateId: string): DunningEmailTemplate | null {
    return this.templates.get(templateId) || null
  }

  /**
   * Get all templates
   */
  getAllTemplates(): DunningEmailTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): DunningEmailTemplate[] {
    return Array.from(this.templates.values()).filter(template => template.category === category)
  }

  /**
   * Render email template with variables
   */
  renderTemplate(templateId: string, variables: Record<string, string>): { subject: string; htmlContent: string; textContent: string } | null {
    const template = this.getTemplate(templateId)
    if (!template) return null

    let subject = template.subject
    let htmlContent = template.htmlContent
    let textContent = template.textContent

    // Replace variables in all content
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      subject = subject.replace(regex, value)
      htmlContent = htmlContent.replace(regex, value)
      textContent = textContent.replace(regex, value)
    })

    return { subject, htmlContent, textContent }
  }
}

// Export singleton instance
export const dunningEmailTemplates = new DunningEmailTemplates()


