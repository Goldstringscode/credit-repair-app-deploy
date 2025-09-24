"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, Download, TrendingUp, DollarSign, Users, Calendar, Target, Award } from "lucide-react"

interface HighEarning1099Data {
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
    accountNumber: string
  }
  recipient: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    ssn: string
    accountNumber: string
    mlmLevel: string
    joinDate: string
    teamSize: number
  }
  compensation: {
    box1_nonemployeeCompensation: number
    box2_payerMadeDirect: number
    box4_federalIncomeTaxWithheld: number
    box5_stateIncomeTaxWithheld: number
    box6_statePayerNumber: string
    box7_stateIncome: number
  }
  detailedBreakdown: Array<{
    category: string
    description: string
    amount: number
    percentage: number
    months: string[]
    volume: number
    commission_rate: number
    notes: string
  }>
  performanceMetrics: {
    totalSales: number
    personalSales: number
    teamSales: number
    recruits: number
    activeTeamMembers: number
    rankAchieved: string
    bonusesEarned: string[]
    topPerformerMonths: string[]
  }
  monthlyBreakdown: Array<{
    month: string
    personalSales: number
    teamSales: number
    commissions: number
    bonuses: number
    total: number
    rank: string
  }>
  taxImplications: {
    selfEmploymentTax: number
    estimatedIncomeTax: number
    quarterlyPayments: number
    totalTaxLiability: number
    effectiveTaxRate: number
    deductionOpportunities: Array<{
      category: string
      estimatedAmount: number
      description: string
    }>
  }
  businessExpenses: Array<{
    category: string
    amount: number
    description: string
    deductible: boolean
  }>
}

