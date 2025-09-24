"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Crown, 
  Star, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Award,
  Share2,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Copy,
  CheckCircle,
  UserPlus,
  Loader2
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth-simple"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface MLMUser {
  id: string
  teamCode: string
  sponsorId: string | null
  rank: {
    id: number
    name: string
    level: number
    requirements: {
      personalVolume: number
      teamVolume: number
      directRecruits: number
    }
  }
  status: string
  personalVolume: number
  teamVolume: number
  currentMonthEarnings: number
  joinDate: string
  downlineCount: number
  isTeamLeader: boolean
}

interface TeamStats {
  totalMembers: number
  activeMembers: number
  newMembersThisMonth: number
  totalVolume: number
  teamEarnings: number
  averageRank: string
}

interface Commission {
  id: string
  type: string
  amount: number
  description: string
  date: string
  status: string
}

export default function MLMDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  
  const [mlmUser, setMlmUser] = useState<MLMUser | null>(null)
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null)
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [teamCodeCopied, setTeamCodeCopied] = useState(false)
  
  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")
  const [isInviting, setIsInviting] = useState(false)

  useEffect(() => {
    if (user && !authLoading) {
      fetchMLMData()
    }
  }, [user, authLoading])

  const fetchMLMData = async () => {
    try {
      setLoading(true)
      
      // Fetch MLM user data
      const userResponse = await fetch(`/api/mlm/users/${user?.id}`)
      const userData = await userResponse.json()
      
      if (userData.success) {
        setMlmUser(userData.user)
      }

      // Fetch team stats
      const statsResponse = await fetch(`/api/mlm/team-stats?userId=${user?.id}`)
      const statsData = await statsResponse.json()
      
      if (statsData.success) {
        setTeamStats(statsData.stats)
      }

      // Fetch commissions
      const commissionsResponse = await fetch(`/api/mlm/commissions?userId=${user?.id}`)
      const commissionsData = await commissionsResponse.json()
      
      if (commissionsData.success) {
        setCommissions(commissionsData.commissions)
      }

    } catch (error) {
      console.error('Error fetching MLM data:', error)
      setError('Failed to load MLM data')
    } finally {
      setLoading(false)
    }
  }

  const copyTeamCode = async () => {
    if (mlmUser?.teamCode) {
      await navigator.clipboard.writeText(mlmUser.teamCode)
      setTeamCodeCopied(true)
      toast({
        title: "Team Code Copied!",
        description: "Share this code with others to invite them to your team.",
      })
      setTimeout(() => setTeamCodeCopied(false), 2000)
    }
  }

  const handleInvite = async () => {
    console.log("handleInvite called with:", { inviteEmail, inviteName })
    
    if (!inviteEmail || !inviteName) {
      console.log("Missing information")
      toast({
        title: "Missing Information",
        description: "Please provide both name and email for the invitation.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("Starting invite process...")
      setIsInviting(true)
      
      const response = await fetch('/api/mlm/invite', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inviteEmail,
          name: inviteName,
          sponsorId: user?.id
        })
      })

      if (!response.ok) {
        throw new Error(`Invite failed: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Invite result:", data)
      
      if (!data.success) {
        throw new Error(data.error || "Invite failed")
      }
      
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteName} at ${inviteEmail}`,
      })
      
      setInviteEmail("")
      setInviteName("")
      setShowInviteModal(false)
      console.log("Invite process completed successfully")
    } catch (error) {
      console.error("Invite error:", error)
      toast({
        title: "Invitation Failed",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsInviting(false)
    }
  }

  const getRankProgress = () => {
    if (!mlmUser?.rank) return 0
    
    const { personalVolume, teamVolume } = mlmUser
    const { personalVolume: requiredPV, teamVolume: requiredTV } = mlmUser.rank.requirements
    
    const pvProgress = Math.min((personalVolume / requiredPV) * 100, 100)
    const tvProgress = Math.min((teamVolume / requiredTV) * 100, 100)
    
    return Math.min((pvProgress + tvProgress) / 2, 100)
  }

  const getNextRank = () => {
    // Mock next rank - in real implementation, fetch from API
    const ranks = [
      { name: 'Bronze', level: 1 },
      { name: 'Silver', level: 2 },
      { name: 'Gold', level: 3 },
      { name: 'Platinum', level: 4 },
      { name: 'Diamond', level: 5 }
    ]
    
    const currentLevel = mlmUser?.rank?.level || 1
    return ranks.find(rank => rank.level === currentLevel + 1) || ranks[ranks.length - 1]
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your MLM dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Error Loading Dashboard</h3>
              <p className="text-gray-600 mt-2">{error}</p>
              <Button onClick={fetchMLMData} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!mlmUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Join MLM Program</h3>
              <p className="text-gray-600 mt-2">You're not part of the MLM program yet.</p>
              <Link href="/mlm/join">
                <Button className="mt-4">
                  Join MLM Program
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const nextRank = getNextRank()
  const rankProgress = getRankProgress()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MLM Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.name}! Here's your team overview.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={mlmUser.isTeamLeader ? "default" : "secondary"} className="text-sm">
                {mlmUser.isTeamLeader ? (
                  <>
                    <Crown className="w-4 h-4 mr-1" />
                    Team Leader
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-1" />
                    Team Member
                  </>
                )}
              </Badge>
              <Button
                onClick={copyTeamCode}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                {teamCodeCopied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Team Code
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${mlmUser.currentMonthEarnings.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Team Members</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teamStats?.totalMembers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Personal Volume</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${mlmUser.personalVolume.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Team Volume</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${mlmUser.teamVolume.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Rank Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Rank Progress
                </CardTitle>
                <CardDescription>
                  Current rank: {mlmUser.rank.name} • Next: {nextRank.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Progress to {nextRank.name}</span>
                    <span>{Math.round(rankProgress)}%</span>
                  </div>
                  <Progress value={rankProgress} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Personal Volume</p>
                      <p className="font-semibold">
                        ${mlmUser.personalVolume.toLocaleString()} / ${mlmUser.rank.requirements.personalVolume.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Team Volume</p>
                      <p className="font-semibold">
                        ${mlmUser.teamVolume.toLocaleString()} / ${mlmUser.rank.requirements.teamVolume.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Team Management
                </CardTitle>
                <CardDescription>
                  Manage your team and invite new members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Team Code</p>
                      <p className="text-sm text-gray-600">Share this code to invite members</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="px-3 py-1 bg-white rounded border text-sm font-mono">
                        {mlmUser.teamCode}
                      </code>
                      <Button size="sm" variant="outline" onClick={copyTeamCode}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Link href="/mlm/genealogy">
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Team Tree
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowInviteModal(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Members
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Team Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="w-5 h-5 mr-2" />
                  Team Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Team Code</span>
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {mlmUser.teamCode}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge variant={mlmUser.status === 'active' ? 'default' : 'secondary'}>
                      {mlmUser.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Join Date</span>
                    <span className="text-sm">
                      {new Date(mlmUser.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Downline Count</span>
                    <span className="text-sm font-medium">{mlmUser.downlineCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Commissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Recent Commissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {commissions.slice(0, 5).map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{commission.description}</p>
                        <p className="text-xs text-gray-600">{commission.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">
                          +${commission.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(commission.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {commissions.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No commissions yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Invite Button - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setShowInviteModal(true)}
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Invite New Member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  type="email"
                  placeholder="Enter email address"
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleInvite}
                  disabled={isInviting || !inviteName || !inviteEmail}
                  className="flex-1"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Send Invite
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInviteModal(false)
                    setInviteName("")
                    setInviteEmail("")
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}