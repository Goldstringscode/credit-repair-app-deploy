'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import jsPDF from 'jspdf'
import { 
  CreditCard, 
  Download, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Crown,
  Star,
  Zap,
  Settings,
  Plus,
  Minus,
  FileText,
  Clock,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Award,
  Share2
} from 'lucide-react'
import { MLMSubscriptionManager } from '@/components/mlm/mlm-subscription-manager'
import { MLMPaymentMethods } from '@/components/mlm/mlm-payment-methods'
import { StripePaymentForm } from '@/components/mlm/stripe-payment-form'
import { MLMSubscriptionSettings } from '@/components/mlm/mlm-subscription-settings'
import { PayoutSettingsModal } from '@/components/mlm/payout-settings-modal'
import { useAuth } from '@/hooks/use-auth-simple'
import Link from 'next/link'

interface MLMSubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  popular?: boolean
  icon: React.ReactNode
  mlmBenefits: string[]
  commissionRate: number
  rankRequirement?: string
}

interface MLMPaymentHistory {
  id: string
  date: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  description: string
  invoiceUrl?: string
  type: 'subscription' | 'commission' | 'bonus' | 'payout'
}

interface MLMSubscription {
  id: string
  planId: string
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEnd?: string
  cancelAtPeriodEnd: boolean
  mlmStatus: 'active' | 'inactive' | 'suspended'
  rank: string
  commissionEligible: boolean
}

interface MLMEarnings {
  currentMonth: number
  lifetime: number
  pending: number
  nextPayout: string
  commissionRate: number
  rank: string
}

