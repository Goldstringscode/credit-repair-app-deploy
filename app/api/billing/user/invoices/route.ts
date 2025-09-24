import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limiter'

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      // Generate sample invoices for demo
      const invoices = [
        {
          id: 'inv_001',
          invoiceNumber: 'INV-2024-001',
          date: '2024-01-15',
          dueDate: '2024-02-15',
          amount: 2999,
          status: 'paid',
          description: 'Basic Plan - January 2024',
          downloadUrl: '/api/billing/user/invoices/inv_001/download'
        },
        {
          id: 'inv_002',
          invoiceNumber: 'INV-2024-002',
          date: '2024-02-15',
          dueDate: '2024-03-15',
          amount: 2999,
          status: 'paid',
          description: 'Basic Plan - February 2024',
          downloadUrl: '/api/billing/user/invoices/inv_002/download'
        },
        {
          id: 'inv_003',
          invoiceNumber: 'INV-2024-003',
          date: '2024-03-15',
          dueDate: '2024-04-15',
          amount: 2999,
          status: 'pending',
          description: 'Basic Plan - March 2024',
          downloadUrl: '/api/billing/user/invoices/inv_003/download'
        }
      ]

      return NextResponse.json({
        success: true,
        invoices: invoices
      })
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch invoices' },
        { status: 500 }
      )
    }
  })
)
