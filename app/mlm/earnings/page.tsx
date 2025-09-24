"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { DollarSign, TrendingUp, Calendar, Download, Eye, CreditCard, Banknote, Wallet, PiggyBank, Target, Award, Clock, CheckCircle, AlertCircle, XCircle, Plus, Settings, BarChart3, ArrowUpRight, ArrowDownRight, Filter, Search, RefreshCw } from 'lucide-react'

interface EarningsData {
  totalEarnings: number
  monthlyEarnings: number
  weeklyEarnings: number
  pendingEarnings: number
  paidEarnings: number
  commissionRate: number
  bonusEarnings: number
  residualEarnings: number
}

interface Transaction {
  id: number
  type: "commission" | "bonus" | "residual" | "penalty"
  description: string
  amount: number
  status: "pending" | "paid" | "processing" | "failed"
  date: string
  source: string
  reference: string
}

interface PayoutMethod {
  id: number
  type: "bank" | "paypal" | "crypto" | "check"
  name: string
  details: string
  isDefault: boolean
  status: "active" | "pending" | "inactive"
}

const earningsData: EarningsData = {
  totalEarnings: 45680,
  monthlyEarnings: 8950,
  weeklyEarnings: 2240,
  pendingEarnings: 1850,
  paidEarnings: 43830,
  commissionRate: 42,
  bonusEarnings: 12450,
  residualEarnings: 8900
}

const transactions: Transaction[] = [
  {
    id: 1,
    type: "commission",
    description: "Direct referral commission - Sarah Johnson",
    amount: 450,
    status: "paid",
    date: "2024-01-25",
    source: "Direct Sale",
    reference: "TXN-2024-001"
  },
  {
    id: 2,
    type: "bonus",
    description: "Team performance bonus - January",
    amount: 1200,
    status: "paid",
    date: "2024-01-24",
    source: "Team Bonus",
    reference: "TXN-2024-002"
  },
  {
    id: 3,
    type: "residual",
    description: "Monthly residual income",
    amount: 850,
    status: "processing",
    date: "2024-01-23",
    source: "Residual",
    reference: "TXN-2024-003"
  },
  {
    id: 4,
    type: "commission",
    description: "Team commission - Level 2",
    amount: 320,
    status: "pending",
    date: "2024-01-22",
    source: "Team Sale",
    reference: "TXN-2024-004"
  },
  {
    id: 5,
    type: "bonus",
    description: "Rank advancement bonus",
    amount: 2500,
    status: "paid",
    date: "2024-01-20",
    source: "Rank Bonus",
    reference: "TXN-2024-005"
  }
]

const payoutMethods: PayoutMethod[] = [
  {
    id: 1,
    type: "bank",
    name: "Chase Bank",
    details: "****1234",
    isDefault: true,
    status: "active"
  },
  {
    id: 2,
    type: "paypal",
    name: "PayPal",
    details: "user@example.com",
    isDefault: false,
    status: "active"
  },
  {
    id: 3,
    type: "crypto",
    name: "Bitcoin Wallet",
    details: "bc1q...xyz",
    isDefault: false,
    status: "pending"
  }
]

