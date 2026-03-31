"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Mail,
  Shield,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  BarChart3,
  Database,
  AlertTriangle,
  UserCheck,
  FileText,
  Target,
  Clock,
  TrendingUp,
  Activity,
  Zap,
  Globe,
  Lock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Filter,
  MoreHorizontal
} from "lucide-react"

const adminNavigation = [
  {
    name: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    description: "System metrics and alerts"
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    description: "User management and profiles"
  },
  {
    name: "Staff",
    href: "/admin/staff",
    icon: UserCheck,
    description: "Staff management and roles"
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "Revenue and user analytics"
  },
  {
    name: "Payouts",
    href: "/admin/payouts",
    icon: TrendingUp,
    description: "MLM commissions and payouts"
  },
  {
    name: "Milestones",
    href: "/admin/milestones",
    icon: Target,
    description: "Credit score milestones"
  },
  {
    name: "Realtime Monitoring",
    href: "/admin/realtime-monitoring",
    icon: Activity,
    description: "Live system activity"
  },
  {
    name: "Billing",
    href: "/admin/billing",
    icon: CreditCard,
    description: "Subscriptions and payments"
  },
  {
    name: "Email Marketing",
    href: "/admin/email",
    icon: Mail,
    description: "Email campaigns and templates"
  },
  {
    name: "Compliance",
    href: "/admin/compliance",
    icon: Shield,
    description: "GDPR, FCRA, CCPA, HIPAA"
  },
  {
    name: "System",
    href: "/admin/system",
    icon: Settings,
    description: "System health and monitoring"
  }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    try {
      const token = document.cookie.split('; ').find(cookie => cookie.startsWith('auth-token='))?.split('=')[1]
      if (token) {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        const decoded = JSON.parse(window.atob(base64)) as { name?: string; email?: string; sub?: string }
        setAdminUser({
          name: decoded.name ?? decoded.email ?? decoded.sub ?? 'Admin User',
          email: decoded.email ?? ''
        })
      }
    } catch (err) {
      console.warn('Failed to decode admin token:', err)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center justify-between bg-white border-b border-gray-200 px-4 lg:px-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="ml-4 lg:ml-0">
              <h2 className="text-lg font-semibold text-gray-900">
                {adminNavigation.find(item => item.href === pathname)?.name || "Admin"}
              </h2>
              <p className="text-sm text-gray-500">
                {adminNavigation.find(item => item.href === pathname)?.description || "Administrative functions"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search admin functions..."
                  className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs">
                3
              </Badge>
            </Button>

            {/* Admin profile */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {(adminUser?.name ?? 'A')[0].toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{adminUser?.name ?? 'Admin User'}</p>
                <p className="text-xs text-gray-500">{adminUser?.email ?? 'Administrator'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
