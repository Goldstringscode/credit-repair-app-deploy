// Direct progress synchronization system
// This provides a more reliable way to sync progress across components

import { progressTrackingService } from './progress-tracking'

// Custom event for progress updates
export class ProgressUpdateEvent extends CustomEvent<{
  lessonId: string
  completed: boolean
  currentTime: number
}> {
  constructor(lessonId: string, completed: boolean, currentTime: number) {
    super('progressUpdate', {
      detail: { lessonId, completed, currentTime }
    })
  }
}

// Progress synchronization manager
export class ProgressSyncManager {
  private static instance: ProgressSyncManager
  private listeners: Set<(event: ProgressUpdateEvent) => void> = new Set()

  static getInstance(): ProgressSyncManager {
    if (!ProgressSyncManager.instance) {
      ProgressSyncManager.instance = new ProgressSyncManager()
    }
    return ProgressSyncManager.instance
  }

  // Subscribe to progress updates
  subscribe(callback: (event: ProgressUpdateEvent) => void): () => void {
    this.listeners.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback)
    }
  }

  // Emit progress update
  emit(lessonId: string, completed: boolean, currentTime: number): void {
    const event = new ProgressUpdateEvent(lessonId, completed, currentTime)
    this.listeners.forEach(callback => callback(event))
    
    // Also dispatch to window for cross-component communication
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event)
    }
  }

  // Update lesson progress and emit event
  updateLessonProgress(
    lessonId: string,
    currentTime: number,
    completed: boolean = false,
    courseId?: string,
    lessonTitle?: string,
    duration?: number,
  ): void {
    try {
      // Keep localStorage as write-through cache for offline resilience
      progressTrackingService.updateLessonProgress(lessonId, currentTime, completed, courseId, lessonTitle, duration)

      // Emit the update event
      this.emit(lessonId, completed, currentTime)

      // Always sync to the server (not only on completion)
      if (typeof window !== 'undefined' && courseId) {
        fetch('/api/mlm/training/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lesson_id: lessonId,
            course_id: courseId,
            video_progress_seconds: Math.floor(currentTime),
            completed_at: completed ? new Date().toISOString() : null,
          }),
        }).catch(err => console.warn('Progress sync failed:', err))
      } else if (!courseId) {
        console.warn('ProgressSyncManager: courseId is required for server-side persistence; skipping API call for lesson', lessonId)
      }
    } catch (error) {
      console.error('ProgressSyncManager: Error updating lesson progress:', error)
    }
  }

  // Fetch persisted progress from the server and merge into localStorage
  async loadFromServer(courseId?: string): Promise<void> {
    if (typeof window === 'undefined') return
    try {
      const url = courseId
        ? `/api/mlm/training/progress?course_id=${encodeURIComponent(courseId)}`
        : '/api/mlm/training/progress'
      const res = await fetch(url)
      if (!res.ok) return
      const { success, data } = await res.json()
      if (!success || !Array.isArray(data) || data.length === 0) return

      // Merge: for each server record mark the lesson in localStorage
      for (const record of data) {
        progressTrackingService.updateLessonProgress(
          record.lesson_id,
          record.video_progress_seconds || 0,
          record.is_completed,
          record.course_id,
        )
      }

      // Notify subscribers so UI re-renders with merged state
      window.dispatchEvent(new CustomEvent('lessonCompletionChanged'))
    } catch {
      // Silently ignore — server unavailable or user unauthenticated
    }
  }

  // Get lesson completion status
  getLessonCompletionStatus(lessonId: string): boolean {
    try {
      const userProgress = progressTrackingService.getUserProgress()
      const lessonProgress = userProgress.lessons.find((l: any) => l.lessonId === lessonId)
      return lessonProgress?.completed || false
    } catch (error) {
      console.error('ProgressSyncManager: Error getting lesson completion status:', error)
      return false
    }
  }

  // Get all progress data
  getUserProgress(): any {
    try {
      return progressTrackingService.getUserProgress()
    } catch (error) {
      console.error('ProgressSyncManager: Error getting user progress:', error)
      return null
    }
  }
}

// Export singleton instance
export const progressSyncManager = ProgressSyncManager.getInstance()

// React hook for progress synchronization
export function useProgressSync(courseId?: string) {
  const [progressData, setProgressData] = React.useState<any>(null)
  const [refreshTrigger, setRefreshTrigger] = React.useState(0)

  React.useEffect(() => {
    // Load initial progress from localStorage
    const loadProgress = () => {
      const progress = progressSyncManager.getUserProgress()
      setProgressData(progress)
    }
    
    loadProgress()

    // Fetch persisted progress from server and merge with localStorage
    progressSyncManager.loadFromServer(courseId).then(() => {
      loadProgress()
    })

    // Subscribe to progress updates
    const unsubscribe = progressSyncManager.subscribe((event) => {
      console.log('ProgressSync: Received update event:', event.detail)
      setRefreshTrigger(prev => prev + 1)
      loadProgress() // Reload progress data
    })

    // Also listen to window events for cross-component communication
    const handleWindowEvent = (event: any) => {
      if (event.type === 'progressUpdate' || event.type === 'lessonCompletionChanged') {
        console.log('ProgressSync: Received window event:', event.detail)
        setRefreshTrigger(prev => prev + 1)
        loadProgress()
      }
    }

    window.addEventListener('progressUpdate', handleWindowEvent)
    window.addEventListener('lessonCompletionChanged', handleWindowEvent)

    return () => {
      unsubscribe()
      window.removeEventListener('progressUpdate', handleWindowEvent)
      window.removeEventListener('lessonCompletionChanged', handleWindowEvent)
    }
  }, [courseId])

  return {
    progressData,
    refreshTrigger,
    updateLessonProgress: progressSyncManager.updateLessonProgress.bind(progressSyncManager),
    getLessonCompletionStatus: progressSyncManager.getLessonCompletionStatus.bind(progressSyncManager),
    getUserProgress: progressSyncManager.getUserProgress.bind(progressSyncManager)
  }
}

// Import React for the hook
import React from 'react'
