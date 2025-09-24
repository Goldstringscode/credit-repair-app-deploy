// Progress Service with fallback for demo mode
// This allows the training system to work even without database access

export interface QuizResult {
  userId: string
  quizId: string
  courseId: string
  lessonId: string
  score: number
  maxScore: number
  passed: boolean
  timeTaken: number
  answers: Array<{
    questionId: string
    selectedOptionId?: string
    text?: string
    isCorrect: boolean
  }>
  completedAt: Date
}

export interface LessonProgress {
  userId: string
  courseId: string
  lessonId: string
  isCompleted: boolean
  progressPercentage: number
  timeSpent: number
  lastAccessedAt: Date
  completedAt?: Date
}

export interface CourseProgress {
  userId: string
  courseId: string
  isEnrolled: boolean
  overallProgress: number
  lessonsCompleted: number
  totalLessons: number
  timeSpent: number
  enrolledAt: Date
  lastAccessedAt: Date
}

export interface Achievement {
  id: string
  userId: string
  type: 'lesson_completed' | 'course_completed' | 'quiz_perfect' | 'streak' | 'milestone'
  title: string
  description: string
  icon: string
  earnedAt: Date
  metadata?: Record<string, any>
}

// Demo data for when database is not available
const demoProgress: CourseProgress = {
  userId: "550e8400-e29b-41d4-a716-446655440000",
  courseId: "550e8400-e29b-41d4-a716-446655440002",
  isEnrolled: true,
  overallProgress: 20,
  lessonsCompleted: 1,
  totalLessons: 5,
  timeSpent: 720,
  enrolledAt: new Date(),
  lastAccessedAt: new Date()
}

const demoAchievements: Achievement[] = [
  {
    id: "demo-achievement-1",
    userId: "550e8400-e29b-41d4-a716-446655440000",
    type: 'milestone',
    title: 'First Steps',
    description: 'Completed your first lesson!',
    icon: '🎯',
    earnedAt: new Date(),
    metadata: { courseId: "550e8400-e29b-41d4-a716-446655440002" }
  }
]

export class ProgressService {
  private isDemoMode: boolean = true

