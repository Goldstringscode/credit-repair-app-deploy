"use client"

import { useState, useEffect, useCallback } from 'react'

interface EmailMetrics {
  totalSent: number
  totalOpened: number
  totalClicked: number
  totalUnsubscribed: number
  totalBounced: number
  openRate: number
  clickRate: number
  unsubscribeRate: number
  bounceRate: number
  conversionRate: number
  growthRate: number
}

interface EmailCampaign {
  id: string
  name: string
  subject: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
  recipients: number
  sent: number
  opened: number
  clicked: number
  unsubscribed: number
  bounced: number
  openRate: number
  clickRate: number
  unsubscribeRate: number
  bounceRate: number
  conversionRate: number
  createdAt: string
  sentDate?: string
  template: string
  category: 'marketing' | 'transactional' | 'newsletter' | 'promotional'
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  category: string
  isDefault: boolean
  createdAt: string
  lastUsed?: string
  usageCount: number
  tags: string[]
}

interface EmailList {
  id: string
  name: string
  description: string
  subscribers: number
  activeSubscribers: number
  unsubscribed: number
  bounced: number
  createdAt: string
  lastUpdated: string
  tags: string[]
  isPublic: boolean
  growthRate: number
  avgOpenRate: number
  avgClickRate: number
}

interface EmailAnalytics {
  timeSeries: Array<{
    date: string
    sent: number
    opened: number
    clicked: number
    unsubscribed: number
    bounced: number
  }>
  deviceStats: Array<{
    device: string
    opens: number
    percentage: number
  }>
  locationStats: Array<{
    location: string
    opens: number
    percentage: number
  }>
}

interface UseEmailDashboardReturn {
  // Data
  metrics: EmailMetrics | null
  campaigns: EmailCampaign[]
  templates: EmailTemplate[]
  lists: EmailList[]
  analytics: EmailAnalytics | null
  
  // Loading states
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  
  // Error states
  error: string | null
  
  // Actions
  fetchData: (type?: string) => Promise<void>
  createCampaign: (data: Partial<EmailCampaign>) => Promise<EmailCampaign>
  updateCampaign: (id: string, data: Partial<EmailCampaign>) => Promise<EmailCampaign>
  deleteCampaign: (id: string) => Promise<void>
  sendCampaign: (id: string) => Promise<void>
  
  createTemplate: (data: Partial<EmailTemplate>) => Promise<EmailTemplate>
  updateTemplate: (id: string, data: Partial<EmailTemplate>) => Promise<EmailTemplate>
  deleteTemplate: (id: string) => Promise<void>
  
  createList: (data: Partial<EmailList>) => Promise<EmailList>
  updateList: (id: string, data: Partial<EmailList>) => Promise<EmailList>
  deleteList: (id: string) => Promise<void>
  
  sendTestEmail: (email: string, name?: string) => Promise<void>
  
  // Utility functions
  clearError: () => void
  refreshData: () => Promise<void>
}

