import { NextRequest, NextResponse } from 'next/server'

// Mock analytics data - in production, this would come from a database
const analyticsData = {
  overview: {
    totalSent: 15420,
    totalOpened: 12336,
    totalClicked: 2467,
    totalUnsubscribed: 154,
    totalBounced: 62,
    openRate: 80.0,
    clickRate: 20.0,
    unsubscribeRate: 1.0,
    bounceRate: 0.4
  },
  campaigns: [
    {
      id: "1",
      name: "Welcome Series - New Users",
      sent: 1248,
      opened: 998,
      clicked: 234,
      unsubscribed: 2,
      bounced: 0,
      openRate: 79.9,
      clickRate: 18.7,
      unsubscribeRate: 0.16,
      bounceRate: 0
    },
    {
      id: "2",
      name: "Credit Score Update Alert",
      sent: 650,
      opened: 520,
      clicked: 89,
      unsubscribed: 0,
      bounced: 0,
      openRate: 80.0,
      clickRate: 13.7,
      unsubscribeRate: 0,
      bounceRate: 0
    }
  ],
  trends: {
    daily: [
      { date: "2024-01-15", sent: 1200, opened: 960, clicked: 192 },
      { date: "2024-01-16", sent: 1350, opened: 1080, clicked: 216 },
      { date: "2024-01-17", sent: 1100, opened: 880, clicked: 176 },
      { date: "2024-01-18", sent: 1400, opened: 1120, clicked: 224 },
      { date: "2024-01-19", sent: 1250, opened: 1000, clicked: 200 },
      { date: "2024-01-20", sent: 1300, opened: 1040, clicked: 208 },
      { date: "2024-01-21", sent: 1150, opened: 920, clicked: 184 }
    ],
    weekly: [
      { week: "Week 1", sent: 8400, opened: 6720, clicked: 1344 },
      { week: "Week 2", sent: 9200, opened: 7360, clicked: 1472 },
      { week: "Week 3", sent: 8800, opened: 7040, clicked: 1408 }
    ],
    monthly: [
      { month: "January", sent: 15420, opened: 12336, clicked: 2467 },
      { month: "December", sent: 12800, opened: 10240, clicked: 2048 },
      { month: "November", sent: 11200, opened: 8960, clicked: 1792 }
    ]
  },
  topPerforming: {
    campaigns: [
      { name: "Welcome Series - New Users", openRate: 79.9, clickRate: 18.7 },
      { name: "Credit Score Update Alert", openRate: 80.0, clickRate: 13.7 },
      { name: "Monthly Newsletter", openRate: 75.2, clickRate: 15.8 }
    ],
    templates: [
      { name: "Welcome Email", usageCount: 45, avgOpenRate: 82.3 },
      { name: "Credit Score Update", usageCount: 23, avgOpenRate: 78.9 },
      { name: "Dispute Letter Reminder", usageCount: 12, avgOpenRate: 76.1 }
    ]
  },
  demographics: {
    ageGroups: [
      { age: "18-24", count: 450, openRate: 75.2 },
      { age: "25-34", count: 1200, openRate: 82.1 },
      { age: "35-44", count: 980, openRate: 79.8 },
      { age: "45-54", count: 650, openRate: 77.3 },
      { age: "55+", count: 320, openRate: 74.6 }
    ],
    locations: [
      { location: "United States", count: 2800, openRate: 80.5 },
      { location: "Canada", count: 450, openRate: 78.9 },
      { location: "United Kingdom", count: 320, openRate: 76.2 },
      { location: "Australia", count: 280, openRate: 79.1 }
    ]
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    const period = searchParams.get('period') || '30d'

    let responseData = {}

    switch (type) {
      case 'overview':
        responseData = analyticsData.overview
        break
      case 'campaigns':
        responseData = analyticsData.campaigns
        break
      case 'trends':
        responseData = analyticsData.trends[period as keyof typeof analyticsData.trends] || analyticsData.trends.daily
        break
      case 'topPerforming':
        responseData = analyticsData.topPerforming
        break
      case 'demographics':
        responseData = analyticsData.demographics
        break
      case 'all':
        responseData = analyticsData
        break
      default:
        responseData = analyticsData.overview
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      period,
      type
    })
  } catch (error) {
    console.error('❌ Error fetching email analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email analytics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignId, event, timestamp, data } = body

    // In production, this would update the database with the event
    console.log(`📊 Email event: ${event} for campaign ${campaignId}`, data)

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully'
    })
  } catch (error) {
    console.error('❌ Error tracking email event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track email event' },
      { status: 500 }
    )
  }
}
