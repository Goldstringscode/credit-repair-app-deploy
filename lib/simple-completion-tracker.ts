// Bulletproof completion tracking system
// Simple, direct, and reliable

interface LessonCompletion {
  lessonId: string
  completed: boolean
  completedAt: string
}

interface CourseCompletion {
  courseId: string
  completedLessons: string[]
  lastUpdated: string
}

class SimpleCompletionTracker {
  private static instance: SimpleCompletionTracker
  private storageKey = 'lessonCompletions'
  private courseStorageKey = 'courseCompletions'

  static getInstance(): SimpleCompletionTracker {
    if (!SimpleCompletionTracker.instance) {
      SimpleCompletionTracker.instance = new SimpleCompletionTracker()
    }
    return SimpleCompletionTracker.instance
  }

  // Mark a lesson as completed
  markLessonComplete(lessonId: string): void {
    try {
      const completions = this.getCompletions()
      const existingIndex = completions.findIndex(c => c.lessonId === lessonId)
      
      if (existingIndex >= 0) {
        completions[existingIndex].completed = true
        completions[existingIndex].completedAt = new Date().toISOString()
      } else {
        completions.push({
          lessonId,
          completed: true,
          completedAt: new Date().toISOString()
        })
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(completions))
      
      // Update course completion
      this.updateCourseCompletion(lessonId)
      
      // Dispatch custom event for immediate UI updates
      this.dispatchCompletionEvent(lessonId, true)
      
      console.log(`✅ Lesson ${lessonId} marked as complete`)
    } catch (error) {
      console.error('Error marking lesson complete:', error)
    }
  }

  // Mark a lesson as incomplete
  markLessonIncomplete(lessonId: string): void {
    try {
      const completions = this.getCompletions()
      const existingIndex = completions.findIndex(c => c.lessonId === lessonId)
      
      if (existingIndex >= 0) {
        completions[existingIndex].completed = false
        completions[existingIndex].completedAt = new Date().toISOString()
      } else {
        completions.push({
          lessonId,
          completed: false,
          completedAt: new Date().toISOString()
        })
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(completions))
      
      // Update course completion
      this.updateCourseCompletion(lessonId)
      
      // Dispatch custom event for immediate UI updates
      this.dispatchCompletionEvent(lessonId, false)
      
      console.log(`❌ Lesson ${lessonId} marked as incomplete`)
    } catch (error) {
      console.error('Error marking lesson incomplete:', error)
    }
  }

  // Check if a lesson is completed
  isLessonCompleted(lessonId: string): boolean {
    try {
      const completions = this.getCompletions()
      const completion = completions.find(c => c.lessonId === lessonId)
      return completion?.completed || false
    } catch (error) {
      console.error('Error checking lesson completion:', error)
      return false
    }
  }

