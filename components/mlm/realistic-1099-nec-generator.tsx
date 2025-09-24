"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Download, RefreshCw, Building2, User, DollarSign } from "lucide-react"

interface Realistic1099NECData {
  formInfo: {
    taxYear: number
    formType: "1099-NEC"
    corrected: boolean
    void: boolean
  }
  payer: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    ein: string
    phoneNumber: string
    accountNumber?: string
  }
  recipient: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    ssn: string
    accountNumber: string
  }
  compensation: {
    box1_nonemployeeCompensation: number
    box2_payerMadeDirect: number
    box4_federalIncomeTaxWithheld: number
    box5_stateIncomeTaxWithheld: number
    box6_statePayerNumber: string
    box7_stateIncome: number
  }
  breakdown: Array<{
    description: string
    amount: number
    percentage: number
    months: string[]
  }>
  businessInfo: {
    businessType: string
    primaryService: string
    clientCount: number
    averageMonthlyEarnings: number
    peakMonth: string
    slowestMonth: string
  }
  taxGuidance: {
    selfEmploymentTax: number
    estimatedIncomeTax: number
    quarterlyPayments: number
    deductionOpportunities: string[]
    filingRequirements: string[]
  }
}

const realisticBusinessNames = [
  "Credit Repair AI LLC",
  "Financial Freedom Solutions Inc",
  "Credit Boost Network LLC",
  "Repair My Credit Pro Inc",
  "Elite Credit Services LLC",
  "Credit Masters Network Inc",
]

const realisticRecipientNames = [
  "John Michael Smith",
  "Sarah Elizabeth Johnson",
  "Michael David Brown",
  "Jennifer Marie Davis",
  "Christopher James Wilson",
  "Amanda Nicole Miller",
  "David Robert Garcia",
  "Lisa Michelle Rodriguez",
  "James William Martinez",
  "Mary Catherine Anderson",
]

const realisticAddresses = [
  { address: "1247 Oak Street", city: "Austin", state: "TX", zipCode: "78701" },
  { address: "892 Pine Avenue", city: "Denver", state: "CO", zipCode: "80202" },
  { address: "3456 Maple Drive", city: "Phoenix", state: "AZ", zipCode: "85001" },
  { address: "567 Cedar Lane", city: "Atlanta", state: "GA", zipCode: "30301" },
  { address: "2134 Birch Road", city: "Seattle", state: "WA", zipCode: "98101" },
  { address: "789 Elm Street", city: "Miami", state: "FL", zipCode: "33101" },
  { address: "4321 Willow Way", city: "Chicago", state: "IL", zipCode: "60601" },
  { address: "876 Spruce Court", city: "Boston", state: "MA", zipCode: "02101" },
]

