import { NextRequest, NextResponse } from 'next/server'
import { fcraService, submitFCRADispute, requestFCRAFreeReport, getUserFCRArequests } from '@/lib/compliance/fcra'

export const POST = async (request: NextRequest) => {
  try {
    const { userId, action, data } = await request.json()
    
    if (!userId || !action) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, action' 
      }, { status: 400 })
    }

    let result: any

    switch (action) {
      case 'dispute':
        if (!data.bureau || !data.description) {
          return NextResponse.json({ 
            error: 'Missing required fields for dispute: bureau, description' 
          }, { status: 400 })
        }
        result = submitFCRADispute(userId, data)
        break
      case 'free_report':
        if (!data.bureau) {
          return NextResponse.json({ 
            error: 'Missing required field for free report: bureau' 
          }, { status: 400 })
        }
        result = requestFCRAFreeReport(userId, data.bureau)
        break
      default:
        return NextResponse.json({ 
          error: 'Invalid action. Must be "dispute" or "free_report"' 
        }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: true, 
      request: result,
      message: `FCRA ${action} request created successfully`
    })
  } catch (error: any) {
    console.error('FCRA request creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create FCRA request',
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
      // Get FCRA rights information
      const rights = fcraService.getFCRArights()
      return NextResponse.json({ 
        success: true, 
        rights
      })
    } else if (action === 'eligibility') {
      // Check free report eligibility
      const bureau = searchParams.get('bureau')
      if (!userId || !bureau) {
        return NextResponse.json({ 
          error: 'Missing required parameters: userId, bureau' 
        }, { status: 400 })
      }
      
      const eligible = fcraService.isEligibleForFreeReport(userId, bureau as any)
      return NextResponse.json({ 
        success: true, 
        eligible,
        bureau
      })
    } else if (userId) {
      // Get user's FCRA requests
      const requests = getUserFCRArequests(userId)
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
    console.error('FCRA request retrieval error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve FCRA data',
      message: error.message 
    }, { status: 500 })
  }
}

export const PUT = async (request: NextRequest) => {
  try {
    const { requestId, resolution } = await request.json()
    
    if (!requestId || !resolution) {
      return NextResponse.json({ 
        error: 'Missing required fields: requestId, resolution' 
      }, { status: 400 })
    }

    const result = await fcraService.processDispute(requestId, resolution)
    
    if (!result.success) {
      return NextResponse.json({ 
        error: result.error 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'FCRA request processed successfully'
    })
  } catch (error: any) {
    console.error('FCRA request processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process FCRA request',
      message: error.message 
    }, { status: 500 })
  }
}