  // Get all completions
  getCompletions(): LessonCompletion[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error getting completions:', error)
      return []
    }
  }

  // Get completed lessons for a course
  getCompletedLessonsForCourse(courseId: string): string[] {
    try {
      const courseCompletions = this.getCourseCompletions()
      const courseCompletion = courseCompletions.find(c => c.courseId === courseId)
      return courseCompletion?.completedLessons || []
    } catch (error) {
      console.error('Error getting course completions:', error)
      return []
    }
  }

  // Get course completion percentage
  getCourseCompletionPercentage(courseId: string, totalLessons: number): number {
    const completedLessons = this.getCompletedLessonsForCourse(courseId)
    return totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0
  }

  // Update course completion
  private updateCourseCompletion(lessonId: string): void {
    try {
      // Extract course ID from lesson ID (assuming format like "lesson-1" for course "credit-basics")
      const courseId = this.getCourseIdFromLessonId(lessonId)
      if (!courseId) return

      const courseCompletions = this.getCourseCompletions()
      const existingIndex = courseCompletions.findIndex(c => c.courseId === courseId)
      
      // Get the current completion status of this lesson
      const lessonCompletion = this.getCompletions().find(c => c.lessonId === lessonId)
      const isCompleted = lessonCompletion?.completed || false
      
      if (existingIndex >= 0) {
        if (isCompleted) {
          // Add to completed lessons if not already there
          if (!courseCompletions[existingIndex].completedLessons.includes(lessonId)) {
            courseCompletions[existingIndex].completedLessons.push(lessonId)
            courseCompletions[existingIndex].lastUpdated = new Date().toISOString()
          }
        } else {
          // Remove from completed lessons if marked as incomplete
          courseCompletions[existingIndex].completedLessons = courseCompletions[existingIndex].completedLessons.filter(id => id !== lessonId)
          courseCompletions[existingIndex].lastUpdated = new Date().toISOString()
        }
      } else if (isCompleted) {
        // Only create new course completion if lesson is completed
        courseCompletions.push({
          courseId,
          completedLessons: [lessonId],
          lastUpdated: new Date().toISOString()
        })
      }
      
      localStorage.setItem(this.courseStorageKey, JSON.stringify(courseCompletions))
    } catch (error) {
      console.error('Error updating course completion:', error)
    }
  }

  // Get course completions
  private getCourseCompletions(): CourseCompletion[] {
    try {
      const stored = localStorage.getItem(this.courseStorageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error getting course completions:', error)
      return []
    }
  }

  // Extract course ID from lesson ID
  private getCourseIdFromLessonId(lessonId: string): string | null {
    // For now, assume all lessons belong to "credit-basics" course
    // This can be made more dynamic later
    return "credit-basics"
  }

  // Dispatch completion event for immediate UI updates
  private dispatchCompletionEvent(lessonId: string, completed: boolean): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('lessonCompletionChanged', {
        detail: { lessonId, completed }
      })
      window.dispatchEvent(event)
    }
  }

  // Clear all completions (for testing)
  clearAllCompletions(): void {
    localStorage.removeItem(this.storageKey)
    localStorage.removeItem(this.courseStorageKey)
    console.log('All completions cleared')
  }

  // Get completion stats
  getCompletionStats(): { totalCompleted: number; totalLessons: number } {
    const completions = this.getCompletions()
    const totalCompleted = completions.filter(c => c.completed).length
    const totalLessons = completions.length
    return { totalCompleted, totalLessons }
  }
}

// Export singleton instance
export const completionTracker = SimpleCompletionTracker.getInstance()

// React hook for completion tracking
export function useCompletionTracker() {
  const [completions, setCompletions] = React.useState<LessonCompletion[]>([])
  const [refreshTrigger, setRefreshTrigger] = React.useState(0)

  React.useEffect(() => {
    // Load initial completions
    const loadCompletions = () => {
      const completionData = completionTracker.getCompletions()
      setCompletions(completionData)
      setRefreshTrigger(prev => prev + 1)
    }

    loadCompletions()

    // Listen for completion changes
    const handleCompletionChange = (event: any) => {
      console.log('Completion change detected:', event.detail)
      loadCompletions()
    }

    window.addEventListener('lessonCompletionChanged', handleCompletionChange)

    return () => {
      window.removeEventListener('lessonCompletionChanged', handleCompletionChange)
    }
  }, [])

  return {
    completions,
    refreshTrigger,
    markLessonComplete: completionTracker.markLessonComplete.bind(completionTracker),
    markLessonIncomplete: completionTracker.markLessonIncomplete.bind(completionTracker),
    isLessonCompleted: completionTracker.isLessonCompleted.bind(completionTracker),
    getCompletedLessonsForCourse: completionTracker.getCompletedLessonsForCourse.bind(completionTracker),
    getCourseCompletionPercentage: completionTracker.getCourseCompletionPercentage.bind(completionTracker),
    getCompletionStats: completionTracker.getCompletionStats.bind(completionTracker),
    clearAllCompletions: completionTracker.clearAllCompletions.bind(completionTracker)
  }
}

// Import React for the hook
import React from 'react'
