import { neon } from "@neondatabase/serverless"

export interface TrainingCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  sortOrder: number
  createdAt: string
}

export interface TrainingCourse {
  id: string
  title: string
  description: string | null
  shortDescription: string | null
  categoryId: string | null
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  durationMinutes: number
  lessonsCount: number
  enrolledCount: number
  rating: number
  ratingCount: number
  instructorName: string | null
  instructorBio: string | null
  thumbnailUrl: string | null
  previewVideoUrl: string | null
  isPublished: boolean
  isFeatured: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  category?: TrainingCategory
  tags?: TrainingTag[]
  userProgress?: UserCourseProgress
}

export interface TrainingLesson {
  id: string
  courseId: string
  title: string
  description: string | null
  contentType: 'video' | 'text' | 'interactive' | 'quiz'
  content: string | null
  videoUrl: string | null
  durationMinutes: number
  sortOrder: number
  isFree: boolean
  createdAt: string
  updatedAt: string
  userProgress?: UserLessonProgress
  tags?: TrainingTag[]
}

export interface TrainingTag {
  id: string
  name: string
  color: string | null
  createdAt: string
}

export interface UserCourseProgress {
  id: string
  userId: string
  courseId: string
  enrolledAt: string
  startedAt: string | null
  completedAt: string | null
  progressPercentage: number
  lastAccessedAt: string
}

export interface UserLessonProgress {
  id: string
  userId: string
  lessonId: string
  courseId: string
  startedAt: string
  completedAt: string | null
  watchTimeSeconds: number
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface TrainingQuiz {
  id: string
  courseId: string
  lessonId: string | null
  title: string
  description: string | null
  passingScore: number
  timeLimitMinutes: number | null
  isRequired: boolean
  createdAt: string
  questions?: QuizQuestion[]
}

export interface QuizQuestion {
  id: string
  quizId: string
  questionText: string
  questionType: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay'
  points: number
  sortOrder: number
  createdAt: string
  answerOptions?: QuizAnswerOption[]
}

export interface QuizAnswerOption {
  id: string
  questionId: string
  optionText: string
  isCorrect: boolean
  sortOrder: number
  createdAt: string
}

export interface UserQuizAttempt {
  id: string
  userId: string
  quizId: string
  courseId: string
  startedAt: string
  completedAt: string | null
  score: number | null
  maxScore: number | null
  passed: boolean | null
  timeTakenSeconds: number | null
  createdAt: string
}

export interface TrainingCertificate {
  id: string
  userId: string
  courseId: string
  certificateNumber: string
  issuedAt: string
  expiresAt: string | null
  pdfUrl: string | null
  verificationUrl: string | null
  createdAt: string
}

export interface TrainingAchievement {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  criteriaType: 'courses_completed' | 'lessons_completed' | 'perfect_scores' | 'streak_days' | 'custom'
  criteriaValue: number
  createdAt: string
}

export interface UserAchievement {
  id: string
  userId: string
  achievementId: string
  earnedAt: string
  achievement?: TrainingAchievement
}

export class TrainingService {
  private sql: any

  constructor() {
    console.log("🔍 TrainingService constructor called")
    const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
    console.log("🔍 Database URL found:", !!databaseUrl)
    
    if (databaseUrl) {
      try {
        this.sql = neon(databaseUrl)
        console.log("✅ TrainingService initialized with database connection")
      } catch (error) {
        console.error("❌ Error initializing neon connection:", error)
      }
    } else {
      console.warn("⚠️ Database URL not found. Training service will be limited.")
    }
  }

  // ===== CATEGORIES =====
  async getCategories(): Promise<TrainingCategory[]> {
    if (!this.sql) return []
    
    try {
      const result = await this.sql`
        SELECT 
          id, name, description, icon, color, sort_order as "sortOrder", created_at as "createdAt"
        FROM training_categories 
        ORDER BY sort_order, name
      `
      return result
    } catch (error) {
      console.error("Failed to fetch training categories:", error)
      return []
    }
  }

