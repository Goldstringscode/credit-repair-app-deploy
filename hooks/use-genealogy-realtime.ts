import { useState, useCallback } from 'react'

// Realtime hook for genealogy - returns triggerTeamUpdate to manually refresh
// Polling-based approach; can be upgraded to Supabase Realtime later

export function useGenealogyRealtime() {
  const [updateCount, setUpdateCount] = useState(0)

  const triggerTeamUpdate = useCallback(() => {
    setUpdateCount(prev => prev + 1)
  }, [])

  return {
    triggerTeamUpdate,
    updateCount,
  }
}
