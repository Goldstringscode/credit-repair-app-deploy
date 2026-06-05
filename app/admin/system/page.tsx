"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Database,
  Download,
  HardDrive,
  Loader2,
  MemoryStick,
  Monitor,
  RefreshCw,
  Server,
  Shield,
  XCircle,
  Zap
} from "lucide-react"

interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
  uptime: string
  status: "healthy" | "warning" | "critical"
}

interface ServiceStatus {
  name: string
  status: "running" | "stopped" | "error"
  lastCheck: string
}

export default function SystemPage() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 67,
    disk: 23,
    network: 89,
    uptime: "15 days, 3 hours",
    status: "healthy"
  })

  const [services, setServices] = useState<ServiceStatus[]>([])
  const [recentEvents, setRecentEvents] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Quick action state
  const [backupState, setBackupState] = useState<'idle'|'loading'|'done'|'error'>('idle')
  const [restartState, setRestartState] = useState<'idle'|'loading'|'done'|'error'>('idle')
  const [scanState, setScanState] = useState<'idle'|'loading'|'done'|'error'>('idle')
  const [actionResult, setActionResult] = useState<{type:string, message:string, data?:any}|null>(null)

  const handleBackup = async () => {
    setBackupState('loading'); setActionResult(null)
    try {
      const res = await fetch('/api/admin/system/backup', { method: 'POST' })
      if (!res.ok) throw new Error('Backup failed: ' + res.statusText)
      // Trigger download
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const date = new Date().toISOString().split('T')[0]
      a.href = url; a.download = 'credit-repair-backup-' + date + '.json'; a.click()
      URL.revokeObjectURL(url)
      const rows = res.headers.get('X-Backup-Rows') || '?'
      const tables = res.headers.get('X-Backup-Tables') || '?'
      setBackupState('done')
      setActionResult({ type: 'backup', message: 'Backup downloaded: ' + tables + ' tables, ' + rows + ' rows' })
    } catch (err: any) {
      setBackupState('error')
      setActionResult({ type: 'backup', message: 'Backup failed: ' + err.message })
    }
    setTimeout(() => setBackupState('idle'), 4000)
  }

  const handleRestart = async () => {
    setRestartState('loading'); setActionResult(null)
    try {
      const res = await fetch('/api/admin/system/restart', { method: 'POST' })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setRestartState('done')
      setActionResult({ type: 'restart', message: data.message, data: data.services })
      // Refresh service statuses
      setServices(data.services.map((s: any) => ({ name: s.name, status: s.status, lastCheck: 'just now' })))
    } catch (err: any) {
      setRestartState('error')
      setActionResult({ type: 'restart', message: 'Service check failed: ' + err.message })
    }
    setTimeout(() => setRestartState('idle'), 4000)
  }

  const handleSecurityScan = async () => {
    setScanState('loading'); setActionResult(null)
    try {
      const res = await fetch('/api/admin/system/security-scan', { method: 'POST' })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setScanState('done')
      const s = data.summary
      setActionResult({
        type: 'scan',
        message: 'Scan complete: ' + s.critical + ' critical, ' + s.high + ' high, ' + s.medium + ' medium, ' + s.passed + ' passed',
        data: data.findings,
      })
    } catch (err: any) {
      setScanState('error')
      setActionResult({ type: 'scan', message: 'Security scan failed: ' + err.message })
    }
    setTimeout(() => setScanState('idle'), 8000)
  }

  const loadSystemData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/system')
      const result = await response.json()
      
      if (result.success && result.data) {
        setMetrics(result.data.metrics)
        setServices(result.data.services)
        setRecentEvents(result.data.recentEvents)
        setSummary(result.data.summary)
      } else {
        console.error('Failed to load system data:', result.error)
      }
    } catch (error) {
      console.error('Error loading system data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSystemData()
  }, [])

  // Auto-refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadSystemData()
      }
    }

    const handleFocus = () => {
      loadSystemData()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const refreshMetrics = async () => {
    setIsRefreshing(true)
    await loadSystemData()
    setIsRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-green-500"
      case "warning": return "bg-yellow-500"
      case "critical": return "bg-red-500"
      case "running": return "text-green-600"
      case "stopped": return "text-yellow-600"
      case "error": return "text-red-600"
      default: return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "running":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
      case "stopped":
        return <AlertTriangle className="h-4 w-4" />
      case "critical":
      case "error":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading system data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600">Monitor system health and performance metrics</p>
        </div>
        <Button
          onClick={refreshMetrics}
          disabled={isRefreshing || loading}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
        </Button>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <div className={`h-2 w-2 rounded-full ${getStatusColor(metrics.status)}`} />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(metrics.status)}
              <span className="text-2xl font-bold capitalize">{metrics.status}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Uptime: {metrics.uptime}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Monitor className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpu}%</div>
            <Progress value={metrics.cpu} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memory}%</div>
            <Progress value={metrics.memory} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.disk}%</div>
            <Progress value={metrics.disk} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>Services Status</span>
          </CardTitle>
          <CardDescription>
            Monitor the status of all system services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`${getStatusColor(service.status)}`}>
                    {getStatusIcon(service.status)}
                  </div>
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-gray-500">Last check: {service.lastCheck}</p>
                  </div>
                </div>
                <Badge variant={service.status === "running" ? "default" : "destructive"}>
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Network Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Bandwidth Usage</span>
                  <span>{metrics.network}%</span>
                </div>
                <Progress value={metrics.network} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Incoming</p>
                  <p className="font-medium">1.2 GB/s</p>
                </div>
                <div>
                  <p className="text-gray-500">Outgoing</p>
                  <p className="font-medium">0.8 GB/s</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">SSL Certificate</span>
                <Badge variant="default">Valid</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Firewall</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">DDoS Protection</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Security Scan</span>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Backup Database</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span>Restart Services</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Run Security Scan</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
