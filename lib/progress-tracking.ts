import { notificationService } from '@/lib/notification-service'

export interface LessonProgress {
  lessonId: string
  courseId: string
  lessonTitle: string
  videoUrl: string
  currentTime: number // in seconds
  duration: number // in seconds
  completed: boolean
  lastAccessed: Date
  notes: string[]
  bookmarks: number[] // timestamps in seconds
}

export interface CourseProgress {
  courseId: string
  courseTitle: string
  overallProgress: number
  lessonsCompleted: number
  totalLessons: number
  currentLessonId: string
  timeSpent: number
  lastAccessed: Date
}

export interface UserProgress {
  userId: string
  courses: CourseProgress[]
  lessons: LessonProgress[]
  totalTimeSpent: number
  lastActivity: Date
}

class ProgressTrackingService {
  private storageKey = 'user-learning-progress'
  private demoUserId = 'demo-user-123'
  private completionCheckTimeouts: Map<string, NodeJS.Timeout> = new Map()

  // Get or create user progress
  private getStoredProgress(): UserProgress {
    if (typeof window === 'undefined') {
      return this.getDefaultProgress()
    }

    // Force fresh data for debugging - remove this line when working
    // localStorage.removeItem(this.storageKey)

    const stored = localStorage.getItem(this.storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        console.log('Progress Tracking: Loading from localStorage, lessons count:', parsed.lessons?.length)
        return parsed
      } catch {
        console.log('Progress Tracking: localStorage parse error, using default')
        return this.getDefaultProgress()
      }
    }
    console.log('Progress Tracking: No localStorage data, using default')
    return this.getDefaultProgress()
  }

  // Save user progress
  private saveUserProgress(progress: UserProgress): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(this.storageKey, JSON.stringify(progress))
  }

  // Get default demo progress
  private getDefaultProgress(): UserProgress {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

    return {
      userId: this.demoUserId,
      courses: [
        {
          courseId: 'credit-basics',
          courseTitle: 'Credit Basics & Fundamentals',
          overallProgress: 65,
          lessonsCompleted: 3,
          totalLessons: 8,
          currentLessonId: 'lesson-4',
          timeSpent: 1800, // 30 minutes
          lastAccessed: oneDayAgo
        },
        {
          courseId: 'advanced-disputes',
          courseTitle: 'Advanced Dispute Strategies',
          overallProgress: 25,
          lessonsCompleted: 1,
          totalLessons: 4,
          currentLessonId: 'lesson-2',
          timeSpent: 900, // 15 minutes
          lastAccessed: twoDaysAgo
        }
      ],
      lessons: [
        {
          lessonId: 'lesson-1',
          courseId: 'credit-basics',
          lessonTitle: 'Understanding Your Credit Report',
          videoUrl: 'demo',
          currentTime: 450, // 7:30 into video
          duration: 1200, // 20 minutes total
          completed: true,
          lastAccessed: twoDaysAgo,
          notes: ['Credit reports contain personal information', 'Three major credit bureaus'],
          bookmarks: [120, 450, 800]
        },
        {
          lessonId: 'lesson-2',
          courseId: 'credit-basics',
          lessonTitle: 'Credit Score Fundamentals',
          videoUrl: 'demo',
          currentTime: 600, // 10:00 into video
          duration: 900, // 15 minutes total
          completed: true,
          lastAccessed: twoDaysAgo,
          notes: ['FICO scores range from 300-850', 'Payment history is most important'],
          bookmarks: [180, 450, 600]
        },
        {
          lessonId: 'lesson-3',
          courseId: 'credit-basics',
          lessonTitle: 'Building Good Credit Habits',
          videoUrl: 'demo',
          currentTime: 300, // 5:00 into video
          duration: 900, // 15 minutes total
          completed: true,
          lastAccessed: oneDayAgo,
          notes: ['Pay bills on time', 'Keep credit utilization low'],
          bookmarks: [120, 300, 600]
        },
        {
          lessonId: 'lesson-4',
          courseId: 'credit-basics',
          lessonTitle: 'Disputing Credit Report Errors',
          videoUrl: 'demo',
          currentTime: 180, // 3:00 into video
          duration: 1200, // 20 minutes total
          completed: false,
          lastAccessed: oneDayAgo,
          notes: ['Check for errors regularly', 'Document everything'],
          bookmarks: [60, 180]
        },
        {
          lessonId: 'lesson-1',
          courseId: 'advanced-disputes',
          lessonTitle: 'Advanced Dispute Letter Strategies',
          videoUrl: 'demo',
          currentTime: 0,
          duration: 720, // 12 minutes
          completed: false,
          lastAccessed: twoDaysAgo,
          notes: [],
          bookmarks: []
        },
        {
          lessonId: 'lesson-2',
          courseId: 'advanced-disputes',
          lessonTitle: 'Legal Framework Mastery',
          videoUrl: 'demo',
          currentTime: 0,
          duration: 900, // 15 minutes
          completed: false,
          lastAccessed: twoDaysAgo,
          notes: [],
          bookmarks: []
        },
        {
          lessonId: 'lesson-3',
          courseId: 'advanced-disputes',
          lessonTitle: 'Procedural Dispute Mastery',
          videoUrl: 'demo',
          currentTime: 0,
          duration: 1080, // 18 minutes
          completed: false,
          lastAccessed: twoDaysAgo,
          notes: [],
          bookmarks: []
        },
        {
          lessonId: 'lesson-4',
          courseId: 'advanced-disputes',
          lessonTitle: 'Timing and Strategy Optimization',
          videoUrl: 'demo',
          currentTime: 0,
          duration: 840, // 14 minutes
          completed: false,
          lastAccessed: twoDaysAgo,
          notes: [],
          bookmarks: []
        }
      ],
      totalTimeSpent: 2700, // 45 minutes total
      lastActivity: oneDayAgo
    }
  }

  // Get user's current progress
  getUserProgress(): UserProgress {
    return this.getStoredProgress()
  }

  // Get the most recent lesson progress for resume functionality
  getResumeLesson(): LessonProgress | null {
    const progress = this.getStoredProgress()
    
    if (progress.lessons.length === 0) return null

    // Find the most recently accessed incomplete lesson
    const incompleteLessons = progress.lessons.filter(lesson => !lesson.completed)
    
    if (incompleteLessons.length === 0) {
      // If all lessons are complete, return the most recently accessed
      return progress.lessons.sort((a, b) => 
        new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
      )[0]
    }

    // Return the most recently accessed incomplete lesson
    return incompleteLessons.sort((a, b) => 
      new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
    )[0]
  }

  // Get course progress by course ID
  getCourseProgress(courseId: string): CourseProgress | null {
    const progress = this.getStoredProgress()
    return progress.courses.find(course => course.courseId === courseId) || null
  }

  // Update lesson progress (called when user watches a video)
  updateLessonProgress(
    lessonId: string,
    currentTime: number,
    completed: boolean = false,
    courseId?: string,
    lessonTitle?: string,
    duration?: number
  ): void {
    console.log('=== PROGRESS TRACKING SERVICE DEBUG ===')
    console.log('updateLessonProgress called with:', { lessonId, currentTime, completed, courseId, lessonTitle, duration })
    
    const progress = this.getStoredProgress()
    let lesson = progress.lessons.find(l => l.lessonId === lessonId && l.courseId === courseId)
    
    console.log('Existing lesson found:', lesson)
    
    // If lesson doesn't exist, create it
    if (!lesson) {
      console.log('Creating new lesson entry')
      lesson = {
        lessonId: lessonId,
        courseId: courseId || 'credit-basics', // Default to credit-basics if not provided
        lessonTitle: lessonTitle || `Lesson ${lessonId}`,
        videoUrl: 'demo',
        currentTime: currentTime,
        duration: duration || 600, // Default 10 minutes
        completed: completed,
        lastAccessed: new Date(),
        notes: [],
        bookmarks: []
      }
      progress.lessons.push(lesson)
      console.log('New lesson created:', lesson)
    } else {
      console.log('Updating existing lesson')
      // Update existing lesson
      lesson.currentTime = currentTime
      lesson.completed = completed
      lesson.lastAccessed = new Date()
      console.log('Updated lesson:', lesson)
    }
    
    // Update course progress
    const course = progress.courses.find(c => c.courseId === lesson.courseId)
    if (course) {
      console.log('Updating course progress for:', course.courseId)
      course.lastAccessed = new Date()
      course.timeSpent += 1 // Increment time spent
      
      // Recalculate overall progress
      const courseLessons = progress.lessons.filter(l => l.courseId === lesson.courseId)
      const completedLessons = courseLessons.filter(l => l.completed).length
      course.lessonsCompleted = completedLessons
      
      // Get the actual total number of lessons for this course
      let totalLessons = 0
      if (lesson.courseId === 'credit-basics') {
        totalLessons = 8 // lesson-1 through lesson-8
      } else if (lesson.courseId === 'advanced-disputes') {
        totalLessons = 4 // This course has 4 lessons
      } else if (lesson.courseId === 'mlm-fundamentals') {
        totalLessons = 6 // MLM fundamentals has 6 lessons
      } else {
        totalLessons = courseLessons.length // Fallback to existing lessons
      }
      
      course.overallProgress = Math.round((completedLessons / totalLessons) * 100)
      console.log('Updated course:', course)
      
      // Check for course completion after progress update
      this.checkCourseCompletion(course, lesson.courseId)
    } else {
      console.log('Course not found for courseId:', lesson.courseId)
    }
    
    progress.lastActivity = new Date()
    this.saveUserProgress(progress)
    
    // Send notification if lesson was just completed
    if (completed && lesson && course) {
      console.log('🎉 Lesson completed! Sending notification...')
      notificationService.notifyLessonCompleted(
        lesson.lessonTitle,
        course.courseTitle,
        50 // Points earned for lesson completion
      ).catch(error => {
        console.error('Failed to send lesson completion notification:', error)
      })
      
      // Check for milestone achievements
      this.checkMilestoneAchievements(lesson.courseId, course)
      
      // Note: Course completion check is handled by checkCourseCompletion() method
      // which is called after this method completes
    }
    
    // Dispatch custom event for cross-component sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lessonCompletionChanged', {
        detail: { lessonId, completed, courseId }
      }))
    }
    
    console.log('Progress saved successfully')
    console.log('=== PROGRESS TRACKING SERVICE DEBUG END ===')
  }

  // Add a note to a lesson
  addLessonNote(lessonId: string, note: string): void {
    const progress = this.getStoredProgress()
    const lesson = progress.lessons.find(l => l.lessonId === lessonId)
    
    if (lesson) {
      lesson.notes.push(note)
      lesson.lastAccessed = new Date()
      this.saveUserProgress(progress)
    }
  }

  // Add a bookmark to a lesson
  addLessonBookmark(lessonId: string, timestamp: number): void {
    const progress = this.getStoredProgress()
    const lesson = progress.lessons.find(l => l.lessonId === lessonId)
    
    if (lesson && !lesson.bookmarks.includes(timestamp)) {
      lesson.bookmarks.push(timestamp)
      lesson.bookmarks.sort((a, b) => a - b)
      lesson.lastAccessed = new Date()
      this.saveUserProgress(progress)
    }
  }

  // Get resume URL for the most appropriate lesson
  getResumeUrl(): string {
    const resumeLesson = this.getResumeLesson()
    
    if (!resumeLesson) {
      return '/dashboard/training/courses/credit-basics'
    }

    // Return URL with video timestamp for exact resume position
    return `/dashboard/training/courses/${resumeLesson.courseId}/lessons/${resumeLesson.lessonId}?t=${Math.round(resumeLesson.currentTime)}`
  }

  // Manually check for course completion (useful for debugging)
  checkAllCoursesForCompletion(): void {
    const progress = this.getStoredProgress()
    progress.courses.forEach(course => {
      this.checkCourseCompletion(course, course.courseId)
    })
  }

  // Force course completion check for a specific course
  forceCourseCompletionCheck(courseId: string): void {
    console.log('🔍 Force checking course completion for:', courseId)
    const progress = this.getStoredProgress()
    const course = progress.courses.find(c => c.courseId === courseId)
    if (course) {
      console.log('📚 Course found for completion check:', {
        courseId: course.courseId,
        title: course.courseTitle,
        progress: course.overallProgress,
        lessonsCompleted: course.lessonsCompleted,
        totalLessons: course.totalLessons
      })
      this.checkCourseCompletion(course, courseId)
    } else {
      console.error('❌ Course not found for completion check:', courseId)
    }
  }

  // Check if all courses are completed (public method)
  checkAllCoursesCompletion(): boolean {
    const progress = this.getStoredProgress()
    return progress.courses.every(course => course.overallProgress >= 100)
  }

  // Get completion status for all courses
  getAllCoursesCompletionStatus(): { courseId: string; title: string; progress: number; completed: boolean }[] {
    const progress = this.getStoredProgress()
    return progress.courses.map(course => ({
      courseId: course.courseId,
      title: course.courseTitle,
      progress: course.overallProgress,
      completed: course.overallProgress >= 100
    }))
  }

  // Cleanup method to clear timeouts
  cleanup(): void {
    this.completionCheckTimeouts.forEach(timeout => clearTimeout(timeout))
    this.completionCheckTimeouts.clear()
  }

  // Get resume data for display
  getResumeData(): {
    courseTitle: string
    lessonTitle: string
    progress: number
    timeRemaining: number
    lastAccessed: string
  } | null {
    const resumeLesson = this.getResumeLesson()
    
    if (!resumeLesson) return null

    const course = this.getCourseProgress(resumeLesson.courseId)
    if (!course) return null

    const timeRemaining = resumeLesson.duration - resumeLesson.currentTime
    const progress = Math.round((resumeLesson.currentTime / resumeLesson.duration) * 100)

    return {
      courseTitle: course.courseTitle,
      lessonTitle: resumeLesson.lessonTitle,
      progress,
      timeRemaining,
      lastAccessed: this.formatTimeAgo(resumeLesson.lastAccessed)
    }
  }

  // Format time ago for display
  private formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return new Date(date).toLocaleDateString()
  }

  // Format time in MM:SS format
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get current/last lesson for a course
  getCurrentLessonForCourse(courseId: string): { lessonId: string; lessonTitle: string; currentTime: number; lastAccessed: Date } | null {
    const progress = this.getUserProgress()
    const courseLessons = progress.lessons.filter(l => l.courseId === courseId)
    
    if (courseLessons.length === 0) {
      return null
    }
    
    // Find the lesson with the most recent lastAccessed date
    const mostRecentLesson = courseLessons.reduce((latest, current) => {
      return new Date(current.lastAccessed) > new Date(latest.lastAccessed) ? current : latest
    })
    
    return {
      lessonId: mostRecentLesson.lessonId,
      lessonTitle: mostRecentLesson.lessonTitle,
      currentTime: mostRecentLesson.currentTime,
      lastAccessed: new Date(mostRecentLesson.lastAccessed)
    }
  }

  // Get course completion stats
  getCourseCompletionStats(courseId: string): { completed: number; total: number; percentage: number } {
    const progress = this.getUserProgress()
    const courseLessons = progress.lessons.filter(l => l.courseId === courseId)
    const completedLessons = courseLessons.filter(l => l.completed)
    
    // Get the actual total number of lessons for this course
    // This should match the courseLessons data structure
    let totalLessons = 0
    if (courseId === 'credit-basics') {
      totalLessons = 8 // lesson-1 through lesson-8
    } else if (courseId === 'advanced-disputes') {
      totalLessons = 4 // This course has 4 lessons
    } else {
      totalLessons = courseLessons.length // Fallback to existing lessons
    }
    
    return {
      completed: completedLessons.length,
      total: totalLessons,
      percentage: totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0
    }
  }

  // Check for course completion with debouncing
  private checkCourseCompletion(course: CourseProgress, courseId: string): void {
    console.log('🔍 Checking course completion:', {
      courseId,
      title: course.courseTitle,
      progress: course.overallProgress,
      isComplete: course.overallProgress >= 100
    })
    
    if (course.overallProgress >= 100) {
      // Clear any existing timeout for this course
      const existingTimeout = this.completionCheckTimeouts.get(courseId)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }
      
      // Set a new timeout to debounce multiple rapid calls
      const timeout = setTimeout(() => {
        this.performCourseCompletionCheck(course, courseId)
        this.completionCheckTimeouts.delete(courseId)
      }, 100) // 100ms debounce
      
      this.completionCheckTimeouts.set(courseId, timeout)
    } else {
      console.log('Course not yet complete:', {
        courseId,
        progress: course.overallProgress,
        required: 100
      })
    }
  }

  // Perform the actual course completion check
  private performCourseCompletionCheck(course: CourseProgress, courseId: string): void {
    // Check if we've already sent a completion notification for this course
    const notificationKey = `course_completed_${courseId}`
    const hasNotified = localStorage.getItem(notificationKey)
    
    console.log('🎓 Course is 100% complete!', {
      courseId,
      hasNotified: !!hasNotified,
      notificationKey
    })
    
    if (!hasNotified) {
      console.log('🎓 Course completed! Sending course completion notification...')
      console.log('Course details:', { courseId, title: course.courseTitle, progress: course.overallProgress })
      
      // Mark that we've sent the notification IMMEDIATELY to prevent duplicates
      localStorage.setItem(notificationKey, 'true')
      console.log('✅ Set completion flag for:', courseId)
      
      // Send notification immediately
      notificationService.notifyCourseCompleted(course.courseTitle).catch(error => {
        console.error('Failed to send course completion notification:', error)
      })
      
      // Check if all courses are now completed
      this.checkAllCoursesCompleted()
    } else {
      console.log('Course completion notification already sent for:', courseId)
    }
  }

  // Check if all courses are completed
  private checkAllCoursesCompleted(): void {
    const progress = this.getStoredProgress()
    const allCoursesCompleted = progress.courses.every(course => course.overallProgress >= 100)
    
    if (allCoursesCompleted) {
      const allCoursesKey = 'all_courses_completed'
      const hasNotifiedAll = localStorage.getItem(allCoursesKey)
      
      if (!hasNotifiedAll) {
        console.log('🎉 ALL COURSES COMPLETED! Sending celebration notification...')
        
        notificationService.notifyCustom(
          '🎉 All Courses Completed! 🎉',
          'Congratulations! You have successfully completed all available courses. You are now a credit repair expert!',
          'success',
          'high',
          [
            {
              label: 'View Certificates',
              action: 'view_certificates',
              variant: 'default'
            },
            {
              label: 'Continue Learning',
              action: 'explore_more',
              variant: 'outline'
            }
          ]
        ).catch(error => {
          console.error('Failed to send all courses completion notification:', error)
        })
        
        // Mark that we've sent the all courses notification
        localStorage.setItem(allCoursesKey, 'true')
      }
    }
  }

  // Check for milestone achievements and send notifications
  private checkMilestoneAchievements(courseId: string, course: any): void {
    const progress = this.getStoredProgress()
    const courseLessons = progress.lessons.filter(l => l.courseId === courseId)
    const completedLessons = courseLessons.filter(l => l.completed).length
    
    // Define milestones for each course
    const milestones = this.getCourseMilestones(courseId)
    
    // Check each milestone
    milestones.forEach(milestone => {
      if (completedLessons === milestone.lessonsRequired) {
        console.log(`🏆 Milestone achieved: ${milestone.title}`)
        notificationService.notifyMilestoneAchieved(
          milestone.title,
          milestone.description
        ).catch(error => {
          console.error('Failed to send milestone notification:', error)
        })
      }
    })
    
    // Check for course completion
    const totalLessons = this.getTotalLessonsForCourse(courseId)
    if (completedLessons === totalLessons) {
      console.log(`🎓 Course completed: ${course.courseTitle}`)
      notificationService.notifyCourseCompleted(course.courseTitle)
        .catch(error => {
          console.error('Failed to send course completion notification:', error)
        })
    }
  }

  // Get milestones for a specific course
  private getCourseMilestones(courseId: string): Array<{lessonsRequired: number, title: string, description: string}> {
    const milestones: Record<string, Array<{lessonsRequired: number, title: string, description: string}>> = {
      'credit-basics': [
        { lessonsRequired: 2, title: "Getting Started", description: "You've completed your first 2 lessons in Credit Basics!" },
        { lessonsRequired: 4, title: "Halfway There", description: "You're halfway through the Credit Basics course!" },
        { lessonsRequired: 6, title: "Almost There", description: "Just 2 more lessons to complete Credit Basics!" }
      ],
      'advanced-disputes': [
        { lessonsRequired: 1, title: "First Step", description: "You've started your journey in Advanced Dispute Strategies!" },
        { lessonsRequired: 2, title: "Making Progress", description: "You're making great progress in Advanced Dispute Strategies!" },
        { lessonsRequired: 3, title: "Almost Complete", description: "Just one more lesson to master Advanced Dispute Strategies!" }
      ]
    }
    
    return milestones[courseId] || []
  }

  // Get total lessons for a course
  private getTotalLessonsForCourse(courseId: string): number {
    if (courseId === 'credit-basics') {
      return 8
    } else if (courseId === 'advanced-disputes') {
      return 4
    } else if (courseId === 'mlm-fundamentals') {
      return 6
    }
    return 0
  }
}

export const progressTrackingService = new ProgressTrackingService()
