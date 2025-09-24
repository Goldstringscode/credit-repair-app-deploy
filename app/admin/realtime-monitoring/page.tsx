"use client"
import RealtimeJourneyMonitor from "@/components/realtime-journey-monitor"

export default function RealtimeMonitoringPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Real-time Journey Monitoring</h1>
          <p className="text-gray-600">
            Monitor user journeys in real-time with live metrics, alerts, and event tracking
          </p>
        </div>

        <RealtimeJourneyMonitor />
      </div>
    </div>
  )
}
