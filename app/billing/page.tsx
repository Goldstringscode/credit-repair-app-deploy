'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CreditCard, 
  Download, 
  FileText, 
  Mail, 
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { PlanManagement } from '@/components/billing/PlanManagement'
import { PaymentHistory } from '@/components/billing/PaymentHistory'
import { CardManagement } from '@/components/billing/CardManagement'
import { MailPayments } from '@/components/billing/MailPayments'
import { BillingOverview } from '@/components/billing/BillingOverview'
import { UserBillingEnhancements } from '@/components/billing/UserBillingEnhancements'
import { InvoiceManagement } from '@/components/billing/InvoiceManagement'
import { BillingAnalytics } from '@/components/billing/BillingAnalytics'
import { AuthWrapper } from '@/components/billing/AuthWrapper'

export default function BillingPage() {
  return (
    <AuthWrapper>
      <BillingContent />
    </AuthWrapper>
  )
}

function BillingContent() {
  const [currentPlan, setCurrentPlan] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserBillingData()
  }, [])

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  const fetchUserBillingData = async () => {
    try {
      setLoading(true)
      
      // Fetch user's subscription data
      const response = await fetch(`${window.location.origin}/api/billing/user/subscription`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
        setCurrentPlan(data.plan)
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
        <p className="text-gray-600 mt-2">Manage your subscription, payment methods, and billing history</p>
      </div>

      {/* Current Plan Overview */}
      {currentPlan && subscription ? (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Plan
                </CardTitle>
                <CardDescription>
                  Your active subscription details
                </CardDescription>
              </div>
              <Badge 
                variant={subscription.status === 'active' ? 'default' : 
                        subscription.status === 'trialing' ? 'secondary' : 'destructive'}
                className="text-sm"
              >
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Plan</p>
                <p className="text-lg font-semibold">{currentPlan.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Amount</p>
                <p className="text-lg font-semibold">${(currentPlan.amount / 100).toFixed(2)}/month</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Next Billing</p>
                <p className="text-lg font-semibold">
                  {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              No Active Subscription
            </CardTitle>
            <CardDescription>
              You don't have an active subscription yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">Get started with one of our plans below</p>
              <Button asChild>
                <a href="#plans">View Plans</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced User Features */}
      <UserBillingEnhancements onRefresh={fetchUserBillingData} />

      {/* Main Billing Interface */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Cards
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="mail" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Mail Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <BillingOverview 
            subscription={subscription}
            currentPlan={currentPlan}
            onRefresh={fetchUserBillingData}
          />
        </TabsContent>

        <TabsContent value="plans">
          <PlanManagement 
            currentPlan={currentPlan}
            subscription={subscription}
            onPlanChange={fetchUserBillingData}
          />
        </TabsContent>

        <TabsContent value="cards">
          <CardManagement 
            onCardUpdate={fetchUserBillingData}
          />
        </TabsContent>

        <TabsContent value="history">
          <PaymentHistory 
            onExport={fetchUserBillingData}
          />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoiceManagement 
            onRefresh={fetchUserBillingData}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <BillingAnalytics 
            onRefresh={fetchUserBillingData}
          />
        </TabsContent>

        <TabsContent value="mail">
          <MailPayments 
            onUpdate={fetchUserBillingData}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