export default function MLMBillingDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const [currentPlan, setCurrentPlan] = useState<MLMSubscriptionPlan | null>(null)
  const [subscription, setSubscription] = useState<MLMSubscription | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<MLMPaymentHistory[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [earnings, setEarnings] = useState<MLMEarnings | null>(null)
  const [payoutHistory, setPayoutHistory] = useState([
    { id: '1', date: '2024-01-01', amount: 1200.00, status: 'completed', method: 'Bank Transfer' },
    { id: '2', date: '2023-12-01', amount: 980.00, status: 'completed', method: 'Bank Transfer' },
    { id: '3', date: '2023-11-01', amount: 750.00, status: 'completed', method: 'Bank Transfer' },
    { id: '4', date: '2023-10-01', amount: 650.00, status: 'completed', method: 'Bank Transfer' },
    { id: '5', date: '2023-09-01', amount: 420.00, status: 'completed', method: 'Bank Transfer' }
  ])
  const [loading, setLoading] = useState(true)
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false)
  const [showEditPaymentMethod, setShowEditPaymentMethod] = useState(false)
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<any>(null)
  const [showPayoutSettings, setShowPayoutSettings] = useState(false)
  const [payoutSettings, setPayoutSettings] = useState<any>(null)
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'txt'>('csv')
  const [payoutExportFormat, setPayoutExportFormat] = useState<'csv' | 'pdf' | 'txt'>('csv')
  const [activeTab, setActiveTab] = useState('overview')
  const [showPlanSwitchModal, setShowPlanSwitchModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [planSwitchType, setPlanSwitchType] = useState<'upgrade' | 'downgrade' | null>(null)
  const [upgradeTiming, setUpgradeTiming] = useState<'immediate' | 'next_cycle'>('immediate')

  // Helper function to calculate next billing date
  const getNextBillingDate = () => {
    // In a real app, this would come from the user's subscription data
    // For demo purposes, we'll use a mock date 15 days from now
    const nextBilling = new Date()
    nextBilling.setDate(nextBilling.getDate() + 15)
    return nextBilling.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // MLM-specific plans with commission rates and rank requirements
  const mlmPlans: MLMSubscriptionPlan[] = [
    {
      id: 'mlm_starter',
      name: 'MLM Starter',
      description: 'Perfect for new MLM members',
      price: 49.99,
      currency: 'usd',
      interval: 'month',
      features: [
        'Basic MLM dashboard access',
        'Team management tools',
        'Commission tracking',
        'Email support',
        'Basic training materials'
      ],
      mlmBenefits: [
        '30% direct referral commission',
        'Access to starter training',
        'Basic marketing materials',
        'Team building tools'
      ],
      commissionRate: 0.30,
      rankRequirement: 'Associate',
      icon: <Star className="h-5 w-5" />
    },
    {
      id: 'mlm_professional',
      name: 'MLM Professional',
      description: 'Advanced MLM features for serious builders',
      price: 99.99,
      currency: 'usd',
      interval: 'month',
      features: [
        'Everything in Starter',
        'Advanced analytics',
        'Custom landing pages',
        'Priority support',
        'Advanced training modules',
        'Team performance tracking'
      ],
      mlmBenefits: [
        '35% direct referral commission',
        '5% unilevel commission (2 levels)',
        'Fast start bonus eligibility',
        'Advanced marketing tools',
        'Custom team pages'
      ],
      commissionRate: 0.35,
      rankRequirement: 'Consultant',
      popular: true,
      icon: <Crown className="h-5 w-5" />
    },
    {
      id: 'mlm_enterprise',
      name: 'MLM Enterprise',
      description: 'Complete MLM leadership solution',
      price: 199.98,
      currency: 'usd',
      interval: 'month',
      features: [
        'Everything in Professional',
        'Unlimited team members',
        'White-label options',
        '24/7 phone support',
        'Advanced reporting',
        'API access',
        'Custom integrations'
      ],
      mlmBenefits: [
        '40% direct referral commission',
        '10% unilevel commission (4 levels)',
        'Leadership bonus eligibility',
        'Infinity bonus access',
        'Presidential recognition',
        'Equity participation'
      ],
      commissionRate: 0.40,
      rankRequirement: 'Manager',
      icon: <Zap className="h-5 w-5" />
    }
  ]

  const mockPaymentHistory: MLMPaymentHistory[] = [
    {
      id: 'inv_001',
      date: '2024-01-15',
      amount: 99.99,
      currency: 'usd',
      status: 'paid',
      description: 'MLM Professional - Monthly',
      type: 'subscription',
      invoiceUrl: '#'
    },
    {
      id: 'comm_001',
      date: '2024-01-14',
      amount: 450.00,
      currency: 'usd',
      status: 'paid',
      description: 'Direct Referral Commission',
      type: 'commission'
    },
    {
      id: 'bonus_001',
      date: '2024-01-10',
      amount: 125.00,
      currency: 'usd',
      status: 'paid',
      description: 'Fast Start Bonus',
      type: 'bonus'
    },
    {
      id: 'payout_001',
      date: '2024-01-01',
      amount: 1200.00,
      currency: 'usd',
      status: 'paid',
      description: 'Monthly Payout',
      type: 'payout'
    }
  ]

  const mockSubscription: MLMSubscription = {
    id: 'sub_mlm_123',
    planId: 'mlm_professional',
    status: 'active',
    currentPeriodStart: '2024-01-15',
    currentPeriodEnd: '2024-02-15',
    cancelAtPeriodEnd: false,
    mlmStatus: 'active',
    rank: 'Consultant',
    commissionEligible: true
  }

  const mockEarnings: MLMEarnings = {
    currentMonth: 2100.00,
    lifetime: 45600.00,
    pending: 450.00,
    nextPayout: '2024-02-01',
    commissionRate: 0.35,
    rank: 'Consultant'
  }

  const mockPaymentMethods = [
    {
      id: 'pm_1',
      type: 'card' as const,
      card: {
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2025
      },
      isDefault: true,
      isExpired: false
    }
  ]

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setCurrentPlan(mlmPlans.find(p => p.id === mockSubscription.planId) || mlmPlans[1])
      setSubscription(mockSubscription)
      setPaymentHistory(mockPaymentHistory)
      setPaymentMethods(mockPaymentMethods)
      setEarnings(mockEarnings)

      // Load payout settings
      try {
        const response = await fetch('/api/mlm/payout-settings')
        if (response.ok) {
          const data = await response.json()
          setPayoutSettings(data.payoutSettings)
        }
      } catch (error) {
        console.error('Error loading payout settings:', error)
      }
      
      setLoading(false)
    }

    loadData()
  }, [])

  const handlePlanChange = (planId: string) => {
    const plan = mlmPlans.find(p => p.id === planId)
    if (plan && plan.id !== currentPlan?.id) {
      setSelectedPlan(plan)
      
      // Determine if it's an upgrade or downgrade
      const currentPrice = currentPlan?.price || 0
      const newPrice = plan.price
      
      if (newPrice > currentPrice) {
        setPlanSwitchType('upgrade')
      } else {
        setPlanSwitchType('downgrade')
      }
      
      setShowPlanSwitchModal(true)
    }
  }

  const confirmPlanSwitch = () => {
    if (selectedPlan) {
      setCurrentPlan(selectedPlan)
      console.log('Changing MLM plan to:', selectedPlan.name)
      
      // In real app, this would call API to change subscription
      if (planSwitchType === 'upgrade') {
        if (upgradeTiming === 'immediate') {
          console.log('Processing immediate upgrade payment...')
          // Call API to charge difference immediately
        } else {
          console.log('Scheduling upgrade for next billing cycle...')
          // Call API to schedule upgrade for next billing cycle
        }
      } else {
        console.log('Processing downgrade - no immediate charge')
        // Call API to schedule downgrade for next billing cycle
      }
      
      setShowPlanSwitchModal(false)
      setSelectedPlan(null)
      setPlanSwitchType(null)
      setUpgradeTiming('immediate')
    }
  }

  const cancelPlanSwitch = () => {
    setShowPlanSwitchModal(false)
    setSelectedPlan(null)
    setPlanSwitchType(null)
    setUpgradeTiming('immediate')
  }

  const handleCancelSubscription = () => {
    if (subscription) {
      setSubscription({
        ...subscription,
        cancelAtPeriodEnd: true
      })
      // In real app, this would call API to cancel subscription
      console.log('Cancelling MLM subscription')
    }
  }

  const handleReactivateSubscription = () => {
    if (subscription) {
      setSubscription({
        ...subscription,
        cancelAtPeriodEnd: false
      })
      // In real app, this would call API to reactivate subscription
      console.log('Reactivating MLM subscription')
    }
  }

  const handleAddPaymentMethod = (method: any) => {
    const newMethod = {
      ...method,
      id: `pm_${Date.now()}`
    }
    setPaymentMethods(prev => [...prev, newMethod])
    setShowAddPaymentMethod(false)
    console.log('Adding MLM payment method:', newMethod)
  }

  const handleEditPaymentMethod = (method: any) => {
    setEditingPaymentMethod(method)
    setShowEditPaymentMethod(true)
  }

  const handleUpdatePaymentMethod = (id: string, updates: any) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === id ? { ...method, ...updates } : method
      )
    )
    setShowEditPaymentMethod(false)
    setEditingPaymentMethod(null)
    console.log('Editing MLM payment method:', id, updates)
  }

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id))
    console.log('Deleting MLM payment method:', id)
  }

  const handleSetDefaultPaymentMethod = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    )
    console.log('Setting default MLM payment method:', id)
  }

  const handleSavePayoutSettings = (settings: any) => {
    setPayoutSettings(settings)
    console.log('Payout settings saved:', settings)
  }

  const handleDownloadPayment = (payment: any) => {
    const data = {
      id: payment.id,
      date: new Date(payment.date).toLocaleDateString(),
      description: payment.description,
      amount: payment.amount,
      status: payment.status,
      type: payment.type
    }

    let content: string
    let mimeType: string
    let fileExtension: string

    switch (exportFormat) {
      case 'csv':
        content = `Payment ID,Date,Description,Amount,Status,Type\n${data.id},${data.date},${data.description},$${data.amount},${data.status},${data.type}`
        mimeType = 'text/csv'
        fileExtension = 'csv'
        break
      case 'pdf':
        // Generate actual PDF using jsPDF
        const pdf = new jsPDF()
        
        // Add title
        pdf.setFontSize(20)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Payment Receipt', 20, 30)
        
        // Add line under title
        pdf.setLineWidth(0.5)
        pdf.line(20, 35, 190, 35)
        
        // Add payment details
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        
        let yPosition = 50
        const lineHeight = 8
        
        pdf.setFont('helvetica', 'bold')
        pdf.text('Payment ID:', 20, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(data.id, 80, yPosition)
        yPosition += lineHeight
        
        pdf.setFont('helvetica', 'bold')
        pdf.text('Date:', 20, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(data.date, 80, yPosition)
        yPosition += lineHeight
        
        pdf.setFont('helvetica', 'bold')
        pdf.text('Description:', 20, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(data.description, 80, yPosition)
        yPosition += lineHeight
        
        pdf.setFont('helvetica', 'bold')
        pdf.text('Amount:', 20, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`$${data.amount}`, 80, yPosition)
        yPosition += lineHeight
        
        pdf.setFont('helvetica', 'bold')
        pdf.text('Status:', 20, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(data.status, 80, yPosition)
        yPosition += lineHeight
        
        pdf.setFont('helvetica', 'bold')
        pdf.text('Type:', 20, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(data.type, 80, yPosition)
        yPosition += lineHeight + 10
        
        // Add footer
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'italic')
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition)
        
        // Save the PDF
        pdf.save(`payment-${data.id}.pdf`)
        return // Exit early since we're handling the download directly
      case 'txt':
        content = `Payment Receipt\n\nPayment ID: ${data.id}\nDate: ${data.date}\nDescription: ${data.description}\nAmount: $${data.amount}\nStatus: ${data.status}\nType: ${data.type}\n\nGenerated on: ${new Date().toLocaleDateString()}`
        mimeType = 'text/plain'
        fileExtension = 'txt'
        break
      default:
        content = `Payment ID,Date,Description,Amount,Status,Type\n${data.id},${data.date},${data.description},$${data.amount},${data.status},${data.type}`
        mimeType = 'text/csv'
        fileExtension = 'csv'
    }

    // Create and download the file
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `payment-${payment.id}.${fileExtension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleDownloadAllPayments = () => {
    const data = paymentHistory.map(payment => ({
      id: payment.id,
      date: new Date(payment.date).toLocaleDateString(),
      description: payment.description,
      amount: payment.amount,
      status: payment.status,
      type: payment.type
    }))

    let content: string
    let mimeType: string
    let fileExtension: string

    switch (exportFormat) {
      case 'csv':
        const csvHeader = 'Payment ID,Date,Description,Amount,Status,Type\n'
        const csvRows = data.map(payment => 
          `${payment.id},${payment.date},${payment.description},$${payment.amount},${payment.status},${payment.type}`
        ).join('\n')
        content = csvHeader + csvRows
        mimeType = 'text/csv'
        fileExtension = 'csv'
        break
      case 'pdf':
        // Generate actual PDF using jsPDF
        const pdf = new jsPDF()
        
        // Add title
        pdf.setFontSize(20)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Payment History Report', 20, 30)
        
        // Add subtitle
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40)
        
        // Add line under title
        pdf.setLineWidth(0.5)
        pdf.line(20, 45, 190, 45)
        
        // Add payments
        let yPosition = 60
        const lineHeight = 6
        const pageHeight = 280
        let currentPage = 1
        
        data.forEach((payment, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight) {
            pdf.addPage()
            currentPage++
            yPosition = 30
          }
          
          // Payment header
          pdf.setFontSize(14)
          pdf.setFont('helvetica', 'bold')
          pdf.text(`Payment ${index + 1}`, 20, yPosition)
          yPosition += lineHeight + 2
          
          // Payment details
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'normal')
          
          pdf.setFont('helvetica', 'bold')
          pdf.text('ID:', 20, yPosition)
          pdf.setFont('helvetica', 'normal')
          pdf.text(payment.id, 40, yPosition)
          yPosition += lineHeight
          
          pdf.setFont('helvetica', 'bold')
          pdf.text('Date:', 20, yPosition)
          pdf.setFont('helvetica', 'normal')
          pdf.text(payment.date, 40, yPosition)
          yPosition += lineHeight
          
          pdf.setFont('helvetica', 'bold')
          pdf.text('Description:', 20, yPosition)
          pdf.setFont('helvetica', 'normal')
          pdf.text(payment.description, 40, yPosition)
          yPosition += lineHeight
          
          pdf.setFont('helvetica', 'bold')
          pdf.text('Amount:', 20, yPosition)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`$${payment.amount}`, 40, yPosition)
          yPosition += lineHeight
          
          pdf.setFont('helvetica', 'bold')
          pdf.text('Status:', 20, yPosition)
          pdf.setFont('helvetica', 'normal')
          pdf.text(payment.status, 40, yPosition)
          yPosition += lineHeight
          
          pdf.setFont('helvetica', 'bold')
          pdf.text('Type:', 20, yPosition)
          pdf.setFont('helvetica', 'normal')
          pdf.text(payment.type, 40, yPosition)
          yPosition += lineHeight + 10
          
          // Add separator line
          if (index < data.length - 1) {
            pdf.setLineWidth(0.2)
            pdf.line(20, yPosition, 190, yPosition)
            yPosition += 5
          }
        })
        
        // Add footer
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'italic')
        pdf.text(`Total Payments: ${data.length}`, 20, yPosition + 10)
        
        // Save the PDF
        pdf.save(`payment-history-${new Date().toISOString().split('T')[0]}.pdf`)
        return // Exit early since we're handling the download directly
      case 'txt':
        content = `Payment History Report\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n` +
          data.map(payment => 
            `Payment ID: ${payment.id}\nDate: ${payment.date}\nDescription: ${payment.description}\nAmount: $${payment.amount}\nStatus: ${payment.status}\nType: ${payment.type}\n${'='.repeat(50)}`
          ).join('\n\n')
        mimeType = 'text/plain'
        fileExtension = 'txt'
        break
      default:
        const defaultHeader = 'Payment ID,Date,Description,Amount,Status,Type\n'
        const defaultRows = data.map(payment => 
          `${payment.id},${payment.date},${payment.description},$${payment.amount},${payment.status},${payment.type}`
        ).join('\n')
        content = defaultHeader + defaultRows
        mimeType = 'text/csv'
        fileExtension = 'csv'
    }

    // Create and download the file
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `payment-history-${new Date().toISOString().split('T')[0]}.${fileExtension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleDownloadPayout = (payout: any) => {
    const data = {
      id: payout.id,
      date: new Date(payout.date).toLocaleDateString(),
      amount: payout.amount,
      status: payout.status,
      method: payout.method
    }

    let content: string
    let mimeType: string
    let fileExtension: string

    switch (payoutExportFormat) {
      case 'csv':
        content = `Payout ID,Date,Amount,Status,Method\n${data.id},${data.date},$${data.amount},${data.status},${data.method}`
        mimeType = 'text/csv'
        fileExtension = 'csv'
        break
      case 'pdf':
        // Generate actual PDF using jsPDF
        const pdf = new jsPDF()
        
        // Add title
        pdf.setFontSize(20)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Payout Receipt', 20, 30)
        
        // Add line under title
        pdf.setLineWidth(0.5)
        pdf.line(20, 35, 190, 35)
        
        // Add payout details
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        
        let yPosition = 50
        const lineHeight = 8
        
        pdf.setFont('helvetica', 'bold')
        pdf.text('Payout ID:', 20, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(data.id, 80, yPosition)
        yPosition += lineHeight
        
        pdf.setFont('helvetica', 'bold')
        pdf.text('Date:', 20, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(data.date, 80, yPosition)
        yPosition += lineHeight
        
        pdf.setFont('helvetica', 'bold')
        pdf.text('Amount:', 20, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`$${data.amount}`, 80, yPosition)
        yPosition += lineHeight
        
        pdf.setFont('helvetica', 'bold')
        pdf.text('Status:', 20, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(data.status, 80, yPosition)
        yPosition += lineHeight
        
        pdf.setFont('helvetica', 'bold')
        pdf.text('Method:', 20, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(data.method, 80, yPosition)
        yPosition += lineHeight + 10
        
        // Add footer
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'italic')
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition)
        
        // Save the PDF
        pdf.save(`payout-${data.id}.pdf`)
        return // Exit early since we're handling the download directly
      case 'txt':
        content = `Payout Receipt\n\nPayout ID: ${data.id}\nDate: ${data.date}\nAmount: $${data.amount}\nStatus: ${data.status}\nMethod: ${data.method}\n\nGenerated on: ${new Date().toLocaleDateString()}`
        mimeType = 'text/plain'
        fileExtension = 'txt'
        break
      default:
        content = `Payout ID,Date,Amount,Status,Method\n${data.id},${data.date},$${data.amount},${data.status},${data.method}`
        mimeType = 'text/csv'
        fileExtension = 'csv'
    }

    // Create and download the file
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `payout-${payout.id}.${fileExtension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleDownloadAllPayouts = () => {
    const data = payoutHistory.map(payout => ({
      id: payout.id,
      date: new Date(payout.date).toLocaleDateString(),
      amount: payout.amount,
      status: payout.status,
      method: payout.method
    }))

    let content: string
    let mimeType: string
    let fileExtension: string

    switch (payoutExportFormat) {
      case 'csv':
        const csvHeader = 'Payout ID,Date,Amount,Status,Method\n'
        const csvRows = data.map(payout => 
          `${payout.id},${payout.date},$${payout.amount},${payout.status},${payout.method}`
        ).join('\n')
        content = csvHeader + csvRows
        mimeType = 'text/csv'
        fileExtension = 'csv'
        break
      case 'pdf':
        // Generate actual PDF using jsPDF
        const pdf = new jsPDF()
        
        // Add title
        pdf.setFontSize(20)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Payout History Report', 20, 30)
        
        // Add subtitle
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40)
        
        // Add line under title
        pdf.setLineWidth(0.5)
        pdf.line(20, 45, 190, 45)
        
        // Add payouts
        let yPosition = 60
        const lineHeight = 6
        const pageHeight = 280
        let currentPage = 1
        
        data.forEach((payout, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight) {
            pdf.addPage()
            currentPage++
            yPosition = 30
          }
          
          // Payout header
          pdf.setFontSize(14)
          pdf.setFont('helvetica', 'bold')
          pdf.text(`Payout ${index + 1}`, 20, yPosition)
          yPosition += lineHeight + 2
          
          // Payout details
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'normal')
          
          pdf.setFont('helvetica', 'bold')
          pdf.text('ID:', 20, yPosition)
          pdf.setFont('helvetica', 'normal')
          pdf.text(payout.id, 40, yPosition)
          yPosition += lineHeight
          
          pdf.setFont('helvetica', 'bold')
          pdf.text('Date:', 20, yPosition)
          pdf.setFont('helvetica', 'normal')
          pdf.text(payout.date, 40, yPosition)
          yPosition += lineHeight
          
          pdf.setFont('helvetica', 'bold')
          pdf.text('Amount:', 20, yPosition)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`$${payout.amount}`, 40, yPosition)
          yPosition += lineHeight
          
          pdf.setFont('helvetica', 'bold')
          pdf.text('Status:', 20, yPosition)
          pdf.setFont('helvetica', 'normal')
          pdf.text(payout.status, 40, yPosition)
          yPosition += lineHeight
          
          pdf.setFont('helvetica', 'bold')
          pdf.text('Method:', 20, yPosition)
          pdf.setFont('helvetica', 'normal')
          pdf.text(payout.method, 40, yPosition)
          yPosition += lineHeight + 10
          
          // Add separator line
          if (index < data.length - 1) {
            pdf.setLineWidth(0.2)
            pdf.line(20, yPosition, 190, yPosition)
            yPosition += 5
          }
        })
        
        // Add footer
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'italic')
        pdf.text(`Total Payouts: ${data.length}`, 20, yPosition + 10)
        
        // Save the PDF
        pdf.save(`payout-history-${new Date().toISOString().split('T')[0]}.pdf`)
        return // Exit early since we're handling the download directly
      case 'txt':
        content = `Payout History Report\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n` +
          data.map(payout => 
            `Payout ID: ${payout.id}\nDate: ${payout.date}\nAmount: $${payout.amount}\nStatus: ${payout.status}\nMethod: ${payout.method}\n${'='.repeat(50)}`
          ).join('\n\n')
        mimeType = 'text/plain'
        fileExtension = 'txt'
        break
      default:
        const defaultHeader = 'Payout ID,Date,Amount,Status,Method\n'
        const defaultRows = data.map(payout => 
          `${payout.id},${payout.date},$${payout.amount},${payout.status},${payout.method}`
        ).join('\n')
        content = defaultHeader + defaultRows
        mimeType = 'text/csv'
        fileExtension = 'csv'
    }

    // Create and download the file
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `payout-history-${new Date().toISOString().split('T')[0]}.${fileExtension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      past_due: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      trialing: { color: 'bg-blue-100 text-blue-800', icon: Calendar }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.paid
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subscription':
        return <CreditCard className="h-4 w-4" />
      case 'commission':
        return <DollarSign className="h-4 w-4" />
      case 'bonus':
        return <Award className="h-4 w-4" />
      case 'payout':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">MLM Billing & Earnings</h1>
        <p className="text-gray-600">Manage your MLM subscription, earnings, and payment methods</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">MLM Plans</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <MLMSubscriptionManager
            currentPlanId={currentPlan?.id || 'mlm_professional'}
            onPlanChange={handlePlanChange}
            onCancel={handleCancelSubscription}
            onReactivate={handleReactivateSubscription}
            subscription={subscription}
            earnings={earnings}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MLM Earnings Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Earnings Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {earnings && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-semibold text-lg">${earnings.currentMonth.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Lifetime Earnings</span>
                      <span className="font-semibold">${earnings.lifetime.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pending Payout</span>
                      <span className="font-semibold text-green-600">${earnings.pending.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Next Payout</span>
                      <span className="font-semibold">{earnings.nextPayout}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Current Rank</span>
                        <Badge className="bg-purple-100 text-purple-800">
                          {earnings.rank}
                        </Badge>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-gray-600">Commission Rate</span>
                        <span className="font-semibold">{(earnings.commissionRate * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Earnings Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Referral Link
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Billing Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* MLM Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mlmPlans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {plan.icon}
                    {plan.name}
                  </CardTitle>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-sm font-normal text-gray-600">/{plan.interval}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Features:</h4>
                    <ul className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">MLM Benefits:</h4>
                    <ul className="space-y-1">
                      {plan.mlmBenefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Award className="h-3 w-3 text-purple-500 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Commission Rate:</span>
                      <span className="font-semibold text-green-600">{(plan.commissionRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Rank Required:</span>
                      <Badge variant="outline">{plan.rankRequirement}</Badge>
                    </div>
                  </div>

                  <Button 
                    className="w-full"
                    variant={plan.id === currentPlan?.id ? "outline" : "default"}
                    onClick={() => handlePlanChange(plan.id)}
                    disabled={plan.id === currentPlan?.id}
                  >
                    {plan.id === currentPlan?.id ? 'Current Plan' : 
                     plan.price > (currentPlan?.price || 0) ? 'Upgrade Plan' : 
                     plan.price < (currentPlan?.price || 0) ? 'Downgrade Plan' : 'Switch Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <MLMSubscriptionSettings
            subscription={subscription || {
              id: 'demo-subscription',
              status: 'active',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              cancelAtPeriodEnd: false,
              planType: 'mlm_starter',
              commissionRate: 30,
              rank: 'Bronze',
              mlmStatus: 'active',
              commissionEligible: true
            }}
            onPlanChange={handlePlanChange}
            onCancel={handleCancelSubscription}
            onReactivate={handleReactivateSubscription}
            onUpdatePaymentMethod={(paymentMethodId) => {
              console.log('Updating payment method:', paymentMethodId)
              // Switch to payment methods tab
              setActiveTab('payment-methods')
            }}
          />
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-green-600">${earnings?.currentMonth.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lifetime</p>
                    <p className="text-2xl font-bold text-blue-600">${earnings?.lifetime.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">${earnings?.pending.toLocaleString()}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Commission Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{(earnings?.commissionRate || 0) * 100}%</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Earnings Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Direct Referrals</h4>
                    <p className="text-2xl font-bold text-green-600">$1,200.00</p>
                    <p className="text-sm text-gray-600">5 referrals this month</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Team Commissions</h4>
                    <p className="text-2xl font-bold text-blue-600">$650.00</p>
                    <p className="text-sm text-gray-600">Unilevel commissions</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Bonuses</h4>
                    <p className="text-2xl font-bold text-purple-600">$250.00</p>
                    <p className="text-sm text-gray-600">Fast start & matching</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Total This Month</h4>
                    <p className="text-2xl font-bold text-gray-900">${earnings?.currentMonth.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">All income streams</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Payment History
                </CardTitle>
                <div className="flex items-center gap-2">
                  <select 
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf' | 'txt')}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                    <option value="txt">TXT</option>
                  </select>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDownloadAllPayments}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getTypeIcon(payment.type)}
                      </div>
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-gray-600">{new Date(payment.date).toLocaleDateString()}</p>
                        <Badge variant="outline" className="mt-1">
                          {payment.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">${payment.amount}</p>
                        {getPaymentStatusBadge(payment.status)}
                      </div>
                      <div className="flex items-center gap-1">
                        <select 
                          value={exportFormat}
                          onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf' | 'txt')}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="csv">CSV</option>
                          <option value="pdf">PDF</option>
                          <option value="txt">TXT</option>
                        </select>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadPayment(payment)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Next Payout</p>
                    <p className="text-2xl font-bold">${earnings?.pending.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{earnings?.nextPayout}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payout Method</p>
                    <p className="text-lg font-bold">Bank Transfer</p>
                    <p className="text-sm text-gray-600">****1234</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Minimum Payout</p>
                    <p className="text-2xl font-bold">$50.00</p>
                    <p className="text-sm text-gray-600">Threshold reached</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Payouts
                </CardTitle>
                <div className="flex items-center gap-2">
                  <select 
                    value={payoutExportFormat}
                    onChange={(e) => setPayoutExportFormat(e.target.value as 'csv' | 'pdf' | 'txt')}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                    <option value="txt">TXT</option>
                  </select>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDownloadAllPayouts}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payoutHistory.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Payout #{payout.id}</p>
                      <p className="text-sm text-gray-600">{new Date(payout.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">{payout.method}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">${payout.amount}</p>
                        <Badge className="bg-green-100 text-green-800">
                          {payout.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <select 
                          value={payoutExportFormat}
                          onChange={(e) => setPayoutExportFormat(e.target.value as 'csv' | 'pdf' | 'txt')}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="csv">CSV</option>
                          <option value="pdf">PDF</option>
                          <option value="txt">TXT</option>
                        </select>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadPayout(payout)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                    <p className="text-2xl font-bold text-green-600">+15.2%</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 ml-1">vs last month</span>
                    </div>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-blue-600">12.5%</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-blue-600 ml-1">+2.1%</span>
                    </div>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Size</p>
                    <p className="text-2xl font-bold text-purple-600">47</p>
                    <div className="flex items-center mt-1">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-purple-600 ml-1">Active members</span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rank Progress</p>
                    <p className="text-2xl font-bold text-orange-600">65%</p>
                    <div className="flex items-center mt-1">
                      <Award className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-orange-600 ml-1">to next rank</span>
                    </div>
                  </div>
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Earnings Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Monthly Earnings</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">January 2024</span>
                        <span className="font-medium">$2,100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">December 2023</span>
                        <span className="font-medium">$1,850</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">November 2023</span>
                        <span className="font-medium">$1,650</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Income Sources</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Direct Referrals</span>
                        <span className="font-medium text-green-600">57%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Team Commissions</span>
                        <span className="font-medium text-blue-600">31%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Bonuses</span>
                        <span className="font-medium text-purple-600">12%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment-methods" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Payment Methods</h3>
              <p className="text-sm text-gray-600">Manage your payment methods for MLM subscriptions and payouts</p>
            </div>
            <Button onClick={() => setShowAddPaymentMethod(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>

          <MLMPaymentMethods
            paymentMethods={paymentMethods}
            onAdd={handleAddPaymentMethod}
            onEdit={handleEditPaymentMethod}
            onDelete={handleDeletePaymentMethod}
            onSetDefault={handleSetDefaultPaymentMethod}
          />

          <Card>
            <CardHeader>
              <CardTitle>Payout Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Payout Method</label>
                <p className="text-sm text-gray-600">
                  {payoutSettings?.payoutMethod === 'card' 
                    ? `Card ending in ${paymentMethods.find(pm => pm.id === payoutSettings.payoutMethodId)?.card?.last4 || '****'}`
                    : payoutSettings?.payoutMethod === 'bank'
                    ? `Bank account ending in ${paymentMethods.find(pm => pm.id === payoutSettings.payoutMethodId)?.bank?.last4 || '****'}`
                    : payoutSettings?.payoutMethod === 'paypal'
                    ? `PayPal: ${paymentMethods.find(pm => pm.id === payoutSettings.payoutMethodId)?.paypal?.email || 'Not set'}`
                    : 'No payout method set'
                  }
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Payout Amount</label>
                <p className="text-sm text-gray-600">
                  ${payoutSettings?.minimumPayoutAmount?.toFixed(2) || '50.00'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payout Schedule</label>
                <p className="text-sm text-gray-600">
                  {payoutSettings?.payoutSchedule 
                    ? (() => {
                        const schedule = payoutSettings.payoutSchedule.charAt(0).toUpperCase() + payoutSettings.payoutSchedule.slice(1);
                        const day = payoutSettings.payoutDay;
                        const suffix = payoutSettings.payoutSchedule === 'monthly' ? 'st' : 'th';
                        const period = payoutSettings.payoutSchedule === 'monthly' ? 'month' : 
                                     payoutSettings.payoutSchedule === 'weekly' ? 'week' : 'period';
                        return `${schedule} (${day}${suffix} of each ${period})`;
                      })()
                    : 'Monthly (1st of each month)'
                  }
                </p>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowPayoutSettings(true)}
              >
                Update Payout Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Payment Method Modal */}
      {showAddPaymentMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <StripePaymentForm
              onSuccess={handleAddPaymentMethod}
              onError={(error) => {
                console.error('Payment method error:', error)
                setShowAddPaymentMethod(false)
              }}
            />
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowAddPaymentMethod(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Method Modal */}
      {showEditPaymentMethod && editingPaymentMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <StripePaymentForm
              isEditing={true}
              existingMethod={editingPaymentMethod}
              onSuccess={(method) => {
                handleUpdatePaymentMethod(editingPaymentMethod.id, method)
              }}
              onError={(error) => {
                console.error('Payment method error:', error)
                setShowEditPaymentMethod(false)
                setEditingPaymentMethod(null)
              }}
            />
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditPaymentMethod(false)
                  setEditingPaymentMethod(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Settings Modal */}
      <PayoutSettingsModal
        isOpen={showPayoutSettings}
        onClose={() => setShowPayoutSettings(false)}
        onSave={handleSavePayoutSettings}
        currentSettings={payoutSettings}
        paymentMethods={paymentMethods}
      />

      {/* Plan Switch Confirmation Modal */}
      {showPlanSwitchModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              {planSwitchType === 'upgrade' ? (
                <div className="p-2 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              ) : (
                <div className="p-2 bg-blue-100 rounded-full">
                  <TrendingDown className="h-6 w-6 text-blue-600" />
                </div>
              )}
              <h2 className="text-2xl font-bold">
                {planSwitchType === 'upgrade' ? 'Upgrade Plan' : 'Downgrade Plan'}
              </h2>
            </div>

            <div className="space-y-4">
              {/* Current vs New Plan Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-600 mb-2">Current Plan</h3>
                  <div className="text-2xl font-bold">{currentPlan?.name}</div>
                  <div className="text-lg text-gray-600">${currentPlan?.price}/month</div>
                  <div className="text-sm text-gray-500">{(currentPlan?.commissionRate || 0) * 100}% commission</div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-600 mb-2">New Plan</h3>
                  <div className="text-2xl font-bold text-blue-600">{selectedPlan.name}</div>
                  <div className="text-lg text-blue-600">${selectedPlan.price}/month</div>
                  <div className="text-sm text-gray-500">{(selectedPlan.commissionRate || 0) * 100}% commission</div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">Pricing Details</h3>
                {planSwitchType === 'upgrade' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>New Plan Price:</span>
                        <span className="font-semibold">${selectedPlan.price}/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Plan Price:</span>
                        <span className="font-semibold">${currentPlan?.price}/month</span>
                      </div>
                    </div>

                    {/* Upgrade Timing Options */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">When would you like to upgrade?</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="upgradeTiming"
                            value="immediate"
                            checked={upgradeTiming === 'immediate'}
                            onChange={(e) => setUpgradeTiming(e.target.value as 'immediate' | 'next_cycle')}
                            className="w-4 h-4 text-green-600"
                          />
                          <div className="flex-1">
                            <div className="font-medium">Upgrade Now</div>
                            <div className="text-sm text-gray-600">
                              Pay ${(selectedPlan.price - (currentPlan?.price || 0)).toFixed(2)} difference immediately
                            </div>
                          </div>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="upgradeTiming"
                            value="next_cycle"
                            checked={upgradeTiming === 'next_cycle'}
                            onChange={(e) => setUpgradeTiming(e.target.value as 'immediate' | 'next_cycle')}
                            className="w-4 h-4 text-green-600"
                          />
                          <div className="flex-1">
                            <div className="font-medium">Upgrade at Next Billing Cycle</div>
                            <div className="text-sm text-gray-600">
                              No immediate charge - upgrade takes effect on {getNextBillingDate()}
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      {upgradeTiming === 'immediate' ? (
                        <div>
                          <div className="flex justify-between text-lg font-bold text-green-600">
                            <span>Immediate Charge:</span>
                            <span>${(selectedPlan.price - (currentPlan?.price || 0)).toFixed(2)}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            You'll be charged the difference immediately, then ${selectedPlan.price}/month going forward.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between text-lg font-bold text-blue-600">
                            <span>Immediate Charge:</span>
                            <span>$0.00</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            No immediate charge. Your next billing cycle will be ${selectedPlan.price}/month.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>New Plan Price:</span>
                      <span className="font-semibold">${selectedPlan.price}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Plan Price:</span>
                      <span className="font-semibold">${currentPlan?.price}/month</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold text-blue-600">
                        <span>Immediate Charge:</span>
                        <span>$0.00</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        No immediate charge. Your next billing cycle will be ${selectedPlan.price}/month.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">Terms & Conditions</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {planSwitchType === 'upgrade' ? (
                    <>
                      {upgradeTiming === 'immediate' ? (
                        <>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>You will be charged the price difference of ${(selectedPlan.price - (currentPlan?.price || 0)).toFixed(2)} immediately upon confirmation.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Your new commission rate of {(selectedPlan.commissionRate || 0) * 100}% will be effective immediately.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Future billing cycles will be charged at ${selectedPlan.price}/month.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>All new plan features and benefits will be available immediately.</span>
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span>No immediate charge - you'll continue paying ${currentPlan?.price}/month until {getNextBillingDate()}.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span>Your commission rate will change to {(selectedPlan.commissionRate || 0) * 100}% on {getNextBillingDate()}.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span>You'll be charged ${selectedPlan.price}/month starting from {getNextBillingDate()}.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span>New plan features will be available on {getNextBillingDate()}.</span>
                          </li>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>No immediate charge - you'll continue paying ${currentPlan?.price}/month until your next billing cycle.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>Your commission rate will change to {(selectedPlan.commissionRate || 0) * 100}% at the next billing cycle.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>You'll be charged ${selectedPlan.price}/month starting from your next billing cycle.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>Some features may be restricted until the downgrade takes effect.</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Warning for Downgrades */}
              {planSwitchType === 'downgrade' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Important Notice</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Downgrading may affect your current earnings and access to certain features. 
                        Please review the plan differences carefully before proceeding.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={cancelPlanSwitch}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmPlanSwitch}
                className={`flex-1 ${
                  planSwitchType === 'upgrade' 
                    ? (upgradeTiming === 'immediate' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700')
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {planSwitchType === 'upgrade' 
                  ? (upgradeTiming === 'immediate' ? 'Upgrade Now' : 'Schedule Upgrade')
                  : 'Schedule Downgrade'
                }
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
