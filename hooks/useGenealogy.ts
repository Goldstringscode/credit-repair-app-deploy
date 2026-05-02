import { useState, useEffect, useCallback } from 'react'

interface GenealogyMember {
  id: string
  userId: string
  name: string
  email: string
  rank: string
  status: string
  mlmCode: string
  joinDate: string
  depth: number
  totalEarnings: number
  monthlyEarnings: number
  personalVolume: number
  teamVolume: number
  children?: GenealogyMember[]
  directDownlines?: number
  totalDownlines?: number
}

interface GenealogyStats {
  totalMembers: number
  activeMembers: number
  newThisWeek: number
  totalVolume: number
  averageMonthlyEarnings: number
  maxDepth: number
  averageDepth: number
}

interface GenealogyFilters {
  searchTerm: string
  filterRank: string
  filterStatus: string
}

// Flatten a nested tree into a flat array for list view
function flattenTree(node: any, depth = 0): GenealogyMember[] {
  if (!node) return []
  const member: GenealogyMember = {
    id: node.mlmId || node.id,
    userId: node.userId,
    name: node.name || node.email || 'Unknown',
    email: node.email || '',
    rank: node.rank || 'associate',
    status: node.status || 'active',
    mlmCode: node.mlmCode || '',
    joinDate: node.joinDate || node.join_date || '',
    depth,
    totalEarnings: Number(node.totalEarnings || node.total_earnings) || 0,
    monthlyEarnings: Number(node.monthlyEarnings || node.current_month_earnings) || 0,
    personalVolume: Number(node.personalVolume || node.personal_volume) || 0,
    teamVolume: Number(node.teamVolume || node.team_volume) || 0,
    children: node.children || [],
    directDownlines: node.directDownlines || node.children?.length || 0,
    totalDownlines: node.totalDownlines || 0,
  }
  const result = [member]
  if (node.children?.length) {
    for (const child of node.children) {
      result.push(...flattenTree(child, depth + 1))
    }
  }
  return result
}

export function useGenealogy() {
  const [rawData, setRawData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<GenealogyFilters>({
    searchTerm: '',
    filterRank: 'all',
    filterStatus: 'all',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/mlm/genealogy')
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load genealogy')
      setRawData(data)
    } catch (e: any) {
      setError(e.message || 'Failed to load team data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Flatten tree into member list
  const allMembers: GenealogyMember[] = rawData?.tree ? flattenTree(rawData.tree) : []

  // Apply filters
  const teamData = allMembers.filter(m => {
    const search = filters.searchTerm.toLowerCase()
    const matchSearch = !search ||
      m.name.toLowerCase().includes(search) ||
      m.email.toLowerCase().includes(search) ||
      m.mlmCode.toLowerCase().includes(search) ||
      m.rank.toLowerCase().includes(search)
    const matchRank = filters.filterRank === 'all' || m.rank === filters.filterRank
    const matchStatus = filters.filterStatus === 'all' || m.status === filters.filterStatus
    return matchSearch && matchRank && matchStatus
  })

  // Compute stats from raw data
  const apiStats = rawData?.stats || {}
  const depths = allMembers.map(m => m.depth)
  const stats: GenealogyStats = {
    totalMembers: apiStats.total ?? allMembers.length,
    activeMembers: apiStats.active ?? allMembers.filter(m => m.status === 'active').length,
    newThisWeek: allMembers.filter(m => {
      if (!m.joinDate) return false
      const joined = new Date(m.joinDate)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return joined >= weekAgo
    }).length,
    totalVolume: allMembers.reduce((s, m) => s + m.personalVolume, 0),
    averageMonthlyEarnings: allMembers.length
      ? Math.round(allMembers.reduce((s, m) => s + m.monthlyEarnings, 0) / allMembers.length)
      : 0,
    maxDepth: depths.length ? Math.max(...depths) : 0,
    averageDepth: depths.length ? Math.round(depths.reduce((a, b) => a + b, 0) / depths.length) : 0,
  }

  const updateFilters = (newFilters: Partial<GenealogyFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const refreshData = () => fetchData()

  const searchMembers = (term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }))
    return teamData.filter(m =>
      m.name.toLowerCase().includes(term.toLowerCase()) ||
      m.email.toLowerCase().includes(term.toLowerCase())
    )
  }

  const exportTeamData = () => {
    const csv = [
      ['Name', 'Email', 'MLM Code', 'Rank', 'Status', 'Depth', 'Monthly Earnings', 'Total Earnings', 'Join Date'].join(','),
      ...teamData.map(m => [
        m.name, m.email, m.mlmCode, m.rank, m.status, m.depth,
        m.monthlyEarnings, m.totalEarnings, m.joinDate
      ].join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'team-genealogy.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const inviteMember = async (email: string, name: string) => {
    try {
      const res = await fetch('/api/mlm/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Invite failed')
      return data
    } catch (e: any) {
      throw new Error(e.message || 'Failed to send invite')
    }
  }

  const getMemberDetails = (memberId: string) => {
    return allMembers.find(m => m.id === memberId || m.userId === memberId) || null
  }

  const clearError = () => setError(null)

  return {
    teamData,
    rawTree: rawData?.tree || null,
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
    clearError,
  }
}
