"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Play, 
  Pause, 
  SkipForward, 
  Rewind, 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp,
  CheckCircle,
  Star,
  Award,
  Zap
} from "lucide-react"

interface ProgressTrackerProps {
  userId: string
  courseId: string
  onProgressUpdate?: (progress: number) => void
}

interface LessonProgress {
  id: string
  title: string
  completed: boolean
  timeSpent: number
  lastAccessed: Date
}

interface CourseProgress {
  overallProgress: number
  lessonsCompleted: number
  totalLessons: number
  timeSpent: number
  currentLesson: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
}

export function ProgressTracker({ userId, courseId, onProgressUpdate }: ProgressTrackerProps) {
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null)
  const [lessons, setLessons] = useState<LessonProgress[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    loadProgress()
  }, [userId, courseId])

  const loadProgress = async () => {
    try {
      setLoading(true)
      
      // Mock data for demo
      const mockProgress: CourseProgress = {
        overallProgress: 65,
        lessonsCompleted: 3,
        totalLessons: 5,
        timeSpent: 1800,
        currentLesson: "Understanding Your Credit Report"
      }
      
      const mockLessons: LessonProgress[] = [
        {
          id: "lesson-1",
          title: "Understanding Your Credit Report",
          completed: true,
          timeSpent: 600,
          lastAccessed: new Date(Date.now() - 86400000)
        },
        {
          id: "lesson-2",
          title: "Credit Score Basics",
          completed: true,
          timeSpent: 450,
          lastAccessed: new Date(Date.now() - 172800000)
        },
        {
          id: "lesson-3",
          title: "Building Good Credit Habits",
          completed: true,
          timeSpent: 750,
          lastAccessed: new Date(Date.now() - 259200000)
        },
        {
          id: "lesson-4",
          title: "Disputing Errors",
          completed: false,
          timeSpent: 0,
          lastAccessed: new Date()
        },
        {
          id: "lesson-5",
          title: "Advanced Credit Strategies",
          completed: false,
          timeSpent: 0,
          lastAccessed: new Date()
        }
      ]
      
      const mockAchievements: Achievement[] = [
        {
          id: "first-lesson",
          title: "First Steps",
          description: "Completed your first lesson",
          icon: "🎯",
          unlocked: true,
          unlockedAt: new Date(Date.now() - 86400000)
        },
        {
          id: "halfway",
          title: "Halfway There",
          description: "Completed 50% of the course",
          icon: "⭐",
          unlocked: true,
          unlockedAt: new Date(Date.now() - 172800000)
        },
        {
          id: "quiz-master",
          title: "Quiz Master",
          description: "Passed all quizzes with flying colors",
          icon: "🧠",
          unlocked: false
        },
        {
          id: "completion",
          title: "Course Champion",
          description: "Completed the entire course",
          icon: "🏆",
          unlocked: false
        }
      ]
      
      setCourseProgress(mockProgress)
      setLessons(mockLessons)
      setAchievements(mockAchievements)
      setIsEnrolled(true)
      
      if (onProgressUpdate) {
        onProgressUpdate(mockProgress.overallProgress)
      }
    } catch (error) {
      console.error('Failed to load progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const enrollInCourse = async () => {
    try {
      // Mock enrollment
      setIsEnrolled(true)
      console.log('Enrolled in course:', courseId)
    } catch (error) {
      console.error('Failed to enroll:', error)
    }
  }

  const startLesson = (lessonId: string) => {
    console.log('Starting lesson:', lessonId)
    // In a real app, this would navigate to the lesson
  }

  const continueLesson = (lessonId: string) => {
    console.log('Continuing lesson:', lessonId)
    // In a real app, this would resume the lesson
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Loading Progress...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isEnrolled) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            <span>Enroll in Course</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Ready to Start Learning?</h3>
          <p className="text-gray-600 mb-6">Enroll in this course to track your progress and earn achievements</p>
          <Button onClick={enrollInCourse} className="bg-green-600 hover:bg-green-700">
            <BookOpen className="h-4 w-4 mr-2" />
            Enroll Now
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!courseProgress) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-8 text-gray-500">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p>No progress data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Progress Overview */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Course Progress</span>
            <Badge variant="secondary" className="ml-2">{courseProgress.overallProgress}% Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${courseProgress.overallProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{courseProgress.lessonsCompleted} of {courseProgress.totalLessons} lessons completed</span>
              <span>{Math.round(courseProgress.timeSpent / 60)} minutes spent</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Lesson */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-green-600" />
            <span>Current Lesson</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{courseProgress.currentLesson}</div>
                <div className="text-sm text-gray-600">Ready to continue learning</div>
              </div>
            </div>
            <Button onClick={() => continueLesson(courseProgress.currentLesson)} className="bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lessons List */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            <span>Course Lessons</span>
            <Badge variant="secondary" className="ml-2">{lessons.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    lesson.completed ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {lesson.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <span className="text-sm font-semibold text-gray-600">{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{lesson.title}</div>
                    <div className="text-sm text-gray-600">
                      {lesson.completed ? 'Completed' : 'Not started'} • {Math.round(lesson.timeSpent / 60)}m
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {lesson.completed ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startLesson(lesson.id)}
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <span>Achievements</span>
            <Badge variant="secondary" className="ml-2">
              {achievements.filter(a => a.unlocked).length} of {achievements.length} unlocked
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl border transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    achievement.unlocked ? 'bg-yellow-100' : 'bg-gray-200'
                  }`}>
                    <span className="text-2xl">{achievement.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${
                      achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {achievement.title}
                    </div>
                    <div className={`text-sm ${
                      achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {achievement.description}
                    </div>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="text-xs text-yellow-600 mt-1">
                        Unlocked {achievement.unlockedAt.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {achievement.unlocked && (
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-yellow-600" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
              <BookOpen className="h-4 w-4 mr-2" />
              View All Lessons
            </Button>
            <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
              <Target className="h-4 w-4 mr-2" />
              Set Goals
            </Button>
            <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
