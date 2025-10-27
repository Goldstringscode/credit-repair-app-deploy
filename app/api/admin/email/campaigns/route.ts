import { NextRequest, NextResponse } from 'next/server'

// Mock data storage (in production, this would be a database)
// This needs to be outside the function to persist across requests
let campaigns = [
  {
    id: '1',
    name: 'Welcome Series - Day 1',
    subject: 'Welcome to CreditRepair Pro!',
    status: 'sent',
    recipients: 150,
    sent: 150,
    opened: 89,
    clicked: 23,
    createdAt: '2024-01-15',
    template: 'welcome-1',
    content: 'Welcome to our platform...',
    scheduledFor: null
  },
  {
    id: '2',
    name: 'Monthly Newsletter - January',
    subject: 'Your Credit Score Update & Tips',
    status: 'scheduled',
    recipients: 1200,
    sent: 0,
    opened: 0,
    clicked: 0,
    createdAt: '2024-01-20',
    scheduledFor: '2024-02-01T09:00:00Z',
    template: 'newsletter-jan',
    content: 'Here are this month\'s updates...'
  },
  {
    id: '3',
    name: 'Promotional - Premium Upgrade',
    subject: 'Unlock Advanced Features Today!',
    status: 'draft',
    recipients: 0,
    sent: 0,
    opened: 0,
    clicked: 0,
    createdAt: '2024-01-25',
    template: 'premium-upgrade',
    content: 'Upgrade to premium for...',
    scheduledFor: null
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    console.log('GET campaigns - current campaigns:', campaigns.length)
    console.log('Campaign IDs:', campaigns.map(c => c.id))

    let filteredCampaigns = campaigns

    if (status && status !== 'all') {
      filteredCampaigns = campaigns.filter(campaign => campaign.status === status)
    }

    if (search) {
      filteredCampaigns = filteredCampaigns.filter(campaign =>
        campaign.name.toLowerCase().includes(search.toLowerCase()) ||
        campaign.subject.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Calculate metrics
    const totalCampaigns = campaigns.length
    const activeCampaigns = campaigns.filter(c => c.status === 'sent' || c.status === 'sending').length
    const draftCampaigns = campaigns.filter(c => c.status === 'draft').length
    const scheduledCampaigns = campaigns.filter(c => c.status === 'scheduled').length

    const totalRecipients = campaigns.reduce((sum, c) => sum + c.recipients, 0)
    const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0)
    const totalOpened = campaigns.reduce((sum, c) => sum + c.opened, 0)
    const totalClicked = campaigns.reduce((sum, c) => sum + c.clicked, 0)

    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        campaigns: filteredCampaigns,
        metrics: {
          totalCampaigns,
          activeCampaigns,
          draftCampaigns,
          scheduledCampaigns,
          totalRecipients,
          totalSent,
          totalOpened,
          totalClicked,
          openRate: Math.round(openRate * 100) / 100,
          clickRate: Math.round(clickRate * 100) / 100
        }
      }
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, subject, content, template, recipients, scheduledFor, status = 'draft' } = body

    if (!name || !subject || !content) {
      return NextResponse.json(
        { success: false, error: 'Name, subject, and content are required' },
        { status: 400 }
      )
    }

    const newCampaign = {
      id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      subject,
      content,
      template: template || 'custom',
      status,
      recipients: recipients || 0,
      sent: 0,
      opened: 0,
      clicked: 0,
      createdAt: new Date().toISOString().split('T')[0],
      scheduledFor: scheduledFor || null
    }

    campaigns.push(newCampaign)

    return NextResponse.json({
      success: true,
      data: { campaign: newCampaign }
    })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    const campaignIndex = campaigns.findIndex(c => c.id === id)
    if (campaignIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    campaigns[campaignIndex] = { ...campaigns[campaignIndex], ...updateData }

    return NextResponse.json({
      success: true,
      data: { campaign: campaigns[campaignIndex] }
    })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    console.log('DELETE campaign - ID:', id)
    console.log('Current campaigns:', campaigns.length)
    console.log('Campaign IDs:', campaigns.map(c => c.id))

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    const campaignIndex = campaigns.findIndex(c => c.id === id)
    console.log('Campaign index found:', campaignIndex)
    
    if (campaignIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const deletedCampaign = campaigns.splice(campaignIndex, 1)[0]
    console.log('Deleted campaign:', deletedCampaign)

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
