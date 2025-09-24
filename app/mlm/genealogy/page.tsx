"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  Search,
  Download,
  Eye,
  Crown,
  Star,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Award,
  Target,
  ChevronDown,
  ChevronRight,
  UserPlus,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { useGenealogy, type TeamMember } from "@/hooks/use-genealogy"
import { useGenealogyRealtime } from "@/hooks/use-genealogy-realtime"
import { useToast } from "@/hooks/use-toast"

export default function GenealogyPage() {
  const {
    teamData,
    stats,
    loading,
    error,
    filters,
    updateFilters,
    refreshData,
    searchMembers,
    exportTeamData,
    inviteMember,
    getMemberDetails,
    clearError
  } = useGenealogy()

  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree")
  const [isInviting, setIsInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")
  const [showInviteModal, setShowInviteModal] = useState(false)
  const { toast } = useToast()
  const { triggerTeamUpdate } = useGenealogyRealtime()
  const initializedRef = useRef(false)

  // Initialize expanded nodes with first level members
  useEffect(() => {
    if (teamData.length > 0 && !initializedRef.current) {
      const firstLevelIds = teamData.map(member => member.id)
      setExpandedNodes(new Set(firstLevelIds))
      initializedRef.current = true
    }
  }, [teamData])

  const handleSearch = (value: string) => {
    updateFilters({ searchTerm: value })
  }

  const handleRankFilter = (value: string) => {
    updateFilters({ filterRank: value })
  }

  const handleStatusFilter = (value: string) => {
    updateFilters({ filterStatus: value })
  }

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      await exportTeamData(format)
      toast({
        title: "Export Successful",
        description: `Team data exported as ${format.toUpperCase()}`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export team data. Please try again.",
        variant: "destructive",
      })
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
      
      const result = await inviteMember(inviteEmail, inviteName)
      console.log("Invite result:", result)
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteName} at ${inviteEmail}`,
      })
      setInviteEmail("")
      setInviteName("")
      
      // Trigger real-time update
      triggerTeamUpdate()
      
      // Close the modal
      setShowInviteModal(false)
    } catch (error) {
      toast({
        title: "Invitation Failed",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsInviting(false)
    }
  }

  const handleMemberClick = async (member: TeamMember) => {
    setSelectedMember(member)
    try {
      const details = await getMemberDetails(member.id)
      setSelectedMember({ ...member, ...details })
    } catch (error) {
      console.error("Failed to fetch member details:", error)
    }
  }

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center p-3 border rounded-lg">
          <Skeleton className="w-10 h-10 rounded-full mr-3" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )

  // Error component
  const ErrorAlert = () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        <Button size="sm" variant="outline" onClick={clearError}>
          Dismiss
        </Button>
      </AlertDescription>
    </Alert>
  )

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case "presidential":
        return "text-red-600 bg-red-50"
      case "executive":
        return "text-orange-600 bg-orange-50"
      case "director":
        return "text-purple-600 bg-purple-50"
      case "manager":
        return "text-blue-600 bg-blue-50"
      case "consultant":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getRankIcon = (rank: string) => {
    switch (rank.toLowerCase()) {
      case "presidential":
        return <Crown className="h-4 w-4" />
      case "executive":
        return <Star className="h-4 w-4" />
      case "director":
        return <Award className="h-4 w-4" />
      case "manager":
        return <Target className="h-4 w-4" />
      case "consultant":
        return <Users className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const renderTreeNode = (member: TeamMember, level = 0) => {
    const hasChildren = member.children && member.children.length > 0
    const isExpanded = expandedNodes.has(member.id)

    return (
      <div key={member.id} className="mb-2">
        <div
          className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedMember?.id === member.id ? "bg-blue-50 border-blue-200" : ""
          }`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => handleMemberClick(member)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleNode(member.id)
              }}
              className="mr-2 p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}

          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{member.name}</span>
                  <Badge className={`text-xs ${getRankColor(member.rank)}`}>
                    {getRankIcon(member.rank)}
                    <span className="ml-1">{member.rank}</span>
                  </Badge>
                  <Badge variant={member.status === "active" ? "default" : "secondary"} className="text-xs">
                    {member.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {member.email} • Level {member.level}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-semibold text-green-600">${member.monthlyEarnings.toLocaleString()}</div>
              <div className="text-xs text-gray-500">{member.totalDownlines} downlines</div>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2">{member.children!.map((child) => renderTreeNode(child, level + 1))}</div>
        )}
      </div>
    )
  }

  const renderListView = () => {
    const flattenTeam = (members: TeamMember[]): TeamMember[] => {
      let result: TeamMember[] = []
      members.forEach((member) => {
        result.push(member)
        if (member.children) {
          result = result.concat(flattenTeam(member.children))
        }
      })
      return result
    }

    const allMembers = flattenTeam(filteredTeamData)

    return (
      <div className="space-y-4">
        {allMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-lg">{member.name}</span>
                      <Badge className={`${getRankColor(member.rank)}`}>
                        {getRankIcon(member.rank)}
                        <span className="ml-1">{member.rank}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {member.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {member.phone}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {member.location}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Joined {new Date(member.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">${member.monthlyEarnings.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Monthly</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{member.totalDownlines}</div>
                      <div className="text-xs text-gray-500">Downlines</div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedMember(member)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Genealogy</h1>
          <p className="text-gray-600">Manage and view your team structure</p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="relative group">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <div className="absolute right-0 top-full mt-1 w-32 bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
              >
                Export Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
              >
                Export PDF
              </button>
            </div>
          </div>
          <Button 
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert />}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={filters.searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filters.filterRank} onValueChange={handleRankFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by rank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranks</SelectItem>
                <SelectItem value="presidential">Presidential</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="director">Director</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="consultant">Consultant</SelectItem>
                <SelectItem value="associate">Associate</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.filterStatus} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-lg">
              <Button variant={viewMode === "tree" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("tree")}>
                Tree View
              </Button>
              <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")}>
                List View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Team Structure */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Team Structure
                  {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                </div>
                <div className="text-sm text-gray-500">
                  {teamData.length} members
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {loading ? (
                <LoadingSkeleton />
              ) : teamData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No team members found</p>
                  <p className="text-sm">Start by inviting your first team member</p>
                </div>
              ) : (
                <>
                  {viewMode === "tree" ? (
                    <div className="space-y-2">{teamData.map((member) => renderTreeNode(member))}</div>
                  ) : (
                    renderListView()
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Member Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Member Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMember ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-600 font-bold text-lg">
                        {selectedMember.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg">{selectedMember.name}</h3>
                    <Badge className={`${getRankColor(selectedMember.rank)} mb-2`}>
                      {getRankIcon(selectedMember.rank)}
                      <span className="ml-1">{selectedMember.rank}</span>
                    </Badge>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{selectedMember.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{selectedMember.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{selectedMember.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Joined {new Date(selectedMember.joinDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        ${selectedMember.monthlyEarnings.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Monthly Earnings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{selectedMember.totalDownlines}</div>
                      <div className="text-xs text-gray-500">Total Downlines</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        ${selectedMember.personalVolume.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Personal Volume</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">
                        ${selectedMember.teamVolume.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Team Volume</div>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button size="sm" className="flex-1">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Select a team member to view details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Team Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Members</span>
                  <span className="font-semibold">{stats.totalMembers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Members</span>
                  <span className="font-semibold text-green-600">{stats.activeMembers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">New This Week</span>
                  <span className="font-semibold text-blue-600">{stats.newThisWeek}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Volume</span>
                  <span className="font-semibold text-purple-600">${stats.totalVolume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg. Monthly Earnings</span>
                  <span className="font-semibold text-orange-600">${stats.averageMonthlyEarnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Max Depth</span>
                  <span className="font-semibold text-gray-600">{stats.maxDepth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg. Depth</span>
                  <span className="font-semibold text-gray-600">{stats.averageDepth.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Invite Button - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setShowInviteModal(true)}
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
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
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
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
