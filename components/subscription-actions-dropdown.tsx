import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Subscription } from '@/lib/subscription-service'
import { 
  MoreHorizontal,
  Mail,
  CreditCard,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  User,
  Settings,
  ExternalLink,
  Copy,
  Send
} from 'lucide-react'

interface SubscriptionActionsDropdownProps {
  subscription: Subscription
  onViewPaymentHistory?: (subscription: Subscription) => void
  onUpdatePaymentMethod?: (subscription: Subscription) => void
  onGenerateInvoice?: (subscription: Subscription) => void
  onExportData?: (subscription: Subscription) => void
  onSendEmail?: (subscription: Subscription) => void
  onViewDetails?: (subscription: Subscription) => void
  onEdit?: (subscription: Subscription) => void
  onPause?: (subscriptionId: string) => void
  onResume?: (subscriptionId: string) => void
  onCancel?: (subscriptionId: string) => void
  onDelete?: (subscriptionId: string) => void
  onRefresh?: (subscriptionId: string) => void
}

export default function SubscriptionActionsDropdown({
  subscription,
  onViewPaymentHistory,
  onUpdatePaymentMethod,
  onGenerateInvoice,
  onExportData,
  onSendEmail,
  onViewDetails,
  onEdit,
  onPause,
  onResume,
  onCancel,
  onDelete,
  onRefresh
}: SubscriptionActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAction = (action: string, callback?: Function) => {
    if (!subscription) {
      console.error('No subscription available for action:', action)
      alert('Error: No subscription data available')
      return
    }
    
    if (callback) {
      callback(subscription)
    } else {
      // Default action handlers with user feedback
      switch (action) {
        case 'sendEmail':
          alert(`Send Email to ${subscription.customerName} (${subscription.customerEmail})\n\nThis would open an email composer with the customer's details.`)
          break
        case 'viewPaymentHistory':
          alert(`View Payment History for ${subscription.customerName}\n\nThis would show a detailed payment history modal with all transactions.`)
          break
        case 'updatePaymentMethod':
          alert(`Update Payment Method for ${subscription.customerName}\n\nThis would open a payment method update form.`)
          break
        case 'generateInvoice':
          alert(`Generate Invoice for ${subscription.customerName}\n\nThis would create and download a PDF invoice for the current period.`)
          break
        case 'exportData':
          alert(`Export Data for ${subscription.customerName}\n\nThis would download a CSV file with all subscription and payment data.`)
          break
        case 'viewDetails':
          if (onViewDetails) {
            onViewDetails(subscription)
          } else {
            alert(`View Details for ${subscription.customerName}\n\nThis would open the subscription details modal.`)
          }
          break
        case 'edit':
          if (onEdit) {
            onEdit(subscription)
          } else {
            alert(`Edit ${subscription.customerName}\n\nThis would open the subscription edit modal.`)
          }
          break
        case 'pause':
          if (onPause) {
            onPause(subscription.id)
          } else {
            alert(`Pause subscription for ${subscription.customerName}\n\nThis would pause the subscription.`)
          }
          break
        case 'resume':
          if (onResume) {
            onResume(subscription.id)
          } else {
            alert(`Resume subscription for ${subscription.customerName}\n\nThis would resume the subscription.`)
          }
          break
        case 'cancel':
          if (onCancel) {
            onCancel(subscription.id)
          } else {
            alert(`Cancel subscription for ${subscription.customerName}\n\nThis would cancel the subscription.`)
          }
          break
        case 'delete':
          if (onDelete) {
            onDelete(subscription.id)
          } else {
            alert(`Delete subscription for ${subscription.customerName}\n\nThis would permanently delete the subscription.`)
          }
          break
        case 'refresh':
          if (onRefresh) {
            onRefresh(subscription.id)
          } else {
            alert(`Refresh subscription data for ${subscription.customerName}\n\nThis would sync with the payment processor.`)
          }
          break
        default:
          alert(`Action: ${action} for ${subscription.customerName}`)
      }
    }
    setIsOpen(false)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    alert(`${label} copied to clipboard: ${text}`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'trialing': return <Clock className="h-4 w-4 text-blue-600" />
      case 'past_due': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'cancelled': return <Trash2 className="h-4 w-4 text-red-600" />
      case 'paused': return <RefreshCw className="h-4 w-4 text-gray-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" title="More actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          {getStatusIcon(subscription.status)}
          <span className="font-medium">{subscription.customerName}</span>
        </DropdownMenuLabel>
        <DropdownMenuLabel className="text-xs text-gray-500 font-normal">
          {subscription.planName} • ${subscription.amount}
          {subscription.isExecutiveAccount && (
            <Badge className="ml-2 bg-green-100 text-green-800 text-xs">Executive</Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Primary Actions */}
        <DropdownMenuItem onClick={() => handleAction('viewDetails', onViewDetails)}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('edit', onEdit)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Subscription
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        {/* Communication Actions */}
        <DropdownMenuItem onClick={() => handleAction('sendEmail', onSendEmail)}>
          <Mail className="h-4 w-4 mr-2" />
          Send Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('viewPaymentHistory', onViewPaymentHistory)}>
          <CreditCard className="h-4 w-4 mr-2" />
          View Payment History
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('updatePaymentMethod', onUpdatePaymentMethod)}>
          <CreditCard className="h-4 w-4 mr-2" />
          Update Payment Method
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        {/* Document Actions */}
        <DropdownMenuItem onClick={() => handleAction('generateInvoice', onGenerateInvoice)}>
          <FileText className="h-4 w-4 mr-2" />
          Generate Invoice
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('exportData', onExportData)}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        {/* Status Actions */}
        {subscription.status === 'active' && (
          <DropdownMenuItem onClick={() => handleAction('pause', onPause)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Pause Subscription
          </DropdownMenuItem>
        )}
        {subscription.status === 'paused' && (
          <DropdownMenuItem onClick={() => handleAction('resume', onResume)}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Resume Subscription
          </DropdownMenuItem>
        )}
        {subscription.status === 'active' && (
          <DropdownMenuItem onClick={() => handleAction('cancel', onCancel)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Cancel Subscription
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleAction('refresh', onRefresh)}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        {/* Copy Actions */}
        <DropdownMenuItem onClick={() => copyToClipboard(subscription.customerEmail, 'Email')}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => copyToClipboard(subscription.id, 'Subscription ID')}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Subscription ID
        </DropdownMenuItem>
        {subscription.stripeSubscriptionId && (
          <DropdownMenuItem onClick={() => copyToClipboard(subscription.stripeSubscriptionId!, 'Stripe ID')}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Stripe ID
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        
        {/* External Actions */}
        {subscription.stripeSubscriptionId && (
          <DropdownMenuItem onClick={() => window.open(`https://dashboard.stripe.com/subscriptions/${subscription.stripeSubscriptionId}`, '_blank')}>
            <ExternalLink className="h-4 w-4 mr-2" />
            View in Stripe
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        
        {/* Danger Zone */}
        <DropdownMenuItem 
          onClick={() => handleAction('delete', onDelete)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Subscription
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
