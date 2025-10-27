import { NextRequest, NextResponse } from 'next/server'

// Mock data storage (in production, this would be a database)
let templates = [
  {
    id: '1',
    name: 'Welcome Email - Day 1',
    subject: 'Welcome to CreditRepair Pro!',
    content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to CreditRepair Pro!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Welcome to CreditRepair Pro!</h1>
        <p>Hi {{name}},</p>
        <p>Welcome to CreditRepair Pro! We're excited to help you on your journey to better credit.</p>
        <p>Here's what you can do next:</p>
        <ul>
            <li>Complete your profile setup</li>
            <li>Upload your credit reports</li>
            <li>Start your first dispute</li>
        </ul>
        <p>If you have any questions, don't hesitate to reach out to our support team.</p>
        <p>Best regards,<br>The CreditRepair Pro Team</p>
    </div>
</body>
</html>`,
    type: 'welcome',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Monthly Newsletter',
    subject: 'Your Credit Score Update & Tips',
    content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Monthly Credit Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Monthly Credit Update</h1>
        <p>Hi {{name}},</p>
        <p>Here's your monthly credit score update and some helpful tips:</p>
        <h2>Your Current Score: {{credit_score}}</h2>
        <p>This month's tips:</p>
        <ul>
            <li>Pay bills on time</li>
            <li>Keep credit utilization low</li>
            <li>Monitor your credit regularly</li>
        </ul>
        <p>Keep up the great work!</p>
        <p>Best regards,<br>The CreditRepair Pro Team</p>
    </div>
</body>
</html>`,
    type: 'newsletter',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-20'
  },
  {
    id: '3',
    name: 'Premium Upgrade Offer',
    subject: 'Unlock Advanced Features Today!',
    content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Upgrade to Premium</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Unlock Advanced Features Today!</h1>
        <p>Hi {{name}},</p>
        <p>Ready to take your credit repair to the next level?</p>
        <p>Upgrade to Premium and get:</p>
        <ul>
            <li>Unlimited disputes</li>
            <li>Priority support</li>
            <li>Advanced analytics</li>
            <li>Custom dispute letters</li>
        </ul>
        <p><a href="{{upgrade_link}}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Upgrade Now</a></p>
        <p>Best regards,<br>The CreditRepair Pro Team</p>
    </div>
</body>
</html>`,
    type: 'promotional',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-25'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    let filteredTemplates = templates

    if (type && type !== 'all') {
      filteredTemplates = templates.filter(template => template.type === type)
    }

    if (search) {
      filteredTemplates = filteredTemplates.filter(template =>
        template.name.toLowerCase().includes(search.toLowerCase()) ||
        template.subject.toLowerCase().includes(search.toLowerCase())
      )
    }

    return NextResponse.json({
      success: true,
      data: { templates: filteredTemplates }
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, subject, content, type = 'custom' } = body

    if (!name || !subject || !content) {
      return NextResponse.json(
        { success: false, error: 'Name, subject, and content are required' },
        { status: 400 }
      )
    }

    const newTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      subject,
      content,
      type,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }

    templates.push(newTemplate)

    return NextResponse.json({
      success: true,
      data: { template: newTemplate }
    })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
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
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const templateIndex = templates.findIndex(t => t.id === id)
    if (templateIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    templates[templateIndex] = { 
      ...templates[templateIndex], 
      ...updateData,
      updatedAt: new Date().toISOString().split('T')[0]
    }

    return NextResponse.json({
      success: true,
      data: { template: templates[templateIndex] }
    })
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    console.log('DELETE template - ID:', id)
    console.log('Current templates:', templates.length)
    console.log('Template IDs:', templates.map(t => t.id))

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const templateIndex = templates.findIndex(t => t.id === id)
    console.log('Template index found:', templateIndex)
    
    if (templateIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    const deletedTemplate = templates.splice(templateIndex, 1)[0]
    console.log('Deleted template:', deletedTemplate)

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