export function HighEarning1099NEC() {
  const [generatedForm, setGeneratedForm] = useState<HighEarning1099Data | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const generateHighEarning1099 = () => {
    // Generate high-earning MLM 1099-NEC with $75,000 total compensation
    const totalEarnings = 7500000 // $75,000 in cents

    const form: HighEarning1099Data = {
      formInfo: {
        taxYear: 2024,
        formType: "1099-NEC",
        corrected: false,
        void: false,
      },
      payer: {
        name: "Credit Repair AI Network LLC",
        address: "2847 Executive Plaza Drive",
        city: "Austin",
        state: "TX",
        zipCode: "78731",
        ein: "47-2891456",
        phoneNumber: "(512) 555-0199",
        accountNumber: "MLM-ELITE-78291",
      },
      recipient: {
        name: "Sarah Michelle Rodriguez",
        address: "1456 Prosperity Lane",
        city: "Plano",
        state: "TX",
        zipCode: "75024",
        ssn: "456-78-9123",
        accountNumber: "USER-DIAMOND-45821",
        mlmLevel: "Diamond Executive",
        joinDate: "March 2022",
        teamSize: 247,
      },
      compensation: {
        box1_nonemployeeCompensation: totalEarnings,
        box2_payerMadeDirect: 0,
        box4_federalIncomeTaxWithheld: 1125000, // 15% withholding
        box5_stateIncomeTaxWithheld: 0, // Texas has no state income tax
        box6_statePayerNumber: "",
        box7_stateIncome: 0,
      },
      detailedBreakdown: [
        {
          category: "Personal Sales Commissions",
          description: "Direct credit repair service sales to personal clients",
          amount: 2100000, // $21,000
          percentage: 28,
          months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          volume: 420000, // $4,200 average monthly
          commission_rate: 50,
          notes: "Maintained consistent personal sales throughout the year",
        },
        {
          category: "Team Override Commissions",
          description: "Commissions from downline team member sales",
          amount: 2625000, // $26,250
          percentage: 35,
          months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          volume: 1312500, // Team generated $131,250 in sales
          commission_rate: 20,
          notes: "5-level deep commission structure, 247 active team members",
        },
        {
          category: "Recruitment Bonuses",
          description: "Bonuses for recruiting new team members",
          amount: 1200000, // $12,000
          percentage: 16,
          months: ["Feb", "Mar", "May", "Jun", "Aug", "Sep", "Oct", "Nov"],
          volume: 24, // 24 new recruits
          commission_rate: 50000, // $500 per recruit
          notes: "Successfully recruited 24 new team members, exceeded quarterly goals",
        },
        {
          category: "Leadership Bonuses",
          description: "Monthly leadership and rank advancement bonuses",
          amount: 900000, // $9,000
          percentage: 12,
          months: ["Jan", "Mar", "Apr", "Jun", "Jul", "Sep", "Oct", "Dec"],
          volume: 8, // 8 bonus months
          commission_rate: 112500, // $1,125 average per bonus
          notes: "Diamond Executive rank bonuses and team leadership incentives",
        },
        {
          category: "Training Course Commissions",
          description: "Commissions from selling advanced training courses",
          amount: 450000, // $4,500
          percentage: 6,
          months: ["Feb", "Apr", "May", "Jul", "Sep", "Nov"],
          volume: 18, // 18 courses sold
          commission_rate: 25000, // $250 per course
          notes: "Advanced dispute resolution and credit building courses",
        },
        {
          category: "Performance Incentives",
          description: "Quarterly and annual performance bonuses",
          amount: 225000, // $2,250
          percentage: 3,
          months: ["Mar", "Jun", "Sep", "Dec"],
          volume: 4, // Quarterly bonuses
          commission_rate: 56250, // $562.50 average per quarter
          notes: "Top 5% performer bonuses and annual achievement awards",
        },
      ],
      performanceMetrics: {
        totalSales: 551250, // $55,125 total volume generated
        personalSales: 42000, // $4,200 personal sales
        teamSales: 131250, // $131,250 team sales
        recruits: 24,
        activeTeamMembers: 247,
        rankAchieved: "Diamond Executive",
        bonusesEarned: [
          "Top Recruiter Q2 2024",
          "Leadership Excellence Award",
          "Diamond Achievement Bonus",
          "Annual Top Performer",
        ],
        topPerformerMonths: ["March", "June", "August", "November"],
      },
      monthlyBreakdown: [
        {
          month: "January",
          personalSales: 3200,
          teamSales: 9800,
          commissions: 5100,
          bonuses: 1125,
          total: 6225,
          rank: "Diamond",
        },
        {
          month: "February",
          personalSales: 3800,
          teamSales: 11200,
          commissions: 6150,
          bonuses: 500,
          total: 6650,
          rank: "Diamond",
        },
        {
          month: "March",
          personalSales: 4100,
          teamSales: 12500,
          commissions: 6825,
          bonuses: 1625,
          total: 8450,
          rank: "Diamond Executive",
        },
        {
          month: "April",
          personalSales: 3600,
          teamSales: 10800,
          commissions: 5850,
          bonuses: 1125,
          total: 6975,
          rank: "Diamond Executive",
        },
        {
          month: "May",
          personalSales: 3900,
          teamSales: 11600,
          commissions: 6275,
          bonuses: 750,
          total: 7025,
          rank: "Diamond Executive",
        },
        {
          month: "June",
          personalSales: 4200,
          teamSales: 13100,
          commissions: 7050,
          bonuses: 1687,
          total: 8737,
          rank: "Diamond Executive",
        },
        {
          month: "July",
          personalSales: 3700,
          teamSales: 10900,
          commissions: 5975,
          bonuses: 1125,
          total: 7100,
          rank: "Diamond Executive",
        },
        {
          month: "August",
          personalSales: 4300,
          teamSales: 13800,
          commissions: 7375,
          bonuses: 500,
          total: 7875,
          rank: "Diamond Executive",
        },
        {
          month: "September",
          personalSales: 3500,
          teamSales: 10200,
          commissions: 5575,
          bonuses: 1687,
          total: 7262,
          rank: "Diamond Executive",
        },
        {
          month: "October",
          personalSales: 3800,
          teamSales: 11400,
          commissions: 6200,
          bonuses: 1625,
          total: 7825,
          rank: "Diamond Executive",
        },
        {
          month: "November",
          personalSales: 4000,
          teamSales: 12200,
          commissions: 6600,
          bonuses: 750,
          total: 7350,
          rank: "Diamond Executive",
        },
        {
          month: "December",
          personalSales: 3400,
          teamSales: 9850,
          commissions: 5275,
          bonuses: 1125,
          total: 6400,
          rank: "Diamond Executive",
        },
      ],
      taxImplications: {
        selfEmploymentTax: Math.floor(totalEarnings * 0.1413), // $10,597.50
        estimatedIncomeTax: Math.floor(totalEarnings * 0.24), // $18,000 (24% bracket)
        quarterlyPayments: Math.floor((totalEarnings * 0.1413 + totalEarnings * 0.24) / 4), // $7,149.38 per quarter
        totalTaxLiability: Math.floor(totalEarnings * 0.3813), // $28,597.50
        effectiveTaxRate: 38.13,
        deductionOpportunities: [
          {
            category: "Home Office",
            estimatedAmount: 360000, // $3,600
            description: "300 sq ft dedicated office space, utilities, maintenance",
          },
          {
            category: "Business Vehicle",
            estimatedAmount: 420000, // $4,200
            description: "Mileage for client meetings, team events, training sessions",
          },
          {
            category: "Marketing & Advertising",
            estimatedAmount: 180000, // $1,800
            description: "Website, social media ads, business cards, promotional materials",
          },
          {
            category: "Professional Development",
            estimatedAmount: 150000, // $1,500
            description: "Training courses, conferences, certification programs",
          },
          {
            category: "Business Equipment",
            estimatedAmount: 120000, // $1,200
            description: "Computer, phone, software subscriptions, office furniture",
          },
          {
            category: "Professional Services",
            estimatedAmount: 240000, // $2,400
            description: "Accounting, legal consultation, business coaching",
          },
        ],
      },
      businessExpenses: [
        {
          category: "Home Office Expenses",
          amount: 360000,
          description: "Dedicated 300 sq ft office space, utilities allocation",
          deductible: true,
        },
        {
          category: "Vehicle Expenses",
          amount: 420000,
          description: "Business mileage: 8,400 miles @ $0.50/mile",
          deductible: true,
        },
        {
          category: "Marketing & Advertising",
          amount: 180000,
          description: "Digital marketing, promotional materials, website maintenance",
          deductible: true,
        },
        {
          category: "Professional Development",
          amount: 150000,
          description: "Training courses, industry conferences, certifications",
          deductible: true,
        },
        {
          category: "Technology & Equipment",
          amount: 120000,
          description: "Computer equipment, software, phone service",
          deductible: true,
        },
        {
          category: "Professional Services",
          amount: 240000,
          description: "Accounting, legal, business consulting fees",
          deductible: true,
        },
        {
          category: "Business Insurance",
          amount: 90000,
          description: "Professional liability and business insurance",
          deductible: true,
        },
        {
          category: "Office Supplies",
          amount: 60000,
          description: "Stationery, printing, office materials",
          deductible: true,
        },
      ],
    }

    setGeneratedForm(form)
    setShowDetails(true)
  }

  const formatCurrency = (amount: number) => `$${(amount / 100).toLocaleString()}`

  const exportForm = (format: "pdf" | "json" | "csv") => {
    if (!generatedForm) return

    let data: string
    let mimeType: string
    let filename: string

    switch (format) {
      case "json":
        data = JSON.stringify(generatedForm, null, 2)
        mimeType = "application/json"
        filename = `High-Earning-1099-NEC-2024-${generatedForm.recipient.name.replace(/\s+/g, "-")}.json`
        break
      case "csv":
        data =
          `Field,Value\n` +
          `Tax Year,${generatedForm.formInfo.taxYear}\n` +
          `Payer Name,"${generatedForm.payer.name}"\n` +
          `Recipient Name,"${generatedForm.recipient.name}"\n` +
          `MLM Level,${generatedForm.recipient.mlmLevel}\n` +
          `Team Size,${generatedForm.recipient.teamSize}\n` +
          `Total Compensation,${formatCurrency(generatedForm.compensation.box1_nonemployeeCompensation)}\n` +
          `Federal Tax Withheld,${formatCurrency(generatedForm.compensation.box4_federalIncomeTaxWithheld)}\n` +
          `Self Employment Tax,${formatCurrency(generatedForm.taxImplications.selfEmploymentTax)}\n` +
          `Estimated Income Tax,${formatCurrency(generatedForm.taxImplications.estimatedIncomeTax)}\n` +
          `Total Tax Liability,${formatCurrency(generatedForm.taxImplications.totalTaxLiability)}\n`
        mimeType = "text/csv"
        filename = `High-Earning-1099-NEC-2024-${generatedForm.recipient.name.replace(/\s+/g, "-")}.csv`
        break
      default:
        data = "PDF export functionality would be implemented here"
        mimeType = "text/plain"
        filename = `High-Earning-1099-NEC-2024.txt`
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
            <TrendingUp className="h-6 w-6 text-green-600" />
            <span>High-Earning 1099-NEC Generator</span>
          </CardTitle>
          <p className="text-gray-600">
            Generate a realistic high-earning 1099-NEC form showing $75,000+ in MLM credit repair earnings with detailed
            performance metrics
          </p>
        </CardHeader>
        <CardContent>
          <Button onClick={generateHighEarning1099} className="w-full" size="lg">
            <FileText className="h-5 w-5 mr-2" />
            Generate $75,000 High-Earning 1099-NEC
          </Button>
        </CardContent>
      </Card>

      {generatedForm && showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-gold-500" />
                <span>Form 1099-NEC - Diamond Executive Level</span>
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
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Executive Summary */}
            <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-700">
                    {formatCurrency(generatedForm.compensation.box1_nonemployeeCompensation)}
                  </p>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-700">{generatedForm.recipient.teamSize}</p>
                  <p className="text-sm text-gray-600">Team Members</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-purple-700">{generatedForm.performanceMetrics.recruits}</p>
                  <p className="text-sm text-gray-600">New Recruits</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="h-8 w-8 text-gold-600" />
                  </div>
                  <p className="text-lg font-bold text-gold-700">{generatedForm.recipient.mlmLevel}</p>
                  <p className="text-sm text-gray-600">MLM Rank</p>
                </div>
              </div>
            </div>

            {/* Recipient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  High Performer Profile
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Name:</strong> {generatedForm.recipient.name}
                  </p>
                  <p>
                    <strong>MLM Level:</strong> {generatedForm.recipient.mlmLevel}
                  </p>
                  <p>
                    <strong>Join Date:</strong> {generatedForm.recipient.joinDate}
                  </p>
                  <p>
                    <strong>Team Size:</strong> {generatedForm.recipient.teamSize} active members
                  </p>
                  <p>
                    <strong>Account:</strong> {generatedForm.recipient.accountNumber}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Performance Highlights
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Total Sales Volume:</strong>{" "}
                    {formatCurrency(generatedForm.performanceMetrics.totalSales * 100)}
                  </p>
                  <p>
                    <strong>Personal Sales:</strong>{" "}
                    {formatCurrency(generatedForm.performanceMetrics.personalSales * 100)}
                  </p>
                  <p>
                    <strong>Team Sales:</strong> {formatCurrency(generatedForm.performanceMetrics.teamSales * 100)}
                  </p>
                  <p>
                    <strong>New Recruits:</strong> {generatedForm.performanceMetrics.recruits}
                  </p>
                  <p>
                    <strong>Top Performer Months:</strong>{" "}
                    {generatedForm.performanceMetrics.topPerformerMonths.join(", ")}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Compensation Display */}
            <div className="p-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300 text-center">
              <h3 className="text-2xl font-semibold mb-4 flex items-center justify-center">
                <DollarSign className="h-6 w-6 mr-2" />
                Box 1 - Nonemployee Compensation
              </h3>
              <p className="text-6xl font-bold text-green-700 mb-4">
                {formatCurrency(generatedForm.compensation.box1_nonemployeeCompensation)}
              </p>
              <p className="text-lg text-gray-700 mb-2">Diamond Executive Level Earnings</p>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Top 1% Performer - 2024
              </Badge>
            </div>

            {/* Tax Withholding */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Federal Income Tax Withheld
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold text-red-700">
                    {formatCurrency(generatedForm.compensation.box4_federalIncomeTaxWithheld)}
                  </p>
                  <p className="text-sm text-gray-600">15% withholding rate applied</p>
                </div>
                <div className="text-sm">
                  <p>
                    <strong>Withholding Rate:</strong> 15%
                  </p>
                  <p>
                    <strong>Quarterly Withholding:</strong>{" "}
                    {formatCurrency(generatedForm.compensation.box4_federalIncomeTaxWithheld / 4)}
                  </p>
                  <p>
                    <strong>State Tax:</strong> $0 (Texas resident)
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Income Breakdown */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Detailed Income Source Analysis
              </h3>
              <div className="space-y-4">
                {generatedForm.detailedBreakdown.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{item.category}</h4>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-700">{formatCurrency(item.amount)}</p>
                        <Badge variant="outline">{item.percentage}% of total</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p>
                          <strong>Commission Rate:</strong> {item.commission_rate}%
                        </p>
                        <p>
                          <strong>Volume Generated:</strong> {formatCurrency(item.volume)}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Active Months:</strong> {item.months.length}
                        </p>
                        <p>
                          <strong>Avg Monthly:</strong> {formatCurrency(item.amount / item.months.length)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 italic">{item.notes}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Performance Chart */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Monthly Performance Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedForm.monthlyBreakdown.map((month, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">{month.month}</h4>
                      <Badge variant={month.rank === "Diamond Executive" ? "default" : "secondary"}>{month.rank}</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Personal:</strong> {formatCurrency(month.personalSales * 100)}
                      </p>
                      <p>
                        <strong>Team:</strong> {formatCurrency(month.teamSales * 100)}
                      </p>
                      <p>
                        <strong>Commissions:</strong> {formatCurrency(month.commissions * 100)}
                      </p>
                      <p>
                        <strong>Bonuses:</strong> {formatCurrency(month.bonuses * 100)}
                      </p>
                      <div className="border-t pt-1 mt-2">
                        <p className="font-semibold text-green-700">
                          <strong>Total:</strong> {formatCurrency(month.total * 100)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Implications */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Tax Implications & Planning</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold mb-2">Self-Employment Tax</h4>
                  <p className="text-2xl font-bold text-purple-700">
                    {formatCurrency(generatedForm.taxImplications.selfEmploymentTax)}
                  </p>
                  <p className="text-xs text-gray-600">14.13% of net earnings</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold mb-2">Est. Income Tax</h4>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(generatedForm.taxImplications.estimatedIncomeTax)}
                  </p>
                  <p className="text-xs text-gray-600">24% tax bracket</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold mb-2">Quarterly Payment</h4>
                  <p className="text-2xl font-bold text-yellow-700">
                    {formatCurrency(generatedForm.taxImplications.quarterlyPayments)}
                  </p>
                  <p className="text-xs text-gray-600">Due 4 times per year</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold mb-2">Total Tax Liability</h4>
                  <p className="text-2xl font-bold text-red-700">
                    {formatCurrency(generatedForm.taxImplications.totalTaxLiability)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {generatedForm.taxImplications.effectiveTaxRate}% effective rate
                  </p>
                </div>
              </div>
            </div>

            {/* Business Deductions */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Potential Business Deductions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedForm.taxImplications.deductionOpportunities.map((deduction, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-green-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{deduction.category}</h4>
                        <p className="text-sm text-gray-600">{deduction.description}</p>
                      </div>
                      <p className="text-lg font-bold text-green-700">{formatCurrency(deduction.estimatedAmount)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-green-100 rounded-lg">
                <p className="text-center text-lg">
                  <strong>Total Potential Deductions:</strong>{" "}
                  <span className="text-green-700 font-bold">
                    {formatCurrency(
                      generatedForm.taxImplications.deductionOpportunities.reduce(
                        (sum, deduction) => sum + deduction.estimatedAmount,
                        0,
                      ),
                    )}
                  </span>
                </p>
                <p className="text-center text-sm text-gray-600 mt-1">
                  Potential tax savings:{" "}
                  {formatCurrency(
                    generatedForm.taxImplications.deductionOpportunities.reduce(
                      (sum, deduction) => sum + deduction.estimatedAmount,
                      0,
                    ) * 0.24,
                  )}{" "}
                  (24% bracket)
                </p>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center">
                <Award className="h-5 w-5 mr-2" />
                2024 Achievement Awards
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {generatedForm.performanceMetrics.bonusesEarned.map((bonus, index) => (
                  <div key={index} className="p-3 bg-gold-50 border border-gold-200 rounded-lg text-center">
                    <Award className="h-6 w-6 mx-auto mb-2 text-gold-600" />
                    <p className="text-sm font-semibold text-gold-700">{bonus}</p>
                  </div>
                ))}
              </div>
            </div>

            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>High Earner Notice:</strong> This 1099-NEC represents exceptional performance in the Credit
                Repair AI MLM network. As a Diamond Executive with $75,000+ in earnings, additional tax planning
                strategies may be beneficial. Consider consulting with a tax professional specializing in high-income
                MLM participants for optimal tax efficiency. Keep this form with your tax records for 7 years.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
