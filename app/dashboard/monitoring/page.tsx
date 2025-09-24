"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditMonitoringDashboard } from "@/components/credit-monitoring/CreditMonitoringDashboard"
import { CreditScoreSimulator } from "@/components/credit-monitoring/CreditScoreSimulator"
import {
  Activity,
  Calculator,
  BarChart3,
  Bell,
  Shield
} from "lucide-react"

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState("monitoring")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Credit Monitoring</h1>
          <p className="text-gray-600 mt-2">
            Real-time credit monitoring, alerts, and score simulation tools
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Live Monitoring
            </TabsTrigger>
            <TabsTrigger value="simulator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Score Simulator
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

          <TabsContent value="monitoring">
            <CreditMonitoringDashboard />
          </TabsContent>

          <TabsContent value="simulator">
            <CreditScoreSimulator />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">
                  Advanced credit analytics and trend analysis coming soon
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="space-y-6">
              <div className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Alert Management</h3>
                <p className="text-gray-600">
                  Advanced alert management and notification settings coming soon
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}