import { NextRequest, NextResponse } from 'next/server'
import { sendCreditRepairTemplateEmail } from '@/lib/email-service-server'

// Mock data - in production, this would come from a database
let campaigns = [
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
    bounceRate: 0.16,
    openRate: 79.9,
    clickRate: 18.7,
    createdAt: "2024-01-15",
    template: "welcome-series-1",
    category: "transactional",
    content: {
      html: "<h1>Welcome to Credit Repair AI!</h1><p>Thank you for joining us...</p>",
      text: "Welcome to Credit Repair AI! Thank you for joining us..."
    }
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
    bounceRate: 0.12,
    openRate: 80.0,
    clickRate: 13.7,
    createdAt: "2024-01-18",
    template: "credit-update",
    category: "transactional",
    content: {
      html: "<h1>Great News!</h1><p>Your credit score has improved...</p>",
      text: "Great News! Your credit score has improved..."
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let filteredCampaigns = campaigns

    if (status && status !== 'all') {
      filteredCampaigns = filteredCampaigns.filter(c => c.status === status)
    }

    if (category && category !== 'all') {
      filteredCampaigns = filteredCampaigns.filter(c => c.category === category)
    }

    if (search) {
      filteredCampaigns = filteredCampaigns.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.subject.toLowerCase().includes(search.toLowerCase())
      )
    }

    return NextResponse.json({
      success: true,
      campaigns: filteredCampaigns,
      total: filteredCampaigns.length
    })
  } catch (error) {
    console.error('❌ Error fetching campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, subject, template, category, recipients, scheduledFor } = body

    const newCampaign = {
      id: Date.now().toString(),
      name,
      subject,
      status: scheduledFor ? "scheduled" : "draft",
      recipients: recipients || 0,
      sent: 0,
      opened: 0,
      clicked: 0,
      unsubscribed: 0,
      bounceRate: 0,
      openRate: 0,
      clickRate: 0,
      createdAt: new Date().toISOString().split('T')[0],
      template,
      category,
      scheduledFor,
      content: {
        html: "<h1>New Campaign</h1><p>Content will be added here...</p>",
        text: "New Campaign - Content will be added here..."
      }
    }

    campaigns.push(newCampaign)

    return NextResponse.json({
      success: true,
      campaign: newCampaign
    })
  } catch (error) {
    console.error('❌ Error creating campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    const campaignIndex = campaigns.findIndex(c => c.id === id)
    if (campaignIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    campaigns[campaignIndex] = { ...campaigns[campaignIndex], ...updates }

    return NextResponse.json({
      success: true,
      campaign: campaigns[campaignIndex]
    })
  } catch (error) {
    console.error('❌ Error updating campaign:', error)
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

    campaigns.splice(campaignIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    })
  } catch (error) {
    console.error('❌ Error deleting campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