  // ===== COURSES =====
  async getCourses(options: {
    categoryId?: string
    level?: string
    isPublished?: boolean
    isFeatured?: boolean
    userId?: string
    limit?: number
    offset?: number
  } = {}): Promise<TrainingCourse[]> {
    console.log("🔍 getCourses called with options:", options)
    console.log("🔍 SQL connection available:", !!this.sql)
    
    if (!this.sql) {
      console.log("❌ No SQL connection available")
      return []
    }
    
    try {
      // Use template literal syntax instead of unsafe()
      let result: any[] = []
      
      if (options.isPublished !== undefined) {
        // Filter by published status
        result = await this.sql`
          SELECT 
            c.id, c.title, c.description, c.short_description as "shortDescription",
            c.category_id as "categoryId", c.level, c.duration_minutes as "durationMinutes",
            c.lessons_count as "lessonsCount", c.enrolled_count as "enrolledCount",
            c.rating, c.rating_count as "ratingCount", c.instructor_name as "instructorName",
            c.instructor_bio as "instructorBio", c.thumbnail_url as "thumbnailUrl",
            c.preview_video_url as "previewVideoUrl", c.is_published as "isPublished",
            c.is_featured as "isFeatured", c.sort_order as "sortOrder",
            c.created_at as "createdAt", c.updated_at as "updatedAt"
          FROM training_courses c
          WHERE c.is_published = ${options.isPublished}
          ORDER BY c.sort_order, c.title
        `
      } else {
        // Get all courses
        result = await this.sql`
          SELECT 
            c.id, c.title, c.description, c.short_description as "shortDescription",
            c.category_id as "categoryId", c.level, c.duration_minutes as "durationMinutes",
            c.lessons_count as "lessonsCount", c.enrolled_count as "enrolledCount",
            c.rating, c.rating_count as "ratingCount", c.instructor_name as "instructorName",
            c.instructor_bio as "instructorBio", c.thumbnail_url as "thumbnailUrl",
            c.preview_video_url as "previewVideoUrl", c.is_published as "isPublished",
            c.is_featured as "isFeatured", c.sort_order as "sortOrder",
            c.created_at as "createdAt", c.updated_at as "updatedAt"
          FROM training_courses c
          ORDER BY c.sort_order, c.title
        `
      }
      
      console.log("🔍 Query result:", result)
      
      // If user ID is provided, fetch progress for each course
      if (options.userId) {
        for (const course of result) {
          course.userProgress = await this.getUserCourseProgress(options.userId!, course.id)
        }
      }
      
      return result
    } catch (error) {
      console.error("Failed to fetch courses:", error)
      return []
    }
  }

  async getCourseById(courseId: string, userId?: string): Promise<TrainingCourse | null> {
    if (!this.sql) return null
    
    try {
      const result = await this.sql`
        SELECT 
          c.id, c.title, c.description, c.short_description as "shortDescription",
          c.category_id as "categoryId", c.level, c.duration_minutes as "durationMinutes",
          c.lessons_count as "lessonsCount", c.enrolled_count as "enrolledCount",
          c.rating, c.rating_count as "ratingCount", c.instructor_name as "instructorName",
          c.instructor_bio as "instructorBio", c.thumbnail_url as "thumbnailUrl",
          c.preview_video_url as "previewVideoUrl", c.is_published as "isPublished",
          c.is_featured as "isFeatured", c.sort_order as "sortOrder",
          c.created_at as "createdAt", c.updated_at as "updatedAt"
        FROM training_courses c
        WHERE c.id = ${courseId}
      `
      
      if (result.length === 0) return null
      
      const course = result[0]
      
      // Fetch category
      if (course.categoryId) {
        const categories = await this.getCategories()
        course.category = categories.find(c => c.id === course.categoryId)
      }
      
      return course
    } catch (error) {
      console.error("Failed to fetch course by ID:", error)
      return null
    }
  }

  async getCourseTags(courseId: string): Promise<TrainingTag[]> {
    if (!this.sql) return []
    
    try {
      const result = await this.sql`
        SELECT 
          t.id, t.name, t.color, t.created_at as "createdAt"
        FROM training_tags t
        JOIN course_tags ct ON t.id = ct.tag_id
        WHERE ct.course_id = ${courseId}
        ORDER BY t.name
      `
      
      return result
    } catch (error) {
      console.error("Failed to fetch course tags:", error)
      return []
    }
  }

