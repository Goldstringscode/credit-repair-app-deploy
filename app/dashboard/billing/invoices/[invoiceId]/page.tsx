"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InvoiceDetailSkeleton } from "@/components/loading-skeletons"
import { ArrowLeft, Download, Mail, Printer, CheckCircle, CreditCard } from "lucide-react"

interface InvoiceDetailPageProps {
  params: {
    invoiceId: string
  }
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const [loading, setLoading] = useState(true)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <InvoiceDetailSkeleton />
  }

  // Mock invoice data - in real app, this would be fetched based on invoiceId
  const invoice = {
    id: params.invoiceId,
    number: "INV-2024-001",
    date: "November 15, 2024",
    dueDate: "November 15, 2024",
    paidDate: "November 15, 2024",
    status: "paid",
    customer: {
      name: "John Doe",
      email: "john.doe@example.com",
      address: "123 Main Street",
      city: "Anytown",
      state: "CA",
      zip: "12345",
      country: "United States",
    },
    items: [
      {
        description: "Premium Plan - Monthly Subscription",
        quantity: 1,
        unitPrice: 49.99,
        total: 49.99,
      },
    ],
    subtotal: 49.99,
    tax: 4.5,
    total: 54.49,
    paymentMethod: "Visa •••• 4242",
    notes:
      "Thank you for your business! If you have any questions about this invoice, please contact our support team.",
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    console.log("Downloading invoice PDF...")
  }

  const handleEmail = () => {
    // In a real app, this would send the invoice via email
    console.log("Emailing invoice...")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard/billing">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Billing
                </a>
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Invoice {invoice.number}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <Badge className="bg-green-100 text-green-800">Paid</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">PDF</Badge>
              <Button size="sm" variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button size="sm" variant="outline" onClick={handleEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Credit Repair AI</h2>
                    <p className="text-gray-600">Professional Credit Repair Services</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>123 Business Ave</p>
                  <p>Suite 100</p>
                  <p>Business City, BC 12345</p>
                  <p>support@creditrepairai.com</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Invoice #:</span> {invoice.number}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span> {invoice.date}
                  </p>
                  <p>
                    <span className="font-medium">Due Date:</span> {invoice.dueDate}
                  </p>
                  <p>
                    <span className="font-medium">Paid Date:</span> {invoice.paidDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Bill To:</h3>
              <div className="text-gray-700 space-y-1">
                <p className="font-medium">{invoice.customer.name}</p>
                <p>{invoice.customer.email}</p>
                <p>{invoice.customer.address}</p>
                <p>
                  {invoice.customer.city}, {invoice.customer.state} {invoice.customer.zip}
                </p>
                <p>{invoice.customer.country}</p>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Qty</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Unit Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4 px-4 text-gray-900">{item.description}</td>
                        <td className="py-4 px-4 text-center text-gray-700">{item.quantity}</td>
                        <td className="py-4 px-4 text-right text-gray-700">${item.unitPrice.toFixed(2)}</td>
                        <td className="py-4 px-4 text-right font-medium text-gray-900">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">${invoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-lg font-bold">${invoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Payment Received</span>
              </div>
              <p className="text-sm text-green-700">
                Payment of ${invoice.total.toFixed(2)} was successfully processed on {invoice.paidDate} via{" "}
                {invoice.paymentMethod}.
              </p>
            </div>

            {/* Notes */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3">Notes:</h4>
              <p className="text-gray-600 text-sm">{invoice.notes}</p>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-500 mb-1">Thank you for choosing Credit Repair AI!</p>
              <p className="text-xs text-gray-400">
                For questions about this invoice, please contact us at support@creditrepairai.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