  constructor() {
    // Check if we can access Supabase
    try {
      // This will throw an error if environment variables are missing
      if (typeof window !== 'undefined') {
        // Client-side check
        this.isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    } catch (error) {
      this.isDemoMode = true
    }
  }

  /**
   * Save quiz attempt and update progress
   */
  async saveQuizResult(result: QuizResult): Promise<boolean> {
    if (this.isDemoMode) {
      console.log('🎭 Demo mode: Quiz result would be saved:', result)
      return true
    }

    try {
      // Dynamic import to avoid build-time errors
      const { supabase } = await import('@/lib/supabase')
      
      const { error } = await supabase
        .from('user_quiz_attempts')
        .insert({
          user_id: result.userId,
          quiz_id: result.quizId,
          course_id: result.courseId,
          lesson_id: result.lessonId,
          score: result.score,
          max_score: result.maxScore,
          passed: result.passed,
          time_taken: result.timeTaken,
          answers: result.answers,
          completed_at: result.completedAt.toISOString()
        })

      if (error) {
        console.error('Failed to save quiz result:', error)
        return false
      }

      // Update lesson progress
      await this.updateLessonProgress(result.userId, result.courseId, result.lessonId, {
        isCompleted: result.passed,
        progressPercentage: result.passed ? 100 : 0
      })

      // Check for achievements
      await this.checkAndAwardAchievements(result.userId, result.courseId, result.lessonId)

      return true
    } catch (error) {
      console.error('Error saving quiz result:', error)
      return false
    }
  }

  /**
   * Update lesson progress
   */
  async updateLessonProgress(
    userId: string, 
    courseId: string, 
    lessonId: string, 
    progress: Partial<LessonProgress>
  ): Promise<boolean> {
    if (this.isDemoMode) {
      console.log('🎭 Demo mode: Lesson progress would be updated:', { userId, courseId, lessonId, progress })
      return true
    }

    try {
      const { supabase } = await import('@/lib/supabase')
      const now = new Date()
      
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: userId,
          course_id: courseId,
          lesson_id: lessonId,
          is_completed: progress.isCompleted || false,
          progress_percentage: progress.progressPercentage || 0,
          time_spent: progress.timeSpent || 0,
          last_accessed_at: now.toISOString(),
          completed_at: progress.isCompleted ? now.toISOString() : null
        }, {
          onConflict: 'user_id,course_id,lesson_id'
        })

      if (error) {
        console.error('Failed to update lesson progress:', error)
        return false
      }

      // Update course progress
      await this.updateCourseProgress(userId, courseId)

      return true
    } catch (error) {
      console.error('Error updating lesson progress:', error)
      return false
    }
  }

  /**
   * Update course progress based on lesson completions
   */
  async updateCourseProgress(userId: string, courseId: string): Promise<boolean> {
    if (this.isDemoMode) {
      console.log('🎭 Demo mode: Course progress would be updated:', { userId, courseId })
      return true
    }

    try {
      const { supabase } = await import('@/lib/supabase')
      
      // Get all lessons for the course
      const { data: lessons, error: lessonsError } = await supabase
        .from('training_lessons')
        .select('id')
        .eq('course_id', courseId)

      if (lessonsError) {
        console.error('Failed to fetch lessons:', lessonsError)
        return false
      }

      // Get user's progress for all lessons
      const { data: progress, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('is_completed, time_spent')
        .eq('user_id', userId)
        .eq('course_id', courseId)

      if (progressError) {
        console.error('Failed to fetch progress:', progressError)
        return false
      }

      const totalLessons = lessons.length
      const completedLessons = progress.filter(p => p.is_completed).length
      const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
      const totalTimeSpent = progress.reduce((sum, p) => sum + (p.time_spent || 0), 0)

      // Update course progress
      const { error: updateError } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: userId,
          course_id: courseId,
          is_enrolled: true,
          overall_progress: overallProgress,
          lessons_completed: completedLessons,
          total_lessons: totalLessons,
          time_spent: totalTimeSpent,
          last_accessed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,course_id'
        })

      if (updateError) {
        console.error('Failed to update course progress:', updateError)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating course progress:', error)
      return false
    }
  }

  /**
   * Get user's progress for a specific course
   */
  async getCourseProgress(userId: string, courseId: string): Promise<CourseProgress | null> {
    if (this.isDemoMode) {
      console.log('🎭 Demo mode: Returning demo progress data')
      return demoProgress
    }

    try {
      const { supabase } = await import('@/lib/supabase')
      
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No progress found, return default
          return {
            userId,
            courseId,
            isEnrolled: false,
            overallProgress: 0,
            lessonsCompleted: 0,
            totalLessons: 0,
            timeSpent: 0,
            enrolledAt: new Date(),
            lastAccessedAt: new Date()
          }
        }
        console.error('Failed to fetch course progress:', error)
        return null
      }

      return {
        userId: data.user_id,
        courseId: data.course_id,
        isEnrolled: data.is_enrolled,
        overallProgress: data.overall_progress,
        lessonsCompleted: data.lessons_completed,
        totalLessons: data.total_lessons,
        timeSpent: data.time_spent,
        enrolledAt: new Date(data.enrolled_at),
        lastAccessedAt: new Date(data.last_accessed_at)
      }
    } catch (error) {
      console.error('Error fetching course progress:', error)
      return null
    }
  }

  /**
   * Get user's progress for all lessons in a course
   */
  async getLessonProgress(userId: string, courseId: string): Promise<LessonProgress[]> {
    if (this.isDemoMode) {
      console.log('🎭 Demo mode: Returning empty lesson progress')
      return []
    }

    try {
      const { supabase } = await import('@/lib/supabase')
      
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .order('lesson_id')

      if (error) {
        console.error('Failed to fetch lesson progress:', error)
        return []
      }

      return data.map(item => ({
        userId: item.user_id,
        courseId: item.course_id,
        lessonId: item.lesson_id,
        isCompleted: item.is_completed,
        progressPercentage: item.progress_percentage,
        timeSpent: item.time_spent,
        lastAccessedAt: new Date(item.last_accessed_at),
        completedAt: item.completed_at ? new Date(item.completed_at) : undefined
      }))
    } catch (error) {
      console.error('Error fetching lesson progress:', error)
      return []
    }
  }

  /**
   * Check and award achievements based on user actions
   */
  async checkAndAwardAchievements(userId: string, courseId: string, lessonId: string): Promise<Achievement[]> {
    if (this.isDemoMode) {
      console.log('🎭 Demo mode: Achievement check would be performed')
      return []
    }

    try {
      const { supabase } = await import('@/lib/supabase')
      
      const newAchievements: Achievement[] = []
      const now = new Date()

      // Check for lesson completion achievement
      const lessonProgress = await this.getLessonProgress(userId, courseId)
      const completedLessons = lessonProgress.filter(p => p.isCompleted).length

      if (completedLessons === 1) {
        // First lesson completed
        const achievement: Achievement = {
          id: `first_lesson_${userId}_${Date.now()}`,
          userId,
          type: 'milestone',
          title: 'First Steps',
          description: 'Completed your first lesson!',
          icon: '🎯',
          earnedAt: now,
          metadata: { lessonId, courseId }
        }
        newAchievements.push(achievement)
      }

      // Check for course completion
      const courseProgress = await this.getCourseProgress(userId, courseId)
      if (courseProgress && courseProgress.overallProgress === 100) {
        const achievement: Achievement = {
          id: `course_complete_${userId}_${courseId}_${Date.now()}`,
          userId,
          type: 'course_completed',
          title: 'Course Master',
          description: 'Completed the entire course!',
          icon: '🏆',
          earnedAt: now,
          metadata: { courseId }
        }
        newAchievements.push(achievement)
      }

      // Save achievements to database
      if (newAchievements.length > 0) {
        const { error } = await supabase
          .from('user_achievements')
          .insert(newAchievements.map(a => ({
            id: a.id,
            user_id: a.userId,
            type: a.type,
            title: a.title,
            description: a.description,
            icon: a.icon,
            earned_at: a.earnedAt.toISOString(),
            metadata: a.metadata
          })))

        if (error) {
          console.error('Failed to save achievements:', error)
        }
      }

      return newAchievements
    } catch (error) {
      console.error('Error checking achievements:', error)
      return []
    }
  }

  /**
   * Get user's achievements
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    if (this.isDemoMode) {
      console.log('🎭 Demo mode: Returning demo achievements')
      return demoAchievements
    }

    try {
      const { supabase } = await import('@/lib/supabase')
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch achievements:', error)
        return []
      }

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        type: item.type,
        title: item.title,
        description: item.description,
        icon: item.icon,
        earnedAt: new Date(item.earned_at),
        metadata: item.metadata
      }))
    } catch (error) {
      console.error('Error fetching achievements:', error)
      return []
    }
  }

  /**
   * Enroll user in a course
   */
  async enrollUserInCourse(userId: string, courseId: string): Promise<boolean> {
    if (this.isDemoMode) {
      console.log('🎭 Demo mode: User would be enrolled in course:', { userId, courseId })
      return true
    }

    try {
      const { supabase } = await import('@/lib/supabase')
      
      const { error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: userId,
          course_id: courseId,
          is_enrolled: true,
          overall_progress: 0,
          lessons_completed: 0,
          total_lessons: 0,
          time_spent: 0,
          enrolled_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,course_id'
        })

      if (error) {
        console.error('Failed to enroll user:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error enrolling user:', error)
      return false
    }
  }

  /**
   * Check if service is in demo mode
   */
  isInDemoMode(): boolean {
    return this.isDemoMode
  }
}

export const progressService = new ProgressService()
