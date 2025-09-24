import { NextRequest, NextResponse } from 'next/server'
import { ccpaService, submitCCPARightsRequest, processCCPARightsRequest, getUserCCPArequests } from '@/lib/compliance/ccpa'

export const POST = async (request: NextRequest) => {
  try {
    const { userId, requestType } = await request.json()
    
    if (!userId || !requestType) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, requestType' 
      }, { status: 400 })
    }

    const ccpaRequest = submitCCPARightsRequest(userId, requestType)
    
    return NextResponse.json({ 
      success: true, 
      request: ccpaRequest,
      message: 'CCPA rights request created successfully'
    })
  } catch (error: any) {
    console.error('CCPA request creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create CCPA request',
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
      // Get CCPA rights information
      const rights = ccpaService.getCCPArights()
      return NextResponse.json({ 
        success: true, 
        rights
      })
    } else if (action === 'data-categories') {
      // Get data categories
      const dataCategories = ccpaService.getDataCategories()
      return NextResponse.json({ 
        success: true, 
        dataCategories
      })
    } else if (action === 'third-parties') {
      // Get third parties
      const thirdParties = ccpaService.getThirdParties()
      return NextResponse.json({ 
        success: true, 
        thirdParties
      })
    } else if (userId) {
      // Get user's CCPA requests
      const requests = getUserCCPArequests(userId)
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
    console.error('CCPA request retrieval error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve CCPA data',
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

    const result = await processCCPARightsRequest(requestId, userId)
    
    if (!result.success) {
      return NextResponse.json({ 
        error: result.error 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: result.data,
      message: 'CCPA rights request processed successfully'
    })
  } catch (error: any) {
    console.error('CCPA request processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process CCPA request',
      message: error.message 
    }, { status: 500 })
  }
}

