'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, CheckCircle, XCircle, Send } from 'lucide-react'

interface EmailTest {
  id: string
  name: string
  description: string
  endpoint: string
  method: 'POST' | 'GET'
  fields: Array<{
    name: string
    label: string
    type: 'text' | 'email' | 'number' | 'textarea'
    required: boolean
    placeholder?: string
    defaultValue?: string
  }>
  status: 'idle' | 'loading' | 'success' | 'error'
  result?: any
}

const emailTests: EmailTest[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Sent when a new user joins the MLM program',
    endpoint: '/api/test-emails/welcome',
    method: 'POST',
    fields: [
      { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'user@example.com' },
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'John Doe' },
      { name: 'teamCode', label: 'Team Code', type: 'text', required: true, placeholder: 'TEAM123' },
      { name: 'dashboardLink', label: 'Dashboard Link', type: 'text', required: false, defaultValue: 'http://localhost:3001/mlm/dashboard' }
    ],
    status: 'idle'
  },
  {
    id: 'team-join',
    name: 'Team Join Email',
    description: 'Sent when someone joins an existing team',
    endpoint: '/api/test-emails/team-join',
    method: 'POST',
    fields: [
      { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'user@example.com' },
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'John Doe' },
      { name: 'teamCode', label: 'Team Code', type: 'text', required: true, placeholder: 'TEAM123' },
      { name: 'sponsorName', label: 'Sponsor Name', type: 'text', required: true, placeholder: 'Jane Smith' },
      { name: 'dashboardLink', label: 'Dashboard Link', type: 'text', required: false, defaultValue: 'http://localhost:3001/mlm/dashboard' }
    ],
    status: 'idle'
  },
  {
    id: 'team-creation',
    name: 'Team Creation Email',
    description: 'Sent when someone creates their own team',
    endpoint: '/api/test-emails/team-creation',
    method: 'POST',
    fields: [
      { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'user@example.com' },
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'John Doe' },
      { name: 'teamCode', label: 'Team Code', type: 'text', required: true, placeholder: 'TEAM123' },
      { name: 'dashboardLink', label: 'Dashboard Link', type: 'text', required: false, defaultValue: 'http://localhost:3001/mlm/dashboard' }
    ],
    status: 'idle'
  },
  {
    id: 'commission-earned',
    name: 'Commission Earned Email',
    description: 'Sent when user earns commission',
    endpoint: '/api/test-emails/commission-earned',
    method: 'POST',
    fields: [
      { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'user@example.com' },
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'John Doe' },
      { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '150.75' },
      { name: 'type', label: 'Commission Type', type: 'text', required: true, placeholder: 'direct_referral' },
      { name: 'level', label: 'Level', type: 'number', required: true, placeholder: '1' },
      { name: 'totalEarnings', label: 'Total Earnings', type: 'number', required: true, placeholder: '1250.50' },
      { name: 'dashboardLink', label: 'Dashboard Link', type: 'text', required: false, defaultValue: 'http://localhost:3001/mlm/dashboard' }
    ],
    status: 'idle'
  },
  {
    id: 'rank-advancement',
    name: 'Rank Advancement Email',
    description: 'Sent when user advances in rank',
    endpoint: '/api/test-emails/rank-advancement',
    method: 'POST',
    fields: [
      { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'user@example.com' },
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'John Doe' },
      { name: 'oldRank', label: 'Old Rank', type: 'text', required: true, placeholder: 'Associate' },
      { name: 'newRank', label: 'New Rank', type: 'text', required: true, placeholder: 'Consultant' },
      { name: 'benefits', label: 'Benefits (one per line)', type: 'textarea', required: true, placeholder: 'Higher commission rates\nLeadership bonuses\nAdvanced training access' },
      { name: 'dashboardLink', label: 'Dashboard Link', type: 'text', required: false, defaultValue: 'http://localhost:3001/mlm/dashboard' }
    ],
    status: 'idle'
  },
  {
    id: 'new-team-member',
    name: 'New Team Member Email',
    description: 'Sent to sponsor when someone joins their team',
    endpoint: '/api/test-emails/new-team-member',
    method: 'POST',
    fields: [
      { name: 'email', label: 'Sponsor Email', type: 'email', required: true, placeholder: 'sponsor@example.com' },
      { name: 'sponsorName', label: 'Sponsor Name', type: 'text', required: true, placeholder: 'Jane Smith' },
      { name: 'newMemberName', label: 'New Member Name', type: 'text', required: true, placeholder: 'John Doe' },
      { name: 'newMemberEmail', label: 'New Member Email', type: 'email', required: true, placeholder: 'user@example.com' },
      { name: 'teamCode', label: 'Team Code', type: 'text', required: true, placeholder: 'TEAM123' },
      { name: 'dashboardLink', label: 'Dashboard Link', type: 'text', required: false, defaultValue: 'http://localhost:3001/mlm/dashboard' }
    ],
    status: 'idle'
  },
  {
    id: 'payout-processed',
    name: 'Payout Processed Email',
    description: 'Sent when commission is paid out',
    endpoint: '/api/test-emails/payout-processed',
    method: 'POST',
    fields: [
      { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'user@example.com' },
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'John Doe' },
      { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '500.00' },
      { name: 'method', label: 'Payment Method', type: 'text', required: true, placeholder: 'bank_account' },
      { name: 'transactionId', label: 'Transaction ID', type: 'text', required: true, placeholder: 'TXN123456789' },
      { name: 'dashboardLink', label: 'Dashboard Link', type: 'text', required: false, defaultValue: 'http://localhost:3001/mlm/dashboard' }
    ],
    status: 'idle'
  },
  {
    id: 'training-completion',
    name: 'Training Completion Email',
    description: 'Sent when user completes training',
    endpoint: '/api/test-emails/training-completion',
    method: 'POST',
    fields: [
      { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'user@example.com' },
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'John Doe' },
      { name: 'courseName', label: 'Course Name', type: 'text', required: true, placeholder: 'MLM Fundamentals' },
      { name: 'pointsEarned', label: 'Points Earned', type: 'number', required: true, placeholder: '150' },
      { name: 'nextCourse', label: 'Next Course', type: 'text', required: true, placeholder: 'Advanced Sales Techniques' },
      { name: 'dashboardLink', label: 'Dashboard Link', type: 'text', required: false, defaultValue: 'http://localhost:3001/mlm/dashboard' }
    ],
    status: 'idle'
  },
  {
    id: 'task-completion',
    name: 'Task Completion Email',
    description: 'Sent when user completes a task',
    endpoint: '/api/test-emails/task-completion',
    method: 'POST',
    fields: [
      { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'user@example.com' },
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'John Doe' },
      { name: 'taskName', label: 'Task Name', type: 'text', required: true, placeholder: 'Complete Profile Setup' },
      { name: 'pointsEarned', label: 'Points Earned', type: 'number', required: true, placeholder: '50' },
      { name: 'nextTask', label: 'Next Task', type: 'text', required: true, placeholder: 'Connect with Sponsor' },
      { name: 'dashboardLink', label: 'Dashboard Link', type: 'text', required: false, defaultValue: 'http://localhost:3001/mlm/dashboard' }
    ],
    status: 'idle'
  }
]

