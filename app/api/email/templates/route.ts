import { NextRequest, NextResponse } from 'next/server'
import { creditRepairEmailTemplates, additionalCreditRepairTemplates } from '@/lib/credit-repair-email-templates'

// Mock data - in production, this would come from a database
let templates = [
  {
    id: "1",
    name: "Welcome Email",
    subject: "Welcome to Credit Repair AI!",
    category: "transactional",
    isDefault: true,
    createdAt: "2024-01-01",
    lastUsed: "2024-01-15",
    usageCount: 45,
    content: {
      html: "<h1>Welcome to Credit Repair AI!</h1><p>Thank you for joining us...</p>",
      text: "Welcome to Credit Repair AI! Thank you for joining us..."
    }
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
    content: {
      html: "<h1>Credit Score Update</h1><p>Your credit score has changed...</p>",
      text: "Credit Score Update - Your credit score has changed..."
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const includeSystemTemplates = searchParams.get('includeSystem') === 'true'

    let allTemplates = [...templates]

    // Include system templates if requested
    if (includeSystemTemplates) {
      const systemTemplates = [
        ...creditRepairEmailTemplates,
        ...additionalCreditRepairTemplates
      ].map((template, index) => ({
        id: `system-${index}`,
        name: template.name,
        subject: template.subject,
        category: template.category,
        isDefault: true,
        createdAt: "2024-01-01",
        lastUsed: "2024-01-01",
        usageCount: 0,
        content: {
          html: template.htmlContent,
          text: template.textContent
        }
      }))
      allTemplates = [...allTemplates, ...systemTemplates]
    }

    let filteredTemplates = allTemplates

    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(t => t.category === category)
    }

    if (search) {
      filteredTemplates = filteredTemplates.filter(t => 
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.subject.toLowerCase().includes(search.toLowerCase())
      )
    }

    return NextResponse.json({
      success: true,
      templates: filteredTemplates,
      total: filteredTemplates.length
    })
  } catch (error) {
    console.error('❌ Error fetching templates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, subject, category, content } = body

    const newTemplate = {
      id: Date.now().toString(),
      name,
      subject,
      category,
      isDefault: false,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: new Date().toISOString().split('T')[0],
      usageCount: 0,
      content: content || {
        html: "<h1>New Template</h1><p>Content will be added here...</p>",
        text: "New Template - Content will be added here..."
      }
    }

    templates.push(newTemplate)

    return NextResponse.json({
      success: true,
      template: newTemplate
    })
  } catch (error) {
    console.error('❌ Error creating template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    const templateIndex = templates.findIndex(t => t.id === id)
    if (templateIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    templates[templateIndex] = { ...templates[templateIndex], ...updates }

    return NextResponse.json({
      success: true,
      template: templates[templateIndex]
    })
  } catch (error) {
    console.error('❌ Error updating template:', error)
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

    templates.splice(templateIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    })
  } catch (error) {
    console.error('❌ Error deleting template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
