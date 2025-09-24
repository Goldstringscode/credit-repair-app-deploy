"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Download, Eye, Plus, Calendar, TrendingUp, Receipt, RefreshCw } from "lucide-react"
import {
  type SampleTaxDocument,
  generateSample1099NEC,
  generateSampleQuarterlyReport,
  generateSampleTaxSummary,
  generateSampleDeductionSummary,
  mockSampleDocuments,
} from "@/lib/sample-tax-documents"

export function SampleTaxDocumentGenerator() {
  const [documents, setDocuments] = useState<SampleTaxDocument[]>(mockSampleDocuments)
  const [selectedDocument, setSelectedDocument] = useState<SampleTaxDocument | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showPreview, setShowPreview] = useState(false)

  const generateDocument = (type: string) => {
    let newDocument: SampleTaxDocument

    switch (type) {
      case "1099-NEC":
        newDocument = generateSample1099NEC(selectedYear)
        break
      case "quarterly-q1":
        newDocument = generateSampleQuarterlyReport(selectedYear, 1)
        break
      case "quarterly-q2":
        newDocument = generateSampleQuarterlyReport(selectedYear, 2)
        break
      case "quarterly-q3":
        newDocument = generateSampleQuarterlyReport(selectedYear, 3)
        break
      case "quarterly-q4":
        newDocument = generateSampleQuarterlyReport(selectedYear, 4)
        break
      case "tax-summary":
        newDocument = generateSampleTaxSummary(selectedYear)
        break
      case "deduction-summary":
        newDocument = generateSampleDeductionSummary(selectedYear)
        break
      default:
        return
    }

    setDocuments((prev) => [newDocument, ...prev])
  }

  const formatCurrency = (amount: number) => `$${(amount / 100).toFixed(2)}`

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "1099-NEC":
      case "1099-MISC":
        return <FileText className="h-5 w-5 text-blue-600" />
      case "quarterly-report":
        return <Calendar className="h-5 w-5 text-green-600" />
      case "tax-summary":
        return <TrendingUp className="h-5 w-5 text-purple-600" />
      case "deduction-summary":
        return <Receipt className="h-5 w-5 text-orange-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const renderDocumentPreview = (document: SampleTaxDocument) => {
    switch (document.type) {
      case "1099-NEC":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Payer Information</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Name:</strong> {document.data.payer.name}
                  </p>
                  <p>
                    <strong>Address:</strong> {document.data.payer.address}
                  </p>
                  <p>
                    <strong>City, State ZIP:</strong> {document.data.payer.city}, {document.data.payer.state}{" "}
                    {document.data.payer.zipCode}
                  </p>
                  <p>
                    <strong>EIN:</strong> {document.data.payer.ein}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Recipient Information</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Name:</strong> {document.data.recipient.name}
                  </p>
                  <p>
                    <strong>Address:</strong> {document.data.recipient.address}
                  </p>
                  <p>
                    <strong>City, State ZIP:</strong> {document.data.recipient.city}, {document.data.recipient.state}{" "}
                    {document.data.recipient.zipCode}
                  </p>
                  <p>
                    <strong>SSN:</strong> {document.data.recipient.ssn}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-3">Box 1 - Nonemployee Compensation</h4>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(document.data.compensation.box1_nonemployeeCompensation)}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-3">Income Breakdown</h4>
              <div className="space-y-2">
                {document.data.breakdown.map((item: any, index: number) => (
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

            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> This income must be reported on your tax return. You may owe self-employment
                tax on this amount.
              </AlertDescription>
            </Alert>
          </div>
        )

      case "quarterly-report":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-sm text-green-600">Gross Earnings</p>
                <p className="text-xl font-bold text-green-700">
                  {formatCurrency(document.data.earnings.grossEarnings)}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <p className="text-sm text-red-600">Fees</p>
                <p className="text-xl font-bold text-red-700">-{formatCurrency(document.data.earnings.fees)}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-blue-600">Net Earnings</p>
                <p className="text-xl font-bold text-blue-700">{formatCurrency(document.data.earnings.netEarnings)}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Earnings Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between p-3 border rounded">
                  <span>Credit Repair Sales</span>
                  <span className="font-medium">{formatCurrency(document.data.breakdown.creditRepairSales)}</span>
                </div>
                <div className="flex justify-between p-3 border rounded">
                  <span>MLM Recruitment</span>
                  <span className="font-medium">{formatCurrency(document.data.breakdown.mlmRecruitment)}</span>
                </div>
                <div className="flex justify-between p-3 border rounded">
                  <span>Training Courses</span>
                  <span className="font-medium">{formatCurrency(document.data.breakdown.trainingCourses)}</span>
                </div>
                <div className="flex justify-between p-3 border rounded">
                  <span>Certified Mail</span>
                  <span className="font-medium">{formatCurrency(document.data.breakdown.certifiedMail)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Estimated Tax Calculation</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Income Tax (25%):</span>
                    <span>{formatCurrency(document.data.estimatedTax.incomeTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Self-Employment Tax:</span>
                    <span>{formatCurrency(document.data.estimatedTax.selfEmploymentTax)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total Tax:</span>
                      <span>{formatCurrency(document.data.estimatedTax.totalTax)}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded text-center">
                  <p className="text-sm text-purple-600">Quarterly Payment</p>
                  <p className="text-lg font-bold text-purple-700">
                    {formatCurrency(document.data.estimatedTax.quarterlyPayment)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case "tax-summary":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-sm text-green-600">Total Earnings</p>
                <p className="text-xl font-bold text-green-700">
                  {formatCurrency(document.data.earnings.totalGrossEarnings)}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-blue-600">Net Earnings</p>
                <p className="text-xl font-bold text-blue-700">{formatCurrency(document.data.earnings.netEarnings)}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-sm text-purple-600">Tax Liability</p>
                <p className="text-xl font-bold text-purple-700">
                  {formatCurrency(document.data.taxCalculation.totalTaxLiability)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Quarterly Breakdown</h4>
              <div className="grid grid-cols-4 gap-4">
                {document.data.quarterlyBreakdown.map((quarter: any) => (
                  <div key={quarter.quarter} className="p-3 border rounded text-center">
                    <p className="font-medium">Q{quarter.quarter}</p>
                    <p className="text-sm text-gray-600">Net: {formatCurrency(quarter.netEarnings)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Business Deductions</h4>
              <div className="space-y-2">
                {document.data.deductions.map((deduction: any, index: number) => (
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
          </div>
        )

      case "deduction-summary":
        return (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-sm text-green-600">Total Business Deductions</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(document.data.totalDeductions)}</p>
              <p className="text-sm text-green-600 mt-1">
                Tax Savings: {formatCurrency(document.data.taxSavings.totalSavings)}
              </p>
            </div>

            <div className="space-y-4">
              {document.data.categories.map((category: any, index: number) => (
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

            <Alert>
              <Receipt className="h-4 w-4" />
              <AlertDescription>
                <strong>Record Keeping:</strong> Keep all receipts and documentation for{" "}
                {document.data.documentation.recordKeepingPeriod}. Audit risk is currently{" "}
                {document.data.documentation.auditRisk.toLowerCase()}.
              </AlertDescription>
            </Alert>
          </div>
        )

      default:
        return <p>Preview not available for this document type.</p>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sample Tax Documents</h2>
          <p className="text-gray-600">Generate realistic sample tax documents for testing and demonstration</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number.parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setDocuments([])} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator">Document Generator</TabsTrigger>
          <TabsTrigger value="library">Document Library</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">1099-NEC Form</CardTitle>
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Generate a sample 1099-NEC form showing nonemployee compensation for MLM earnings.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <p>• Realistic payer/recipient information</p>
                  <p>• Random earnings amounts</p>
                  <p>• Income category breakdown</p>
                  <p>• Tax filing instructions</p>
                </div>
                <Button onClick={() => generateDocument("1099-NEC")} className="w-full" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate 1099-NEC
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Quarterly Reports</CardTitle>
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Generate quarterly earnings reports with tax calculations and payout summaries.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => generateDocument("quarterly-q1")} variant="outline" size="sm">
                    Q1
                  </Button>
                  <Button onClick={() => generateDocument("quarterly-q2")} variant="outline" size="sm">
                    Q2
                  </Button>
                  <Button onClick={() => generateDocument("quarterly-q3")} variant="outline" size="sm">
                    Q3
                  </Button>
                  <Button onClick={() => generateDocument("quarterly-q4")} variant="outline" size="sm">
                    Q4
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Annual Tax Summary</CardTitle>
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Comprehensive annual tax summary with earnings, deductions, and tax liability calculations.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <p>• Full year earnings breakdown</p>
                  <p>• Quarterly payment schedule</p>
                  <p>• Business deduction summary</p>
                  <p>• Tax liability calculations</p>
                </div>
                <Button onClick={() => generateDocument("tax-summary")} className="w-full" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Summary
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Deduction Summary</CardTitle>
                  <Receipt className="h-5 w-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Detailed business deduction summary with categories, amounts, and tax savings.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <p>• Home office expenses</p>
                  <p>• Equipment & technology</p>
                  <p>• Marketing & advertising</p>
                  <p>• Professional development</p>
                </div>
                <Button onClick={() => generateDocument("deduction-summary")} className="w-full" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Deductions
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          {documents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Generated</h3>
                <p className="text-gray-600 mb-4">Use the Document Generator tab to create sample tax documents.</p>
                <Button onClick={() => generateDocument("1099-NEC")}>Generate First Document</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <Card key={document.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">{getDocumentIcon(document.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium">{document.title}</h3>
                            <Badge variant="outline">{document.type.toUpperCase()}</Badge>
                            {document.quarter && <Badge variant="outline">Q{document.quarter}</Badge>}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{document.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Tax Year: {document.taxYear}</span>
                            <span>Generated: {document.generatedAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => {
                            setSelectedDocument(document)
                            setShowPreview(true)
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Document Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedDocument && getDocumentIcon(selectedDocument.type)}
              <span>{selectedDocument?.title}</span>
            </DialogTitle>
            <DialogDescription>{selectedDocument?.description}</DialogDescription>
          </DialogHeader>
          {selectedDocument && <div className="mt-4">{renderDocumentPreview(selectedDocument)}</div>}
        </DialogContent>
      </Dialog>
    </div>
  )
}
