"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowRight,
  Crown,
  Users,
  DollarSign,
  Target,
  BookOpen,
  Trophy,
  BarChart3,
  Mic,
  Brain,
  Sparkles,
  ArrowLeft,
} from "lucide-react"

export default function MLMPage() {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)

  useEffect(() => {
    // Check if voice is supported
    const supported =
      typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    setIsVoiceEnabled(supported)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Back to Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Crown className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  MLM Command Center
                </span>
              </div>
            </div>

            {isVoiceEnabled && (
              <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <Mic className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">Voice Commands Active</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Crown className="h-12 w-12 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              MLM Business Hub
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Your complete multi-level marketing command center with advanced analytics, team management, and
            voice-powered navigation.
          </p>

          {isVoiceEnabled && (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-medium">Try Voice Commands</span>
              </div>
              <p className="text-sm text-blue-700">Say: "Go to MLM Dashboard" or "Go to Training"</p>
            </div>
          )}

          <Link href="/mlm/dashboard">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
              <Crown className="mr-2 h-5 w-5" />
              Enter MLM Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">$4,250</div>
              <div className="text-purple-100 text-sm">Monthly Earnings</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">47</div>
              <div className="text-blue-100 text-sm">Team Members</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">#3</div>
              <div className="text-green-100 text-sm">Leaderboard Rank</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">65%</div>
              <div className="text-orange-100 text-sm">Rank Progress</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Team Management */}
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-purple-600" />
                <CardTitle>Team Management</CardTitle>
              </div>
              <CardDescription>Comprehensive tools for managing and growing your MLM team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Link href="/mlm/genealogy">
                  <Button variant="outline" className="w-full justify-start h-auto p-3 bg-transparent">
                    <div className="text-left">
                      <div className="font-medium">Team Genealogy</div>
                      <div className="text-xs text-gray-500">Visual team tree</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/mlm/team-performance">
                  <Button variant="outline" className="w-full justify-start h-auto p-3 bg-transparent">
                    <div className="text-left">
                      <div className="font-medium">Performance</div>
                      <div className="text-xs text-gray-500">Team analytics</div>
                    </div>
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/mlm/team-builder">
                  <Button variant="outline" className="w-full justify-start h-auto p-3 bg-transparent">
                    <div className="text-left">
                      <div className="font-medium">Team Builder</div>
                      <div className="text-xs text-gray-500">Recruit & grow</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/mlm/communication">
                  <Button variant="outline" className="w-full justify-start h-auto p-3 bg-transparent">
                    <div className="text-left">
                      <div className="font-medium">Communication</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <span>Team chat</span>
                        <Badge variant="destructive" className="ml-1 text-xs px-1">
                          5
                        </Badge>
                      </div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Earnings & Commissions */}
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                <CardTitle>Earnings & Payouts</CardTitle>
              </div>
              <CardDescription>Track your commissions, bonuses, and payout history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-700">This Month</span>
                  <span className="text-2xl font-bold text-green-800">$4,250</span>
                </div>
                <Progress value={85} className="h-2 bg-green-200" />
                <div className="text-xs text-green-600 mt-1">85% of monthly goal</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/mlm/payouts">
                  <Button variant="outline" className="w-full justify-start h-auto p-3 bg-transparent">
                    <div className="text-left">
                      <div className="font-medium">View Payouts</div>
                      <div className="text-xs text-gray-500">Payment history</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/mlm/commission-calculator">
                  <Button variant="outline" className="w-full justify-start h-auto p-3 bg-transparent">
                    <div className="text-left">
                      <div className="font-medium">Calculator</div>
                      <div className="text-xs text-gray-500">Estimate earnings</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Training & Development */}
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <CardTitle>Training & Development</CardTitle>
              </div>
              <CardDescription>Advanced training programs and voice-powered learning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Voice Learning Available</span>
                </div>
                <p className="text-sm text-blue-700">Interactive voice-controlled training modules</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/mlm/training">
                  <Button variant="outline" className="w-full justify-start h-auto p-3 bg-transparent">
                    <div className="text-left">
                      <div className="font-medium">Training Hub</div>
                      <div className="text-xs text-gray-500">12 courses</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/mlm/training/voice-learning">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-3 bg-gradient-to-r from-purple-50 to-blue-50"
                  >
                    <div className="text-left">
                      <div className="font-medium flex items-center">
                        Voice Learning
                        <Sparkles className="h-3 w-3 ml-1 text-purple-500" />
                      </div>
                      <div className="text-xs text-gray-500">AI-powered</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance & Analytics */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  <CardTitle>Performance Analytics</CardTitle>
                </div>
                <Badge className="bg-purple-100 text-purple-800">Live Data</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600">47</div>
                  <div className="text-xs text-gray-500">Team Size</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">89%</div>
                  <div className="text-xs text-gray-500">Active Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">$12.5K</div>
                  <div className="text-xs text-gray-500">Team Volume</div>
                </div>
              </div>
              <Link href="/mlm/team-performance">
                <Button className="w-full">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Detailed Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-6 w-6 text-orange-600" />
                  <CardTitle>Rank & Achievements</CardTitle>
                </div>
                <Badge className="bg-orange-100 text-orange-800">Director</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to Executive</span>
                  <span className="font-semibold">65%</span>
                </div>
                <Progress value={65} className="h-2" />
                <div className="text-xs text-gray-500">2 more qualifications needed</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/mlm/rank-progression">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Target className="mr-2 h-4 w-4" />
                    Rank Details
                  </Button>
                </Link>
                <Link href="/mlm/leaderboard">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Trophy className="mr-2 h-4 w-4" />
                    Leaderboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voice Commands Help */}
        {isVoiceEnabled && (
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Mic className="h-6 w-6 text-green-600" />
                <CardTitle className="text-green-800">Voice Commands Available</CardTitle>
              </div>
              <CardDescription className="text-green-700">
                Navigate your MLM business using natural voice commands
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/60 p-3 rounded-lg">
                  <div className="font-medium text-sm mb-1">Navigation</div>
                  <div className="text-xs text-gray-600">
                    "Go to MLM Dashboard"
                    <br />
                    "Go to Training"
                    <br />
                    "Go to Genealogy"
                  </div>
                </div>
                <div className="bg-white/60 p-3 rounded-lg">
                  <div className="font-medium text-sm mb-1">Quick Actions</div>
                  <div className="text-xs text-gray-600">
                    "Check earnings"
                    <br />
                    "View team"
                    <br />
                    "Show payouts"
                  </div>
                </div>
                <div className="bg-white/60 p-3 rounded-lg">
                  <div className="font-medium text-sm mb-1">Training</div>
                  <div className="text-xs text-gray-600">
                    "Go to voice learning"
                    <br />
                    "Start training"
                    <br />
                    "Take quiz"
                  </div>
                </div>
                <div className="bg-white/60 p-3 rounded-lg">
                  <div className="font-medium text-sm mb-1">System</div>
                  <div className="text-xs text-gray-600">
                    "Help"
                    <br />
                    "Stop listening"
                    <br />
                    "Voice commands"
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/mlm/dashboard">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6 text-center">
                <Crown className="h-8 w-8 mx-auto mb-3" />
                <div className="font-semibold mb-1">MLM Dashboard</div>
                <div className="text-xs opacity-90">Complete overview</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/mlm/training">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-3" />
                <div className="font-semibold mb-1">Training Hub</div>
                <div className="text-xs opacity-90">12 courses available</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/mlm/genealogy">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-3" />
                <div className="font-semibold mb-1">Team Genealogy</div>
                <div className="text-xs opacity-90">47 team members</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/mlm/payouts">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-3" />
                <div className="font-semibold mb-1">Payouts</div>
                <div className="text-xs opacity-90">$4,250 this month</div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
