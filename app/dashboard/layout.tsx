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
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { toast } from "sonner"
import {
LayoutDashboard,
FileText,
CreditCard,
Shield,
GraduationCap,
UserCog,
TrendingUp,
Settings,
Bookmark,
Menu,
X,
LogOut,
Lock,
} from "lucide-react"

const navigation = [
{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
{ name: "Letters", href: "/dashboard/letters", icon: FileText },
{ name: "My Templates", href: "/dashboard/my-templates", icon: Bookmark },
{ name: "Negative Items", href: "/dashboard/credit-reports", icon: CreditCard },
{ name: "Monitoring", href: "/dashboard/monitoring", icon: Shield },
{ name: "Training", href: "/dashboard/training", icon: GraduationCap },
{ name: "The Vault", href: "/mlm/dashboard", icon: TrendingUp },
{ name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const TIER_LABELS: Record<string, string> = {
free: "Free",
basic: "Basic",
professional: "Professional",
premium: "Premium",
}

export default function DashboardLayout({
children,
}: {
children: React.ReactNode
}) {
const [sidebarOpen, setSidebarOpen] = useState(false)
const pathname = usePathname()
const { user, isLoading, initials } = useCurrentUser()

const tier = (user?.subscriptionTier || "free").toLowerCase()
const isAdmin = user?.role === "admin"
const tierLabel = TIER_LABELS[tier] || "Free"

const displayName = isLoading ? "Loading…" : (user?.name ?? "")
const displayPlan = isLoading ? "" : `${tierLabel} Plan`
const avatarInitials = isLoading ? "…" : (initials || "?")

// The Vault (formerly "MLM System") is admin-only for now — not tied to
// subscription tier. Every non-admin user, free through the highest paid
// tier, sees it locked until it's rolled out more broadly.
const handleNavClick = (e: React.MouseEvent, locked: boolean) => {
if (locked) {
e.preventDefault()
toast.error("You need special credentials to access this page. Eligibility only on higher tiers.")
}
}

const handleSignOut = async () => {
try {
await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
} catch (error) {
console.error('Logout error:', error)
}
window.location.href = '/login'
}

return (
<NotificationProvider>
<div className="min-h-screen bg-gray-50">
<div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
<div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
<div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
<div className="flex h-16 items-center justify-between px-4 border-b">
<h1 className="text-xl font-bold text-blue-600">Merit Point AI</h1>
<Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
<X className="h-5 w-5" />
</Button>
</div>
<nav className="flex-1 space-y-1 px-2 py-4">
{navigation.map((item) => {
const Icon = item.icon
const isActive = pathname === item.href
const isVaultLocked = item.name === "The Vault" && !isAdmin
return (
<Link
key={item.name}
href={isVaultLocked ? pathname : item.href}
className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
isActive ? "bg-blue-100 text-blue-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
}`}
onClick={(e) => {
handleNavClick(e, isVaultLocked)
setSidebarOpen(false)
}}
>
<Icon className="mr-3 h-5 w-5" />
{item.name}
{isVaultLocked && <Lock className="ml-auto h-4 w-4 text-gray-400" />}
</Link>
)
})}
{isAdmin && (
<Link
href="/admin"
className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
pathname.startsWith('/admin') ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
}`}
onClick={() => setSidebarOpen(false)}
>
<UserCog className={`mr-3 h-5 w-5 flex-shrink-0 ${pathname.startsWith('/admin') ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
Admin Panel
</Link>
)}
</nav>
<div className="border-t p-4">
<Button variant="outline" className="w-full bg-transparent" onClick={handleSignOut}>
<LogOut className="mr-2 h-4 w-4" />Sign Out
</Button>
</div>
</div>
</div>
<div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
<div className="flex flex-col flex-grow bg-white border-r border-gray-200">
<div className="flex h-16 items-center px-4 border-b">
<h1 className="text-xl font-bold text-blue-600">Merit Point AI</h1>
<Badge className={tier === "free" ? "ml-2 bg-gray-100 text-gray-700" : "ml-2 bg-green-100 text-green-800"}>{tierLabel}</Badge>
</div>
<nav className="flex-1 space-y-1 px-2 py-4">
{navigation.map((item) => {
const Icon = item.icon
const isActive = pathname === item.href
const isVaultLocked = item.name === "The Vault" && !isAdmin
return (
<Link
key={item.name}
href={isVaultLocked ? pathname : item.href}
className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
isActive ? "bg-blue-100 text-blue-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
}`}
onClick={(e) => handleNavClick(e, isVaultLocked)}
>
<Icon className="mr-3 h-5 w-5" />
{item.name}
{isVaultLocked && <Lock className="ml-auto h-4 w-4 text-gray-400" />}
</Link>
)
})}
{isAdmin && (
<Link
href="/admin"
className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
pathname.startsWith('/admin') ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
}`}
>
<UserCog className={`mr-3 h-5 w-5 flex-shrink-0 ${pathname.startsWith('/admin') ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
Admin Panel
</Link>
)}
</nav>
<div className="border-t p-4">
<div className="flex items-center space-x-3 mb-4">
<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
<span className="text-white text-sm font-medium">{avatarInitials}</span>
</div>
<div>
<p className="text-sm font-medium">{displayName}</p>
<p className="text-xs text-gray-500">{displayPlan}</p>
</div>
</div>
<Button variant="outline" className="w-full bg-transparent" onClick={handleSignOut}>
<LogOut className="mr-2 h-4 w-4" />Sign Out
</Button>
</div>
</div>
</div>
<div className="lg:pl-64">
<div className="hidden lg:flex sticky top-0 z-40 h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
<div className="flex items-center space-x-4">
<h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
</div>
<div className="flex items-center space-x-4">
<NotificationBellIntegrated />
<div className="flex items-center space-x-3">
<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
<span className="text-white text-sm font-medium">{avatarInitials}</span>
</div>
<div className="hidden md:block">
<p className="text-sm font-medium text-gray-900">{displayName}</p>
<p className="text-xs text-gray-500">{displayPlan}</p>
</div>
</div>
</div>
</div>
<div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
<Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
<Menu className="h-5 w-5" />
</Button>
<h1 className="text-lg font-semibold">Merit Point AI</h1>
<div className="ml-auto"><NotificationBellIntegrated /></div>
</div>
<main className="flex-1">
<DashboardNotificationIntegration />
{children}
</main>
</div>
</div>
</NotificationProvider>
)
}

