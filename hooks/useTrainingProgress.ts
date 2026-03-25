"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface ProgressData {
  lessonId: string
  courseId: string
  videoProgressSeconds: number
  videoDurationSeconds?: number
  isCompleted: boolean
  completedAt?: string
  lastWatchedAt: string
}

interface UseTrainingProgressReturn {
  /** Progress keyed by lessonId */
  progress: Record<string, ProgressData>
  /** Percentage of lessons completed (0-100) */
  courseCompletionPercent: number
  /** Last-watched lesson ID, for "resume here" UI */
  lastWatchedLessonId: string | null
  isLoading: boolean
  /** Debounced: saves video progress. Call on video time-update events. */
  updateProgress: (lessonId: string, progressSeconds: number, durationSeconds: number) => void
  /** Immediately marks a lesson complete (optimistic + API sync) */
  markComplete: (lessonId: string) => Promise<void>
}

const DEBOUNCE_INTERVAL_MS = 10_000 // save every 10 seconds

export function useTrainingProgress(
  courseId: string,
  totalLessons: number
): UseTrainingProgressReturn {
  const [progress, setProgress] = useState<Record<string, ProgressData>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [lastWatchedLessonId, setLastWatchedLessonId] = useState<string | null>(null)

  // Debounce timers: lessonId → timeout handle
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  // Pending progress to save after debounce: lessonId → { progressSeconds, durationSeconds }
  const pendingUpdates = useRef<Record<string, { progressSeconds: number; durationSeconds: number }>>({})

  // Fetch all progress records for this course on mount
  useEffect(() => {
    if (!courseId) return

    const fetchProgress = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/training/progress?courseId=${encodeURIComponent(courseId)}`)
        if (!res.ok) return

        const json = await res.json()
        if (!json.success || !Array.isArray(json.data)) return

        const progressMap: Record<string, ProgressData> = {}
        let latestWatchedLessonId: string | null = null
        let latestWatchedAt = ""

        for (const row of json.data) {
          const pd: ProgressData = {
            lessonId: row.lesson_id,
            courseId: row.course_id,
            videoProgressSeconds: row.video_progress_seconds,
            videoDurationSeconds: row.video_duration_seconds,
            isCompleted: row.is_completed,
            completedAt: row.completed_at,
            lastWatchedAt: row.last_watched_at,
          }
          progressMap[row.lesson_id] = pd

          if (row.last_watched_at > latestWatchedAt) {
            latestWatchedAt = row.last_watched_at
            latestWatchedLessonId = row.lesson_id
          }
        }

        setProgress(progressMap)
        setLastWatchedLessonId(latestWatchedLessonId)
      } catch (err) {
        console.error("useTrainingProgress: failed to fetch progress", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgress()
  }, [courseId])

  /** Persist a progress update to the API */
  const saveProgressToApi = useCallback(
    async (lessonId: string, progressSeconds: number, durationSeconds: number) => {
      try {
        await fetch("/api/training/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId,
            lessonId,
            videoProgressSeconds: progressSeconds,
            videoDurationSeconds: durationSeconds,
            isCompleted: false,
          }),
        })
      } catch (err) {
        console.error("useTrainingProgress: failed to save progress", err)
      }
    },
    [courseId]
  )

  /**
   * Debounced video progress update.
   * Updates local state immediately; flushes to API at most once every 10 seconds per lesson.
   */
  const updateProgress = useCallback(
    (lessonId: string, progressSeconds: number, durationSeconds: number) => {
      // Optimistic local update
      setProgress(prev => ({
        ...prev,
        [lessonId]: {
          ...(prev[lessonId] ?? {
            lessonId,
            courseId,
            isCompleted: false,
            lastWatchedAt: new Date().toISOString(),
          }),
          videoProgressSeconds: progressSeconds,
          videoDurationSeconds: durationSeconds,
          lastWatchedAt: new Date().toISOString(),
        } as ProgressData,
      }))
      setLastWatchedLessonId(lessonId)

      // Track latest pending update
      pendingUpdates.current[lessonId] = { progressSeconds, durationSeconds }

      // Debounce: clear existing timer and set a new one
      if (debounceTimers.current[lessonId]) {
        clearTimeout(debounceTimers.current[lessonId])
      }
      debounceTimers.current[lessonId] = setTimeout(() => {
        const pending = pendingUpdates.current[lessonId]
        if (pending) {
          saveProgressToApi(lessonId, pending.progressSeconds, pending.durationSeconds)
          delete pendingUpdates.current[lessonId]
        }
      }, DEBOUNCE_INTERVAL_MS)
    },
    [courseId, saveProgressToApi]
  )

  /**
   * Immediately marks a lesson as complete — optimistic update + API sync.
   */
  const markComplete = useCallback(
    async (lessonId: string) => {
      const now = new Date().toISOString()

      // Optimistic update
      setProgress(prev => ({
        ...prev,
        [lessonId]: {
          ...(prev[lessonId] ?? {
            lessonId,
            courseId,
            videoProgressSeconds: 0,
            lastWatchedAt: now,
          }),
          isCompleted: true,
          completedAt: now,
          lastWatchedAt: now,
        } as ProgressData,
      }))

      // Cancel any pending debounced save for this lesson
      if (debounceTimers.current[lessonId]) {
        clearTimeout(debounceTimers.current[lessonId])
        delete debounceTimers.current[lessonId]
      }

      try {
        const existing = progress[lessonId]
        await fetch("/api/training/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId,
            lessonId,
            videoProgressSeconds: existing?.videoProgressSeconds ?? 0,
            videoDurationSeconds: existing?.videoDurationSeconds,
            isCompleted: true,
          }),
        })
      } catch (err) {
        console.error("useTrainingProgress: failed to mark complete", err)
      }
    },
    [courseId, progress]
  )

  const completedCount = Object.values(progress).filter(p => p.isCompleted).length
  const courseCompletionPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  // Flush pending updates and cleanup debounce timers on unmount
  useEffect(() => {
    const flushPending = () => {
      for (const [lessonId, pending] of Object.entries(pendingUpdates.current)) {
        saveProgressToApi(lessonId, pending.progressSeconds, pending.durationSeconds)
      }
      pendingUpdates.current = {}
    }

    // Also flush on page unload to minimise data loss
    window.addEventListener("beforeunload", flushPending)

    return () => {
      window.removeEventListener("beforeunload", flushPending)
      // Flush any pending saves before unmounting
      flushPending()
      for (const timer of Object.values(debounceTimers.current)) {
        clearTimeout(timer)
      }
      debounceTimers.current = {}
    }
  }, [saveProgressToApi])

  return {
    progress,
    courseCompletionPercent,
    lastWatchedLessonId,
    isLoading,
    updateProgress,
    markComplete,
  }
}
