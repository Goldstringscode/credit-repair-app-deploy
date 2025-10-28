import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // In a real app, this would fetch from a database
    // For now, we'll return mock data that matches the structure
    const mockNegativeItems = [
      {
        id: 'item_1',
        creditor: 'Capital One',
        accountNumber: '****1234',
        originalAmount: 2500,
        currentBalance: 0,
        dateOpened: '2020-03-15',
        dateReported: '2023-12-01',
        status: 'Closed',
        itemType: 'Late Payment',
        disputeReason: 'Inaccurate Information - Wrong amounts, dates, or account details',
        notes: 'Account was never late, always paid on time'
      },
      {
        id: 'item_2',
        creditor: 'Chase Bank',
        accountNumber: '****5678',
        originalAmount: 1500,
        currentBalance: 1500,
        dateOpened: '2021-06-20',
        dateReported: '2024-01-15',
        status: 'In Collections',
        itemType: 'Collection',
        disputeReason: 'Identity Theft - Account opened without authorization',
        notes: 'This account was opened fraudulently'
      },
      {
        id: 'item_3',
        creditor: 'Discover',
        accountNumber: '****9012',
        originalAmount: 800,
        currentBalance: 0,
        dateOpened: '2019-11-10',
        dateReported: '2023-10-30',
        status: 'Charged Off',
        itemType: 'Charge Off',
        disputeReason: 'Paid in Full - Account was paid but not updated',
        notes: 'Account was settled and paid in full'
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        negativeItems: mockNegativeItems
      }
    })

  } catch (error) {
    console.error('Error fetching negative items:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch negative items",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    )
  }
}