export default function TestEmailsPage() {
  const [tests, setTests] = useState<EmailTest[]>(emailTests)
  // Auto-fill all fields except email addresses
  const getDefaultValue = (testId: string, fieldName: string, originalDefault?: string) => {
    const autoFillValues: Record<string, Record<string, string>> = {
      'welcome': {
        name: 'John Doe',
        teamCode: 'TEAM123',
        dashboardLink: 'http://localhost:3001/mlm/dashboard'
      },
      'team-join': {
        name: 'John Doe',
        teamCode: 'TEAM123',
        sponsorName: 'Jane Smith',
        dashboardLink: 'http://localhost:3001/mlm/dashboard'
      },
      'team-creation': {
        name: 'John Doe',
        teamCode: 'TEAM123',
        dashboardLink: 'http://localhost:3001/mlm/dashboard'
      },
      'commission-earned': {
        name: 'John Doe',
        amount: '150.75',
        type: 'direct_referral',
        level: '1',
        totalEarnings: '1250.50',
        dashboardLink: 'http://localhost:3001/mlm/dashboard'
      },
      'rank-advancement': {
        name: 'John Doe',
        oldRank: 'Associate',
        newRank: 'Consultant',
        benefits: 'Higher commission rates\nLeadership bonuses\nAdvanced training access\nTeam management tools',
        dashboardLink: 'http://localhost:3001/mlm/dashboard'
      },
      'new-team-member': {
        sponsorName: 'Jane Smith',
        newMemberName: 'John Doe',
        teamCode: 'TEAM123',
        dashboardLink: 'http://localhost:3001/mlm/dashboard'
      },
      'payout-processed': {
        name: 'John Doe',
        amount: '500.00',
        method: 'bank_account',
        transactionId: 'TXN123456789',
        dashboardLink: 'http://localhost:3001/mlm/dashboard'
      },
      'training-completion': {
        name: 'John Doe',
        courseName: 'MLM Fundamentals',
        pointsEarned: '150',
        nextCourse: 'Advanced Sales Techniques',
        dashboardLink: 'http://localhost:3001/mlm/dashboard'
      },
      'task-completion': {
        name: 'John Doe',
        taskName: 'Complete Profile Setup',
        pointsEarned: '50',
        nextTask: 'Connect with Sponsor',
        dashboardLink: 'http://localhost:3001/mlm/dashboard'
      }
    }

    // Don't auto-fill email fields
    if (fieldName.includes('email') || fieldName.includes('Email')) {
      return originalDefault || ''
    }

    return autoFillValues[testId]?.[fieldName] || originalDefault || ''
  }

  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({})

  const updateFormData = (testId: string, fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [fieldName]: value
      }
    }))
  }

  const testEmail = async (test: EmailTest) => {
    setTests(prev => prev.map(t => 
      t.id === test.id ? { ...t, status: 'loading' } : t
    ))

    try {
      const data = formData[test.id] || {}
      
      // Fill in default values for empty fields
      const payload = test.fields.reduce((acc, field) => {
        acc[field.name] = data[field.name] || getDefaultValue(test.id, field.name, field.defaultValue)
        return acc
      }, {} as Record<string, any>)

      // Convert benefits string to array for rank advancement
      if (test.id === 'rank-advancement' && payload.benefits) {
        payload.benefits = payload.benefits.split('\n').filter((b: string) => b.trim())
      }

      const response = await fetch(test.endpoint, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: test.method === 'POST' ? JSON.stringify(payload) : undefined,
      })

      const result = await response.json()

      setTests(prev => prev.map(t => 
        t.id === test.id ? { 
          ...t, 
          status: response.ok ? 'success' : 'error',
          result 
        } : t
      ))
    } catch (error) {
      setTests(prev => prev.map(t => 
        t.id === test.id ? { 
          ...t, 
          status: 'error',
          result: { error: error instanceof Error ? error.message : 'Unknown error' }
        } : t
      ))
    }
  }

  const getStatusIcon = (status: EmailTest['status']) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: EmailTest['status']) => {
    switch (status) {
      case 'loading':
        return <Badge variant="secondary">Sending...</Badge>
      case 'success':
        return <Badge variant="default" className="bg-green-500">Sent Successfully</Badge>
      case 'error':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Ready</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Testing Dashboard</h1>
          <p className="text-gray-600">Test all MLM email functions individually</p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
            <p className="text-sm text-blue-800">
              <strong>Quick Testing:</strong> All fields are auto-filled except email addresses. 
              Just enter your email address and click "Test Email" to send real emails!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Card key={test.id} className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  {getStatusIcon(test.status)}
                </div>
                <CardDescription>{test.description}</CardDescription>
                <div className="flex items-center justify-between">
                  {getStatusBadge(test.status)}
                  <Button
                    onClick={() => testEmail(test)}
                    disabled={test.status === 'loading'}
                    size="sm"
                    className="ml-2"
                  >
                    {test.status === 'loading' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Test Email
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {test.fields.map((field) => (
                  <div key={field.name}>
                    <Label htmlFor={`${test.id}-${field.name}`}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={`${test.id}-${field.name}`}
                        placeholder={field.placeholder}
                        value={formData[test.id]?.[field.name] || getDefaultValue(test.id, field.name, field.defaultValue)}
                        onChange={(e) => updateFormData(test.id, field.name, e.target.value)}
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={`${test.id}-${field.name}`}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[test.id]?.[field.name] || getDefaultValue(test.id, field.name, field.defaultValue)}
                        onChange={(e) => updateFormData(test.id, field.name, e.target.value)}
                      />
                    )}
                  </div>
                ))}

                {test.status === 'success' && test.result && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Email sent successfully! Message ID: {test.result.messageId}
                    </AlertDescription>
                  </Alert>
                )}

                {test.status === 'error' && test.result && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      Error: {test.result.error || 'Failed to send email'}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center space-x-4">
          <Button
            onClick={() => {
              // Fill all email fields with a test email
              const newFormData: Record<string, Record<string, string>> = {}
              tests.forEach(test => {
                newFormData[test.id] = {}
                test.fields.forEach(field => {
                  if (field.name.includes('email') || field.name.includes('Email')) {
                    newFormData[test.id][field.name] = 'test@example.com'
                  }
                })
              })
              setFormData(newFormData)
            }}
            variant="default"
            size="lg"
          >
            Fill All Emails
          </Button>
          <Button
            onClick={() => {
              setTests(prev => prev.map(t => ({ ...t, status: 'idle', result: undefined })))
              setFormData({})
            }}
            variant="outline"
            size="lg"
          >
            Reset All Tests
          </Button>
        </div>
      </div>
    </div>
  )
}
