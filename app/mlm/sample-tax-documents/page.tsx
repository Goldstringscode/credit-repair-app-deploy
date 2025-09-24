"use client"

import type React from "react"

import { useState } from "react"
import { SampleTaxDocumentGenerator } from "@/components/mlm/sample-tax-document-generator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Download, Share, TrendingUp, Calendar, Receipt, Settings } from "lucide-react"
import {
  generateSample1099NEC,
  generateSampleQuarterlyReport,
  generateSampleTaxSummary,
  generateSampleDeductionSummary,
  type SampleTaxDocument,
} from "@/lib/sample-tax-documents"

interface DocumentTemplate {
  id: string
  name: string
  description: string
  type: "1099-NEC" | "quarterly-report" | "tax-summary" | "deduction-summary"
  icon: React.ReactNode
  color: string
  fields: Array<{
    name: string
    label: string
    type: "text" | "number" | "select" | "date"
    options?: string[]
    defaultValue?: any
  }>
}

const documentTemplates: DocumentTemplate[] = [
  {
    id: "1099-nec",
    name: "1099-NEC Form",
    description: "Nonemployee Compensation form for MLM earnings",
    type: "1099-NEC",
    icon: <FileText className="h-6 w-6" />,
    color: "bg-blue-500",
    fields: [
      { name: "taxYear", label: "Tax Year", type: "number", defaultValue: 2024 },
      { name: "totalEarnings", label: "Total Earnings ($)", type: "number", defaultValue: 15000 },
      { name: "payerName", label: "Payer Name", type: "text", defaultValue: "Credit Repair AI LLC" },
      { name: "recipientName", label: "Recipient Name", type: "text", defaultValue: "John Doe" },
    ],
  },
  {
    id: "quarterly",
    name: "Quarterly Report",
    description: "Quarterly earnings and tax calculation report",
    type: "quarterly-report",
    icon: <Calendar className="h-6 w-6" />,
    color: "bg-green-500",
    fields: [
      { name: "taxYear", label: "Tax Year", type: "number", defaultValue: 2024 },
      { name: "quarter", label: "Quarter", type: "select", options: ["1", "2", "3", "4"], defaultValue: "1" },
      { name: "grossEarnings", label: "Gross Earnings ($)", type: "number", defaultValue: 3750 },
    ],
  },
  {
    id: "tax-summary",
    name: "Annual Tax Summary",
    description: "Complete annual tax overview with calculations",
    type: "tax-summary",
    icon: <TrendingUp className="h-6 w-6" />,
    color: "bg-purple-500",
    fields: [
      { name: "taxYear", label: "Tax Year", type: "number", defaultValue: 2024 },
      { name: "annualEarnings", label: "Annual Earnings ($)", type: "number", defaultValue: 15000 },
    ],
  },
  {
    id: "deductions",
    name: "Deduction Summary",
    description: "Business deduction breakdown and tax savings",
    type: "deduction-summary",
    icon: <Receipt className="h-6 w-6" />,
    color: "bg-orange-500",
    fields: [
      { name: "taxYear", label: "Tax Year", type: "number", defaultValue: 2024 },
      { name: "totalDeductions", label: "Total Deductions ($)", type: "number", defaultValue: 2500 },
    ],
  },
]

