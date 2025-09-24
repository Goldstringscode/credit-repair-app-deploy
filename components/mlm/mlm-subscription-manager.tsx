'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Crown, 
  Star, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Award,
  Target,
  TrendingUp
} from 'lucide-react'

interface MLMPlan {
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

interface MLMSubscriptionManagerProps {
  currentPlanId: string
  onPlanChange: (planId: string) => void
  onCancel: () => void
  onReactivate: () => void
  subscription?: MLMSubscription | null
  earnings?: MLMEarnings | null
}

export function MLMSubscriptionManager({
  currentPlanId,
  onPlanChange,
  onCancel,
  onReactivate,
  subscription,
  earnings
}: MLMSubscriptionManagerProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showChangeDialog, setShowChangeDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const mlmPlans: MLMPlan[] = [
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
      price: 199.99,
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

  const currentPlan = mlmPlans.find(p => p.id === currentPlanId)

  const handlePlanChange = () => {
    if (selectedPlan) {
      onPlanChange(selectedPlan)
      setShowChangeDialog(false)
      setSelectedPlan(null)
    }
  }

  const handleCancel = () => {
    onCancel()
    setShowCancelDialog(false)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      past_due: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
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

  const getMLMStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle },
      suspended: { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            MLM Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentPlan && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentPlan.icon}
                  <div>
                    <h3 className="font-semibold text-lg">{currentPlan.name}</h3>
                    <p className="text-gray-600">{currentPlan.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {subscription && getStatusBadge(subscription.status)}
                  {subscription && getMLMStatusBadge(subscription.mlmStatus)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  ${currentPlan.price}
                  <span className="text-sm font-normal text-gray-600">/{currentPlan.interval}</span>
                </span>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Commission Rate</p>
                  <p className="text-lg font-semibold text-green-600">
                    {(currentPlan.commissionRate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* MLM-specific information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-sm text-purple-800 mb-2">MLM Benefits</h4>
                  <ul className="space-y-1">
                    {currentPlan.mlmBenefits.slice(0, 2).map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-purple-700">
                        <Award className="h-3 w-3 text-purple-500 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-purple-800 mb-2">Current Status</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-700">Rank:</span>
                      <Badge variant="outline" className="text-purple-700 border-purple-300">
                        {subscription?.rank || 'Associate'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-700">Commission Eligible:</span>
                      <span className={`font-medium ${subscription?.commissionEligible ? 'text-green-600' : 'text-red-600'}`}>
                        {subscription?.commissionEligible ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {subscription && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current period ends:</span>
                    <span>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                  </div>
                  {subscription.cancelAtPeriodEnd && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your MLM subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                        You can reactivate it anytime before then to maintain your commission eligibility.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Earnings Summary */}
              {earnings && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-lg font-bold text-green-600">${earnings.currentMonth.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Lifetime</p>
                    <p className="text-lg font-bold text-blue-600">${earnings.lifetime.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-lg font-bold text-yellow-600">${earnings.pending.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Next Payout</p>
                    <p className="text-sm font-medium">{earnings.nextPayout}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Dialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      Change Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Choose Your MLM Plan</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                      {mlmPlans.map((plan) => (
                        <Card 
                          key={plan.id} 
                          className={`cursor-pointer transition-all ${
                            selectedPlan === plan.id 
                              ? 'ring-2 ring-blue-500 bg-blue-50' 
                              : plan.popular 
                                ? 'ring-1 ring-blue-300' 
                                : ''
                          }`}
                          onClick={() => setSelectedPlan(plan.id)}
                        >
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
                            <div className="text-2xl font-bold">
                              ${plan.price}
                              <span className="text-sm font-normal text-gray-600">/{plan.interval}</span>
                            </div>
                            <p className="text-sm text-gray-600">{plan.description}</p>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Features:</h4>
                              <ul className="space-y-1">
                                {plan.features.slice(0, 3).map((feature, index) => (
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
                                {plan.mlmBenefits.slice(0, 2).map((benefit, index) => (
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
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowChangeDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handlePlanChange}
                        disabled={!selectedPlan || selectedPlan === currentPlanId}
                      >
                        {selectedPlan === currentPlanId ? 'Current Plan' : 'Change Plan'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {subscription?.cancelAtPeriodEnd ? (
                  <Button onClick={onReactivate} className="flex-1">
                    Reactivate
                  </Button>
                ) : (
                  <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="flex-1">
                        Cancel
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancel MLM Subscription</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p className="text-sm text-gray-600 mb-4">
                          Are you sure you want to cancel your MLM subscription? You'll continue to have access 
                          until the end of your current billing period, but you'll lose commission eligibility.
                        </p>
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Important:</strong> Cancelling will suspend your MLM status and make you ineligible 
                            for commissions. You can reactivate anytime before expiration.
                          </AlertDescription>
                        </Alert>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                          Keep Subscription
                        </Button>
                        <Button variant="destructive" onClick={handleCancel}>
                          Cancel Subscription
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
