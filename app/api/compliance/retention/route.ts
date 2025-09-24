import { NextRequest, NextResponse } from 'next/server'
import { retentionService, createRetentionRecord, processExpiredData, getRetentionPolicies } from '@/lib/compliance/data-retention'

export const POST = async (request: NextRequest) => {
  try {
    const { userId, dataType, metadata } = await request.json()
    
    if (!userId || !dataType) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, dataType' 
      }, { status: 400 })
    }

    const record = createRetentionRecord(userId, dataType, metadata)
    
    return NextResponse.json({ 
      success: true, 
      record,
      message: 'Retention record created successfully'
    })
  } catch (error: any) {
    console.error('Retention record creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create retention record',
      message: error.message 
    }, { status: 500 })
  }
}

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    
    if (action === 'policies') {
      // Get retention policies
      const policies = getRetentionPolicies()
      return NextResponse.json({ 
        success: true, 
        policies
      })
    } else if (action === 'expiring') {
      // Get records expiring soon
      const days = parseInt(searchParams.get('days') || '30')
      const records = retentionService.getRecordsExpiringSoon(days)
      return NextResponse.json({ 
        success: true, 
        records,
        count: records.length
      })
    } else if (action === 'audits') {
      // Get retention audit history
      const audits = retentionService.getRetentionAudits()
      return NextResponse.json({ 
        success: true, 
        audits
      })
    } else if (userId) {
      // Get user's retention records
      const records = retentionService.getUserRetentionRecords(userId)
      return NextResponse.json({ 
        success: true, 
        records
      })
    } else {
      return NextResponse.json({ 
        error: 'Missing userId parameter' 
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Retention data retrieval error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve retention data',
      message: error.message 
    }, { status: 500 })
  }
}

export const PUT = async (request: NextRequest) => {
  try {
    const { action, recordId, reason } = await request.json()
    
    if (!action) {
      return NextResponse.json({ 
        error: 'Missing required field: action' 
      }, { status: 400 })
    }

    if (action !== 'process_expired' && !recordId) {
      return NextResponse.json({ 
        error: 'Missing required field: recordId' 
      }, { status: 400 })
    }

    let result: any

    switch (action) {
      case 'exempt':
        if (!reason) {
          return NextResponse.json({ 
            error: 'Missing required field for exemption: reason' 
          }, { status: 400 })
        }
        result = retentionService.markDataExempt(recordId, reason)
        break
      case 'process_expired':
        result = await processExpiredData()
        break
      default:
        return NextResponse.json({ 
          error: 'Invalid action. Must be "exempt" or "process_expired"' 
        }, { status: 400 })
    }
    
    if (action === 'exempt' && !result) {
      return NextResponse.json({ 
        error: 'Record not found or already processed' 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      result,
      message: `Retention ${action} completed successfully`
    })
  } catch (error: any) {
    console.error('Retention processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process retention action',
      message: error.message 
    }, { status: 500 })
  }
}