  async getCourseLessons(courseId: string, userId?: string): Promise<TrainingLesson[]> {
    if (!this.sql) return []
    
    try {
      const result = await this.sql`
        SELECT 
          l.id, l.course_id as "courseId", l.title, l.description,
          l.content_type as "contentType", l.content, l.video_url as "videoUrl",
          l.duration_minutes as "durationMinutes", l.sort_order as "sortOrder",
          l.is_free as "isFree", l.created_at as "createdAt", l.updated_at as "updatedAt"
        FROM training_lessons l
        WHERE l.course_id = ${courseId}
        ORDER BY l.sort_order, l.title
      `
      
      // If user ID is provided, fetch progress for each lesson
      if (userId) {
        for (const lesson of result) {
          lesson.userProgress = await this.getUserLessonProgress(userId, lesson.id)
        }
      }
      
      return result
    } catch (error) {
      console.error("Failed to fetch course lessons:", error)
      return []
    }
  }

  async getLessons(courseId: string, userId?: string): Promise<TrainingLesson[]> {
    if (!this.sql) return []
    
    try {
      const result = await this.sql`
        SELECT 
          id, course_id as "courseId", title, description, content_type as "contentType",
          content, video_url as "videoUrl", duration_minutes as "durationMinutes",
          sort_order as "sortOrder", is_free as "isFree", created_at as "createdAt",
          updated_at as "updatedAt"
        FROM training_lessons
        WHERE course_id = ${courseId}
        ORDER BY sort_order
      `
      
      // If user ID is provided, fetch progress for each lesson
      if (userId) {
        for (const lesson of result) {
          lesson.userProgress = await this.getUserLessonProgress(userId, lesson.id)
        }
      }
      
      return result
    } catch (error) {
      console.error("Failed to fetch lessons:", error)
      return []
    }
  }

  async getUserCourseProgress(userId: string, courseId: string): Promise<UserCourseProgress | null> {
    if (!this.sql) return null
    
    try {
      const result = await this.sql`
        SELECT 
          id, user_id as "userId", course_id as "courseId", enrolled_at as "enrolledAt",
          started_at as "startedAt", completed_at as "completedAt", progress_percentage as "progressPercentage",
          last_accessed_at as "lastAccessedAt"
        FROM user_course_enrollments
        WHERE user_id = ${userId} AND course_id = ${courseId}
        LIMIT 1
      `
      
      return result.length > 0 ? result[0] : null
    } catch (error) {
      console.error("Failed to fetch user course progress:", error)
      return null
    }
  }

  async getUserLessonProgress(userId: string, lessonId: string): Promise<UserLessonProgress | null> {
    if (!this.sql) return null
    
    try {
      const result = await this.sql`
        SELECT 
          id, user_id as "userId", lesson_id as "lessonId", course_id as "courseId",
          started_at as "startedAt", completed_at as "completedAt", watch_time_seconds as "watchTimeSeconds",
          is_completed as "isCompleted", created_at as "createdAt", updated_at as "updatedAt"
        FROM user_lesson_progress
        WHERE user_id = ${userId} AND lesson_id = ${lessonId}
        LIMIT 1
      `
      
      return result.length > 0 ? result[0] : null
    } catch (error) {
      console.error("Failed to fetch user lesson progress:", error)
      return null
    }
  }

  async enrollUserInCourse(userId: string, courseId: string): Promise<boolean> {
    if (!this.sql) return false
    
    try {
      await this.sql`
        INSERT INTO user_course_enrollments (user_id, course_id, enrolled_at, started_at)
        VALUES (${userId}, ${courseId}, NOW(), NOW())
        ON CONFLICT (user_id, course_id) DO NOTHING
      `
      return true
    } catch (error) {
      console.error("Failed to enroll user in course:", error)
      return false
    }
  }

  async updateLessonProgress(
    userId: string, 
    lessonId: string, 
    courseId: string, 
    progress: any
  ): Promise<boolean> {
    if (!this.sql) return false
    
    try {
      await this.sql`
        INSERT INTO user_lesson_progress (user_id, lesson_id, course_id, started_at, watch_time_seconds, is_completed)
        VALUES (${userId}, ${lessonId}, ${courseId}, NOW(), ${progress.watchTimeSeconds || 0}, ${progress.isCompleted || false})
        ON CONFLICT (user_id, lesson_id) 
        DO UPDATE SET 
          watch_time_seconds = ${progress.watchTimeSeconds || 0},
          is_completed = ${progress.isCompleted || false},
          updated_at = NOW()
      `
      return true
    } catch (error) {
      console.error("Failed to update lesson progress:", error)
      return false
    }
  }

