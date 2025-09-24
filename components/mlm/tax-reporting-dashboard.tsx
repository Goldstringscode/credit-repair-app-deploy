"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Settings,
  Mail,
  Eye,
  Plus,
} from "lucide-react"
import {
  generateTaxSummary,
  calculateEstimatedTax,
  mockTaxDocuments,
  mockTaxSettings,
  taxThresholds,
} from "@/lib/tax-reporting"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

interface TaxReportingDashboardProps {
  userId: string
}

export function TaxReportingDashboard({ userId }: TaxReportingDashboardProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showSettings, setShowSettings] = useState(false)
  const [taxSettings, setTaxSettings] = useState(mockTaxSettings)

  // Mock data - in real app, fetch from API
  const mockCommissions = [
    {
      id: "comm_001",
      userId,
      amount: 45000, // $450.00
      type: "credit_repair_sale",
      createdAt: new Date("2024-03-15"),
    },
    {
      id: "comm_002",
      userId,
      amount: 35000, // $350.00
      type: "mlm_recruitment",
      createdAt: new Date("2024-06-20"),
    },
    {
      id: "comm_003",
      userId,
      amount: 25000, // $250.00
      type: "training_course",
      createdAt: new Date("2024-09-10"),
    },
    {
      id: "comm_004",
      userId,
      amount: 20000, // $200.00
      type: "certified_mail",
      createdAt: new Date("2024-11-05"),
    },
  ]

  const mockPayouts = [
    {
      id: "payout_001",
      userId,
      amount: 100000,
      fees: { totalFees: 5000 },
      createdAt: new Date("2024-04-01"),
    },
    {
      id: "payout_002",
      userId,
      amount: 25000,
      fees: { totalFees: 1250 },
      createdAt: new Date("2024-07-01"),
    },
  ]

  const taxSummary = generateTaxSummary(userId, selectedYear, mockCommissions, mockPayouts)
  const taxDocuments = mockTaxDocuments.filter((doc) => doc.userId === userId)
  const estimatedTax = calculateEstimatedTax(taxSummary.netEarnings, taxSettings.estimatedTaxRate / 100)

  const formatCurrency = (amount: number) => `$${(amount / 100).toFixed(2)}`

  const needs1099 = taxSummary.totalEarnings >= taxThresholds.form1099Required

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tax Reporting</h2>
          <p className="text-gray-600">Manage your tax documents and reporting</p>
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
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tax Settings</DialogTitle>
                <DialogDescription>Configure your tax reporting preferences</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <Select
                    value={taxSettings.businessType}
                    onValueChange={(value: any) => setTaxSettings({ ...taxSettings, businessType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="corporation">Corporation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tax ID (SSN/EIN)</Label>
                  <Input
                    value={taxSettings.taxId}
                    onChange={(e) => setTaxSettings({ ...taxSettings, taxId: e.target.value })}
                    placeholder="123-45-6789"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estimated Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={taxSettings.estimatedTaxRate}
                    onChange={(e) =>
                      setTaxSettings({ ...taxSettings, estimatedTaxRate: Number.parseFloat(e.target.value) })
                    }
                    min="0"
                    max="50"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Auto-generate 1099 forms</Label>
                  <Switch
                    checked={taxSettings.autoGenerate1099}
                    onCheckedChange={(checked) => setTaxSettings({ ...taxSettings, autoGenerate1099: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Quarterly reports</Label>
                  <Switch
                    checked={taxSettings.quarterlyReports}
                    onCheckedChange={(checked) => setTaxSettings({ ...taxSettings, quarterlyReports: checked })}
                  />
                </div>

                <Button className="w-full">Save Settings</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tax Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(taxSummary.totalEarnings)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              {needs1099 && <Badge className="bg-yellow-100 text-yellow-800">1099 Required</Badge>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Earnings</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(taxSummary.netEarnings)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 text-xs text-gray-600">After fees</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estimated Tax</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(estimatedTax.totalTax)}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 text-xs text-orange-600">{taxSettings.estimatedTaxRate}% rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quarterly Payment</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(estimatedTax.quarterlyPayment)}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 text-xs text-purple-600">Recommended</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Tax Summary</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Earnings */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Earnings Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={taxSummary.monthlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${(value / 100).toFixed(0)}`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="earnings" fill="#00C49F" name="Gross Earnings" />
                    <Bar dataKey="netEarnings" fill="#0088FE" name="Net Earnings" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Income by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taxSummary.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {taxSummary.categoryBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tax Calculation Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Calculation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Income Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Gross Earnings:</span>
                        <span>{formatCurrency(taxSummary.totalEarnings)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Less: Business Fees:</span>
                        <span>-{formatCurrency(taxSummary.totalFees)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Less: Deductions:</span>
                        <span>-{formatCurrency(taxSummary.deductions.reduce((sum, d) => sum + d.amount, 0))}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-medium">
                          <span>Taxable Income:</span>
                          <span>
                            {formatCurrency(
                              Math.max(
                                0,
                                taxSummary.netEarnings - taxSummary.deductions.reduce((sum, d) => sum + d.amount, 0),
                              ),
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Tax Liability</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Income Tax ({taxSettings.estimatedTaxRate}%):</span>
                        <span>{formatCurrency(estimatedTax.incomeTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Self-Employment Tax (14.13%):</span>
                        <span>{formatCurrency(estimatedTax.selfEmploymentTax)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-medium">
                          <span>Total Tax:</span>
                          <span>{formatCurrency(estimatedTax.totalTax)}</span>
                        </div>
                        <div className="flex justify-between text-purple-600">
                          <span>Quarterly Payment:</span>
                          <span>{formatCurrency(estimatedTax.quarterlyPayment)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This is an estimate based on your settings. Consult a tax professional for accurate calculations.
                    {needs1099 && " You'll receive a 1099-NEC form for earnings over $600."}
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Tax Documents</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Document
            </Button>
          </div>

          <div className="grid gap-4">
            {taxDocuments.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">
                            {doc.type} - {doc.taxYear}
                          </p>
                          <Badge
                            className={
                              doc.status === "generated"
                                ? "bg-green-100 text-green-800"
                                : doc.status === "sent"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {doc.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Total: {formatCurrency(doc.totalEarnings)} • Generated: {doc.generatedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {taxDocuments.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Tax Documents</h3>
                  <p className="text-gray-600 mb-4">
                    Tax documents will be automatically generated when you meet the requirements.
                  </p>
                  <Button>Generate Test Document</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="quarterly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quarterly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {taxSummary.quarterlyBreakdown.map((quarter) => (
                  <div key={quarter.quarter} className="p-4 border rounded-lg">
                    <h4 className="font-medium text-lg">
                      Q{quarter.quarter} {selectedYear}
                    </h4>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Earnings:</span>
                        <span>{formatCurrency(quarter.earnings)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fees:</span>
                        <span>-{formatCurrency(quarter.fees)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-medium">
                          <span>Net:</span>
                          <span>{formatCurrency(quarter.netEarnings)}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">{quarter.payouts} payouts</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={taxSummary.quarterlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" tickFormatter={(q) => `Q${q}`} />
                    <YAxis tickFormatter={(value) => `$${(value / 100).toFixed(0)}`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="earnings" fill="#00C49F" name="Gross Earnings" />
                    <Bar dataKey="netEarnings" fill="#0088FE" name="Net Earnings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quarterly Payment Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Estimated Tax Payment Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { quarter: "Q1", dueDate: "April 15", amount: estimatedTax.quarterlyPayment },
                  { quarter: "Q2", dueDate: "June 15", amount: estimatedTax.quarterlyPayment },
                  { quarter: "Q3", dueDate: "September 15", amount: estimatedTax.quarterlyPayment },
                  { quarter: "Q4", dueDate: "January 15", amount: estimatedTax.quarterlyPayment },
                ].map((payment) => (
                  <div key={payment.quarter} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {payment.quarter} {selectedYear}
                      </p>
                      <p className="text-sm text-gray-600">Due: {payment.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <Badge className="bg-yellow-100 text-yellow-800">Estimated</Badge>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="mt-4">
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  Quarterly estimated tax payments are due if you expect to owe $1,000 or more in taxes. Set up
                  automatic reminders to avoid penalties.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deductions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Business Deductions</CardTitle>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deduction
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxSummary.deductions.map((deduction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{deduction.type}</p>
                      <p className="text-sm text-gray-600">{deduction.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(deduction.amount)}</p>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-900">Total Deductions</p>
                    <p className="text-sm text-green-700">Reduces your taxable income</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(taxSummary.deductions.reduce((sum, d) => sum + d.amount, 0))}
                  </p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Keep detailed records and receipts for all business deductions. Consult a tax professional to ensure
                  you're claiming all eligible deductions.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Common MLM Deductions Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Common MLM Business Deductions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Home Office Expenses</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Portion of rent/mortgage</li>
                    <li>• Utilities (electricity, heating)</li>
                    <li>• Home insurance</li>
                    <li>• Property taxes</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Business Equipment</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Computer and software</li>
                    <li>• Phone and internet</li>
                    <li>• Office furniture</li>
                    <li>• Printer and supplies</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Marketing & Advertising</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Website hosting and domain</li>
                    <li>• Social media advertising</li>
                    <li>• Business cards and flyers</li>
                    <li>• Lead generation tools</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Training & Education</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Business courses and seminars</li>
                    <li>• Books and educational materials</li>
                    <li>• Conference attendance</li>
                    <li>• Professional development</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
