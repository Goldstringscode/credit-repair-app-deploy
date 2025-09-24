"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface CourseProgress {
  courseId: string
  completedLessons: string[]
  overallProgress: number
  lastAccessed: string
  lessons: { [lessonId: string]: { completed: boolean; completedAt?: string } }
}

interface CourseContextType {
  getCurrentProgress: (courseId: string) => number
  markLessonComplete: (courseId: string, lessonId: string) => void
  isLessonCompleted: (courseId: string, lessonId: string) => boolean
  setCurrentLesson: (courseId: string, lessonId: string) => void
  getAllProgress: () => { [courseId: string]: CourseProgress }
  getCompletedLessons: (courseId: string) => string[]
  getCourseProgress: (courseId: string) => CourseProgress
}

const CourseContext = createContext<CourseContextType | undefined>(undefined)

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<{ [courseId: string]: CourseProgress }>({})

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem("courseProgress")
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress)
        setProgress(parsed)
      }
    } catch (error) {
      console.error("Error loading course progress:", error)
      // Initialize with empty progress if parsing fails
      setProgress({})
    }
  }, [])

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("courseProgress", JSON.stringify(progress))
    } catch (error) {
      console.error("Error saving course progress:", error)
    }
  }, [progress])

  const getCurrentProgress = (courseId: string): number => {
    const courseProgress = progress[courseId]
    return courseProgress?.overallProgress || 0
  }

  const markLessonComplete = (courseId: string, lessonId: string) => {
    setProgress((prev) => {
      const courseProgress = prev[courseId] || {
        courseId,
        completedLessons: [],
        overallProgress: 0,
        lastAccessed: new Date().toISOString(),
        lessons: {},
      }

      // Don't add if already completed
      if (courseProgress.completedLessons.includes(lessonId)) {
        return prev
      }

      const updatedCompletedLessons = [...courseProgress.completedLessons, lessonId]
      const updatedLessons = {
        ...courseProgress.lessons,
        [lessonId]: {
          completed: true,
          completedAt: new Date().toISOString(),
        },
      }

      // Calculate progress based on total lessons (assuming 10 lessons per course for now)
      const totalLessons = 10
      const overallProgress = Math.round((updatedCompletedLessons.length / totalLessons) * 100)

      return {
        ...prev,
        [courseId]: {
          ...courseProgress,
          completedLessons: updatedCompletedLessons,
          lessons: updatedLessons,
          overallProgress: Math.min(overallProgress, 100),
          lastAccessed: new Date().toISOString(),
        },
      }
    })
  }

  const isLessonCompleted = (courseId: string, lessonId: string): boolean => {
    const courseProgress = progress[courseId]
    return courseProgress?.completedLessons.includes(lessonId) || false
  }

  const setCurrentLesson = (courseId: string, lessonId: string) => {
    setProgress((prev) => {
      const courseProgress = prev[courseId] || {
        courseId,
        completedLessons: [],
        overallProgress: 0,
        lastAccessed: new Date().toISOString(),
        lessons: {},
      }

      return {
        ...prev,
        [courseId]: {
          ...courseProgress,
          lastAccessed: new Date().toISOString(),
        },
      }
    })
  }

  const getAllProgress = () => {
    return progress
  }

  const getCompletedLessons = (courseId: string): string[] => {
    const courseProgress = progress[courseId]
    return courseProgress?.completedLessons || []
  }

  const getCourseProgress = (courseId: string): CourseProgress => {
    return (
      progress[courseId] || {
        courseId,
        completedLessons: [],
        overallProgress: 0,
        lastAccessed: new Date().toISOString(),
        lessons: {},
      }
    )
  }

  return (
    <CourseContext.Provider
      value={{
        getCurrentProgress,
        markLessonComplete,
        isLessonCompleted,
        setCurrentLesson,
        getAllProgress,
        getCompletedLessons,
        getCourseProgress,
      }}
    >
      {children}
    </CourseContext.Provider>
  )
}

export function useCourse() {
  const context = useContext(CourseContext)
  if (context === undefined) {
    throw new Error("useCourse must be used within a CourseProvider")
  }
  return context
}
