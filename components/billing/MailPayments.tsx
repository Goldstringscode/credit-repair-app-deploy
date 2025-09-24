'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Mail, Plus, Search, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface MailPayment {
  id: string
  type: 'certified' | 'priority'
  letterType: 'dispute' | 'verification' | 'follow_up' | 'other'
  amount: number
  status: 'pending' | 'sent' | 'delivered' | 'returned' | 'failed'
  trackingNumber: string
  sentDate: string
  expectedDelivery: string
  actualDelivery?: string
  recipient: string
  address: string
  description: string
  notes?: string
}

interface MailPaymentsProps {
  onUpdate: () => void
}

export function MailPayments({ onUpdate }: MailPaymentsProps) {
  const [mailPayments, setMailPayments] = useState<MailPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    type: 'certified' as 'certified' | 'priority',
    letterType: 'dispute' as 'dispute' | 'verification' | 'follow_up' | 'other',
    amount: '',
    recipient: '',
    address: '',
    description: '',
    notes: ''
  })

  useEffect(() => {
    fetchMailPayments()
  }, [])

  const fetchMailPayments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/billing/user/mail-payments', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })
      if (response.ok) {
        const data = await response.json()
        setMailPayments(data.mailPayments || [])
      }
    } catch (error) {
      console.error('Failed to fetch mail payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMailPayment = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/billing/user/mail-payments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onUpdate()
        setShowAddDialog(false)
        setFormData({
          type: 'certified',
          letterType: 'dispute',
          amount: '',
          recipient: '',
          address: '',
          description: '',
          notes: ''
        })
        fetchMailPayments()
      } else {
        const error = await response.json()
        alert(`Failed to add mail payment: ${error.message}`)
      }
    } catch (error) {
      console.error('Add mail payment failed:', error)
      alert('Failed to add mail payment. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const filteredMailPayments = mailPayments.filter(payment => {
    const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || payment.type === typeFilter
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      sent: 'default',
      delivered: 'default',
      returned: 'destructive',
      failed: 'destructive'
    } as const

    const icons = {
      pending: <Clock className="h-3 w-3" />,
      sent: <Mail className="h-3 w-3" />,
      delivered: <CheckCircle className="h-3 w-3" />,
      returned: <AlertCircle className="h-3 w-3" />,
      failed: <AlertCircle className="h-3 w-3" />
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'} className="flex items-center gap-1">
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    return type === 'certified' ? '📮' : '📬'
  }

  const getLetterTypeLabel = (type: string) => {
    const labels = {
      dispute: 'Dispute Letter',
      verification: 'Verification Letter',
      follow_up: 'Follow-up Letter',
      other: 'Other'
    }
    return labels[type as keyof typeof labels] || type
  }

  if (loading) {
    return <div className="text-center py-8">Loading mail payments...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mail Payments</h2>
          <p className="text-gray-600 mt-2">Track certified and priority mail payments</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Mail Payment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search mail payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="certified">Certified Mail</SelectItem>
                  <SelectItem value="priority">Priority Mail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mail Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mail Payments ({filteredMailPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMailPayments.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No mail payments found</h3>
              <p className="text-gray-600 mb-4">Add your first mail payment to get started</p>
              <Button onClick={() => setShowAddDialog(true)}>
                Add Mail Payment
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Letter Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMailPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getTypeIcon(payment.type)}</span>
                          {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                        </div>
                      </TableCell>
                      <TableCell>{getLetterTypeLabel(payment.letterType)}</TableCell>
                      <TableCell className="font-medium">{payment.recipient}</TableCell>
                      <TableCell className="font-mono">
                        ${(payment.amount / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.trackingNumber}
                      </TableCell>
                      <TableCell>
                        {new Date(payment.sentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(payment.expectedDelivery).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Mail Payment Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Mail Payment</DialogTitle>
            <DialogDescription>
              Track a new certified or priority mail payment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Mail Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'certified' | 'priority') => setFormData({...formData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="certified">Certified Mail</SelectItem>
                    <SelectItem value="priority">Priority Mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="letterType">Letter Type</Label>
                <Select 
                  value={formData.letterType} 
                  onValueChange={(value: 'dispute' | 'verification' | 'follow_up' | 'other') => setFormData({...formData, letterType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dispute">Dispute Letter</SelectItem>
                    <SelectItem value="verification">Verification Letter</SelectItem>
                    <SelectItem value="follow_up">Follow-up Letter</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                placeholder="Credit Bureau Name"
                value={formData.recipient}
                onChange={(e) => setFormData({...formData, recipient: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Full mailing address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of the mail payment"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or tracking information"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMailPayment} disabled={saving}>
              {saving ? 'Adding...' : 'Add Mail Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
