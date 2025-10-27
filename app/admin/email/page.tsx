'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Mail, 
  Send, 
  Users, 
  Eye, 
  MousePointer, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  Calendar,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileText
} from 'lucide-react'
import CreateCampaignModal from '@/components/email-create-campaign-modal'
import CreateTemplateModal from '@/components/email-create-template-modal'
import EditCampaignModal from '@/components/email-edit-campaign-modal'
import EditTemplateModal from '@/components/email-edit-template-modal'
import ResendCampaignModal from '@/components/email-resend-campaign-modal'

interface EmailCampaign {
  id: string
  name: string
  subject: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
  recipients: number
  sent: number
  opened: number
  clicked: number
  createdAt: string
  scheduledFor?: string
  template: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'welcome' | 'promotional' | 'transactional' | 'newsletter'
  createdAt: string
  updatedAt: string
}

const mockCampaigns: EmailCampaign[] = [
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
    template: 'welcome-1'
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
    template: 'newsletter-jan'
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
    template: 'premium-upgrade'
  }
]

const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email - Day 1',
    subject: 'Welcome to CreditRepair Pro!',
    content: 'Welcome to our platform...',
    type: 'welcome',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Monthly Newsletter',
    subject: 'Your Credit Score Update & Tips',
    content: 'Here are this month\'s updates...',
    type: 'newsletter',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-20'
  },
  {
    id: '3',
    name: 'Premium Upgrade Offer',
    subject: 'Unlock Advanced Features Today!',
    content: 'Upgrade to premium for...',
    type: 'promotional',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-25'
  }
]

