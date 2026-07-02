'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export interface TrackingUpdate {
  id: string
  tracking_number: string
  status: string
  current_location: string
  status_details: string
  estimated_delivery: string | null
  updated_at: string
}

/**
 * Subscribes to real-time tracking updates for the current user via Supabase
 * broadcast channels. The Supabase client is created inside useEffect so it
 * only runs in the browser — safe for Next.js SSR/prerendering.
 *
 * @param userId   The authenticated user's UUID
 * @param onUpdate Called with the updated record on every status change
 * @returns        true when the channel is actively subscribed (for live indicator)
 */
export function useRealtimeTracking(
  userId: string | undefined,
  onUpdate: (update: TrackingUpdate) => void
): boolean {
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!userId) return
    if (typeof window === 'undefined') return

    // Create client inside useEffect — browser only, never during SSR
    const supabase: SupabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { realtime: { params: { eventsPerSecond: 10 } } }
    )

    const channel = supabase
      .channel(`tracking:${userId}`)
      .on('broadcast', { event: 'status_update' }, ({ payload }) => {
        onUpdateRef.current(payload as TrackingUpdate)
      })
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
      setConnected(false)
    }
  }, [userId])

  return connected
}
