"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useRealtimeTracking, type TrackingUpdate } from "@/hooks/useRealtimeTracking"
import { toast } from "sonner"
import {
  FileText,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  MapPin,
  Calendar,
  Package,
  Mail,
  Phone,
  Building,
  User,
  CreditCard,
  Shield,
  BarChart3,
  Bell,
  Activity,
  Copy, Wifi, WifiOff, RefreshCw
} from "lucide-react"

interface LetterTracking {
  id: string
  letterType: string
  recipient: string
  recipientAddress: string
  trackingNumber: string
  status: "sent" | "in_transit" | "delivered" | "returned" | "pending"
  sentDate: string
  expectedDelivery: string
  actualDelivery?: string
  currentLocation: string
  lastUpdate: string
  disputeType: string
  creditBureau: string
  certifiedMail: boolean
  returnReceipt: boolean
  notes?: string
}

export default function LetterMonitoringPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [bureauFilter, setBureauFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedLetter, setSelectedLetter] = useState<LetterTracking | null>(null)
  
  // Alert settings state
  const [alertSettings, setAlertSettings] = useState({
    allAlerts: true,
    deliveryNotifications: true,
    statusUpdates: true,
    bureauResponses: true,
    returnReceipts: true,
    trackingUpdates: true,
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    weeklyDigest: true,
    monthlyReport: false
  })

  // Mock data - in real app, this would come from API
  const { user } = useCurrentUser()
  const [letters, setLetters] = useState<LetterTracking[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [isLive, setIsLive] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Map DB row -> LetterTracking
  const mapMailRecord = (r: any): LetterTracking => {
    const addr = typeof r.recipient_address === 'string' ? (() => { try { return JSON.parse(r.recipient_address) } catch { return {} } })() : (r.recipient_address ?? {})
    const addrStr = [addr.street1, addr.city, addr.state, addr.zip].filter(Boolean).join(', ')
    const sm: Record<string, LetterTracking['status']> = { pending_payment:'pending', paid:'pending', processing:'processing', sent:'sent', in_transit:'in_transit', shipped:'in_transit', delivered:'delivered', returned:'returned', failed:'failed' }
    return { id: r.id, source: 'certified_mail' as const, letterType: (r.dispute_type ?? 'Dispute') + ' — ' + (r.bureau_name ?? r.recipient_name ?? ''), recipient: r.recipient_name ?? '', recipientAddress: addrStr, trackingNumber: r.tracking_number ?? '—', status: sm[r.status] ?? 'pending', sentDate: r.sent_at ? new Date(r.sent_at).toLocaleDateString() : (r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'), expectedDelivery: r.estimated_delivery ?? '—', currentLocation: r.status === 'delivered' ? 'Delivered' : r.status === 'in_transit' ? 'In Transit' : r.status === 'sent' ? 'Sent — awaiting scan' : (r.status ?? '—'), lastUpdate: r.updated_at ? new Date(r.updated_at).toLocaleString() : '—', disputeType: r.dispute_type ?? '—', creditBureau: r.bureau_name ?? '—', certifiedMail: true }
  }
  const mapLetter = (r: any): LetterTracking => ({
    id: r.id, source: 'letter' as const, letterType: r.letter_type ?? 'Letter', recipient: r.recipient ?? '—', recipientAddress: r.recipient_address ?? '—', trackingNumber: r.tracking_number ?? '—', status: (r.delivery_status as LetterTracking['status']) ?? 'pending', sentDate: r.sent_date ? new Date(r.sent_date).toLocaleDateString() : (r.generated_at ? new Date(r.generated_at).toLocaleDateString() : '—'), expectedDelivery: '—', currentLocation: '—', lastUpdate: r.generated_at ? new Date(r.generated_at).toLocaleString() : '—', disputeType: '—', creditBureau: r.recipient ?? '—', certifiedMail: false
  })

  const loadData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    try {
      const res = await fetch('/api/monitoring/letters', { credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        setLetters([
          ...(data.data.certifiedMail ?? []).map(mapMailRecord),
          ...(data.data.letters ?? []).map(mapLetter),
        ])
        setLastRefresh(new Date())
      }
    } catch (e) { console.error('Monitoring load error:', e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    loadData()
    pollRef.current = setInterval(() => loadData(true), 60_000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [loadData])

  // Real-time updates
  const handleRealtimeUpdate = useCallback((update: TrackingUpdate) => {
    setLetters(prev => prev.map(l => l.id !== update.id ? l : {
      ...l,
      status: update.status as LetterTracking['status'],
      currentLocation: update.current_location,
      lastUpdate: new Date(update.updated_at).toLocaleString(),
      expectedDelivery: update.estimated_delivery ?? l.expectedDelivery,
    }))
    toast.success('Live update: ' + update.status.replace('_', ' ') + ' — ' + update.current_location)
  }, [])
  const connected = useRealtimeTracking(user?.id, handleRealtimeUpdate)
  useEffect(() => { setIsLive(connected) }, [connected])

  
  // Functional handlers
  const handleViewLetter = (letter: LetterTracking) => {
    setSelectedLetter(letter)
    toast.success(`Opening letter details: ${letter.letterType}`)
  }

  const handleDownloadLetter = (letter: LetterTracking) => {
    toast.success(`Downloading letter: ${letter.letterType}`)
    const element = document.createElement('a')
    const file = new Blob([`Letter Details:\n\nType: ${letter.letterType}\nRecipient: ${letter.recipient}\nTracking: ${letter.trackingNumber}\nStatus: ${letter.status}\nSent: ${letter.sentDate}\nDispute: ${letter.disputeType}\nBureau: ${letter.creditBureau}\nNotes: ${letter.notes || 'None'}`], {type: 'text/plain'})
    element.href = URL.createObjectURL(file)
    element.download = `letter-${letter.id}-${letter.letterType.replace(/\s+/g, '-').toLowerCase()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleCopyTrackingNumber = async (letter: LetterTracking) => {
    try {
      await navigator.clipboard.writeText(letter.trackingNumber)
      toast.success(`Tracking number copied: ${letter.trackingNumber}`)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = letter.trackingNumber
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success(`Tracking number copied: ${letter.trackingNumber}`)
    }
  }

  const handleDownloadTrackingNumber = (letter: LetterTracking) => {
    toast.success(`Downloading tracking number: ${letter.trackingNumber}`)
    const element = document.createElement('a')
    const file = new Blob([`Tracking Information:\n\nTracking Number: ${letter.trackingNumber}\nLetter Type: ${letter.letterType}\nRecipient: ${letter.recipient}\nStatus: ${letter.status}\nCurrent Location: ${letter.currentLocation}\nSent Date: ${letter.sentDate}\nExpected Delivery: ${letter.expectedDelivery}\nLast Update: ${letter.lastUpdate}\nCertified Mail: ${letter.certifiedMail ? 'Yes' : 'No'}\nReturn Receipt: ${letter.returnReceipt ? 'Yes' : 'No'}`], {type: 'text/plain'})
    element.href = URL.createObjectURL(file)
    element.download = `tracking-${letter.trackingNumber.replace(/\s+/g, '-')}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleAlertSettingChange = (setting: string, value: boolean) => {
    setAlertSettings(prev => ({
      ...prev,
      [setting]: value
    }))
    
    if (setting === 'allAlerts') {
      // Toggle all alerts when master switch is toggled
      const newValue = value
      setAlertSettings(prev => ({
        ...prev,
        deliveryNotifications: newValue,
        statusUpdates: newValue,
        bureauResponses: newValue,
        returnReceipts: newValue,
        trackingUpdates: newValue
      }))
    }
    
    toast.success(`Alert setting updated: ${setting}`)
  }

  const handleSaveAlertSettings = () => {
    toast.success("Alert settings saved successfully!")
    // In a real app, this would save to the backend
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Letter Monitoring</h1>
          <p className="text-gray-600 mt-2">
            Track your dispute letters, monitor delivery status, and manage your credit repair process
          </p>
        </div>

        {loading && <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" /><span className="text-gray-600">Loading tracking data…</span></div>}
      {!loading && letters.length === 0 && <div className="text-center py-16 text-gray-500"><Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" /><h3 className="text-xl font-semibold text-gray-700 mb-2">No Letters Yet</h3><p className="max-w-sm mx-auto mb-6">Send a letter via certified mail to see real-time tracking here.</p><Button onClick={() => window.location.href = "/dashboard/letters/generate"}>Generate a Letter</Button></div>}
      {!loading && letters.length > 0 && <>
      {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Letters</p>
                  <p className="text-2xl font-bold">{totalLetters}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold">{deliveredLetters}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Truck className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">In Transit</p>
                  <p className="text-2xl font-bold">{inTransitLetters}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{pendingLetters}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Letter Tracking
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {letters.slice(0, 3).map((letter) => (
                      <div key={letter.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{letter.letterType}</h4>
                          <p className="text-sm text-gray-600">{letter.recipient}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500">
                              {letter.trackingNumber}
                            </span>
                            <span className="text-xs text-gray-500">
                              {letter.lastUpdate}
                            </span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(letter.status)}>
                          {letter.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bureau Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Bureau Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["Experian", "Equifax", "TransUnion"].map((bureau) => {
                      const count = letters.filter(l => l.creditBureau === bureau).length
                      return (
                        <div key={bureau} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{bureau}</h4>
                            <p className="text-sm text-gray-600">{count} letters sent</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{count}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Letter Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search letters, tracking numbers, or recipients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={bureauFilter} onValueChange={setBureauFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Bureau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Bureaus</SelectItem>
                      <SelectItem value="Experian">Experian</SelectItem>
                      <SelectItem value="Equifax">Equifax</SelectItem>
                      <SelectItem value="TransUnion">TransUnion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Letters List */}
            <Card>
              <CardHeader>
                <CardTitle>Letter Tracking</CardTitle>
                <CardDescription>
                  Monitor the status and delivery of your dispute letters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLetters.map((letter) => (
                    <div key={letter.id} className="border rounded-lg p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h4 className="font-medium text-lg">{letter.letterType}</h4>
                            <Badge className={getStatusColor(letter.status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(letter.status)}
                                <span>{letter.status.replace('_', ' ')}</span>
                              </div>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Recipient</p>
                              <p className="text-sm">{letter.recipient}</p>
                              <p className="text-xs text-gray-500">{letter.recipientAddress}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Tracking Number</p>
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-mono">{letter.trackingNumber}</p>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleCopyTrackingNumber(letter)}
                                  title="Copy tracking number to clipboard"
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Credit Bureau</p>
                              <p className="text-sm">{letter.creditBureau}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Dispute Type</p>
                              <p className="text-sm">{letter.disputeType}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Sent Date</p>
                              <p className="text-sm">{letter.sentDate}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Expected Delivery</p>
                              <p className="text-sm">{letter.expectedDelivery}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Current Location</p>
                              <p className="text-sm">{letter.currentLocation}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>Certified Mail: {letter.certifiedMail ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Package className="h-4 w-4" />
                              <span>Return Receipt: {letter.returnReceipt ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Last Update: {letter.lastUpdate}</span>
                            </div>
                          </div>

                          {letter.notes && (
                            <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                              <p className="text-sm font-medium text-gray-600">Notes</p>
                              <p className="text-sm">{letter.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewLetter(letter)}
                                title="View letter details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2">
                                  <FileText className="h-5 w-5" />
                                  <span>Letter Details</span>
                                </DialogTitle>
                                <DialogDescription>
                                  Complete information for {letter.letterType}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-600 mb-2">Letter Information</h4>
                                    <div className="space-y-2">
                                      <div>
                                        <p className="text-sm font-medium">Type</p>
                                        <p className="text-sm text-gray-600">{letter.letterType}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Dispute Type</p>
                                        <p className="text-sm text-gray-600">{letter.disputeType}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Credit Bureau</p>
                                        <p className="text-sm text-gray-600">{letter.creditBureau}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-600 mb-2">Recipient Information</h4>
                                    <div className="space-y-2">
                                      <div>
                                        <p className="text-sm font-medium">Recipient</p>
                                        <p className="text-sm text-gray-600">{letter.recipient}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Address</p>
                                        <p className="text-sm text-gray-600">{letter.recipientAddress}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-600 mb-2">Tracking Information</h4>
                                    <div className="space-y-2">
                                      <div>
                                        <p className="text-sm font-medium">Tracking Number</p>
                                        <div className="flex items-center space-x-2">
                                          <p className="text-sm font-mono text-gray-600">{letter.trackingNumber}</p>
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleCopyTrackingNumber(letter)}
                                            title="Copy tracking number to clipboard"
                                            className="h-6 w-6 p-0"
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Status</p>
                                        <Badge className={getStatusColor(letter.status)}>
                                          <div className="flex items-center space-x-1">
                                            {getStatusIcon(letter.status)}
                                            <span>{letter.status.replace('_', ' ')}</span>
                                          </div>
                                        </Badge>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Current Location</p>
                                        <p className="text-sm text-gray-600">{letter.currentLocation}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-600 mb-2">Timeline</h4>
                                    <div className="space-y-2">
                                      <div>
                                        <p className="text-sm font-medium">Sent Date</p>
                                        <p className="text-sm text-gray-600">{letter.sentDate}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Expected Delivery</p>
                                        <p className="text-sm text-gray-600">{letter.expectedDelivery}</p>
                                      </div>
                                      {letter.actualDelivery && (
                                        <div>
                                          <p className="text-sm font-medium">Actual Delivery</p>
                                          <p className="text-sm text-gray-600">{letter.actualDelivery}</p>
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-sm font-medium">Last Update</p>
                                        <p className="text-sm text-gray-600">{letter.lastUpdate}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-600 mb-2">Mail Services</h4>
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4" />
                                        <span className="text-sm">Certified Mail: {letter.certifiedMail ? 'Yes' : 'No'}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Package className="h-4 w-4" />
                                        <span className="text-sm">Return Receipt: {letter.returnReceipt ? 'Yes' : 'No'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {letter.notes && (
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-600 mb-2">Notes</h4>
                                    <div className="p-3 bg-gray-100 rounded-lg">
                                      <p className="text-sm">{letter.notes}</p>
                                    </div>
                                  </div>
                                )}

                                <div className="flex justify-end space-x-2 pt-4 border-t">
                                  <Button 
                                    variant="outline"
                                    onClick={() => handleDownloadLetter(letter)}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Letter
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    onClick={() => handleDownloadTrackingNumber(letter)}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Tracking
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownloadLetter(letter)}
                            title="Download letter"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Delivery Success Rate */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Delivery Success Rate</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Successful Deliveries</span>
                      <span className="text-2xl font-bold text-green-600">
                        {totalLetters > 0 ? Math.round((deliveredLetters / totalLetters) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${totalLetters > 0 ? (deliveredLetters / totalLetters) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {deliveredLetters} of {totalLetters} letters delivered successfully
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Bureau Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Bureau Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["Experian", "Equifax", "TransUnion"].map((bureau) => {
                      const bureauLetters = letters.filter(l => l.creditBureau === bureau)
                      const delivered = bureauLetters.filter(l => l.status === "delivered").length
                      const successRate = bureauLetters.length > 0 ? Math.round((delivered / bureauLetters.length) * 100) : 0
                      
                      return (
                        <div key={bureau} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{bureau}</h4>
                            <p className="text-sm text-gray-600">{bureauLetters.length} letters sent</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{successRate}% success</p>
                            <p className="text-xs text-gray-500">{delivered} delivered</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Letter Types Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Letter Types</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(letters.reduce((acc, letter) => {
                      const type = letter.disputeType
                      acc[type] = (acc[type] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{type}</h4>
                          <p className="text-sm text-gray-600">{count} letters</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{count}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Delivery Timeline</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Delivery Time</span>
                      <span className="text-2xl font-bold text-blue-600">3.2 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Fastest Delivery</span>
                      <span className="text-sm text-green-600">1 day</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Longest Delivery</span>
                      <span className="text-sm text-red-600">7 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Return Rate</span>
                      <span className="text-sm text-orange-600">{returnedLetters} letters</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Alert Settings</span>
                </CardTitle>
                <CardDescription>
                  Manage your notification preferences for letter tracking and delivery updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Master Alert Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-1">
                    <Label htmlFor="all-alerts" className="text-base font-medium">
                      Enable All Alerts
                    </Label>
                    <p className="text-sm text-gray-600">
                      Master switch to enable or disable all letter tracking notifications
                    </p>
                  </div>
                  <Switch
                    id="all-alerts"
                    checked={alertSettings.allAlerts}
                    onCheckedChange={(checked) => handleAlertSettingChange('allAlerts', checked)}
                  />
                </div>

                <Separator />

                {/* Letter Tracking Alerts */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Letter Tracking Alerts</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="delivery-notifications" className="font-medium">
                          Delivery Notifications
                        </Label>
                        <p className="text-sm text-gray-600">Get notified when letters are delivered</p>
                      </div>
                      <Switch
                        id="delivery-notifications"
                        checked={alertSettings.deliveryNotifications}
                        onCheckedChange={(checked) => handleAlertSettingChange('deliveryNotifications', checked)}
                        disabled={!alertSettings.allAlerts}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="status-updates" className="font-medium">
                          Status Updates
                        </Label>
                        <p className="text-sm text-gray-600">Get notified of status changes</p>
                      </div>
                      <Switch
                        id="status-updates"
                        checked={alertSettings.statusUpdates}
                        onCheckedChange={(checked) => handleAlertSettingChange('statusUpdates', checked)}
                        disabled={!alertSettings.allAlerts}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="bureau-responses" className="font-medium">
                          Bureau Responses
                        </Label>
                        <p className="text-sm text-gray-600">Get notified of bureau responses</p>
                      </div>
                      <Switch
                        id="bureau-responses"
                        checked={alertSettings.bureauResponses}
                        onCheckedChange={(checked) => handleAlertSettingChange('bureauResponses', checked)}
                        disabled={!alertSettings.allAlerts}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="return-receipts" className="font-medium">
                          Return Receipts
                        </Label>
                        <p className="text-sm text-gray-600">Get notified of return receipts</p>
                      </div>
                      <Switch
                        id="return-receipts"
                        checked={alertSettings.returnReceipts}
                        onCheckedChange={(checked) => handleAlertSettingChange('returnReceipts', checked)}
                        disabled={!alertSettings.allAlerts}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="tracking-updates" className="font-medium">
                          Tracking Updates
                        </Label>
                        <p className="text-sm text-gray-600">Get notified of tracking location updates</p>
                      </div>
                      <Switch
                        id="tracking-updates"
                        checked={alertSettings.trackingUpdates}
                        onCheckedChange={(checked) => handleAlertSettingChange('trackingUpdates', checked)}
                        disabled={!alertSettings.allAlerts}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Notification Methods */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Notification Methods</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="email-alerts" className="font-medium">
                          Email Alerts
                        </Label>
                        <p className="text-sm text-gray-600">Receive notifications via email</p>
                      </div>
                      <Switch
                        id="email-alerts"
                        checked={alertSettings.emailAlerts}
                        onCheckedChange={(checked) => handleAlertSettingChange('emailAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="sms-alerts" className="font-medium">
                          SMS Alerts
                        </Label>
                        <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                      </div>
                      <Switch
                        id="sms-alerts"
                        checked={alertSettings.smsAlerts}
                        onCheckedChange={(checked) => handleAlertSettingChange('smsAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="push-notifications" className="font-medium">
                          Push Notifications
                        </Label>
                        <p className="text-sm text-gray-600">Receive browser push notifications</p>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={alertSettings.pushNotifications}
                        onCheckedChange={(checked) => handleAlertSettingChange('pushNotifications', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Digest Settings */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Digest & Reports</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="weekly-digest" className="font-medium">
                          Weekly Digest
                        </Label>
                        <p className="text-sm text-gray-600">Weekly summary of letter activity</p>
                      </div>
                      <Switch
                        id="weekly-digest"
                        checked={alertSettings.weeklyDigest}
                        onCheckedChange={(checked) => handleAlertSettingChange('weeklyDigest', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="monthly-report" className="font-medium">
                          Monthly Report
                        </Label>
                        <p className="text-sm text-gray-600">Monthly analytics and insights</p>
                      </div>
                      <Switch
                        id="monthly-report"
                        checked={alertSettings.monthlyReport}
                        onCheckedChange={(checked) => handleAlertSettingChange('monthlyReport', checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveAlertSettings} className="px-6">
                    Save Alert Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
    </div>
  )
}