export default function SampleTaxDocumentsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null)
  const [customFields, setCustomFields] = useState<Record<string, any>>({})
  const [generatedDocument, setGeneratedDocument] = useState<SampleTaxDocument | null>(null)
  const [showCustomDialog, setShowCustomDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)

  const generateCustomDocument = () => {
    if (!selectedTemplate) return

    let document: SampleTaxDocument

    switch (selectedTemplate.type) {
      case "1099-NEC":
        document = generateSample1099NEC(customFields.taxYear || 2024)
        // Customize with user inputs
        if (customFields.totalEarnings) {
          document.data.compensation.box1_nonemployeeCompensation = customFields.totalEarnings * 100
        }
        if (customFields.payerName) {
          document.data.payer.name = customFields.payerName
        }
        if (customFields.recipientName) {
          document.data.recipient.name = customFields.recipientName
        }
        break

      case "quarterly-report":
        document = generateSampleQuarterlyReport(
          customFields.taxYear || 2024,
          Number.parseInt(customFields.quarter) || 1,
        )
        if (customFields.grossEarnings) {
          document.data.earnings.grossEarnings = customFields.grossEarnings * 100
        }
        break

      case "tax-summary":
        document = generateSampleTaxSummary(customFields.taxYear || 2024)
        if (customFields.annualEarnings) {
          document.data.earnings.totalGrossEarnings = customFields.annualEarnings * 100
        }
        break

      case "deduction-summary":
        document = generateSampleDeductionSummary(customFields.taxYear || 2024)
        if (customFields.totalDeductions) {
          document.data.totalDeductions = customFields.totalDeductions * 100
        }
        break

      default:
        return
    }

    setGeneratedDocument(document)
    setShowPreviewDialog(true)
    setShowCustomDialog(false)
  }

  const exportDocument = (format: "pdf" | "csv" | "json") => {
    if (!generatedDocument) return

    const filename = `${generatedDocument.id}.${format}`
    const data = format === "json" ? JSON.stringify(generatedDocument, null, 2) : "Export not implemented"

    const blob = new Blob([data], { type: format === "json" ? "application/json" : "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const shareDocument = async () => {
    if (!generatedDocument) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: generatedDocument.title,
          text: generatedDocument.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const formatCurrency = (amount: number) => `$${(amount / 100).toFixed(2)}`

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sample Tax Document Generator</h1>
          <p className="text-gray-600">Generate realistic tax documents for testing and demonstration</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
            <DialogTrigger asChild>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Custom Generator
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Custom Document Generator</DialogTitle>
                <DialogDescription>Create a customized tax document with your specific parameters</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select
                    value={selectedTemplate?.id || ""}
                    onValueChange={(value) => {
                      const template = documentTemplates.find((t) => t.id === value)
                      setSelectedTemplate(template || null)
                      setCustomFields({})
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center space-x-2">
                            {template.icon}
                            <span>{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplate && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Document Parameters</h4>
                    {selectedTemplate.fields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <Label>{field.label}</Label>
                        {field.type === "select" ? (
                          <Select
                            value={customFields[field.name] || field.defaultValue || ""}
                            onValueChange={(value) => setCustomFields((prev) => ({ ...prev, [field.name]: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={field.type}
                            value={customFields[field.name] || field.defaultValue || ""}
                            onChange={(e) =>
                              setCustomFields((prev) => ({
                                ...prev,
                                [field.name]:
                                  field.type === "number" ? Number.parseFloat(e.target.value) || 0 : e.target.value,
                              }))
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button onClick={generateCustomDocument} disabled={!selectedTemplate} className="flex-1">
                    Generate Document
                  </Button>
                  <Button onClick={() => setShowCustomDialog(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Quick Templates</TabsTrigger>
          <TabsTrigger value="generator">Advanced Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {documentTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${template.color} text-white`}>{template.icon}</div>
                    <Badge variant="outline">{template.type.toUpperCase()}</Badge>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{template.description}</p>

                  <div className="space-y-2 text-xs text-gray-500">
                    {template.fields.slice(0, 3).map((field) => (
                      <div key={field.name} className="flex justify-between">
                        <span>{field.label}:</span>
                        <span>{field.defaultValue}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedTemplate(template)
                      setCustomFields(
                        template.fields.reduce(
                          (acc, field) => ({
                            ...acc,
                            [field.name]: field.defaultValue,
                          }),
                          {},
                        ),
                      )
                      generateCustomDocument()
                    }}
                    className="w-full"
                    size="sm"
                  >
                    Generate Sample
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="generator" className="space-y-6">
          <SampleTaxDocumentGenerator />
        </TabsContent>
      </Tabs>

      {/* Document Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>{generatedDocument?.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={() => exportDocument("pdf")} size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </Button>
                <Button onClick={() => exportDocument("csv")} size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </Button>
                <Button onClick={() => exportDocument("json")} size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  JSON
                </Button>
                <Button onClick={shareDocument} size="sm" variant="outline">
                  <Share className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>{generatedDocument?.description}</DialogDescription>
          </DialogHeader>

          {generatedDocument && (
            <div className="space-y-6">
              {generatedDocument.type === "1099-NEC" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">Payer Information</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Name:</strong> {generatedDocument.data.payer.name}
                        </p>
                        <p>
                          <strong>Address:</strong> {generatedDocument.data.payer.address}
                        </p>
                        <p>
                          <strong>EIN:</strong> {generatedDocument.data.payer.ein}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">Recipient Information</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Name:</strong> {generatedDocument.data.recipient.name}
                        </p>
                        <p>
                          <strong>Address:</strong> {generatedDocument.data.recipient.address}
                        </p>
                        <p>
                          <strong>SSN:</strong> {generatedDocument.data.recipient.ssn}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50 rounded-lg text-center">
                    <h4 className="font-medium mb-2">Box 1 - Nonemployee Compensation</h4>
                    <p className="text-3xl font-bold text-blue-600">
                      {formatCurrency(generatedDocument.data.compensation.box1_nonemployeeCompensation)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Income Breakdown</h4>
                    {generatedDocument.data.breakdown.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded">
                        <span>{item.description}</span>
                        <div className="text-right">
                          <span className="font-medium">{formatCurrency(item.amount)}</span>
                          <span className="text-sm text-gray-500 ml-2">({item.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {generatedDocument.type === "quarterly-report" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <p className="text-sm text-green-600">Gross Earnings</p>
                      <p className="text-xl font-bold text-green-700">
                        {formatCurrency(generatedDocument.data.earnings.grossEarnings)}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg text-center">
                      <p className="text-sm text-red-600">Fees</p>
                      <p className="text-xl font-bold text-red-700">
                        -{formatCurrency(generatedDocument.data.earnings.fees)}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <p className="text-sm text-blue-600">Net Earnings</p>
                      <p className="text-xl font-bold text-blue-700">
                        {formatCurrency(generatedDocument.data.earnings.netEarnings)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Tax Calculation</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Income Tax (25%):</span>
                          <span>{formatCurrency(generatedDocument.data.estimatedTax.incomeTax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Self-Employment Tax:</span>
                          <span>{formatCurrency(generatedDocument.data.estimatedTax.selfEmploymentTax)}</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between font-medium">
                            <span>Total Tax:</span>
                            <span>{formatCurrency(generatedDocument.data.estimatedTax.totalTax)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded text-center">
                        <p className="text-sm text-purple-600">Quarterly Payment</p>
                        <p className="text-lg font-bold text-purple-700">
                          {formatCurrency(generatedDocument.data.estimatedTax.quarterlyPayment)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {generatedDocument.type === "tax-summary" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <p className="text-sm text-green-600">Total Earnings</p>
                      <p className="text-xl font-bold text-green-700">
                        {formatCurrency(generatedDocument.data.earnings.totalGrossEarnings)}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <p className="text-sm text-blue-600">Net Earnings</p>
                      <p className="text-xl font-bold text-blue-700">
                        {formatCurrency(generatedDocument.data.earnings.netEarnings)}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <p className="text-sm text-purple-600">Tax Liability</p>
                      <p className="text-xl font-bold text-purple-700">
                        {formatCurrency(generatedDocument.data.taxCalculation.totalTaxLiability)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Business Deductions</h4>
                    {generatedDocument.data.deductions.map((deduction: any, index: number) => (
                      <div key={index} className="flex justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">{deduction.type}</span>
                          <p className="text-sm text-gray-600">{deduction.description}</p>
                        </div>
                        <span className="font-medium">{formatCurrency(deduction.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {generatedDocument.type === "deduction-summary" && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-sm text-green-600">Total Business Deductions</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(generatedDocument.data.totalDeductions)}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Tax Savings: {formatCurrency(generatedDocument.data.taxSavings.totalSavings)}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {generatedDocument.data.categories.map((category: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">{category.category}</h4>
                          <span className="font-bold">{formatCurrency(category.totalAmount)}</span>
                        </div>
                        <div className="space-y-2">
                          {category.items.map((item: any, itemIndex: number) => (
                            <div key={itemIndex} className="flex justify-between text-sm">
                              <span className="text-gray-600">{item.description}</span>
                              <span>{formatCurrency(item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  This is a sample document generated for demonstration purposes. Consult with a tax professional for
                  actual tax preparation and filing.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