export default function EarningsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [showPayoutDialog, setShowPayoutDialog] = useState(false)
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")

  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: "bank" as PayoutMethod["type"],
    name: "",
    details: ""
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "processing": return "bg-blue-100 text-blue-800"
      case "failed": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />
      case "processing": return <RefreshCw className="h-4 w-4 text-blue-600" />
      case "failed": return <XCircle className="h-4 w-4 text-red-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "commission": return "bg-blue-100 text-blue-800"
      case "bonus": return "bg-purple-100 text-purple-800"
      case "residual": return "bg-green-100 text-green-800"
      case "penalty": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case "bank": return <Banknote className="h-5 w-5" />
      case "paypal": return <Wallet className="h-5 w-5" />
      case "crypto": return <CreditCard className="h-5 w-5" />
      case "check": return <PiggyBank className="h-5 w-5" />
      default: return <DollarSign className="h-5 w-5" />
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus
    const matchesType = filterType === "all" || transaction.type === filterType
    return matchesStatus && matchesType
  })

  const handleRequestPayout = () => {
    toast({
      title: "Payout Requested",
      description: "Your payout request has been submitted and will be processed within 3-5 business days."
    })
    setShowPayoutDialog(false)
  }

  const handleAddPaymentMethod = () => {
    if (!newPaymentMethod.name || !newPaymentMethod.details) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Success",
      description: "Payment method added successfully!"
    })
    
    setNewPaymentMethod({ type: "bank", name: "", details: "" })
    setShowAddPaymentMethod(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings & Payouts</h1>
          <p className="text-gray-600 mt-1">Track your income and manage payouts</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
            <DialogTrigger asChild>
              <Button>
                <DollarSign className="h-4 w-4 mr-2" />
                Request Payout
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Payout</DialogTitle>
                <DialogDescription>
                  Request a payout of your available earnings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Available for Payout:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${earningsData.pendingEarnings.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Payout Method</Label>
                  <Select defaultValue="1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {payoutMethods.filter(method => method.status === "active").map(method => (
                        <SelectItem key={method.id} value={method.id.toString()}>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(method.type)}
                            {method.name} - {method.details}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-gray-600">
                  <p>• Payouts are processed within 3-5 business days</p>
                  <p>• Minimum payout amount: $50</p>
                  <p>• Processing fees may apply</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRequestPayout}>
                  Request Payout
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${earningsData.totalEarnings.toLocaleString()}</p>
                <div className="flex items-center mt-1 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +12.5% from last month
                </div>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${earningsData.monthlyEarnings.toLocaleString()}</p>
                <div className="flex items-center mt-1 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +8.2% from last month
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${earningsData.pendingEarnings.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Available for payout</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commission Rate</p>
                <p className="text-2xl font-bold text-gray-900">{earningsData.commissionRate}%</p>
                <p className="text-xs text-blue-600 mt-1">Current tier rate</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Payout Methods</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Earnings Breakdown */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Earnings Breakdown</CardTitle>
                <CardDescription>Your income sources this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Direct Commissions</p>
                        <p className="text-sm text-gray-600">From direct referrals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${(earningsData.monthlyEarnings * 0.6).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">60% of total</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Award className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Bonuses</p>
                        <p className="text-sm text-gray-600">Performance & rank bonuses</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${earningsData.bonusEarnings.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">25% of total</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Residual Income</p>
                        <p className="text-sm text-gray-600">Ongoing team commissions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${earningsData.residualEarnings.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">15% of total</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Key performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
                  <div className="text-2xl font-bold">${earningsData.weeklyEarnings.toLocaleString()}</div>
                  <div className="text-sm opacity-90">This Week</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg. Daily Earnings</span>
                    <span className="font-semibold">${(earningsData.weeklyEarnings / 7).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Paid Out</span>
                    <span className="font-semibold">${earningsData.paidEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Next Payout</span>
                    <span className="font-semibold">Feb 1st</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Monthly Goal</span>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">$2,250 to reach $12,000 goal</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input placeholder="Search transactions..." className="pl-10" />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="commission">Commission</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                    <SelectItem value="residual">Residual</SelectItem>
                    <SelectItem value="penalty">Penalty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <div className="grid gap-4">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(transaction.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{transaction.description}</h3>
                          <Badge className={getTypeColor(transaction.type)}>
                            {transaction.type}
                          </Badge>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Date: {new Date(transaction.date).toLocaleDateString()}</span>
                          <span>Source: {transaction.source}</span>
                          <span>Ref: {transaction.reference}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}${transaction.amount.toLocaleString()}
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Payout Methods</h2>
            <Dialog open={showAddPaymentMethod} onOpenChange={setShowAddPaymentMethod}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                  <DialogDescription>
                    Add a new method to receive your payouts
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Payment Type</Label>
                    <Select value={newPaymentMethod.type} onValueChange={(value: PayoutMethod["type"]) => setNewPaymentMethod({...newPaymentMethod, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Bank Account</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="crypto">Cryptocurrency</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <Input
                      placeholder="e.g., Chase Bank, PayPal"
                      value={newPaymentMethod.name}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Details</Label>
                    <Input
                      placeholder="Account number, email, or wallet address"
                      value={newPaymentMethod.details}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, details: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddPaymentMethod(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPaymentMethod}>
                    Add Method
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {payoutMethods.map((method) => (
              <Card key={method.id} className={method.isDefault ? "ring-2 ring-blue-500" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getPaymentMethodIcon(method.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{method.name}</h3>
                          {method.isDefault && (
                            <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                          )}
                          <Badge className={method.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                            {method.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{method.details}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                      {!method.isDefault && (
                        <Button size="sm" variant="outline">
                          Set Default
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Earnings Trend</CardTitle>
                <CardDescription>Your earnings over the past 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mb-2" />
                  <p>Earnings chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">+23%</div>
                  <div className="text-sm text-gray-600">Growth Rate</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Best Month</span>
                    <span className="font-semibold">$12,450</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Monthly</span>
                    <span className="font-semibold">$8,950</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">YTD Total</span>
                    <span className="font-semibold">$45,680</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
