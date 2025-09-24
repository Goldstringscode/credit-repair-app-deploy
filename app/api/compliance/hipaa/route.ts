import { NextRequest, NextResponse } from 'next/server'
import { hipaaService, createHIPAARequest, processHIPAARequest, getUserHIPAArequests } from '@/lib/compliance/hipaa'

export const POST = async (request: NextRequest) => {
  try {
    const { userId, requestType, healthData } = await request.json()
    
    if (!userId || !requestType || !healthData) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, requestType, healthData' 
      }, { status: 400 })
    }

    const hipaaRequest = createHIPAARequest(userId, requestType, healthData)
    
    return NextResponse.json({ 
      success: true, 
      request: hipaaRequest,
      message: 'HIPAA request created successfully'
    })
  } catch (error: any) {
    console.error('HIPAA request creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create HIPAA request',
      message: error.message 
    }, { status: 500 })
  }
}

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    
    if (action === 'rights') {
      // Get HIPAA rights information
      const rights = {
        title: 'Your Rights Under HIPAA',
        rights: [
          {
            right: 'Right to Access',
            description: 'You have the right to access and obtain a copy of your health information.'
          },
          {
            right: 'Right to Amend',
            description: 'You have the right to request amendments to your health information.'
          },
          {
            right: 'Right to Disclosure',
            description: 'You have the right to request disclosures of your health information.'
          },
          {
            right: 'Right to Restriction',
            description: 'You have the right to request restrictions on how your health information is used.'
          },
          {
            right: 'Right to Accounting',
            description: 'You have the right to receive an accounting of disclosures of your health information.'
          }
        ]
      }
      return NextResponse.json({ 
        success: true, 
        rights
      })
    } else if (userId) {
      // Get user's HIPAA requests
      const requests = getUserHIPAArequests(userId)
      return NextResponse.json({ 
        success: true, 
        requests
      })
    } else {
      return NextResponse.json({ 
        error: 'Missing userId parameter' 
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error('HIPAA request retrieval error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve HIPAA data',
      message: error.message 
    }, { status: 500 })
  }
}

export const PUT = async (request: NextRequest) => {
  try {
    const { requestId, userId } = await request.json()
    
    if (!requestId || !userId) {
      return NextResponse.json({ 
        error: 'Missing required fields: requestId, userId' 
      }, { status: 400 })
    }

    const result = await processHIPAARequest(requestId, userId)
    
    if (!result.success) {
      return NextResponse.json({ 
        error: result.error 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: result.data,
      message: 'HIPAA request processed successfully'
    })
  } catch (error: any) {
    console.error('HIPAA request processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process HIPAA request',
      message: error.message 
    }, { status: 500 })
  }
}