  async getQuizzes(courseId: string): Promise<TrainingQuiz[]> {
    if (!this.sql) return []
    
    try {
      const result = await this.sql`
        SELECT 
          id, course_id as "courseId", lesson_id as "lessonId", title, description,
          passing_score as "passingScore", time_limit_minutes as "timeLimitMinutes",
          is_required as "isRequired", created_at as "createdAt"
        FROM training_quizzes
        WHERE course_id = ${courseId}
        ORDER BY created_at
      `
      
      return result
    } catch (error) {
      console.error("Failed to fetch quizzes:", error)
      return []
    }
  }

  async getCourseQuizzes(courseId: string): Promise<TrainingQuiz[]> {
    return this.getQuizzes(courseId)
  }

  async getQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
    if (!this.sql) return []
    
    try {
      const result = await this.sql`
        SELECT 
          id, quiz_id as "quizId", question_text as "questionText", question_type as "questionType",
          points, sort_order as "sortOrder", created_at as "createdAt"
        FROM quiz_questions
        WHERE quiz_id = ${quizId}
        ORDER BY sort_order
      `
      
      // Fetch answer options for each question
      for (const question of result) {
        const options = await this.sql`
          SELECT 
            id, question_id as "questionId", option_text as "optionText", 
            is_correct as "isCorrect", sort_order as "sortOrder"
          FROM quiz_answer_options
          WHERE question_id = ${question.id}
          ORDER BY sort_order
        `
        question.answerOptions = options
      }
      
      return result
    } catch (error) {
      console.error("Failed to fetch quiz questions:", error)
      return []
    }
  }

  async submitQuizAttempt(
    userId: string,
    quizId: string,
    courseId: string,
    answers: any[],
    timeTaken: number
  ): Promise<any> {
    if (!this.sql) return null
    
    try {
      // Create quiz attempt
      const [attempt] = await this.sql`
        INSERT INTO user_quiz_attempts (user_id, quiz_id, course_id, started_at, completed_at, time_taken_seconds)
        VALUES (${userId}, ${quizId}, ${courseId}, NOW(), NOW(), ${timeTaken})
        RETURNING id
      `
      
      // Calculate score
      let score = 0
      let maxScore = 0
      
      for (const answer of answers) {
        const question = await this.sql`
          SELECT points FROM quiz_questions WHERE id = ${answer.questionId}
        `
        if (question.length > 0) {
          maxScore += question[0].points
          
          if (answer.isCorrect) {
            score += question[0].points
          }
        }
      }
      
      const passed = score >= (maxScore * 0.7) // 70% passing score
      
      // Update attempt with score
      await this.sql`
        UPDATE user_quiz_attempts 
        SET score = ${score}, max_score = ${maxScore}, passed = ${passed}
        WHERE id = ${attempt.id}
      `
      
      return {
        attemptId: attempt.id,
        score,
        maxScore,
        passed,
        percentage: Math.round((score / maxScore) * 100)
      }
    } catch (error) {
      console.error("Failed to submit quiz attempt:", error)
      return null
    }
  }

