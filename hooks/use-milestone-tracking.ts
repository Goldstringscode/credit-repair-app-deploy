"use client"

import { useState, useEffect, useCallback } from "react"
import MilestoneTracker, { type CustomMilestone, type MilestoneProgress } from "@/lib/milestone-tracker"

interface MilestoneTrackingHook {
  milestones: CustomMilestone[]
  userProgress: MilestoneProgress[]
  userStats: {
    totalMilestones: number
    completedMilestones: number
    completionRate: number
    totalPoints: number
    recentCompletions: MilestoneProgress[]
  }
  isTracking: boolean
  startTracking: (userId: string, sessionId: string, journeyId: string) => void
  stopTracking: () => void
  triggerCustomEvent: (eventName: string, data?: any) => void
  refreshProgress: () => void
}

export function useMilestoneTracking(userId?: string): MilestoneTrackingHook {
  const [milestones, setMilestones] = useState<CustomMilestone[]>([])
  const [userProgress, setUserProgress] = useState<MilestoneProgress[]>([])
  const [userStats, setUserStats] = useState({
    totalMilestones: 0,
    completedMilestones: 0,
    completionRate: 0,
    totalPoints: 0,
    recentCompletions: [] as MilestoneProgress[],
  })
  const [isTracking, setIsTracking] = useState(false)
  const [tracker] = useState(() => MilestoneTracker.getInstance())

  const refreshProgress = useCallback(() => {
    if (!userId) return

    const progress = tracker.getUserProgress(userId)
    const stats = tracker.getUserMilestoneStats(userId)
    const allMilestones = tracker.getAllMilestones()

    setUserProgress(progress)
    setUserStats(stats)
    setMilestones(allMilestones)
  }, [userId, tracker])

  const startTracking = useCallback(
    (trackingUserId: string, sessionId: string, journeyId: string) => {
      tracker.startTracking(trackingUserId, sessionId, journeyId)
      setIsTracking(true)
      refreshProgress()
    },
    [tracker, refreshProgress],
  )

  const stopTracking = useCallback(() => {
    setIsTracking(false)
  }, [])

  const triggerCustomEvent = useCallback(
    (eventName: string, data: any = {}) => {
      tracker.triggerCustomEvent(eventName, data)
    },
    [tracker],
  )

  // Listen for milestone completions
  useEffect(() => {
    const handleMilestoneCompleted = (event: CustomEvent) => {
      const { userId: completedUserId } = event.detail
      if (completedUserId === userId) {
        refreshProgress()
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("milestone_completed", handleMilestoneCompleted as EventListener)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("milestone_completed", handleMilestoneCompleted as EventListener)
      }
    }
  }, [userId, refreshProgress])

  // Initial load
  useEffect(() => {
    refreshProgress()
  }, [refreshProgress])

  return {
    milestones,
    userProgress,
    userStats,
    isTracking,
    startTracking,
    stopTracking,
    triggerCustomEvent,
    refreshProgress,
  }
}
