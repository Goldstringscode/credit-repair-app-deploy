import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Subscription } from '@/lib/subscription-service'
import { 
  User, 
  Mail, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Clock,
  FileText,
  Phone,
  MapPin,
  Building,
  CreditCard as PaymentIcon,
  Calendar as BillingIcon,
  Settings,
  AlertCircle,
  CheckCircle,
  Pause,
  X,
  Play,
  Edit,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react'

interface SubscriptionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  subscription: Subscription | null
  onEdit?: (subscription: Subscription) => void
  onPause?: (subscriptionId: string) => void
  onResume?: (subscriptionId: string) => void
  onCancel?: (subscriptionId: string) => void
  onDelete?: (subscriptionId: string) => void
}

export default function SubscriptionDetailsModal({
  isOpen,
  onClose,
  subscription,
  onEdit,
  onPause,
  onResume,
  onCancel,
  onDelete
}: SubscriptionDetailsModalProps) {
  if (!subscription) return null

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-300', icon: X },
      past_due: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: AlertCircle },
      trialing: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Clock },
      paused: { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: Pause },
      incomplete: { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: AlertCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <User className="h-6 w-6" />
                {subscription.customerName}
              </DialogTitle>
              <DialogDescription>
                Subscription ID: {subscription.id}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(subscription.status)}
              {subscription.isExecutiveAccount && (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  Executive Account
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Customer Name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{subscription.customerName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(subscription.customerName)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{subscription.customerEmail}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(subscription.customerEmail)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Customer ID</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{subscription.customerId}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(subscription.customerId)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Member Since</span>
                  </div>
                  <span className="text-sm">{formatDate(subscription.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Plan</span>
                  </div>
                  <Badge variant="outline">{subscription.planName}</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Amount</span>
                  </div>
                  <span className={`text-lg font-semibold ${subscription.amount === 0 ? 'text-green-600' : ''}`}>
                    {subscription.amount === 0 ? 'FREE' : formatCurrency(subscription.amount, subscription.currency)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Billing Cycle</span>
                  </div>
                  <span className="text-sm capitalize">{subscription.billingCycle}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BillingIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Next Billing</span>
                  </div>
                  <span className="text-sm">
                    {subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : 'No billing'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Current Period</span>
                  </div>
                  <span className="text-sm">
                    {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Trial End</span>
                  </div>
                  <span className="text-sm">
                    {subscription.trialEnd ? formatDate(subscription.trialEnd) : 'No trial'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PaymentIcon className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Payment Method</span>
                  </div>
                  <span className="text-sm">{subscription.paymentMethod}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Last Payment</span>
                  </div>
                  <span className="text-sm">
                    {subscription.lastPaymentDate ? formatDate(subscription.lastPaymentDate) : 'No payments yet'}
                  </span>
                </div>
                
                {subscription.lastPaymentAmount && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Last Payment Amount</span>
                    </div>
                    <span className="text-sm">{formatCurrency(subscription.lastPaymentAmount, subscription.currency)}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Auto-Renewal</span>
                  </div>
                  <span className="text-sm">
                    {subscription.cancelAtPeriodEnd ? 'Cancels at period end' : 'Enabled'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Proration</span>
                  </div>
                  <span className="text-sm">
                    {subscription.prorationEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Dunning</span>
                  </div>
                  <span className="text-sm">
                    {subscription.dunningEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                {subscription.stripeSubscriptionId && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Stripe Subscription ID</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{subscription.stripeSubscriptionId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(subscription.stripeSubscriptionId!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {subscription.stripeCustomerId && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Stripe Customer ID</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{subscription.stripeCustomerId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(subscription.stripeCustomerId!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {subscription.notes && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Notes</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <span className="text-sm">{subscription.notes}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4">
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(subscription)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Subscription
              </Button>
            )}
            
            {subscription.status === 'active' && onPause && (
              <Button variant="outline" onClick={() => onPause(subscription.id)}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            
            {subscription.status === 'paused' && onResume && (
              <Button variant="outline" onClick={() => onResume(subscription.id)}>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
            
            {subscription.status === 'active' && onCancel && (
              <Button variant="outline" onClick={() => onCancel(subscription.id)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
            
            {onDelete && (
              <Button variant="destructive" onClick={() => onDelete(subscription.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