  async getUserTrainingStats(userId: string): Promise<any> {
    if (!this.sql) return {}
    
    try {
      // Get course enrollment stats
      const courseStats = await this.sql`
        SELECT 
          COUNT(*) as total_enrolled,
          COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed,
          COUNT(CASE WHEN completed_at IS NULL AND started_at IS NOT NULL THEN 1 END) as in_progress
        FROM user_course_enrollments
        WHERE user_id = ${userId}
      `
      
      // Get lesson progress stats
      const lessonStats = await this.sql`
        SELECT 
          COUNT(*) as total_lessons,
          COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_lessons,
          SUM(watch_time_seconds) as total_time
        FROM user_lesson_progress
        WHERE user_id = ${userId}
      `
      
      // Get quiz stats
      const quizStats = await this.sql`
        SELECT 
          COUNT(*) as total_attempts,
          COUNT(CASE WHEN passed = true THEN 1 END) as passed_quizzes,
          AVG(score) as avg_score,
          COUNT(CASE WHEN score = max_score THEN 1 END) as perfect_scores
        FROM user_quiz_attempts
        WHERE user_id = ${userId} AND completed_at IS NOT NULL
      `
      
      // Get certificate count
      const certificateCount = await this.sql`
        SELECT COUNT(*) as count
        FROM training_certificates
        WHERE user_id = ${userId}
      `
      
      // Get achievement count
      const achievementCount = await this.sql`
        SELECT COUNT(*) as count
        FROM user_achievements
        WHERE user_id = ${userId}
      `
      
      // Calculate current streak (simplified - you might want to implement more sophisticated logic)
      const currentStreak = 0 // TODO: Implement streak calculation
      
      return {
        totalCourses: 0, // TODO: Get from published courses
        enrolledCourses: courseStats[0]?.total_enrolled || 0,
        completedCourses: courseStats[0]?.completed || 0,
        inProgressCourses: courseStats[0]?.in_progress || 0,
        totalLessons: lessonStats[0]?.total_lessons || 0,
        completedLessons: lessonStats[0]?.completed_lessons || 0,
        totalQuizzes: quizStats[0]?.total_attempts || 0,
        passedQuizzes: quizStats[0]?.passed_quizzes || 0,
        perfectQuizScores: quizStats[0]?.perfect_scores || 0,
        certificatesEarned: certificateCount[0]?.count || 0,
        achievementsEarned: achievementCount[0]?.count || 0,
        totalLearningTime: Math.round((lessonStats[0]?.total_time || 0) / 60), // Convert to minutes
        currentStreak,
        averageScore: Math.round(quizStats[0]?.avg_score || 0)
      }
    } catch (error) {
      console.error("Failed to fetch user training stats:", error)
      return {
        totalCourses: 0,
        enrolledCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        totalLessons: 0,
        completedLessons: 0,
        totalQuizzes: 0,
        passedQuizzes: 0,
        perfectQuizScores: 0,
        certificatesEarned: 0,
        achievementsEarned: 0,
        totalLearningTime: 0,
        currentStreak: 0,
        averageScore: 0
      }
    }
  }

  // ===== CERTIFICATES =====
  async getCertificateById(certificateId: string): Promise<TrainingCertificate | null> {
    if (!this.sql) return null
    
    try {
      const result = await this.sql`
        SELECT 
          id, user_id as "userId", course_id as "courseId", certificate_number as "certificateNumber",
          issued_at as "issuedAt", expires_at as "expiresAt", pdf_url as "pdfUrl",
          verification_url as "verificationUrl", created_at as "createdAt"
        FROM training_certificates
        WHERE id = ${certificateId}
      `
      
      return result.length > 0 ? result[0] : null
    } catch (error) {
      console.error("Failed to fetch certificate by ID:", error)
      return null
    }
  }

  async getUserCertificates(userId: string): Promise<TrainingCertificate[]> {
    if (!this.sql) return []
    
    try {
      const result = await this.sql`
        SELECT 
          id, user_id as "userId", course_id as "courseId", certificate_number as "certificateNumber",
          issued_at as "issuedAt", expires_at as "expiresAt", pdf_url as "pdfUrl",
          verification_url as "verificationUrl", created_at as "createdAt"
        FROM training_certificates
        WHERE user_id = ${userId}
        ORDER BY issued_at DESC
      `
      
      return result
    } catch (error) {
      console.error("Failed to fetch user certificates:", error)
      return []
    }
  }

