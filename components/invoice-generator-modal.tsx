import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Subscription } from '@/lib/subscription-service'
import { 
  FileText, 
  Download, 
  Calendar, 
  DollarSign,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  CreditCard,
  Building,
  Mail,
  Phone
} from 'lucide-react'

interface InvoiceGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  subscription: Subscription | null
  onGenerate: (invoiceData: InvoiceData) => void
}

interface InvoiceData {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  period: string
  amount: number
  tax: number
  total: number
  description: string
  notes?: string
}

const INVOICE_TEMPLATES = [
  {
    id: 'monthly',
    name: 'Monthly Invoice',
    description: 'Standard monthly subscription invoice',
    taxRate: 0.08
  },
  {
    id: 'yearly',
    name: 'Annual Invoice',
    description: 'Annual subscription invoice with discount',
    taxRate: 0.08
  },
  {
    id: 'custom',
    name: 'Custom Invoice',
    description: 'Custom invoice with specific details',
    taxRate: 0.08
  }
]

export default function InvoiceGeneratorModal({
  isOpen,
  onClose,
  subscription
}: InvoiceGeneratorModalProps) {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    period: '',
    amount: subscription?.amount || 0,
    tax: 0,
    total: 0,
    description: '',
    notes: ''
  })
  const [generating, setGenerating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedTemplate, setSelectedTemplate] = useState('monthly')

  React.useEffect(() => {
    if (subscription && isOpen) {
      const invoiceNumber = `INV-${subscription.id.slice(-8).toUpperCase()}-${Date.now().toString().slice(-4)}`
      const period = `${new Date(subscription.currentPeriodStart).toLocaleDateString()} - ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
      const description = `${subscription.planName} - ${subscription.billingCycle} subscription`
      
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber,
        period,
        amount: subscription.amount,
        description
      }))
    }
  }, [subscription, isOpen])

  React.useEffect(() => {
    const template = INVOICE_TEMPLATES.find(t => t.id === selectedTemplate)
    if (template) {
      const tax = invoiceData.amount * template.taxRate
      const total = invoiceData.amount + tax
      setInvoiceData(prev => ({
        ...prev,
        tax,
        total
      }))
    }
  }, [invoiceData.amount, selectedTemplate])

  const validateInvoice = () => {
    const newErrors: Record<string, string> = {}

    if (!invoiceData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = 'Invoice number is required'
    }
    if (!invoiceData.issueDate) {
      newErrors.issueDate = 'Issue date is required'
    }
    if (!invoiceData.dueDate) {
      newErrors.dueDate = 'Due date is required'
    }
    if (!invoiceData.period.trim()) {
      newErrors.period = 'Period is required'
    }
    if (invoiceData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }
    if (!invoiceData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleGenerate = async () => {
    if (!validateInvoice()) {
      return
    }

    setGenerating(true)
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create a mock PDF download
      const invoiceContent = generateInvoiceHTML()
      const blob = new Blob([invoiceContent], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoiceData.invoiceNumber}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      alert(`Invoice ${invoiceData.invoiceNumber} generated successfully!`)
      onClose()
    } catch (error) {
      alert('Failed to generate invoice. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const generateInvoiceHTML = () => {
    if (!subscription) return ''

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Invoice ${invoiceData.invoiceNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .company-info { float: right; text-align: right; }
        .customer-info { margin-bottom: 30px; }
        .invoice-details { margin-bottom: 30px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .items-table th { background-color: #f2f2f2; }
        .totals { float: right; width: 300px; }
        .totals table { width: 100%; }
        .totals td { padding: 8px; }
        .total-row { font-weight: bold; border-top: 2px solid #000; }
    </style>
</head>
<body>
    <div class="header">
        <h1>INVOICE</h1>
        <h2>Credit Repair Services</h2>
    </div>
    
    <div class="company-info">
        <p><strong>Credit Repair Services</strong><br>
        123 Business Street<br>
        City, State 12345<br>
        Phone: (555) 123-4567<br>
        Email: billing@creditrepair.com</p>
    </div>
    
    <div class="customer-info">
        <h3>Bill To:</h3>
        <p><strong>${subscription.customerName}</strong><br>
        ${subscription.customerEmail}</p>
    </div>
    
    <div class="invoice-details">
        <table>
            <tr><td><strong>Invoice Number:</strong></td><td>${invoiceData.invoiceNumber}</td></tr>
            <tr><td><strong>Issue Date:</strong></td><td>${new Date(invoiceData.issueDate).toLocaleDateString()}</td></tr>
            <tr><td><strong>Due Date:</strong></td><td>${new Date(invoiceData.dueDate).toLocaleDateString()}</td></tr>
            <tr><td><strong>Period:</strong></td><td>${invoiceData.period}</td></tr>
        </table>
    </div>
    
    <table class="items-table">
        <thead>
            <tr>
                <th>Description</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>${invoiceData.description}</td>
                <td>$${invoiceData.amount.toFixed(2)}</td>
            </tr>
        </tbody>
    </table>
    
    <div class="totals">
        <table>
            <tr><td>Subtotal:</td><td>$${invoiceData.amount.toFixed(2)}</td></tr>
            <tr><td>Tax:</td><td>$${invoiceData.tax.toFixed(2)}</td></tr>
            <tr class="total-row"><td>Total:</td><td>$${invoiceData.total.toFixed(2)}</td></tr>
        </table>
    </div>
    
    <div style="clear: both; margin-top: 50px;">
        <h3>Payment Information</h3>
        <p>Payment Method: ${subscription.paymentMethod}</p>
        <p>Subscription ID: ${subscription.id}</p>
        ${invoiceData.notes ? `<p><strong>Notes:</strong> ${invoiceData.notes}</p>` : ''}
    </div>
</body>
</html>
    `
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Generate Invoice
          </DialogTitle>
          <DialogDescription>
            Create an invoice for {subscription?.customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select invoice template" />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    placeholder="INV-123456"
                  />
                  {errors.invoiceNumber && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {errors.invoiceNumber}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="period">Billing Period</Label>
                  <Input
                    id="period"
                    value={invoiceData.period}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, period: e.target.value }))}
                    placeholder="Jan 1, 2024 - Jan 31, 2024"
                  />
                  {errors.period && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {errors.period}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={invoiceData.issueDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, issueDate: e.target.value }))}
                  />
                  {errors.issueDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {errors.issueDate}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                  {errors.dueDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {errors.dueDate}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={invoiceData.description}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Service description"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> {errors.description}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={invoiceData.amount}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> {errors.amount}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={invoiceData.notes || ''}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes for the invoice"
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoiceData.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%):</span>
                  <span>{formatCurrency(invoiceData.tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(invoiceData.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={generating}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Generate Invoice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