export default function EmailMarketingPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTab, setSelectedTab] = useState('campaigns')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState(false)
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false)
  const [isEditCampaignModalOpen, setIsEditCampaignModalOpen] = useState(false)
  const [isEditTemplateModalOpen, setIsEditTemplateModalOpen] = useState(false)
  const [isResendCampaignModalOpen, setIsResendCampaignModalOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [metrics, setMetrics] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    draftCampaigns: 0,
    scheduledCampaigns: 0,
    totalRecipients: 0,
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    openRate: 0,
    clickRate: 0
  })

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Load campaigns
      const campaignsResponse = await fetch('/api/admin/email/campaigns')
      const campaignsData = await campaignsResponse.json()
      
      if (campaignsData.success) {
        setCampaigns(campaignsData.data.campaigns)
        setMetrics(campaignsData.data.metrics)
      }

      // Load templates
      const templatesResponse = await fetch('/api/admin/email/templates')
      const templatesData = await templatesResponse.json()
      
      if (templatesData.success) {
        setTemplates(templatesData.data.templates)
      }

      console.log('Email marketing data loaded')
    } catch (error) {
      console.error('Error loading email marketing data:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData()
      }
    }

    const handleFocus = () => {
      loadData()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
      sending: { color: 'bg-yellow-100 text-yellow-800', label: 'Sending' },
      sent: { color: 'bg-green-100 text-green-800', label: 'Sent' },
      paused: { color: 'bg-red-100 text-red-800', label: 'Paused' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getTemplateTypeBadge = (type: string) => {
    const typeConfig = {
      welcome: { color: 'bg-green-100 text-green-800', label: 'Welcome' },
      promotional: { color: 'bg-blue-100 text-blue-800', label: 'Promotional' },
      transactional: { color: 'bg-purple-100 text-purple-800', label: 'Transactional' },
      newsletter: { color: 'bg-orange-100 text-orange-800', label: 'Newsletter' }
    }
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.welcome
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const handleCreateCampaign = () => {
    setIsCreateCampaignModalOpen(true)
  }

  const handleCreateTemplate = () => {
    setIsCreateTemplateModalOpen(true)
  }

  const handleCampaignCreated = (newCampaign: EmailCampaign) => {
    setCampaigns(prev => [...prev, newCampaign])
    loadData() // Refresh data to get updated metrics
  }

  const handleTemplateCreated = (newTemplate: EmailTemplate) => {
    setTemplates(prev => [...prev, newTemplate])
  }

  const handleSendCampaign = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    if (!campaign) return

    try {
      const response = await fetch('/api/admin/email/campaigns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: campaignId,
          status: 'sending'
        })
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setCampaigns(prev => prev.map(c => 
          c.id === campaignId ? { ...c, status: 'sending' } : c
        ))
        alert('Campaign is now sending!')
        loadData() // Refresh data
      } else {
        alert(`Failed to send campaign: ${data.error}`)
      }
    } catch (error) {
      console.error('Error sending campaign:', error)
      alert('An error occurred while sending the campaign')
    }
  }

  const handleEditCampaign = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    if (campaign) {
      setSelectedCampaign(campaign)
      setIsEditCampaignModalOpen(true)
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        const response = await fetch(`/api/admin/email/campaigns?id=${campaignId}`, {
          method: 'DELETE'
        })

        const data = await response.json()

        if (data.success) {
          setCampaigns(prev => prev.filter(c => c.id !== campaignId))
          alert('Campaign deleted successfully!')
          loadData() // Refresh data
        } else {
          alert(`Failed to delete campaign: ${data.error}`)
        }
      } catch (error) {
        console.error('Error deleting campaign:', error)
        alert('An error occurred while deleting the campaign')
      }
    }
  }

  const handleEditTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      setIsEditTemplateModalOpen(true)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        const response = await fetch(`/api/admin/email/templates?id=${templateId}`, {
          method: 'DELETE'
        })

        const data = await response.json()

        if (data.success) {
          setTemplates(prev => prev.filter(t => t.id !== templateId))
          alert('Template deleted successfully!')
        } else {
          alert(`Failed to delete template: ${data.error}`)
        }
      } catch (error) {
        console.error('Error deleting template:', error)
        alert('An error occurred while deleting the template')
      }
    }
  }

  const handleCampaignUpdated = (updatedCampaign: EmailCampaign) => {
    setCampaigns(prev => prev.map(c => 
      c.id === updatedCampaign.id ? updatedCampaign : c
    ))
    loadData() // Refresh data to get updated metrics
  }

  const handleTemplateUpdated = (updatedTemplate: EmailTemplate) => {
    setTemplates(prev => prev.map(t => 
      t.id === updatedTemplate.id ? updatedTemplate : t
    ))
  }

  const handleResendCampaign = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    if (campaign) {
      setSelectedCampaign(campaign)
      setIsResendCampaignModalOpen(true)
    }
  }

  const handleCampaignResent = (updatedCampaign: EmailCampaign) => {
    setCampaigns(prev => prev.map(c => 
      c.id === updatedCampaign.id ? updatedCampaign : c
    ))
    loadData() // Refresh data to get updated metrics
  }

  const handleRefreshData = () => {
    loadData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading email marketing data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Marketing</h1>
          <p className="text-gray-600">Manage email campaigns, templates, and analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateCampaign}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeCampaigns} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              {templates.filter(t => t.type === 'welcome').length} welcome
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.openRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalOpened} opens
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.clickRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalClicked} clicks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>
                Manage your email marketing campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold">{campaign.name}</h3>
                        {getStatusBadge(campaign.status)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{campaign.subject}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Recipients: {campaign.recipients}</span>
                        <span>Sent: {campaign.sent}</span>
                        <span>Opened: {campaign.opened}</span>
                        <span>Clicked: {campaign.clicked}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {campaign.status === 'draft' && (
                        <Button size="sm" onClick={() => handleSendCampaign(campaign.id)}>
                          <Send className="h-4 w-4 mr-1" />
                          Send
                        </Button>
                      )}
                      {campaign.status === 'sent' && (
                        <Button size="sm" onClick={() => handleResendCampaign(campaign.id)}>
                          <Send className="h-4 w-4 mr-1" />
                          Resend
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleEditCampaign(campaign.id)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteCampaign(campaign.id)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>
                    Create and manage email templates
                  </CardDescription>
                </div>
                <Button onClick={handleCreateTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      {getTemplateTypeBadge(template.type)}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.subject}</p>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template.id)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteTemplate(template.id)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Analytics</CardTitle>
              <CardDescription>
                Track email performance and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Campaign Performance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Open Rate</span>
                        <span className="font-semibold">{metrics.openRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.openRate} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Click Rate</span>
                        <span className="font-semibold">{metrics.clickRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.clickRate} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Sent</span>
                        <span className="font-semibold">{metrics.totalSent}</span>
                      </div>
                      <Progress value={Math.min((metrics.totalSent / Math.max(metrics.totalRecipients, 1)) * 100, 100)} className="h-2" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {campaigns.slice(0, 3).map((campaign) => (
                        <div key={campaign.id} className="flex items-center space-x-3">
                          {campaign.status === 'sent' && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {campaign.status === 'scheduled' && <Clock className="h-4 w-4 text-blue-500" />}
                          {campaign.status === 'draft' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                          {campaign.status === 'sending' && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                          {campaign.status === 'paused' && <AlertCircle className="h-4 w-4 text-red-500" />}
                          <div>
                            <p className="text-sm font-medium">{campaign.name}</p>
                            <p className="text-xs text-gray-500">
                              {campaign.status === 'sent' && `Sent to ${campaign.recipients} recipients`}
                              {campaign.status === 'scheduled' && `Scheduled for ${new Date(campaign.scheduledFor || '').toLocaleDateString()}`}
                              {campaign.status === 'draft' && 'Draft - needs review'}
                              {campaign.status === 'sending' && 'Currently sending...'}
                              {campaign.status === 'paused' && 'Paused'}
                            </p>
                          </div>
                        </div>
                      ))}
                      {campaigns.length === 0 && (
                        <p className="text-sm text-gray-500">No campaigns yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateCampaignModal
        isOpen={isCreateCampaignModalOpen}
        onClose={() => setIsCreateCampaignModalOpen(false)}
        onSuccess={handleCampaignCreated}
      />

      <CreateTemplateModal
        isOpen={isCreateTemplateModalOpen}
        onClose={() => setIsCreateTemplateModalOpen(false)}
        onSuccess={handleTemplateCreated}
      />

      <EditCampaignModal
        isOpen={isEditCampaignModalOpen}
        onClose={() => {
          setIsEditCampaignModalOpen(false)
          setSelectedCampaign(null)
        }}
        onSuccess={handleCampaignUpdated}
        campaign={selectedCampaign}
      />

      <EditTemplateModal
        isOpen={isEditTemplateModalOpen}
        onClose={() => {
          setIsEditTemplateModalOpen(false)
          setSelectedTemplate(null)
        }}
        onSuccess={handleTemplateUpdated}
        template={selectedTemplate}
      />

      <ResendCampaignModal
        isOpen={isResendCampaignModalOpen}
        onClose={() => {
          setIsResendCampaignModalOpen(false)
          setSelectedCampaign(null)
        }}
        onSuccess={handleCampaignResent}
        campaign={selectedCampaign}
      />
    </div>
  )
}
