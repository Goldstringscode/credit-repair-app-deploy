"use client"

import { useEffect, useCallback, useRef } from "react"
import { useGenealogy } from "./use-genealogy"

export function useGenealogyRealtime() {
  const { refreshData } = useGenealogy()
  const refreshDataRef = useRef(refreshData)

  // Update ref when refreshData changes
  useEffect(() => {
    refreshDataRef.current = refreshData
  }, [refreshData])

  // Set up real-time updates
  useEffect(() => {
    // In a real implementation, this would use WebSocket or Server-Sent Events
    // For now, we'll use polling every 30 seconds
    const interval = setInterval(() => {
      refreshDataRef.current()
    }, 30000) // 30 seconds

    // Listen for custom events (e.g., when new members are added)
    const handleTeamUpdate = () => {
      refreshDataRef.current()
    }

    // Listen for storage events (cross-tab communication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mlm-team-updated') {
        refreshDataRef.current()
        localStorage.removeItem('mlm-team-updated')
      }
    }

    // Listen for custom events
    window.addEventListener('mlm-team-updated', handleTeamUpdate)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('mlm-team-updated', handleTeamUpdate)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, []) // Remove refreshData from dependencies

  // Function to trigger team update (can be called from other components)
  const triggerTeamUpdate = useCallback(() => {
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('mlm-team-updated'))
    
    // Also update localStorage for cross-tab communication
    localStorage.setItem('mlm-team-updated', Date.now().toString())
  }, [])

  return {
    triggerTeamUpdate
  }
}
