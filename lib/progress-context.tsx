'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { progressTrackingService } from './progress-tracking'

interface ProgressContextType {
  // Progress data
  userProgress: any
  isLoading: boolean
  
  // Actions
  refreshProgress: () => void
  updateLessonProgress: (lessonId: string, currentTime: number, completed: boolean) => void
  markLessonComplete: (lessonId: string) => void
  
  // Getters
  getLessonCompletionStatus: (lessonId: string) => boolean
  getCourseProgress: (courseId: string) => any
  getResumeData: (lessonId: string) => any
  
  // State for forcing re-renders
  refreshTrigger: number
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [userProgress, setUserProgress] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Load initial progress
  useEffect(() => {
    const loadProgress = () => {
      try {
        const progress = progressTrackingService.getUserProgress()
        setUserProgress(progress)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading progress:', error)
        setIsLoading(false)
      }
    }

    loadProgress()
  }, [])

  // Refresh progress data
  const refreshProgress = useCallback(() => {
    try {
      const progress = progressTrackingService.getUserProgress()
      setUserProgress(progress)
      setRefreshTrigger(prev => prev + 1)
      console.log('Progress refreshed:', progress)
    } catch (error) {
      console.error('Error refreshing progress:', error)
    }
  }, [])

  // Update lesson progress
  const updateLessonProgress = useCallback((lessonId: string, currentTime: number, completed: boolean = false) => {
    try {
      progressTrackingService.updateLessonProgress(lessonId, currentTime, completed)
      refreshProgress() // Refresh the context state
      console.log(`Updated lesson ${lessonId}:`, { currentTime, completed })
    } catch (error) {
      console.error('Error updating lesson progress:', error)
    }
  }, [refreshProgress])

  // Mark lesson as complete
  const markLessonComplete = useCallback((lessonId: string) => {
    try {
      const currentTime = 0 // We'll get the actual time from the video player
      progressTrackingService.updateLessonProgress(lessonId, currentTime, true)
      refreshProgress() // Refresh the context state
      console.log(`Marked lesson ${lessonId} as complete`)
    } catch (error) {
      console.error('Error marking lesson complete:', error)
    }
  }, [refreshProgress])

  // Get lesson completion status
  const getLessonCompletionStatus = useCallback((lessonId: string): boolean => {
    if (!userProgress) return false
    try {
      const lessonProgress = userProgress.lessons.find((l: any) => l.lessonId === lessonId)
      return lessonProgress?.completed || false
    } catch (error) {
      console.error('Error getting lesson completion status:', error)
      return false
    }
  }, [userProgress])

  // Get course progress
  const getCourseProgress = useCallback((courseId: string) => {
    if (!userProgress) return null
    try {
      return userProgress.courses.find((c: any) => c.courseId === courseId) || null
    } catch (error) {
      console.error('Error getting course progress:', error)
      return null
    }
  }, [userProgress])

  // Get resume data for a lesson
  const getResumeData = useCallback((lessonId: string) => {
    if (!userProgress) return null
    try {
      return progressTrackingService.getResumeData(lessonId)
    } catch (error) {
      console.error('Error getting resume data:', error)
      return null
    }
  }, [userProgress])

  // Listen for storage changes (for cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userProgress') {
        refreshProgress()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [refreshProgress])

  // Listen for visibility changes (when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshProgress()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [refreshProgress])

  const value: ProgressContextType = {
    userProgress,
    isLoading,
    refreshProgress,
    updateLessonProgress,
    markLessonComplete,
    getLessonCompletionStatus,
    getCourseProgress,
    getResumeData,
    refreshTrigger
  }

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}
