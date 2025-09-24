"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { progressTrackingService } from "@/lib/progress-tracking"
import { notificationService } from "@/lib/notification-service"
import { useNotifications } from "@/lib/notification-context"

export default function TestCourseCompletionPage() {
  const [progress, setProgress] = useState<any>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const { addNotification } = useNotifications()

  useEffect(() => {
    loadProgress()
  }, [])

  const loadProgress = () => {
    const userProgress = progressTrackingService.getUserProgress()
    setProgress(userProgress)
    
    // Add debug info
    const debug = []
    debug.push(`Total courses: ${userProgress.courses.length}`)
    userProgress.courses.forEach(course => {
      debug.push(`${course.courseId}: ${course.overallProgress}% (${course.lessonsCompleted}/${course.totalLessons} lessons)`)
    })
    debug.push(`Total lessons: ${userProgress.lessons.length}`)
    userProgress.lessons.forEach(lesson => {
      debug.push(`  ${lesson.lessonId}: ${lesson.completed ? '✅' : '❌'} (${lesson.courseId})`)
    })
    setDebugInfo(debug)
  }

  const testCourseCompletion = (courseId: string) => {
    console.log(`Testing course completion for: ${courseId}`)
    progressTrackingService.forceCourseCompletionCheck(courseId)
  }

  const testAllCourses = () => {
    console.log('Testing all courses for completion')
    progressTrackingService.checkAllCoursesForCompletion()
  }

  const testAllCoursesCompletion = () => {
    const allCompleted = progressTrackingService.checkAllCoursesCompletion()
    console.log('All courses completed:', allCompleted)
    
    if (allCompleted) {
      console.log('🎉 All courses are completed!')
      // Manually trigger the all courses completion check
      progressTrackingService.checkAllCoursesForCompletion()
    } else {
      console.log('Not all courses are completed yet')
    }
  }

  const testDirectNotification = () => {
    console.log('Testing direct course completion notification')
    notificationService.notifyCourseCompleted('Test Course').catch(error => {
      console.error('Direct notification failed:', error)
    })
  }

  const clearLocalStorage = () => {
    localStorage.removeItem('userProgress')
    // Also clear course completion flags
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('course_completed_') || key === 'all_courses_completed') {
        localStorage.removeItem(key)
      }
    })
    console.log('Local storage and completion flags cleared')
    loadProgress()
  }

  const simulateCourseCompletion = (courseId: string) => {
    if (isSimulating) {
      console.log('⏳ Simulation already in progress, please wait...')
      return
    }
    
    setIsSimulating(true)
    console.log(`🎯 Simulating course completion for: ${courseId}`)
    
    try {
      // Get current progress
      const userProgress = progressTrackingService.getUserProgress()
      const course = userProgress.courses.find(c => c.courseId === courseId)
      
      if (!course) {
        console.error('❌ Course not found:', courseId)
        setIsSimulating(false)
        return
      }
      
      console.log('📚 Course found:', course)
      
      // Mark all lessons in the course as completed using the service
      const courseLessons = userProgress.lessons.filter(l => l.courseId === courseId)
      console.log('📖 Course lessons:', courseLessons.length)
      
      // Use the progress tracking service to update each lesson
      courseLessons.forEach(lesson => {
        console.log('✅ Updating lesson:', lesson.lessonTitle)
        progressTrackingService.updateLessonProgress(
          lesson.lessonId,
          lesson.duration || 600,
          true, // Mark as completed
          courseId,
          lesson.lessonTitle,
          lesson.duration || 600
        )
      })
      
      console.log('🎓 All lessons updated, course should be 100% complete')
      
      // Clear any existing completion flags for this course
      const notificationKey = `course_completed_${courseId}`
      localStorage.removeItem(notificationKey)
      console.log('🧹 Cleared completion flag for:', courseId)
      
      // Now trigger the course completion check
      console.log('🔍 Triggering course completion check...')
      progressTrackingService.forceCourseCompletionCheck(courseId)
      
      // Reload progress
      setTimeout(() => {
        console.log('🔄 Reloading progress...')
        loadProgress()
        setIsSimulating(false)
      }, 500)
      
    } catch (error) {
      console.error('❌ Simulation failed:', error)
      setIsSimulating(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Course Completion Test</h1>
      
      <div className="grid gap-6">
        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                  {info}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Courses Completion Status */}
        {progress && (
          <Card className={progressTrackingService.checkAllCoursesCompletion() ? "border-green-200 bg-green-50" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {progressTrackingService.checkAllCoursesCompletion() ? "🎉" : "📚"}
                All Courses Status
                {progressTrackingService.checkAllCoursesCompletion() && (
                  <Badge className="bg-green-600">ALL COMPLETED!</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {progressTrackingService.checkAllCoursesCompletion() 
                  ? "Congratulations! You have completed all available courses!" 
                  : "Complete all courses to unlock the achievement notification."
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Course Progress */}
        {progress && (
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progress.courses.map((course: any) => (
                  <div key={course.courseId} className="border p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{course.courseTitle}</h3>
                      <Badge variant={course.overallProgress >= 100 ? "default" : "secondary"}>
                        {course.overallProgress}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {course.lessonsCompleted} of {course.totalLessons} lessons completed
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button 
                        size="sm" 
                        onClick={() => testCourseCompletion(course.courseId)}
                      >
                        Test Completion
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => simulateCourseCompletion(course.courseId)}
                        disabled={isSimulating}
                      >
                        {isSimulating ? 'Simulating...' : 'Simulate Completion'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button onClick={testAllCourses}>
                Check All Courses
              </Button>
              <Button onClick={testAllCoursesCompletion} variant="outline">
                Test All Courses Completion
              </Button>
              <Button onClick={testDirectNotification} variant="outline">
                Test Direct Notification
              </Button>
              <Button onClick={loadProgress} variant="outline">
                Refresh Progress
              </Button>
              <Button onClick={clearLocalStorage} variant="destructive">
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>1. <strong>Check All Courses</strong> - Manually trigger course completion check for all courses</p>
              <p>2. <strong>Test Completion</strong> - Check if a specific course should trigger completion notification</p>
              <p>3. <strong>Simulate Completion</strong> - Mark all lessons in a course as completed to test the flow</p>
              <p>4. <strong>Test Direct Notification</strong> - Test if the notification system is working</p>
              <p>5. Check the browser console for debug logs</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
