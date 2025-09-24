"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Search,
  Filter,
  Maximize2,
  Download,
  User,
  Crown,
  Star,
  Award,
  Target,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Calendar,
} from "lucide-react"
import { mlmRanks } from "@/lib/mlm-system"

interface TreeNode {
  id: string
  name: string
  email: string
  rank: string
  status: "active" | "inactive"
  volume: number
  earnings: number
  joinDate: string
  children: TreeNode[]
  level: number
  isExpanded?: boolean
}

interface GenealogyTreeProps {
  userId: string
}

export function GenealogyTree({ userId }: GenealogyTreeProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRank, setFilterRank] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["root"]))

  // Mock genealogy data
  const genealogyData: TreeNode = {
    id: "root",
    name: "You",
    email: "you@example.com",
    rank: "manager",
    status: "active",
    volume: 8500,
    earnings: 2100,
    joinDate: "2024-01-01",
    level: 0,
    isExpanded: true,
    children: [
      {
        id: "child1",
        name: "Sarah Johnson",
        email: "sarah@example.com",
        rank: "consultant",
        status: "active",
        volume: 3200,
        earnings: 850,
        joinDate: "2024-01-15",
        level: 1,
        children: [
          {
            id: "grandchild1",
            name: "Mike Davis",
            email: "mike@example.com",
            rank: "associate",
            status: "active",
            volume: 1200,
            earnings: 360,
            joinDate: "2024-02-01",
            level: 2,
            children: [],
          },
          {
            id: "grandchild2",
            name: "Emily Wilson",
            email: "emily@example.com",
            rank: "consultant",
            status: "active",
            volume: 1800,
            earnings: 540,
            joinDate: "2024-02-10",
            level: 2,
            children: [
              {
                id: "greatgrand1",
                name: "David Chen",
                email: "david@example.com",
                rank: "associate",
                status: "inactive",
                volume: 400,
                earnings: 120,
                joinDate: "2024-03-01",
                level: 3,
                children: [],
              },
            ],
          },
        ],
      },
      {
        id: "child2",
        name: "Robert Martinez",
        email: "robert@example.com",
        rank: "manager",
        status: "active",
        volume: 4200,
        earnings: 1260,
        joinDate: "2024-01-20",
        level: 1,
        children: [
          {
            id: "grandchild3",
            name: "Lisa Anderson",
            email: "lisa@example.com",
            rank: "consultant",
            status: "active",
            volume: 2100,
            earnings: 630,
            joinDate: "2024-02-15",
            level: 2,
            children: [],
          },
          {
            id: "grandchild4",
            name: "James Wilson",
            email: "james@example.com",
            rank: "associate",
            status: "active",
            volume: 900,
            earnings: 270,
            joinDate: "2024-02-20",
            level: 2,
            children: [],
          },
        ],
      },
      {
        id: "child3",
        name: "Jennifer Brown",
        email: "jennifer@example.com",
        rank: "associate",
        status: "inactive",
        volume: 600,
        earnings: 180,
        joinDate: "2024-01-25",
        level: 1,
        children: [],
      },
    ],
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

  const getRankInfo = (rankId: string) => {
    return mlmRanks.find((rank) => rank.id === rankId) || mlmRanks[0]
  }

  const getRankIcon = (rankId: string) => {
    const rank = getRankInfo(rankId)
    switch (rank.icon) {
      case "crown":
        return Crown
      case "star":
        return Star
      case "diamond":
        return Award
      case "users":
        return Users
      case "briefcase":
        return Target
      default:
        return User
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const filterNodes = (node: TreeNode): boolean => {
    const matchesSearch =
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRank = filterRank === "all" || node.rank === filterRank
    const matchesStatus = filterStatus === "all" || node.status === filterStatus

    return matchesSearch && matchesRank && matchesStatus
  }

  const renderNode = (node: TreeNode): React.ReactNode => {
    const hasChildren = node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const rankInfo = getRankInfo(node.rank)
    const RankIcon = getRankIcon(node.rank)

    if (!filterNodes(node) && node.id !== "root") {
      return null
    }

    return (
      <div key={node.id} className="relative">
        <div className="flex items-center space-x-2 p-3 border rounded-lg bg-white hover:shadow-md transition-shadow">
          {hasChildren && (
            <Button variant="ghost" size="sm" onClick={() => toggleNode(node.id)} className="p-1 h-6 w-6">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )}

          <div className="flex items-center space-x-3 flex-1">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${rankInfo.color}20` }}
            >
              <RankIcon className="h-5 w-5" style={{ color: rankInfo.color }} />
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium">{node.name}</h4>
                <Badge style={{ backgroundColor: rankInfo.color }} className="text-white text-xs">
                  {rankInfo.name}
                </Badge>
                <Badge className={getStatusColor(node.status)}>{node.status}</Badge>
              </div>
              <p className="text-sm text-gray-600">{node.email}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                <span className="flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />${node.volume.toLocaleString()} volume
                </span>
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Joined {new Date(node.joinDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="font-medium text-green-600">${node.earnings.toLocaleString()}</p>
              <p className="text-xs text-gray-500">This month</p>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-8 mt-2 space-y-2 border-l-2 border-gray-200 pl-4">
            {node.children.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    )
  }

  const calculateTotalStats = (node: TreeNode): { members: number; volume: number; earnings: number } => {
    let members = 1
    let volume = node.volume
    let earnings = node.earnings

    node.children.forEach((child) => {
      const childStats = calculateTotalStats(child)
      members += childStats.members
      volume += childStats.volume
      earnings += childStats.earnings
    })

    return { members, volume, earnings }
  }

  const totalStats = calculateTotalStats(genealogyData)

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-3xl font-bold text-blue-600">{totalStats.members}</p>
            <p className="text-gray-600">Total Organization</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-3xl font-bold text-green-600">${totalStats.volume.toLocaleString()}</p>
            <p className="text-gray-600">Total Volume</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <p className="text-3xl font-bold text-purple-600">${totalStats.earnings.toLocaleString()}</p>
            <p className="text-gray-600">Total Earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Genealogy Tree */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Organization Genealogy
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Maximize2 className="h-4 w-4 mr-1" />
                Fullscreen
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48"
              />
            </div>

            <Select value={filterRank} onValueChange={setFilterRank}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by rank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranks</SelectItem>
                {mlmRanks.map((rank) => (
                  <SelectItem key={rank.id} value={rank.id}>
                    {rank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              More Filters
            </Button>
          </div>

          {/* Tree View */}
          <div className="space-y-2 max-h-96 overflow-y-auto">{renderNode(genealogyData)}</div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Rank Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {mlmRanks.map((rank) => {
              const RankIcon = getRankIcon(rank.id)
              return (
                <div key={rank.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${rank.color}20` }}
                  >
                    <RankIcon className="h-4 w-4" style={{ color: rank.color }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{rank.name}</p>
                    <p className="text-xs text-gray-600">Level {rank.level}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
