"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NotificationProvider } from "@/lib/notification-context"
import { NotificationBellIntegrated } from "@/components/notification-bell-integrated"
import { DashboardNotificationIntegration } from "@/components/dashboard-notification-integration"
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Shield,
  GraduationCap,
  Bell,
  UserCog,
  Menu,
  X,
  LogOut,
  Scale,
  TrendingUp,
  FileCheck,
  Mail,
  MessageSquare,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Letters", href: "/dashboard/letters", icon: FileText },
  { name: "Credit Reports", href: "/dashboard/reports", icon: CreditCard },
  { name: "Email Marketing", href: "/dashboard/email", icon: Mail },
  { name: "SMS Alerts", href: "/dashboard/sms", icon: MessageSquare },
  { name: "Monitoring", href: "/dashboard/monitoring", icon: Shield },
  { name: "Training", href: "/dashboard/training", icon: GraduationCap },
  { name: "Attorneys", href: "/dashboard/attorneys", icon: Scale },
  { name: "MLM System", href: "/mlm/dashboard", icon: TrendingUp },
  { name: "Compliance", href: "/admin/compliance", icon: FileCheck },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Admin", href: "/admin", icon: UserCog },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h1 className="text-xl font-bold text-blue-600">CreditAI Pro</h1>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive ? "bg-blue-100 text-blue-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t p-4">
            <Button variant="outline" className="w-full bg-transparent">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b">
            <h1 className="text-xl font-bold text-blue-600">CreditAI Pro</h1>
            <Badge className="ml-2 bg-green-100 text-green-800">Pro</Badge>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive ? "bg-blue-100 text-blue-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
              <div>
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-gray-500">Professional Plan</p>
              </div>
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Desktop header */}
        <div className="hidden lg:flex sticky top-0 z-40 h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationBellIntegrated />
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">Professional Plan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">CreditAI Pro</h1>
          <div className="ml-auto">
            <NotificationBellIntegrated />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <DashboardNotificationIntegration />
          {children}
        </main>
      </div>
    </div>
    </NotificationProvider>
  )
}
