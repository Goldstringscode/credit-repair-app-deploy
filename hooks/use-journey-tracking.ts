"use client"

import { useEffect, useCallback } from "react"
import RealtimeJourneyTracker from "@/lib/realtime-journey-tracker"

interface UseJourneyTrackingOptions {
  userId?: string
  sessionId?: string
  journeyId: string
  autoTrack?: boolean
}

export function useJourneyTracking({
  userId = "anonymous",
  sessionId,
  journeyId,
  autoTrack = true,
}: UseJourneyTrackingOptions) {
  const tracker = RealtimeJourneyTracker.getInstance()

  // Generate session ID if not provided
  const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const trackStep = useCallback(
    (
      stepId: string,
      stepName: string,
      event: "step_start" | "step_complete" | "step_abandon" | "journey_complete",
      metadata?: Record<string, any>,
    ) => {
      tracker.trackEvent({
        userId,
        sessionId: currentSessionId,
        journeyId,
        stepId,
        stepName,
        event,
        metadata: metadata || {},
      })
    },
    [userId, currentSessionId, journeyId, tracker],
  )

  const trackStepStart = useCallback(
    (stepId: string, stepName: string, metadata?: Record<string, any>) => {
      trackStep(stepId, stepName, "step_start", metadata)
    },
    [trackStep],
  )

  const trackStepComplete = useCallback(
    (stepId: string, stepName: string, timeSpent?: number, metadata?: Record<string, any>) => {
      trackStep(stepId, stepName, "step_complete", {
        timeSpent,
        ...metadata,
      })
    },
    [trackStep],
  )

  const trackStepAbandon = useCallback(
    (stepId: string, stepName: string, timeSpent?: number, metadata?: Record<string, any>) => {
      trackStep(stepId, stepName, "step_abandon", {
        timeSpent,
        ...metadata,
      })
    },
    [trackStep],
  )

  const trackJourneyComplete = useCallback(
    (finalStepId: string, finalStepName: string, totalTime?: number, metadata?: Record<string, any>) => {
      trackStep(finalStepId, finalStepName, "journey_complete", {
        totalTime,
        ...metadata,
      })
    },
    [trackStep],
  )

  // Auto-track page views if enabled
  useEffect(() => {
    if (autoTrack && typeof window !== "undefined") {
      const currentPath = window.location.pathname
      const stepId = currentPath.split("/").pop() || "unknown"
      const stepName = stepId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

      trackStepStart(stepId, stepName, {
        path: currentPath,
        referrer: document.referrer,
      })

      // Track page unload as step abandon (if user leaves without completing)
      const handleBeforeUnload = () => {
        trackStepAbandon(stepId, stepName, undefined, {
          reason: "page_unload",
        })
      }

      window.addEventListener("beforeunload", handleBeforeUnload)

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload)
      }
    }
  }, [autoTrack, trackStepStart, trackStepAbandon])

  return {
    trackStep,
    trackStepStart,
    trackStepComplete,
    trackStepAbandon,
    trackJourneyComplete,
    sessionId: currentSessionId,
  }
}
