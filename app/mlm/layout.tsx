"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Calculator,
  DollarSign,
  BookOpen,
  MessageSquare,
  Trophy,
  Target,
  Menu,
  X,
  LogOut,
  Crown,
  Bell,
} from "lucide-react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { MLMNotificationProvider } from "@/lib/mlm-notification-context"
import { MLMNotificationBadge } from "@/components/mlm-notification-badge"
import { MLMNotificationBell } from "@/components/mlm-notification-bell"
import { MLMToastNotifications } from "@/components/mlm-toast-notifications"

interface NavigationItem {
  name: string
  href: string
  icon: React.ReactNode
  badge?: string | React.ReactNode
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  premium?: boolean
  children?: NavigationItem[]
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/mlm/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    badge: "Home",
    badgeVariant: "default",
  },
  {
    name: "Team Genealogy",
    href: "/mlm/genealogy",
    icon: <Users className="h-5 w-5" />,
    badge: "47 Members",
    badgeVariant: "secondary",
  },
  {
    name: "Team Performance",
    href: "/mlm/team-performance",
    icon: <TrendingUp className="h-5 w-5" />,
    badge: "Live",
    badgeVariant: "default",
  },
  {
    name: "Commission Calculator",
    href: "/mlm/commission-calculator",
    icon: <Calculator className="h-5 w-5" />,
    badge: "New!",
    badgeVariant: "destructive",
  },
  {
    name: "Billing & Payments",
    href: "/mlm/billing",
    icon: <DollarSign className="h-5 w-5" />,
    badge: "Active",
    badgeVariant: "default",
  },
  {
    name: "Payouts & Earnings",
    href: "/mlm/payouts",
    icon: <DollarSign className="h-5 w-5" />,
    badge: "$4,250",
    badgeVariant: "default",
  },
  {
    name: "Leaderboard",
    href: "/mlm/leaderboard",
    icon: <Trophy className="h-5 w-5" />,
    badge: "#3 Ranking",
    badgeVariant: "default",
  },
  {
    name: "Rank Progression",
    href: "/mlm/rank-progression",
    icon: <Target className="h-5 w-5" />,
    badge: "65% Complete",
    badgeVariant: "outline",
  },
  {
    name: "Communications",
    href: "/mlm/communications",
    icon: <MessageSquare className="h-5 w-5" />,
    badge: "5 unread",
    badgeVariant: "destructive",
  },
  {
    name: "Training",
    href: "/mlm/training",
    icon: <BookOpen className="h-5 w-5" />,
    badge: "12 Courses",
    badgeVariant: "secondary",
  },
  {
    name: "Notifications",
    href: "/mlm/notifications",
    icon: <MLMNotificationBell />,
    badge: <MLMNotificationBadge />,
    badgeVariant: "destructive",
  },
  {
    name: "Test Notifications",
    href: "/mlm/test-notifications",
    icon: <Bell className="h-5 w-5" />,
    badge: "Dev",
    badgeVariant: "outline",
  },
]

export default function MLMLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, isLoading, initials } = useCurrentUser()

  const displayName = isLoading ? "Loading…" : (user?.name ?? "")
  const avatarInitials = isLoading ? "…" : (initials || "?")

  const isActive = (href: string) => {
    return pathname === href || (href !== "/mlm/dashboard" && pathname.startsWith(href))
  }

  return (
    <MLMNotificationProvider>
      <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-80 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center space-x-2">
              <Crown className="h-6 w-6 text-white" />
              <h1 className="text-lg font-bold text-white">MLM Command</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href} onClick={() => setSidebarOpen(false)}>
                <div
                  className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-blue-100 text-blue-900 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="flex-shrink-0">{item.icon}</div>
                    <span className="ml-3 truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    typeof item.badge === 'string' ? (
                      <Badge variant={item.badgeVariant} className="text-xs px-1.5 py-0.5">
                        {item.badge}
                      </Badge>
                    ) : (
                      item.badge
                    )
                  )}
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <div className="flex h-16 items-center px-4 border-b bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center space-x-2">
              <Crown className="h-6 w-6 text-white" />
              <h1 className="text-lg font-bold text-white">MLM Command Center</h1>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <div
                  className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-blue-100 text-blue-900 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="flex-shrink-0">{item.icon}</div>
                    <span className="ml-3 truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    typeof item.badge === 'string' ? (
                      <Badge variant={item.badgeVariant} className="text-xs px-1.5 py-0.5">
                        {item.badge}
                      </Badge>
                    ) : (
                      item.badge
                    )
                  )}
                </div>
              </Link>
            ))}
          </nav>

          <div className="border-t p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{avatarInitials}</span>
              </div>
              <div>
                <p className="text-sm font-medium">{displayName}</p>
                <div className="flex items-center space-x-1">
                  <Crown className="h-3 w-3 text-yellow-500" />
                  <p className="text-xs text-gray-500">Director Rank</p>
                </div>
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
      <div className="lg:pl-80">
        {/* Desktop header */}
        <div className="hidden lg:flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
          <div className="flex items-center space-x-2">
            <Crown className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold">MLM Command Center</h1>
          </div>
          <div className="flex items-center space-x-4">
            <MLMNotificationBell />
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{avatarInitials}</span>
              </div>
              <div className="text-sm">
                <p className="font-medium">{displayName}</p>
                <p className="text-gray-500">Director Rank</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2 flex-1">
            <Crown className="h-5 w-5 text-blue-600" />
            <h1 className="text-lg font-semibold">MLM Command</h1>
          </div>
          <MLMNotificationBell />
        </div>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
      
      {/* Toast Notifications */}
      <MLMToastNotifications />
      </div>
    </MLMNotificationProvider>
  )
}
