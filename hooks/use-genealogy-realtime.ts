import { useEffect } from 'react'

// Polling-based realtime fallback for genealogy updates
// Full Supabase Realtime support can be added by subscribing to mlm_genealogy table

export function useGenealogyRealtime(onUpdate?: () => void, intervalMs = 30000) {
  useEffect(() => {
    if (!onUpdate) return
    const interval = setInterval(onUpdate, intervalMs)
    return () => clearInterval(interval)
  }, [onUpdate, intervalMs])
}
