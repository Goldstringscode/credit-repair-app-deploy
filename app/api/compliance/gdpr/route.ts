import { NextRequest, NextResponse } from 'next/server'
import { gdprService, createGDPRRequest, processGDPRRequest, getUserGDPRRequests } from '@/lib/compliance/gdpr'

export const POST = async (request: NextRequest) => {
  try {
    const { userId, requestType, reason } = await request.json()
    
    if (!userId || !requestType) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, requestType' 
      }, { status: 400 })
    }

    const gdprRequest = createGDPRRequest(userId, requestType, reason)
    
    return NextResponse.json({ 
      success: true, 
      request: gdprRequest,
      message: 'GDPR request created successfully'
    })
  } catch (error: any) {
    console.error('GDPR request creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create GDPR request',
      message: error.message 
    }, { status: 500 })
  }
}

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const requestId = searchParams.get('requestId')
    
    if (requestId && userId) {
      // Get specific request
      const gdprRequest = gdprService.getRequestStatus(requestId, userId)
      if (!gdprRequest) {
        return NextResponse.json({ 
          error: 'Request not found or unauthorized' 
        }, { status: 404 })
      }
      
      return NextResponse.json({ 
        success: true, 
        request: gdprRequest
      })
    } else if (userId) {
      // Get all user requests
      const requests = getUserGDPRRequests(userId)
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
    console.error('GDPR request retrieval error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve GDPR requests',
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

    const result = await processGDPRRequest(requestId, userId)
    
    if (!result.success) {
      return NextResponse.json({ 
        error: result.error 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: result.data,
      message: 'GDPR request processed successfully'
    })
  } catch (error: any) {
    console.error('GDPR request processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process GDPR request',
      message: error.message 
    }, { status: 500 })
  }
}

