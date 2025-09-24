import { NextRequest, NextResponse } from 'next/server'
import { sendInvitationEmail, sendWelcomeEmail, sendCreditRepairEmail } from '@/lib/email-service'

// GET /api/email/dashboard - Get email dashboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    console.log(`📧 Email Dashboard API: Fetching data for type: ${type}`)

    // Mock data - in production, this would come from your database
    const mockData = {
      overview: {
        totalSent: 15420,
        totalOpened: 12336,
        totalClicked: 2467,
        totalUnsubscribed: 154,
        totalBounced: 231,
        openRate: 80.0,
        clickRate: 20.0,
        unsubscribeRate: 1.0,
        bounceRate: 1.5,
        conversionRate: 16.0,
        growthRate: 12.5
      },
      campaigns: [
        {
          id: "1",
          name: "Welcome Series - New Users",
          subject: "Welcome to Credit Repair AI!",
          status: "sent",
          recipients: 1250,
          sent: 1248,
          opened: 998,
          clicked: 234,
          unsubscribed: 2,
          bounced: 18,
          openRate: 79.9,
          clickRate: 18.7,
          unsubscribeRate: 0.2,
          bounceRate: 1.4,
          conversionRate: 15.2,
          createdAt: "2024-01-15",
          sentDate: "2024-01-15",
          template: "welcome-series-1",
          category: "transactional"
        },
        {
          id: "2",
          name: "Credit Score Update Alert",
          subject: "Your Credit Score Has Improved!",
          status: "sending",
          recipients: 850,
          sent: 650,
          opened: 520,
          clicked: 89,
          unsubscribed: 0,
          bounced: 8,
          openRate: 80.0,
          clickRate: 13.7,
          unsubscribeRate: 0.0,
          bounceRate: 1.2,
          conversionRate: 10.5,
          createdAt: "2024-01-18",
          sentDate: "2024-01-18",
          template: "credit-update",
          category: "transactional"
        }
      ],
      templates: [
        {
          id: "1",
          name: "Welcome Email",
          subject: "Welcome to Credit Repair AI!",
          category: "transactional",
          isDefault: true,
          createdAt: "2024-01-01",
          lastUsed: "2024-01-15",
          usageCount: 45,
          tags: ["welcome", "onboarding"]
        },
        {
          id: "2",
          name: "Credit Score Update",
          subject: "Your Credit Score Has Changed",
          category: "transactional",
          isDefault: true,
          createdAt: "2024-01-01",
          lastUsed: "2024-01-18",
          usageCount: 23,
          tags: ["credit", "update", "score"]
        }
      ],
      lists: [
        {
          id: "1",
          name: "All Subscribers",
          subscribers: 2150,
          activeSubscribers: 1980,
          unsubscribed: 170,
          bounced: 0,
          createdAt: "2024-01-01",
          lastUpdated: "2024-01-22",
          tags: ["all", "active"],
          isPublic: false,
          growthRate: 12.5,
          avgOpenRate: 80.0,
          avgClickRate: 20.0
        },
        {
          id: "2",
          name: "Premium Users",
          subscribers: 450,
          activeSubscribers: 420,
          unsubscribed: 30,
          bounced: 0,
          createdAt: "2024-01-01",
          lastUpdated: "2024-01-22",
          tags: ["premium", "active"],
          isPublic: false,
          growthRate: 8.3,
          avgOpenRate: 85.0,
          avgClickRate: 25.0
        }
      ],
      analytics: {
        timeSeries: [
          { date: "2024-01-15", sent: 1250, opened: 998, clicked: 234, unsubscribed: 2, bounced: 18 },
          { date: "2024-01-16", sent: 850, opened: 680, clicked: 89, unsubscribed: 0, bounced: 10 },
          { date: "2024-01-17", sent: 1200, opened: 960, clicked: 192, unsubscribed: 5, bounced: 18 },
          { date: "2024-01-18", sent: 1100, opened: 880, clicked: 176, unsubscribed: 3, bounced: 16 },
          { date: "2024-01-19", sent: 1350, opened: 1080, clicked: 216, unsubscribed: 7, bounced: 20 },
          { date: "2024-01-20", sent: 2100, opened: 1680, clicked: 420, unsubscribed: 21, bounced: 32 },
          { date: "2024-01-21", sent: 950, opened: 760, clicked: 152, unsubscribed: 4, bounced: 14 },
          { date: "2024-01-22", sent: 980, opened: 784, clicked: 156, unsubscribed: 8, bounced: 15 }
        ],
        deviceStats: [
          { device: "Desktop", opens: 4934, percentage: 40.0 },
          { device: "Mobile", opens: 6170, percentage: 50.0 },
          { device: "Tablet", opens: 1232, percentage: 10.0 }
        ],
        locationStats: [
          { location: "United States", opens: 7402, percentage: 60.0 },
          { location: "Canada", opens: 2467, percentage: 20.0 },
          { location: "United Kingdom", opens: 1234, percentage: 10.0 },
          { location: "Australia", opens: 1234, percentage: 10.0 }
        ]
      }
    }

    // Handle specific analytics request
    if (type === 'analytics') {
      const responseData = mockData.analytics
      console.log(`📧 Email Dashboard API: Returning analytics data:`, {
        dataType: typeof responseData,
        hasData: !!responseData,
        timeSeriesLength: responseData?.timeSeries?.length || 0
      })
      return NextResponse.json({
        success: true,
        data: responseData
      })
    }

    const responseData = mockData[type as keyof typeof mockData] || mockData.overview
    
    console.log(`📧 Email Dashboard API: Returning data for ${type}:`, {
      dataType: typeof responseData,
      hasData: !!responseData,
      dataKeys: Array.isArray(responseData) ? responseData.length : Object.keys(responseData || {}).length
    })

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('❌ Error fetching email dashboard data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch email dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/email/dashboard - Create or update email data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    console.log(`📧 Email Dashboard API: POST request - Action: ${action}`)

    switch (action) {
      case 'create_campaign':
        // Handle campaign creation
        console.log('Creating campaign:', data)
        return NextResponse.json({
          success: true,
          message: 'Campaign created successfully',
          data: { id: Date.now().toString(), ...data }
        })

      case 'create_template':
        // Handle template creation
        console.log('Creating template:', data)
        return NextResponse.json({
          success: true,
          message: 'Template created successfully',
          data: { id: Date.now().toString(), ...data }
        })

      case 'create_list':
        // Handle list creation
        console.log('Creating list:', data)
        return NextResponse.json({
          success: true,
          message: 'List created successfully',
          data: { id: Date.now().toString(), ...data }
        })

      case 'send_test_email':
        // Handle test email sending
        try {
          await sendCreditRepairEmail({
            to: data.email,
            name: data.name || 'Test User',
            type: 'welcome',
            data: { message: 'This is a test email from Credit Repair AI' }
          })
          
          return NextResponse.json({
            success: true,
            message: 'Test email sent successfully'
          })
        } catch (emailError) {
          console.error('Error sending test email:', emailError)
          return NextResponse.json(
            { success: false, error: 'Failed to send test email' },
            { status: 500 }
          )
        }

      case 'send_campaign':
        // Handle campaign sending
        console.log('Sending campaign:', data)
        return NextResponse.json({
          success: true,
          message: 'Campaign sent successfully',
          data: { campaignId: data.id, sentAt: new Date().toISOString() }
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error processing email dashboard request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// PUT /api/email/dashboard - Update email data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'update_campaign':
        // Handle campaign update
        console.log('Updating campaign:', data)
        return NextResponse.json({
          success: true,
          message: 'Campaign updated successfully',
          data
        })

      case 'update_template':
        // Handle template update
        console.log('Updating template:', data)
        return NextResponse.json({
          success: true,
          message: 'Template updated successfully',
          data
        })

      case 'update_list':
        // Handle list update
        console.log('Updating list:', data)
        return NextResponse.json({
          success: true,
          message: 'List updated successfully',
          data
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error updating email dashboard data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update data' },
      { status: 500 }
    )
  }
}

// DELETE /api/email/dashboard - Delete email data
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: 'Type and ID are required' },
        { status: 400 }
      )
    }

    switch (type) {
      case 'campaign':
        // Handle campaign deletion
        console.log('Deleting campaign:', id)
        return NextResponse.json({
          success: true,
          message: 'Campaign deleted successfully'
        })

      case 'template':
        // Handle template deletion
        console.log('Deleting template:', id)
        return NextResponse.json({
          success: true,
          message: 'Template deleted successfully'
        })

      case 'list':
        // Handle list deletion
        console.log('Deleting list:', id)
        return NextResponse.json({
          success: true,
          message: 'List deleted successfully'
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error deleting email dashboard data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete data' },
      { status: 500 }
    )
  }
}
