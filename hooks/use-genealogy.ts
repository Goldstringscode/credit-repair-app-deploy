"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "./use-auth-simple"

export interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
  location: string
  rank: string
  level: number
  sponsor: string
  joinDate: string
  status: "active" | "inactive" | "suspended"
  personalVolume: number
  teamVolume: number
  directReferrals: number
  totalDownlines: number
  monthlyEarnings: number
  lifetimeEarnings: number
  children?: TeamMember[]
}

export interface GenealogyStats {
  totalMembers: number
  activeMembers: number
  newThisWeek: number
  totalVolume: number
  averageMonthlyEarnings: number
  maxDepth: number
  averageDepth: number
}

export interface GenealogyFilters {
  searchTerm: string
  filterRank: string
  filterStatus: string
  depth: number
}

export function useGenealogy() {
  const { user } = useAuth()
  const [teamData, setTeamData] = useState<TeamMember[]>([])
  const [stats, setStats] = useState<GenealogyStats>({
    totalMembers: 0,
    activeMembers: 0,
    newThisWeek: 0,
    totalVolume: 0,
    averageMonthlyEarnings: 0,
    maxDepth: 0,
    averageDepth: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<GenealogyFilters>({
    searchTerm: "",
    filterRank: "all",
    filterStatus: "all",
    depth: 5
  })
  const fetchingRef = useRef(false)

  // Fetch team genealogy data
  const fetchGenealogy = useCallback(async (userId?: string, depth?: number) => {
    if (fetchingRef.current) {
      console.log('fetchGenealogy: Already fetching, skipping...')
      return
    }

    try {
      fetchingRef.current = true
      setLoading(true)
      setError(null)

      const targetUserId = userId || user?.id || 'demo-user-123'
      if (!targetUserId) {
        throw new Error("User ID is required")
      }

      console.log('fetchGenealogy: Fetching data for user:', targetUserId)

      const response = await fetch(
        `/api/mlm/genealogy?userId=${targetUserId}&depth=${depth || 5}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch genealogy: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch genealogy data")
      }

      // Transform API data to component format
      const transformedData = transformApiDataToTeamMembers(data.data.tree)
      setTeamData(transformedData)
      
      // Update stats
      setStats({
        totalMembers: data.data.stats.totalMembers,
        activeMembers: data.data.stats.activeMembers,
        newThisWeek: 0, // Would need separate API call
        totalVolume: data.data.stats.totalVolume,
        averageMonthlyEarnings: data.data.stats.totalEarnings / Math.max(data.data.stats.totalMembers, 1),
        maxDepth: data.data.stats.maxDepth,
        averageDepth: data.data.stats.averageDepth
      })
    } catch (err) {
      console.error("Error fetching genealogy:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch team data")
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [user?.id])

  // Transform API data to TeamMember format
  const transformApiDataToTeamMembers = (apiData: any): TeamMember[] => {
    if (!apiData || !apiData.children) return []

    return apiData.children.map((child: any) => ({
      id: child.id,
      name: child.name || "Unknown User",
      email: child.email || "",
      phone: "", // Would need to fetch from user profile
      location: "", // Would need to fetch from user profile
      rank: child.rank || "Associate",
      level: child.level || 1,
      sponsor: "You", // Would need to get actual sponsor name
      joinDate: child.joinDate || new Date().toISOString(),
      status: child.status || "active",
      personalVolume: child.volume || 0,
      teamVolume: 0, // Would need to calculate from children
      directReferrals: 0, // Would need to count direct children
      totalDownlines: 0, // Would need to count all descendants
      monthlyEarnings: child.earnings || 0,
      lifetimeEarnings: 0, // Would need to fetch from user data
      children: child.children ? transformApiDataToTeamMembers({ children: child.children }) : []
    }))
  }

  // Apply filters to team data
  const filteredTeamData = teamData.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(filters.searchTerm.toLowerCase())
    const matchesRank = filters.filterRank === "all" || member.rank.toLowerCase() === filters.filterRank.toLowerCase()
    const matchesStatus = filters.filterStatus === "all" || member.status === filters.filterStatus
    return matchesSearch && matchesRank && matchesStatus
  })

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<GenealogyFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Refresh data
  const refreshData = useCallback(() => {
    if (user?.id) {
      fetchGenealogy(user.id, 5) // Use default depth
    }
  }, [user?.id])

  // Search team members
  const searchMembers = useCallback(async (searchTerm: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/mlm/genealogy/search?q=${encodeURIComponent(searchTerm)}&userId=${user?.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || "Search failed")
      }

      const transformedData = transformApiDataToTeamMembers({ children: data.data })
      setTeamData(transformedData)
    } catch (err) {
      console.error("Error searching members:", err)
      setError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Export team data
  const exportTeamData = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const response = await fetch(
        `/api/mlm/genealogy/export?format=${format}&userId=${user?.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `team-genealogy.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Error exporting data:", err)
      setError(err instanceof Error ? err.message : "Export failed")
    }
  }, [user?.id])

  // Invite new member
  const inviteMember = useCallback(async (email: string, name: string) => {
    try {
      const response = await fetch('/api/mlm/invite', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          sponsorId: user?.id
        })
      })

      if (!response.ok) {
        throw new Error(`Invite failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || "Invite failed")
      }

      // Refresh data to show new member
      if (user?.id) {
        await fetchGenealogy(user.id, 5)
      }

      // Send client-side notification
      try {
        const { mlmNotificationService } = await import('@/lib/mlm-notification-service')
        const notificationService = mlmNotificationService.getInstance()
        notificationService.sendInvitationSentNotification(email, 'DEMO123')
      } catch (notificationError) {
        console.log('Client-side notification error:', notificationError)
        // Don't fail the invite if notification fails
      }
      
      return data
    } catch (err) {
      console.error("Error inviting member:", err)
      setError(err instanceof Error ? err.message : "Invite failed")
      throw err
    }
  }, [user?.id, fetchGenealogy])

  // Get member details
  const getMemberDetails = useCallback(async (memberId: string) => {
    try {
      const response = await fetch(
        `/api/mlm/genealogy/member/${memberId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch member details: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch member details")
      }

      return data.data
    } catch (err) {
      console.error("Error fetching member details:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch member details")
      throw err
    }
  }, [])

  // Load data on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      console.log('useGenealogy: Loading data for user:', user.id)
      fetchGenealogy()
    }
  }, [user?.id])

  // Debounced search
  useEffect(() => {
    if (filters.searchTerm) {
      const timeoutId = setTimeout(() => {
        searchMembers(filters.searchTerm)
      }, 500)

      return () => clearTimeout(timeoutId)
    }
    // Remove the else clause that was causing infinite loops
  }, [filters.searchTerm, searchMembers])

  return {
    teamData: filteredTeamData,
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
    clearError: () => setError(null)
  }
}
