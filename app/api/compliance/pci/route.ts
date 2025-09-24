import { NextRequest, NextResponse } from 'next/server'
import { pciService, addPCICard, processPCITransaction, getUserPCICards, getUserPCITransactions } from '@/lib/compliance/pci'

export const POST = async (request: NextRequest) => {
  try {
    console.log('🔍 PCI API: Request received')
    const { action, data } = await request.json()
    console.log('🔍 PCI API: Action:', action, 'Data:', data)
    
    if (!action) {
      console.log('❌ PCI API: Missing action field')
      return NextResponse.json({ 
        error: 'Missing required field: action' 
      }, { status: 400 })
    }

    let result: any

    switch (action) {
      case 'add_card':
        console.log('🔍 PCI API: Processing add_card action')
        if (!data.userId || !data.cardNumber || !data.expiryMonth || !data.expiryYear || !data.cardholderName || !data.cvv) {
          console.log('❌ PCI API: Missing required fields for add_card')
          return NextResponse.json({ 
            error: 'Missing required fields for add_card: userId, cardNumber, expiryMonth, expiryYear, cardholderName, cvv' 
          }, { status: 400 })
        }
        console.log('🔍 PCI API: Calling addPCICard with data:', data)
        result = addPCICard(data)
        console.log('🔍 PCI API: addPCICard result:', result)
        break
      case 'process_transaction':
        if (!data.userId || !data.cardId || !data.amount || !data.currency || !data.merchantId || !data.transactionType) {
          return NextResponse.json({ 
            error: 'Missing required fields for process_transaction: userId, cardId, amount, currency, merchantId, transactionType' 
          }, { status: 400 })
        }
        result = processPCITransaction(data)
        break
      default:
        return NextResponse.json({ 
          error: 'Invalid action. Must be "add_card" or "process_transaction"' 
        }, { status: 400 })
    }
    
    console.log('🔍 PCI API: Returning success response:', result)
    return NextResponse.json({ 
      success: true, 
      result,
      message: `PCI ${action} completed successfully`
    })
  } catch (error: any) {
    console.error('❌ PCI API: Error occurred:', error)
    console.error('❌ PCI API: Error stack:', error.stack)
    return NextResponse.json({ 
      error: 'Failed to process PCI operation',
      message: error.message 
    }, { status: 500 })
  }
}

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    
    if (action === 'compliance') {
      // Get PCI compliance information
      const compliance = {
        title: 'PCI DSS Compliance Requirements',
        requirements: [
          'Build and maintain secure networks and systems',
          'Protect cardholder data',
          'Maintain a vulnerability management program',
          'Implement strong access control measures',
          'Regularly monitor and test networks',
          'Maintain an information security policy'
        ],
        securityMeasures: [
          'Data encryption at rest and in transit',
          'Secure payment processing',
          'Access controls and authentication',
          'Vulnerability scanning and patching',
          'Audit logging and monitoring',
          'Regular security assessments'
        ]
      }
      return NextResponse.json({ 
        success: true, 
        compliance
      })
    } else if (action === 'cards' && userId) {
      // Get user's cards
      const cards = getUserPCICards(userId)
      return NextResponse.json({ 
        success: true, 
        cards
      })
    } else if (action === 'transactions' && userId) {
      // Get user's transactions
      const transactions = getUserPCITransactions(userId)
      return NextResponse.json({ 
        success: true, 
        transactions
      })
    } else if (userId) {
      // Get user's PCI data
      const cards = getUserPCICards(userId)
      const transactions = getUserPCITransactions(userId)
      return NextResponse.json({ 
        success: true, 
        cards,
        transactions
      })
    } else {
      return NextResponse.json({ 
        error: 'Missing userId parameter' 
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error('PCI data retrieval error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve PCI data',
      message: error.message 
    }, { status: 500 })
  }
}
