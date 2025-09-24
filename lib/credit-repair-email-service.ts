"use client"

import { sendCreditRepairTemplateEmail } from './email-service'
import { creditRepairEmailTemplates } from './credit-repair-email-templates-beautiful'
import { CreditRepairEmailTemplate } from './credit-repair-email-templates'

export interface CreditRepairEmailSendData {
  templateId: string
  to: string
  variables: Record<string, string>
}

export class CreditRepairEmailService {
  private static instance: CreditRepairEmailService
  private allTemplates: CreditRepairEmailTemplate[]

  constructor() {
    this.allTemplates = [...creditRepairEmailTemplates, ...additionalCreditRepairTemplates]
  }

  static getInstance(): CreditRepairEmailService {
    if (!CreditRepairEmailService.instance) {
      CreditRepairEmailService.instance = new CreditRepairEmailService()
    }
    return CreditRepairEmailService.instance
  }

  getTemplateById(templateId: string): CreditRepairEmailTemplate | undefined {
    return this.allTemplates.find(template => template.id === templateId)
  }

  getTemplatesByCategory(category: string): CreditRepairEmailTemplate[] {
    return this.allTemplates.filter(template => template.category === category)
  }

  getAllTemplates(): CreditRepairEmailTemplate[] {
    return this.allTemplates
  }

  async sendTemplateEmail(data: CreditRepairEmailSendData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.getTemplateById(data.templateId)
      if (!template) {
        throw new Error(`Template with ID ${data.templateId} not found`)
      }

      // Replace variables in subject and content
      let subject = template.subject
      let htmlContent = template.htmlContent
      let textContent = template.textContent

      // Replace all template variables
      template.variables.forEach(variable => {
        const value = data.variables[variable] || `{{${variable}}}`
        const regex = new RegExp(`{{${variable}}}`, 'g')
        subject = subject.replace(regex, value)
        htmlContent = htmlContent.replace(regex, value)
        textContent = textContent.replace(regex, value)
      })

      // Send the email using the new template email function
      const result = await sendCreditRepairTemplateEmail({
        to: data.to,
        subject,
        htmlContent,
        textContent
      })

      return {
        success: true,
        messageId: result.messageId
      }
    } catch (error) {
      console.error('Error sending credit repair email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async sendTestEmail(templateId: string, to: string, testData: Record<string, string>): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTemplateEmail({
      templateId,
      to,
      variables: testData
    })
  }

  // Get default test data for a template
  getDefaultTestData(template: CreditRepairEmailTemplate): Record<string, string> {
    const defaultData: Record<string, string> = {
      userName: 'John Doe',
      userEmail: 'test@example.com',
      dashboardUrl: 'https://app.creditai.com/dashboard',
      profileSetupUrl: 'https://app.creditai.com/onboarding/profile',
      disputeType: 'Incorrect Account Information',
      creditBureau: 'Experian',
      accountName: 'Credit Card Account #1234',
      generatedDate: new Date().toLocaleDateString(),
      disputeLetterUrl: 'https://app.creditai.com/disputes/letter/123',
      scoreIncrease: '25',
      previousScore: '650',
      currentScore: '675',
      updateDate: new Date().toLocaleDateString(),
      transactionId: 'TXN-123456789',
      amount: '29.99',
      planName: 'Professional Plan',
      billingPeriod: 'Monthly',
      paymentDate: new Date().toLocaleDateString(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      daysSinceSubmission: '15',
      currentStatus: 'Under Investigation',
      submissionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      expectedResponseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      trackingNumber: 'TRK-987654321',
      disputeUrl: 'https://app.creditai.com/disputes/123',
      daysRemaining: '5',
      uploadUrl: 'https://app.creditai.com/dashboard/upload',
      ticketNumber: 'TKT-456789',
      subject: 'Account Access Issue',
      priority: 'High',
      createdDate: new Date().toLocaleDateString(),
      status: 'Open',
      responseTime: '24 hours',
      ticketUrl: 'https://app.creditai.com/support/ticket/456789',
      supportPhone: '(555) 123-4567',
      featureName: 'AI Credit Score Predictor',
      featureDescription: 'Predict your credit score changes before making financial decisions',
      benefit1: 'Predict credit score impact of financial actions',
      benefit2: 'Get personalized recommendations',
      benefit3: 'Track score trends over time',
      benefit4: 'Make informed financial decisions',
      featureUrl: 'https://app.creditai.com/features/score-predictor',
      complianceType: 'FCRA Updates',
      impact1: 'Enhanced dispute process requirements',
      impact2: 'New documentation standards',
      impact3: 'Updated privacy protections',
      actionRequired: 'Review and accept updated terms of service',
      actionUrl: 'https://app.creditai.com/legal/terms',
      effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      legalNotice: 'This notice is required by federal law and must be acknowledged to continue service.',
      complianceEmail: 'compliance@creditai.com',
      compliancePhone: '(555) 987-6543'
    }

    // Return only the variables that this template actually uses
    const templateData: Record<string, string> = {}
    template.variables.forEach(variable => {
      if (defaultData[variable]) {
        templateData[variable] = defaultData[variable]
      }
    })

    return templateData
  }
}

// Export singleton instance
export const creditRepairEmailService = CreditRepairEmailService.getInstance()