export function Realistic1099NECGenerator() {
  const [generatedForm, setGeneratedForm] = useState<Realistic1099NECData | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [customSettings, setCustomSettings] = useState({
    taxYear: 2024,
    totalEarnings: 25000,
    businessType: "credit-repair",
    includeWithholding: false,
    recipientName: "",
    payerName: "",
  })

  const generateRealistic1099NEC = () => {
    const totalEarnings = customSettings.totalEarnings * 100 // Convert to cents
    const recipientAddress = realisticAddresses[Math.floor(Math.random() * realisticAddresses.length)]
    const payerAddress = realisticAddresses[Math.floor(Math.random() * realisticAddresses.length)]

    // Generate realistic SSN (for demo purposes only)
    const generateSSN = () => {
      const area = Math.floor(Math.random() * 899) + 100
      const group = Math.floor(Math.random() * 99) + 1
      const serial = Math.floor(Math.random() * 9999) + 1
      return `${area.toString().padStart(3, "0")}-${group.toString().padStart(2, "0")}-${serial.toString().padStart(4, "0")}`
    }

    // Generate realistic EIN
    const generateEIN = () => {
      const prefix = Math.floor(Math.random() * 99) + 10
      const suffix = Math.floor(Math.random() * 9999999) + 1000000
      return `${prefix}-${suffix}`
    }

    // Generate monthly breakdown
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlyEarnings = Array.from(
      { length: 12 },
      () => Math.floor(Math.random() * (totalEarnings / 6)) + totalEarnings / 24,
    )

    // Adjust to match total
    const currentTotal = monthlyEarnings.reduce((sum, amount) => sum + amount, 0)
    const adjustment = totalEarnings - currentTotal
    monthlyEarnings[Math.floor(Math.random() * 12)] += adjustment

    const breakdown = [
      {
        description: "Credit Repair Sales Commissions",
        amount: Math.floor(totalEarnings * 0.42),
        percentage: 42,
        months: months.slice(0, 12),
      },
      {
        description: "MLM Recruitment Bonuses",
        amount: Math.floor(totalEarnings * 0.28),
        percentage: 28,
        months: months.slice(2, 10),
      },
      {
        description: "Training Course Commissions",
        amount: Math.floor(totalEarnings * 0.18),
        percentage: 18,
        months: months.slice(1, 11),
      },
      {
        description: "Certified Mail Service Fees",
        amount: Math.floor(totalEarnings * 0.08),
        percentage: 8,
        months: months.slice(0, 8),
      },
      {
        description: "Performance Bonuses & Incentives",
        amount: Math.floor(totalEarnings * 0.04),
        percentage: 4,
        months: ["Mar", "Jun", "Sep", "Dec"],
      },
    ]

    // Calculate tax implications
    const selfEmploymentTax = Math.floor(totalEarnings * 0.1413) // 14.13%
    const estimatedIncomeTax = Math.floor(totalEarnings * 0.22) // 22% bracket
    const quarterlyPayments = Math.floor((selfEmploymentTax + estimatedIncomeTax) / 4)

    const form: Realistic1099NECData = {
      formInfo: {
        taxYear: customSettings.taxYear,
        formType: "1099-NEC",
        corrected: false,
        void: false,
      },
      payer: {
        name:
          customSettings.payerName || realisticBusinessNames[Math.floor(Math.random() * realisticBusinessNames.length)],
        address: payerAddress.address,
        city: payerAddress.city,
        state: payerAddress.state,
        zipCode: payerAddress.zipCode,
        ein: generateEIN(),
        phoneNumber: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        accountNumber: `MLM-${Math.floor(Math.random() * 90000) + 10000}`,
      },
      recipient: {
        name:
          customSettings.recipientName ||
          realisticRecipientNames[Math.floor(Math.random() * realisticRecipientNames.length)],
        address: recipientAddress.address,
        city: recipientAddress.city,
        state: recipientAddress.state,
        zipCode: recipientAddress.zipCode,
        ssn: generateSSN(),
        accountNumber: `USER-${Math.floor(Math.random() * 90000) + 10000}`,
      },
      compensation: {
        box1_nonemployeeCompensation: totalEarnings,
        box2_payerMadeDirect: 0,
        box4_federalIncomeTaxWithheld: customSettings.includeWithholding ? Math.floor(totalEarnings * 0.1) : 0,
        box5_stateIncomeTaxWithheld: customSettings.includeWithholding ? Math.floor(totalEarnings * 0.05) : 0,
        box6_statePayerNumber: customSettings.includeWithholding
          ? `ST-${Math.floor(Math.random() * 900000) + 100000}`
          : "",
        box7_stateIncome: customSettings.includeWithholding ? totalEarnings : 0,
      },
      breakdown,
      businessInfo: {
        businessType: "Multi-Level Marketing - Credit Repair Services",
        primaryService: "Credit repair consultation and MLM recruitment",
        clientCount: Math.floor(Math.random() * 150) + 25,
        averageMonthlyEarnings: Math.floor(totalEarnings / 12),
        peakMonth: months[Math.floor(Math.random() * 12)],
        slowestMonth: months[Math.floor(Math.random() * 12)],
      },
      taxGuidance: {
        selfEmploymentTax,
        estimatedIncomeTax,
        quarterlyPayments,
        deductionOpportunities: [
          "Home office expenses (if applicable)",
          "Business phone and internet costs",
          "Marketing and advertising expenses",
          "Professional development and training",
          "Business travel and transportation",
          "Office supplies and equipment",
          "Professional services (legal, accounting)",
        ],
        filingRequirements: [
          "File Schedule C (Profit or Loss from Business)",
          "File Schedule SE (Self-Employment Tax)",
          "Make quarterly estimated tax payments",
          "Keep detailed records of all business expenses",
          "Consider forming an LLC for liability protection",
        ],
      },
    }

    setGeneratedForm(form)
    setShowPreview(true)
  }

  const formatCurrency = (amount: number) => `$${(amount / 100).toFixed(2)}`

  const exportForm = (format: "pdf" | "json" | "csv") => {
    if (!generatedForm) return

    let data: string
    let mimeType: string
    let filename: string

    switch (format) {
      case "json":
        data = JSON.stringify(generatedForm, null, 2)
        mimeType = "application/json"
        filename = `1099-NEC-${generatedForm.formInfo.taxYear}-${generatedForm.recipient.name.replace(/\s+/g, "-")}.json`
        break
      case "csv":
        data =
          `Field,Value\n` +
          `Tax Year,${generatedForm.formInfo.taxYear}\n` +
          `Payer Name,"${generatedForm.payer.name}"\n` +
          `Payer EIN,${generatedForm.payer.ein}\n` +
          `Recipient Name,"${generatedForm.recipient.name}"\n` +
          `Recipient SSN,${generatedForm.recipient.ssn}\n` +
          `Nonemployee Compensation,${formatCurrency(generatedForm.compensation.box1_nonemployeeCompensation)}\n` +
          `Federal Tax Withheld,${formatCurrency(generatedForm.compensation.box4_federalIncomeTaxWithheld)}\n` +
          `State Tax Withheld,${formatCurrency(generatedForm.compensation.box5_stateIncomeTaxWithheld)}\n`
        mimeType = "text/csv"
        filename = `1099-NEC-${generatedForm.formInfo.taxYear}-${generatedForm.recipient.name.replace(/\s+/g, "-")}.csv`
        break
      default:
        data = "PDF export not implemented in demo"
        mimeType = "text/plain"
        filename = `1099-NEC-${generatedForm.formInfo.taxYear}.txt`
    }

    const blob = new Blob([data], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span>Realistic 1099-NEC Generator</span>
          </CardTitle>
          <p className="text-gray-600">Generate professional, realistic 1099-NEC forms with detailed breakdowns</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxYear">Tax Year</Label>
              <Select
                value={customSettings.taxYear.toString()}
                onValueChange={(value) => setCustomSettings((prev) => ({ ...prev, taxYear: Number.parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalEarnings">Total Earnings ($)</Label>
              <Input
                id="totalEarnings"
                type="number"
                value={customSettings.totalEarnings}
                onChange={(e) =>
                  setCustomSettings((prev) => ({ ...prev, totalEarnings: Number.parseInt(e.target.value) || 0 }))
                }
                min="1000"
                max="500000"
                step="1000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Focus</Label>
              <Select
                value={customSettings.businessType}
                onValueChange={(value) => setCustomSettings((prev) => ({ ...prev, businessType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit-repair">Credit Repair MLM</SelectItem>
                  <SelectItem value="financial-services">Financial Services</SelectItem>
                  <SelectItem value="consulting">Business Consulting</SelectItem>
                  <SelectItem value="training">Training & Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name (Optional)</Label>
              <Input
                id="recipientName"
                value={customSettings.recipientName}
                onChange={(e) => setCustomSettings((prev) => ({ ...prev, recipientName: e.target.value }))}
                placeholder="Leave blank for random name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payerName">Payer Company (Optional)</Label>
              <Input
                id="payerName"
                value={customSettings.payerName}
                onChange={(e) => setCustomSettings((prev) => ({ ...prev, payerName: e.target.value }))}
                placeholder="Leave blank for random company"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeWithholding"
              checked={customSettings.includeWithholding}
              onChange={(e) => setCustomSettings((prev) => ({ ...prev, includeWithholding: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="includeWithholding">Include tax withholding (10% federal, 5% state)</Label>
          </div>

          <div className="flex space-x-2">
            <Button onClick={generateRealistic1099NEC} className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Generate Realistic 1099-NEC
            </Button>
            <Button
              onClick={() => {
                setCustomSettings({
                  taxYear: 2024,
                  totalEarnings: Math.floor(Math.random() * 45000) + 5000,
                  businessType: "credit-repair",
                  includeWithholding: Math.random() > 0.7,
                  recipientName: "",
                  payerName: "",
                })
              }}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Randomize
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Form 1099-NEC - {generatedForm?.formInfo.taxYear}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={() => exportForm("pdf")} size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </Button>
                <Button onClick={() => exportForm("csv")} size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </Button>
                <Button onClick={() => exportForm("json")} size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  JSON
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              Nonemployee Compensation - Professional tax document with detailed breakdown
            </DialogDescription>
          </DialogHeader>

          {generatedForm && (
            <div className="space-y-6">
              {/* Form Header */}
              <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Form 1099-NEC</h2>
                  <div className="text-right">
                    <p className="text-lg font-semibold">Tax Year {generatedForm.formInfo.taxYear}</p>
                    <p className="text-sm text-gray-600">Nonemployee Compensation</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Building2 className="h-4 w-4 mr-2" />
                      Payer Information
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Name:</strong> {generatedForm.payer.name}
                      </p>
                      <p>
                        <strong>Address:</strong> {generatedForm.payer.address}
                      </p>
                      <p>
                        <strong>City, State ZIP:</strong> {generatedForm.payer.city}, {generatedForm.payer.state}{" "}
                        {generatedForm.payer.zipCode}
                      </p>
                      <p>
                        <strong>EIN:</strong> {generatedForm.payer.ein}
                      </p>
                      <p>
                        <strong>Phone:</strong> {generatedForm.payer.phoneNumber}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Recipient Information
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Name:</strong> {generatedForm.recipient.name}
                      </p>
                      <p>
                        <strong>Address:</strong> {generatedForm.recipient.address}
                      </p>
                      <p>
                        <strong>City, State ZIP:</strong> {generatedForm.recipient.city},{" "}
                        {generatedForm.recipient.state} {generatedForm.recipient.zipCode}
                      </p>
                      <p>
                        <strong>SSN:</strong> {generatedForm.recipient.ssn}
                      </p>
                      <p>
                        <strong>Account:</strong> {generatedForm.recipient.accountNumber}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Compensation Box */}
              <div className="p-8 bg-green-50 rounded-lg border-2 border-green-200 text-center">
                <h3 className="text-lg font-semibold mb-2 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Box 1 - Nonemployee Compensation
                </h3>
                <p className="text-4xl font-bold text-green-700 mb-2">
                  {formatCurrency(generatedForm.compensation.box1_nonemployeeCompensation)}
                </p>
                <p className="text-sm text-gray-600">Total compensation paid during {generatedForm.formInfo.taxYear}</p>
              </div>

              {/* Tax Withholding (if applicable) */}
              {(generatedForm.compensation.box4_federalIncomeTaxWithheld > 0 ||
                generatedForm.compensation.box5_stateIncomeTaxWithheld > 0) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-semibold mb-2">Box 4 - Federal Income Tax Withheld</h4>
                    <p className="text-2xl font-bold text-red-700">
                      {formatCurrency(generatedForm.compensation.box4_federalIncomeTaxWithheld)}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold mb-2">Box 5 - State Income Tax Withheld</h4>
                    <p className="text-2xl font-bold text-orange-700">
                      {formatCurrency(generatedForm.compensation.box5_stateIncomeTaxWithheld)}
                    </p>
                  </div>
                </div>
              )}

              {/* Income Breakdown */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Income Source Breakdown</h3>
                <div className="space-y-3">
                  {generatedForm.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-600">Active months: {item.months.join(", ")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(item.amount)}</p>
                        <p className="text-sm text-gray-500">{item.percentage}% of total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Business Information */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Business Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>
                      <strong>Business Type:</strong> {generatedForm.businessInfo.businessType}
                    </p>
                    <p>
                      <strong>Primary Service:</strong> {generatedForm.businessInfo.primaryService}
                    </p>
                    <p>
                      <strong>Client Count:</strong> {generatedForm.businessInfo.clientCount}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Avg Monthly:</strong> {formatCurrency(generatedForm.businessInfo.averageMonthlyEarnings)}
                    </p>
                    <p>
                      <strong>Peak Month:</strong> {generatedForm.businessInfo.peakMonth}
                    </p>
                    <p>
                      <strong>Slowest Month:</strong> {generatedForm.businessInfo.slowestMonth}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tax Guidance */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tax Implications & Guidance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold mb-2">Self-Employment Tax</h4>
                    <p className="text-xl font-bold text-purple-700">
                      {formatCurrency(generatedForm.taxGuidance.selfEmploymentTax)}
                    </p>
                    <p className="text-xs text-gray-600">14.13% of net earnings</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold mb-2">Est. Income Tax</h4>
                    <p className="text-xl font-bold text-blue-700">
                      {formatCurrency(generatedForm.taxGuidance.estimatedIncomeTax)}
                    </p>
                    <p className="text-xs text-gray-600">22% tax bracket estimate</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold mb-2">Quarterly Payment</h4>
                    <p className="text-xl font-bold text-yellow-700">
                      {formatCurrency(generatedForm.taxGuidance.quarterlyPayments)}
                    </p>
                    <p className="text-xs text-gray-600">Due 4 times per year</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Potential Deductions</h4>
                    <ul className="text-sm space-y-1">
                      {generatedForm.taxGuidance.deductionOpportunities.map((deduction, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {deduction}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Filing Requirements</h4>
                    <ul className="text-sm space-y-1">
                      {generatedForm.taxGuidance.filingRequirements.map((requirement, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> This is a realistic sample document for demonstration purposes. Consult
                  with a qualified tax professional for actual tax preparation and filing. Keep this form with your tax
                  records for {generatedForm.formInfo.taxYear + 7} years.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
