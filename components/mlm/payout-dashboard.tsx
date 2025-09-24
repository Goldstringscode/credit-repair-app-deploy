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
import {
  DollarSign,
  Clock,
  TrendingUp,
  Building2,
  Zap,
  CreditCard,
  Mail,
  Plus,
  Settings,
  AlertCircle,
  Calendar,
  Download,
  Eye,
} from "lucide-react"
import {
  payoutMethods,
  calculatePayoutFees,
  getAvailableBalance,
  mockPayoutMethods,
  mockPayoutRequests,
} from "@/lib/mlm-payout-system"

interface PayoutDashboardProps {
  userId: string
}

export function PayoutDashboard({ userId }: PayoutDashboardProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("")
  const [payoutAmount, setPayoutAmount] = useState<string>("")
  const [showAddMethod, setShowAddMethod] = useState(false)
  const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(true)

  // Mock data - in real app, fetch from API
  const userPayoutMethods = mockPayoutMethods
  const payoutHistory = mockPayoutRequests
  const mockCommissions = [] // Would fetch from API

  const balance = getAvailableBalance(userId, mockCommissions)
  const defaultMethod = userPayoutMethods.find((m) => m.isDefault)

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "bank_account":
        return Building2
      case "stripe_connect":
        return Zap
      case "paypal":
        return CreditCard
      case "check":
        return Mail
      default:
        return DollarSign
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleRequestPayout = () => {
    const amount = Number.parseInt(payoutAmount) * 100 // Convert to cents
    const method = userPayoutMethods.find((m) => m.id === selectedMethod)

    if (!method || !amount) return

    const fees = calculatePayoutFees(amount, method.type as keyof typeof payoutMethods)

    // In real app, would call API to create payout request
    console.log("Requesting payout:", {
      amount,
      method: method.type,
      fees,
    })
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-green-600">${(balance.availableAmount / 100).toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Button
                className="w-full"
                disabled={balance.availableAmount < 2500}
                onClick={() => setPayoutAmount((balance.availableAmount / 100).toFixed(2))}
              >
                Request Payout
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Release</p>
                <p className="text-2xl font-bold text-yellow-600">${(balance.pendingAmount / 100).toFixed(2)}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {balance.nextReleaseDate && <>Next: {balance.nextReleaseDate.toLocaleDateString()}</>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earned</p>
                <p className="text-2xl font-bold text-blue-600">${(balance.totalEarned / 100).toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 text-xs text-blue-600">All time earnings</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-purple-600">$2,450.00</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 text-xs text-green-600">+18% vs last month</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="request" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="request">Request Payout</TabsTrigger>
          <TabsTrigger value="methods">Payout Methods</TabsTrigger>
          <TabsTrigger value="history">Payout History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Payout</CardTitle>
              <p className="text-sm text-gray-600">
                Minimum payout: $25.00 • Available: ${(balance.availableAmount / 100).toFixed(2)}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Payout Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      min="25"
                      max={(balance.availableAmount / 100).toString()}
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Payout Method</Label>
                    <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payout method" />
                      </SelectTrigger>
                      <SelectContent>
                        {userPayoutMethods.map((method) => {
                          const Icon = getMethodIcon(method.type)
                          const config = payoutMethods[method.type as keyof typeof payoutMethods]
                          return (
                            <SelectItem key={method.id} value={method.id}>
                              <div className="flex items-center space-x-2">
                                <Icon className="h-4 w-4" />
                                <span>{config.name}</span>
                                {method.isDefault && <Badge variant="outline">Default</Badge>}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleRequestPayout}
                    disabled={!selectedMethod || !payoutAmount || Number.parseFloat(payoutAmount) < 25}
                  >
                    Request Payout
                  </Button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Payout Preview</h4>
                  {selectedMethod && payoutAmount && (
                    <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                      {(() => {
                        const method = userPayoutMethods.find((m) => m.id === selectedMethod)
                        const amount = Number.parseFloat(payoutAmount) * 100
                        const fees = method
                          ? calculatePayoutFees(amount, method.type as keyof typeof payoutMethods)
                          : null
                        const config = method ? payoutMethods[method.type as keyof typeof payoutMethods] : null

                        if (!fees || !config) return null

                        return (
                          <>
                            <div className="flex justify-between text-sm">
                              <span>Payout Amount:</span>
                              <span>${(amount / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Processing Fee:</span>
                              <span>-${(fees.processingFee / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Platform Fee:</span>
                              <span>-${(fees.platformFee / 100).toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between font-medium">
                                <span>You'll Receive:</span>
                                <span className="text-green-600">${(fees.netAmount / 100).toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 mt-2">Processing time: {config.processingTime}</div>
                          </>
                        )
                      })()}
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Hold Period Information</p>
                        <ul className="mt-1 space-y-1 text-xs">
                          <li>• Credit repair sales: 30-day hold</li>
                          <li>• MLM recruitment: 3-day hold</li>
                          <li>• Training courses: 14-day hold</li>
                          <li>• High-value sales ($500+): 14-day hold</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Payout Methods</h3>
            <Dialog open={showAddMethod} onOpenChange={setShowAddMethod}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payout Method</DialogTitle>
                  <DialogDescription>Choose how you'd like to receive your commission payouts</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {Object.entries(payoutMethods).map(([key, config]) => {
                    const Icon = getMethodIcon(key)
                    return (
                      <div key={key} className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Icon className="h-6 w-6" />
                            <div>
                              <p className="font-medium">{config.name}</p>
                              <p className="text-sm text-gray-600">{config.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{config.processingTime}</p>
                            <p className="text-xs text-gray-600">Min: ${(config.minimumAmount / 100).toFixed(2)}</p>
                          </div>
                        </div>
                        {config.recommended && <Badge className="mt-2 bg-green-100 text-green-800">Recommended</Badge>}
                      </div>
                    )
                  })}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {userPayoutMethods.map((method) => {
              const Icon = getMethodIcon(method.type)
              const config = payoutMethods[method.type as keyof typeof payoutMethods]

              return (
                <Card key={method.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{config.name}</p>
                            {method.isDefault && <Badge>Default</Badge>}
                            <Badge
                              className={
                                method.status === "verified"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {method.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {method.type === "bank_account" &&
                              `****${(method.details as any).lastFourDigits} • ${(method.details as any).bankName}`}
                            {method.type === "stripe_connect" && `${(method.details as any).email}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payout History</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payoutHistory.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">${(payout.amount / 100).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          {payout.method.type === "bank_account" ? "Bank Transfer" : "Instant Payout"} •
                          {payout.requestedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(payout.status)}>{payout.status}</Badge>
                      <p className="text-sm text-gray-600 mt-1">Net: ${(payout.fees.netAmount / 100).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payout Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Automatic Payouts</h4>
                  <p className="text-sm text-gray-600">Automatically request payouts when balance reaches minimum</p>
                </div>
                <Switch checked={autoPayoutEnabled} onCheckedChange={setAutoPayoutEnabled} />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Payout Frequency</Label>
                  <Select defaultValue="monthly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Payout Amount</Label>
                  <Select defaultValue="25">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">$25.00</SelectItem>
                      <SelectItem value="50">$50.00</SelectItem>
                      <SelectItem value="100">$100.00</SelectItem>
                      <SelectItem value="250">$250.00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Important Notes</p>
                    <ul className="mt-1 space-y-1">
                      <li>• All payouts are subject to our standard hold periods</li>
                      <li>• Bank transfers are free but take 3-5 business days</li>
                      <li>• Instant payouts have fees but arrive immediately</li>
                      <li>• We charge a 0.5% platform fee on all payouts</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
