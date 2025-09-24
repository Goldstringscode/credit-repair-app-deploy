"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  TrendingUp,
  Calculator,
  DollarSign,
  BookOpen,
  MessageSquare,
  Gift,
  Trophy,
  Target,
  UserPlus,
  BarChart3,
  FileText,
  Star,
  Crown,
  ArrowRight,
  Calendar,
  Bell,
  Activity,
} from "lucide-react"
import Link from "next/link"

interface NavigationItem {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  premium?: boolean
  status?: "new" | "updated" | "beta"
  stats?: string
}

export function MLMDashboardNavigation() {
  const [currentRank] = useState("Director")
  const [rankProgress] = useState(65)
  const [monthlyEarnings] = useState(4250)
  const [teamSize] = useState(47)
  const [activeRate] = useState(89)

  const navigationItems: NavigationItem[] = [
    {
      title: "Team Genealogy",
      description: "View your team structure and hierarchy",
      href: "/mlm/genealogy",
      icon: <Users className="h-6 w-6" />,
      stats: `${teamSize} Members`,
      badge: "Active",
      badgeVariant: "default",
    },
    {
      title: "Team Performance",
      description: "Monitor team activity and performance metrics",
      href: "/mlm/team-performance",
      icon: <TrendingUp className="h-6 w-6" />,
      stats: `${activeRate}% Active`,
      badge: "Live",
      badgeVariant: "default",
    },
    {
      title: "Commission Calculator",
      description: "Calculate potential earnings and commissions",
      href: "/mlm/commission-calculator",
      icon: <Calculator className="h-6 w-6" />,
      status: "new",
      badge: "New!",
      badgeVariant: "destructive",
    },
    {
      title: "Payouts & Earnings",
      description: "Track your earnings and payout history",
      href: "/mlm/payouts",
      icon: <DollarSign className="h-6 w-6" />,
      stats: `$${monthlyEarnings.toLocaleString()}`,
      badge: "Monthly",
      badgeVariant: "default",
    },
    {
      title: "Team Training",
      description: "Access training materials and courses",
      href: "/mlm/team-training",
      icon: <BookOpen className="h-6 w-6" />,
      badge: "3 New",
      badgeVariant: "secondary",
    },
    {
      title: "Communication Center",
      description: "Team chat and messaging system",
      href: "/mlm/communication",
      icon: <MessageSquare className="h-6 w-6" />,
      badge: "5 unread",
      badgeVariant: "destructive",
    },
    {
      title: "Rewards & Recognition",
      description: "View achievements and claim rewards",
      href: "/mlm/rewards",
      icon: <Gift className="h-6 w-6" />,
      badge: "2 New",
      badgeVariant: "secondary",
    },
    {
      title: "Leaderboard",
      description: "See top performers and rankings",
      href: "/mlm/leaderboard",
      icon: <Trophy className="h-6 w-6" />,
      stats: "#3 Ranking",
      badge: "Top 5",
      badgeVariant: "default",
    },
    {
      title: "Rank Progression",
      description: "Track your advancement to next rank",
      href: "/mlm/rank-progression",
      icon: <Target className="h-6 w-6" />,
      stats: `${rankProgress}% Complete`,
      badge: "In Progress",
      badgeVariant: "outline",
    },
    {
      title: "Team Builder",
      description: "Recruit and onboard new team members",
      href: "/mlm/team-builder",
      icon: <UserPlus className="h-6 w-6" />,
      premium: true,
      badge: "Premium",
      badgeVariant: "secondary",
    },
    {
      title: "Analytics Dashboard",
      description: "Advanced metrics and business intelligence",
      href: "/mlm/payouts/analytics",
      icon: <BarChart3 className="h-6 w-6" />,
      premium: true,
      badge: "Premium",
      badgeVariant: "secondary",
    },
    {
      title: "Tax Reporting",
      description: "Generate tax documents and reports",
      href: "/mlm/tax-reporting",
      icon: <FileText className="h-6 w-6" />,
      badge: "2024 Ready",
      badgeVariant: "default",
    },
  ]

  const quickActions = [
    {
      title: "Invite Team Member",
      description: "Send invitation to join your team",
      href: "/mlm/team-builder",
      icon: <UserPlus className="h-5 w-5" />,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Calculate Commission",
      description: "Estimate your potential earnings",
      href: "/mlm/commission-calculator",
      icon: <Calculator className="h-5 w-5" />,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "View Earnings",
      description: "Check your latest payouts",
      href: "/mlm/payouts",
      icon: <DollarSign className="h-5 w-5" />,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Team Chat",
      description: "Connect with your team",
      href: "/mlm/communication",
      icon: <MessageSquare className="h-5 w-5" />,
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ]

  const recentActivity = [
    {
      type: "team_join",
      message: "Sarah Johnson joined your team",
      time: "2 hours ago",
      icon: <Users className="h-4 w-4 text-green-500" />,
    },
    {
      type: "commission",
      message: "Commission earned: $125",
      time: "4 hours ago",
      icon: <DollarSign className="h-4 w-4 text-blue-500" />,
    },
    {
      type: "training",
      message: "Mike completed Advanced Training",
      time: "6 hours ago",
      icon: <BookOpen className="h-4 w-4 text-purple-500" />,
    },
    {
      type: "milestone",
      message: "Team reached 50 members milestone",
      time: "1 day ago",
      icon: <Trophy className="h-4 w-4 text-yellow-500" />,
    },
  ]

  const upcomingEvents = [
    {
      title: "Team Call",
      time: "Today, 7:00 PM",
      type: "meeting",
      icon: <Calendar className="h-4 w-4 text-blue-500" />,
    },
    {
      title: "Monthly Payout",
      time: "Tomorrow",
      type: "payout",
      icon: <DollarSign className="h-4 w-4 text-green-500" />,
    },
    {
      title: "Training Session",
      time: "Friday, 2:00 PM",
      type: "training",
      icon: <BookOpen className="h-4 w-4 text-purple-500" />,
    },
  ]

  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        {/* Header Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold text-gray-900">{currentRank}</span>
              <Badge variant="outline" className="text-xs">
                {rankProgress}% to Executive
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="font-semibold text-gray-900">${monthlyEarnings.toLocaleString()}</span>
              <Badge variant="secondary" className="text-xs">
                Monthly
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="font-semibold text-gray-900">{teamSize} Members</span>
              <Badge variant="default" className="text-xs">
                {activeRate}% Active
              </Badge>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Button size="sm" className={`${action.color} text-white`}>
                  {action.icon}
                  <span className="ml-1 hidden md:inline">{action.title}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {navigationItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors">
                      {item.icon}
                    </div>
                    {item.badge && (
                      <Badge variant={item.badgeVariant} className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {item.premium && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Pro
                      </Badge>
                    )}
                    {item.status && (
                      <Badge
                        variant={item.status === "new" ? "destructive" : "secondary"}
                        className="text-xs animate-pulse"
                      >
                        {item.status === "new" ? "NEW" : item.status.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                  {item.stats && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-600">{item.stats}</span>
                      <ArrowRight className="h-3 w-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Recent Activity */}
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Activity className="h-4 w-4 mr-2 text-blue-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentActivity.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  {activity.icon}
                  <span className="flex-1 text-gray-700">{activity.message}</span>
                  <span className="text-gray-500">{activity.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Rank Progress */}
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Target className="h-4 w-4 mr-2 text-purple-500" />
                Rank Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>{currentRank}</span>
                  <span>Executive</span>
                </div>
                <Progress value={rankProgress} className="h-2" />
                <p className="text-xs text-gray-600">{rankProgress}% complete</p>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Bell className="h-4 w-4 mr-2 text-orange-500" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  {event.icon}
                  <div className="flex-1">
                    <div className="font-medium text-gray-700">{event.title}</div>
                    <div className="text-gray-500">{event.time}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
