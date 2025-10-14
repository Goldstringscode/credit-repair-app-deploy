import { NextRequest, NextResponse } from 'next/server'
import { envValidator } from '@/lib/env-validation'

export const GET = async (request: NextRequest) => {
  try {
    const validator = envValidator.instance
    const isValid = validator.isValid()
    const errors = validator.getErrors()
    
    return NextResponse.json({ 
      valid: isValid,
      errors: errors,
      environment: process.env.NODE_ENV,
      features: {
        aiAnalysis: validator.isFeatureEnabled('ai_analysis'),
        superiorParser: validator.isFeatureEnabled('superior_parser'),
        notifications: validator.isFeatureEnabled('notifications'),
        auditLogging: validator.isFeatureEnabled('audit_logging')
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      valid: false,
      error: 'Environment validation failed',
      message: (error as Error)?.message ?? 'Unknown error'
    }, { status: 500 })
  }
}