  async generateCertificate(userId: string, courseId: string): Promise<TrainingCertificate | null> {
    if (!this.sql) return null
    
    try {
      // Check if user has completed the course
      const courseProgress = await this.getUserCourseProgress(userId, courseId)
      if (!courseProgress || !courseProgress.completedAt) {
        return null // Course not completed
      }

      // Check if certificate already exists
      const existingCertificates = await this.getUserCertificates(userId)
      const existingCertificate = existingCertificates.find(cert => cert.courseId === courseId)
      if (existingCertificate) {
        return existingCertificate // Certificate already exists
      }

      // Generate certificate number
      const certificateNumber = `CR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      
      // Create certificate
      const [certificate] = await this.sql`
        INSERT INTO training_certificates (user_id, course_id, certificate_number, issued_at, expires_at)
        VALUES (${userId}, ${courseId}, ${certificateNumber}, NOW(), NOW() + INTERVAL '2 years')
        RETURNING 
          id, user_id as "userId", course_id as "courseId", certificate_number as "certificateNumber",
          issued_at as "issuedAt", expires_at as "expiresAt", pdf_url as "pdfUrl",
          verification_url as "verificationUrl", created_at as "createdAt"
      `
      
      return certificate
    } catch (error) {
      console.error("Failed to generate certificate:", error)
      return null
    }
  }

  // ===== ACHIEVEMENTS =====
  async checkAndAwardAchievements(userId: string): Promise<UserAchievement[]> {
    if (!this.sql) return []
    
    try {
      // Get user stats
      const stats = await this.getUserTrainingStats(userId)
      
      // Define achievement criteria
      const achievements = [
        {
          id: 'first_quiz_pass',
          name: 'First Quiz Pass',
          description: 'Passed your first quiz',
          criteriaType: 'perfect_scores' as const,
          criteriaValue: 1
        },
        {
          id: 'course_completion',
          name: 'Course Completion',
          description: 'Completed your first course',
          criteriaType: 'courses_completed' as const,
          criteriaValue: 1
        },
        {
          id: 'perfect_score',
          name: 'Perfect Score',
          description: 'Achieved a perfect score on a quiz',
          criteriaType: 'perfect_scores' as const,
          criteriaValue: 1
        }
      ]
      
      const newAchievements: UserAchievement[] = []
      
      for (const achievement of achievements) {
        // Check if user already has this achievement
        const existing = await this.sql`
          SELECT id FROM user_achievements 
          WHERE user_id = ${userId} AND achievement_id = ${achievement.id}
        `
        
        if (existing.length > 0) continue
        
        // Check if user meets criteria
        let shouldAward = false
        
        switch (achievement.criteriaType) {
          case 'courses_completed':
            shouldAward = stats.completedCourses >= achievement.criteriaValue
            break
          case 'perfect_scores':
            shouldAward = stats.perfectQuizScores >= achievement.criteriaValue
            break
          case 'lessons_completed':
            shouldAward = stats.completedLessons >= achievement.criteriaValue
            break
        }
        
        if (shouldAward) {
          // Award the achievement
          const [newAchievement] = await this.sql`
            INSERT INTO user_achievements (user_id, achievement_id, earned_at)
            VALUES (${userId}, ${achievement.id}, NOW())
            RETURNING id, user_id as "userId", achievement_id as "achievementId", earned_at as "earnedAt"
          `
          
          newAchievement.achievement = achievement
          newAchievements.push(newAchievement)
        }
      }
      
      return newAchievements
    } catch (error) {
      console.error("Failed to check and award achievements:", error)
      return []
    }
  }

  // ===== SEARCH =====
  async searchCourses(query: string, userId?: string): Promise<TrainingCourse[]> {
    if (!this.sql) return []
    
    try {
      const result = await this.sql`
        SELECT 
          c.id, c.title, c.description, c.short_description as "shortDescription",
          c.category_id as "categoryId", c.level, c.duration_minutes as "durationMinutes",
          c.lessons_count as "lessonsCount", c.enrolled_count as "enrolledCount",
          c.rating, c.rating_count as "ratingCount", c.instructor_name as "instructorName",
          c.instructor_bio as "instructorBio", c.thumbnail_url as "thumbnailUrl",
          c.preview_video_url as "previewVideoUrl", c.is_published as "isPublished",
          c.is_featured as "isFeatured", c.sort_order as "sortOrder",
          c.created_at as "createdAt", c.updated_at as "updatedAt"
        FROM training_courses c
        WHERE c.is_published = true
        AND (
          c.title ILIKE ${`%${query}%`} OR
          c.description ILIKE ${`%${query}%`} OR
          c.short_description ILIKE ${`%${query}%`}
        )
        ORDER BY c.is_featured DESC, c.rating DESC, c.enrolled_count DESC
      `
      
      // If user ID is provided, fetch progress for each course
      if (userId) {
        for (const course of result) {
          course.userProgress = await this.getUserCourseProgress(userId, course.id)
        }
      }
      
      return result
    } catch (error) {
      console.error("Failed to search courses:", error)
      return []
    }
  }
}

export const trainingService = new TrainingService()