export function useEmailDashboard(): UseEmailDashboardReturn {
  const [metrics, setMetrics] = useState<EmailMetrics | null>(null)
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [lists, setLists] = useState<EmailList[]>([])
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from API
  const fetchData = useCallback(async (type: string = 'overview') => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/email/dashboard?type=${type}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data')
      }
      
      const data = result.data
      
      switch (type) {
        case 'overview':
          setMetrics(data)
          break
        case 'campaigns':
          setCampaigns(data)
          break
        case 'templates':
          setTemplates(data)
          break
        case 'lists':
          setLists(data)
          break
        case 'analytics':
          setAnalytics(data)
          break
        default:
          // If no specific type, fetch all data
          if (data.overview) setMetrics(data.overview)
          if (data.campaigns) setCampaigns(data.campaigns)
          if (data.templates) setTemplates(data.templates)
          if (data.lists) setLists(data.lists)
          if (data.analytics) setAnalytics(data.analytics)
      }
    } catch (err) {
      console.error('Error fetching email dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create campaign
  const createCampaign = useCallback(async (data: Partial<EmailCampaign>): Promise<EmailCampaign> => {
    try {
      setIsCreating(true)
      setError(null)
      
      const response = await fetch('/api/email/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_campaign', data })
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create campaign')
      }
      
      const newCampaign = result.data
      setCampaigns(prev => [newCampaign, ...prev])
      
      return newCampaign
    } catch (err) {
      console.error('Error creating campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
      throw err
    } finally {
      setIsCreating(false)
    }
  }, [])

  // Update campaign
  const updateCampaign = useCallback(async (id: string, data: Partial<EmailCampaign>): Promise<EmailCampaign> => {
    try {
      setIsUpdating(true)
      setError(null)
      
      const response = await fetch('/api/email/dashboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_campaign', data: { id, ...data } })
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update campaign')
      }
      
      const updatedCampaign = result.data
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === id ? updatedCampaign : campaign
      ))
      
      return updatedCampaign
    } catch (err) {
      console.error('Error updating campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to update campaign')
      throw err
    } finally {
      setIsUpdating(false)
    }
  }, [])

  // Delete campaign
  const deleteCampaign = useCallback(async (id: string): Promise<void> => {
    try {
      setIsDeleting(true)
      setError(null)
      
      const response = await fetch(`/api/email/dashboard?type=campaign&id=${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete campaign')
      }
      
      setCampaigns(prev => prev.filter(campaign => campaign.id !== id))
    } catch (err) {
      console.error('Error deleting campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete campaign')
      throw err
    } finally {
      setIsDeleting(false)
    }
  }, [])

  // Send campaign
  const sendCampaign = useCallback(async (id: string): Promise<void> => {
    try {
      setIsUpdating(true)
      setError(null)
      
      const response = await fetch('/api/email/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_campaign', data: { id } })
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send campaign')
      }
      
      // Update campaign status
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === id ? { ...campaign, status: 'sent' as const } : campaign
      ))
    } catch (err) {
      console.error('Error sending campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to send campaign')
      throw err
    } finally {
      setIsUpdating(false)
    }
  }, [])

  // Create template
  const createTemplate = useCallback(async (data: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    try {
      setIsCreating(true)
      setError(null)
      
      const response = await fetch('/api/email/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_template', data })
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create template')
      }
      
      const newTemplate = result.data
      setTemplates(prev => [newTemplate, ...prev])
      
      return newTemplate
    } catch (err) {
      console.error('Error creating template:', err)
      setError(err instanceof Error ? err.message : 'Failed to create template')
      throw err
    } finally {
      setIsCreating(false)
    }
  }, [])

  // Update template
  const updateTemplate = useCallback(async (id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    try {
      setIsUpdating(true)
      setError(null)
      
      const response = await fetch('/api/email/dashboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_template', data: { id, ...data } })
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update template')
      }
      
      const updatedTemplate = result.data
      setTemplates(prev => prev.map(template => 
        template.id === id ? updatedTemplate : template
      ))
      
      return updatedTemplate
    } catch (err) {
      console.error('Error updating template:', err)
      setError(err instanceof Error ? err.message : 'Failed to update template')
      throw err
    } finally {
      setIsUpdating(false)
    }
  }, [])

  // Delete template
  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    try {
      setIsDeleting(true)
      setError(null)
      
      const response = await fetch(`/api/email/dashboard?type=template&id=${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete template')
      }
      
      setTemplates(prev => prev.filter(template => template.id !== id))
    } catch (err) {
      console.error('Error deleting template:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete template')
      throw err
    } finally {
      setIsDeleting(false)
    }
  }, [])

  // Create list
  const createList = useCallback(async (data: Partial<EmailList>): Promise<EmailList> => {
    try {
      setIsCreating(true)
      setError(null)
      
      const response = await fetch('/api/email/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_list', data })
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create list')
      }
      
      const newList = result.data
      setLists(prev => [newList, ...prev])
      
      return newList
    } catch (err) {
      console.error('Error creating list:', err)
      setError(err instanceof Error ? err.message : 'Failed to create list')
      throw err
    } finally {
      setIsCreating(false)
    }
  }, [])

  // Update list
  const updateList = useCallback(async (id: string, data: Partial<EmailList>): Promise<EmailList> => {
    try {
      setIsUpdating(true)
      setError(null)
      
      const response = await fetch('/api/email/dashboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_list', data: { id, ...data } })
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update list')
      }
      
      const updatedList = result.data
      setLists(prev => prev.map(list => 
        list.id === id ? updatedList : list
      ))
      
      return updatedList
    } catch (err) {
      console.error('Error updating list:', err)
      setError(err instanceof Error ? err.message : 'Failed to update list')
      throw err
    } finally {
      setIsUpdating(false)
    }
  }, [])

  // Delete list
  const deleteList = useCallback(async (id: string): Promise<void> => {
    try {
      setIsDeleting(true)
      setError(null)
      
      const response = await fetch(`/api/email/dashboard?type=list&id=${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete list')
      }
      
      setLists(prev => prev.filter(list => list.id !== id))
    } catch (err) {
      console.error('Error deleting list:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete list')
      throw err
    } finally {
      setIsDeleting(false)
    }
  }, [])

  // Send test email
  const sendTestEmail = useCallback(async (email: string, name?: string): Promise<void> => {
    try {
      setIsUpdating(true)
      setError(null)
      
      const response = await fetch('/api/email/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'send_test_email', 
          data: { email, name } 
        })
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send test email')
      }
    } catch (err) {
      console.error('Error sending test email:', err)
      setError(err instanceof Error ? err.message : 'Failed to send test email')
      throw err
    } finally {
      setIsUpdating(false)
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Refresh data
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch all data types in parallel
      const [overviewRes, campaignsRes, templatesRes, listsRes, analyticsRes] = await Promise.all([
        fetch('/api/email/dashboard?type=overview'),
        fetch('/api/email/dashboard?type=campaigns'),
        fetch('/api/email/dashboard?type=templates'),
        fetch('/api/email/dashboard?type=lists'),
        fetch('/api/email/dashboard?type=analytics')
      ])
      
      const [overviewData, campaignsData, templatesData, listsData, analyticsData] = await Promise.all([
        overviewRes.json(),
        campaignsRes.json(),
        templatesRes.json(),
        listsRes.json(),
        analyticsRes.json()
      ])
      
      // Set all data
      if (overviewData.success) setMetrics(overviewData.data)
      if (campaignsData.success) setCampaigns(campaignsData.data)
      if (templatesData.success) setTemplates(templatesData.data)
      if (listsData.success) setLists(listsData.data)
      if (analyticsData.success) setAnalytics(analyticsData.data)
      
      console.log('📧 Email Dashboard: Data refreshed successfully', {
        metrics: !!overviewData.success,
        campaigns: campaignsData.data?.length || 0,
        templates: templatesData.data?.length || 0,
        lists: listsData.data?.length || 0,
        analytics: !!analyticsData.success
      })
      
    } catch (err) {
      console.error('Error refreshing email dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load all data on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch all data types in parallel
        const [overviewRes, campaignsRes, templatesRes, listsRes, analyticsRes] = await Promise.all([
          fetch('/api/email/dashboard?type=overview'),
          fetch('/api/email/dashboard?type=campaigns'),
          fetch('/api/email/dashboard?type=templates'),
          fetch('/api/email/dashboard?type=lists'),
          fetch('/api/email/dashboard?type=analytics')
        ])
        
        const [overviewData, campaignsData, templatesData, listsData, analyticsData] = await Promise.all([
          overviewRes.json(),
          campaignsRes.json(),
          templatesRes.json(),
          listsRes.json(),
          analyticsRes.json()
        ])
        
        // Set all data
        if (overviewData.success) setMetrics(overviewData.data)
        if (campaignsData.success) setCampaigns(campaignsData.data)
        if (templatesData.success) setTemplates(templatesData.data)
        if (listsData.success) setLists(listsData.data)
        if (analyticsData.success) setAnalytics(analyticsData.data)
        
        console.log('📧 Email Dashboard: All data loaded successfully', {
          metrics: !!overviewData.success,
          campaigns: campaignsData.data?.length || 0,
          templates: templatesData.data?.length || 0,
          lists: listsData.data?.length || 0,
          analytics: !!analyticsData.success
        })
        
      } catch (err) {
        console.error('Error loading email dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadAllData()
  }, [])

  return {
    // Data
    metrics,
    campaigns,
    templates,
    lists,
    analytics,
    
    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Error states
    error,
    
    // Actions
    fetchData,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createList,
    updateList,
    deleteList,
    sendTestEmail,
    
    // Utility functions
    clearError,
    refreshData
  }
}
