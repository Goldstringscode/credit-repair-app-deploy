"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { 
  Play, 
  Pause, 
  RotateCcw, 
  BookOpen, 
  Clock, 
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Edit3
} from "lucide-react"
import { progressTrackingService } from "@/lib/progress-tracking"
import { VideoPlayer } from "@/components/training/video-player"
import { useRouter } from "next/navigation"
import { courseLessons } from "@/lib/course-lessons"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/lib/notification-context"

export default function LessonPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addNotification } = useNotifications()
  
  const courseId = params.courseId as string
  const lessonId = params.lessonId as string
  const resumeTime = searchParams.get('t') ? parseInt(searchParams.get('t')!) : 0

  const [currentTime, setCurrentTime] = useState(resumeTime)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [notes, setNotes] = useState<string[]>([])
  const [newNote, setNewNote] = useState("")
  const [showNotes, setShowNotes] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [userProgress, setUserProgress] = useState<any>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { toast } = useToast()

  // Simple function to get lesson completion status
  const getLessonCompletionStatus = (lessonId: string): boolean => {
    if (!userProgress) return false
    const lessonProgress = userProgress.lessons.find((l: any) => l.lessonId === lessonId)
    return lessonProgress?.completed || false
  }

  // Simple function to refresh progress data
  const refreshProgress = useCallback(async () => {
    try {
      const res = await fetch(`/api/training/progress?courseId=${courseId}`)
      if (res.ok) {
        const json = await res.json()
        const lessons: Array<{ lessonId: string; isCompleted: boolean; videoProgressSeconds: number }> = json.data ?? []
        // Hydrate local state from API data
        const completed = new Set(lessons.filter((l: any) => l.isCompleted || l.is_completed).map((l: any) => l.lessonId || l.lesson_id))
        setIsCompleted(completed.has(lessonId))
        // Mirror to localStorage as write-through cache for offline resilience
        if (typeof window !== 'undefined') {
          const progressObj = { lessons: lessons.map((l: any) => ({ lessonId: l.lessonId || l.lesson_id, completed: l.isCompleted || l.is_completed, currentTime: l.videoProgressSeconds || l.video_progress_seconds || 0 })) }
          localStorage.setItem('userProgress', JSON.stringify(progressObj))
          setUserProgress(progressObj)
        }
      }
    } catch (err) {
      console.error('refreshProgress: API fetch failed, falling back to localStorage', err)
      // Fallback: read from localStorage
      const progress = progressTrackingService.getUserProgress()
      setUserProgress(progress)
    }
    setRefreshTrigger(prev => prev + 1)
  }, [courseId, lessonId])

  // Simple function to update lesson progress
  const updateLessonProgress = (lessonId: string, currentTime: number, completed: boolean = false) => {
    progressTrackingService.updateLessonProgress(
      lessonId, 
      currentTime, 
      completed, 
      courseId, 
      lessonData.title, 
      duration
    )
    refreshProgress() // Immediately refresh the UI
  }

  // Get course lessons and current lesson data
  const lessons = courseLessons[courseId] || []
  const currentLessonIndex = lessons.findIndex(lesson => lesson.id === lessonId)
  const currentLesson = lessons[currentLessonIndex]
  const previousLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null

  // Enhanced lesson data with course context
  const lessonData = currentLesson ? {
    id: currentLesson.id,
    title: currentLesson.title,
    description: currentLesson.content,
    videoUrl: "demo", // Use demo mode for all lessons
    duration: parseInt(currentLesson.duration) * 60, // Convert minutes to seconds
    courseId: courseId,
    tags: ["Credit Report", "Basics", "FICO"],
    type: currentLesson.type
  } : {
    id: lessonId,
    title: "Understanding Your Credit Report",
    description: "Learn the fundamentals of credit reports and how to read them effectively.",
    videoUrl: "demo",
    duration: 1200, // 20 minutes in seconds
    courseId: courseId,
    tags: ["Credit Report", "Basics", "FICO"],
    type: "video"
  }

  useEffect(() => {
    setMounted(true)
    
    // Set initial time from resume parameter
    if (resumeTime > 0) {
      setCurrentTime(resumeTime)
    }

    // Load initial progress data
    refreshProgress()
  }, [lessonId, resumeTime, refreshProgress])

  // Load progress data when userProgress is available
  useEffect(() => {
    if (userProgress && mounted) {
      // Load existing notes
      const existingNotes = userProgress.lessons.find((l: any) => l.lessonId === lessonId)?.notes || []
      setNotes(existingNotes)

      // Check if lesson is already completed
      const lessonProgress = userProgress.lessons.find((l: any) => l.lessonId === lessonId)
      if (lessonProgress?.completed) {
        setIsCompleted(true)
      }
    }
  }, [userProgress, lessonId, mounted, refreshTrigger])

  // Refresh progress when page becomes visible (e.g., returning from another lesson)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshProgress()
      }
    }

    // Listen for lesson completion changes (fired by ProgressSyncManager after API call)
    const handleLessonCompletionChange = () => {
      refreshProgress()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('lessonCompletionChanged', handleLessonCompletionChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('lessonCompletionChanged', handleLessonCompletionChange)
    }
  }, [lessonId, refreshProgress])

  // Force re-render when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      const currentCompletionStatus = getLessonCompletionStatus(lessonId)
      if (currentCompletionStatus !== isCompleted) {
        setIsCompleted(currentCompletionStatus)
      }
    }
  }, [refreshTrigger, lessonId, isCompleted, getLessonCompletionStatus])

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time)
    // Update progress every 10 seconds
    if (time % 10 === 0) {
      updateLessonProgress(lessonId, time, false)
    }
  }

  const handleVideoEnd = async () => {
    setIsCompleted(true)
    updateLessonProgress(lessonId, duration, true)
    
    // Send notification
    try {
      await addNotification({
        title: "Lesson Completed! 🎉",
        message: `Great job completing "${lessonData.title}" in Training Course. You earned 50 points!`,
        type: "success",
        priority: "medium",
        read: false,
        actions: [
          {
            label: "View Progress",
            action: "view_progress",
            variant: "default"
          }
        ]
      })
    } catch (error) {
      console.error('Failed to send lesson completion notification:', error)
    }
  }

  const handleMarkComplete = async () => {
    setIsCompleted(true)
    updateLessonProgress(lessonId, currentTime, true)
    
    // Send notification
    try {
      await addNotification({
        title: "Lesson Completed! 🎉",
        message: `Great job completing "${lessonData.title}" in Training Course. You earned 50 points!`,
        type: "success",
        priority: "medium",
        read: false,
        actions: [
          {
            label: "View Progress",
            action: "view_progress",
            variant: "default"
          }
        ]
      })
    } catch (error) {
      console.error('Failed to send lesson completion notification:', error)
    }
    
    // Show success toast
    toast({
      title: "Lesson Completed! 🎉",
      description: `"${lessonData.title}" has been marked as complete. Great job!`,
      duration: 5000,
    })
  }

  const handleMarkIncomplete = () => {
    setIsCompleted(false)
    updateLessonProgress(lessonId, currentTime, false)
    
    // Show success toast
    toast({
      title: "Lesson Marked as Incomplete",
      description: `"${lessonData.title}" has been marked as incomplete. You can complete it again when ready.`,
      duration: 5000,
    })
  }

  const addNote = () => {
    if (newNote.trim()) {
      const updatedNotes = [...notes, newNote.trim()]
      setNotes(updatedNotes)
      setNewNote("")
      // Note: We'll need to add this to the progress context later
    }
  }

  const addBookmark = () => {
    // Note: We'll need to add this to the progress context later
    // Show feedback
    const bookmarkTime = Math.floor(currentTime / 60) + ":" + (currentTime % 60).toString().padStart(2, '0')
    alert(`Bookmark added at ${bookmarkTime}`)
  }

  // Navigation functions
  const handlePreviousLesson = () => {
    if (previousLesson) {
      // Save current progress before navigating
      updateLessonProgress(lessonId, currentTime, isCompleted)
      router.push(`/dashboard/training/courses/${courseId}/lessons/${previousLesson.id}`)
    }
  }

  const handleNextLesson = () => {
    if (nextLesson) {
      // Save current progress before navigating
      updateLessonProgress(lessonId, currentTime, isCompleted)
      router.push(`/dashboard/training/courses/${courseId}/lessons/${nextLesson.id}`)
    } else {
      // Course completed - redirect to course page
      router.push(`/dashboard/training/courses/${courseId}`)
    }
  }

  const handleContinueLearning = () => {
    // Get the current lesson progress
    const lessonProgress = userProgress?.lessons.find((l: any) => l.lessonId === lessonId)
    
    if (lessonProgress && lessonProgress.currentTime > 0) {
      router.push(`/dashboard/training/courses/${courseId}/lessons/${lessonId}?t=${Math.round(lessonProgress.currentTime)}`)
    } else {
      router.push(`/dashboard/training/courses/${courseId}/lessons/${lessonId}`)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // Show loading state until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-lg">Loading lesson...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Course
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2">
                {lessonData.title}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">{lessonData.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {lessonData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="font-semibold bg-blue-100 text-blue-700 border-blue-200">
                {tag}
              </Badge>
            ))}
          </div>
      </div>

        {/* Video Player */}
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="flex items-center justify-between">
              <span className="text-xl font-bold">🎥 Video Lesson</span>
              <div className="flex items-center space-x-2 text-blue-100">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
            </CardTitle>
          </CardHeader>
        <CardContent>
          {/* Actual Video Player - Only render when mounted to prevent hydration issues */}
          {mounted ? (
            <VideoPlayer
              videoUrl={lessonData.videoUrl}
              lessonId={lessonId}
              courseId={courseId}
              lessonTitle={lessonData.title}
              lessonDescription={lessonData.description}
              lessonDuration={lessonData.duration}
              onProgressUpdate={handleTimeUpdate}
              onComplete={handleVideoEnd}
              initialProgress={resumeTime > 0 ? (resumeTime / lessonData.duration) * 100 : 0}
              isCompleted={isCompleted}
            />
          ) : (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading video player...</p>
              </div>
            </div>
          )}

          {/* Resume Info */}
          {resumeTime > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700">
                <CheckCircle className="h-4 w-4 inline mr-2" />
                Resumed from where you left off: {formatTime(resumeTime)}
      </div>
    </div>
          )}

          {/* Completion Action Buttons */}
          <div className="mt-6 flex justify-center">
            {!isCompleted ? (
              <Button
                onClick={handleMarkComplete}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-12 py-4 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <CheckCircle className="h-6 w-6 mr-3" />
                Mark as Complete
              </Button>
            ) : (
              <Button
                onClick={handleMarkIncomplete}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-12 py-4 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <XCircle className="h-6 w-6 mr-3" />
                Unmark as Complete
              </Button>
            )}
          </div>

          {/* Completion Status */}
          {isCompleted && (
            <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border-2 border-green-200">
              <div className="flex items-center justify-center text-green-700">
                <CheckCircle className="h-6 w-6 mr-3" />
                <span className="text-xl font-bold">Lesson Completed! 🎉</span>
      </div>
    </div>
          )}
        </CardContent>
      </Card>

      {/* Lesson Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Lesson Content</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3>What You'll Learn</h3>
                <ul>
                  <li>How to read and understand your credit report</li>
                  <li>Key components of credit reports</li>
                  <li>Common errors and how to spot them</li>
                  <li>Understanding credit scores and factors</li>
                </ul>
                
                <h3>Key Takeaways</h3>
                <p>
                  Your credit report is a detailed record of your credit history. Understanding 
                  how to read it is crucial for maintaining good credit and identifying potential 
                  errors that could affect your score.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Course Progress */}
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6" />
                <span className="text-lg font-bold">Course Progress</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  Lesson {currentLessonIndex + 1} of {lessons.length}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${mounted ? (() => {
                      const completedLessons = lessons.filter(lesson => getLessonCompletionStatus(lesson.id)).length
                      return (completedLessons / lessons.length) * 100
                    })() : 0}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {mounted ? (() => {
                    const completedLessons = lessons.filter(lesson => getLessonCompletionStatus(lesson.id)).length
                    return Math.round((completedLessons / lessons.length) * 100)
                  })() : 0}% Complete
                </div>
                <div className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                  📚 Lessons Completed: {mounted ? lessons.filter(lesson => getLessonCompletionStatus(lesson.id)).length : 0}/{lessons.length}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lesson List */}
          <Card key={refreshTrigger} className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardTitle className="text-lg font-bold">📚 Course Lessons</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {lessons.map((lesson, index) => {
                  // Check if this lesson is completed using the global context
                  const isLessonCompleted = getLessonCompletionStatus(lesson.id)
                  
                  // Enhanced debug logging for all lessons
                  console.log(`=== SIDEBAR RENDER - Lesson ${lesson.id} ===`, {
                    isLessonCompleted,
                    refreshTrigger,
                    mounted,
                    index
                  })

                    return (
                    <div
                      key={`${lesson.id}-${refreshTrigger}-${isLessonCompleted}`}
                      className={`p-2 rounded-lg cursor-pointer transition-colors ${
                        lesson.id === lessonId
                          ? 'bg-blue-100 border border-blue-300'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => router.push(`/dashboard/training/courses/${courseId}/lessons/${lesson.id}`)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          lesson.id === lessonId
                            ? 'bg-blue-600 text-white'
                            : isLessonCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {isLessonCompleted ? '✓' : index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{lesson.title}</div>
                          <div className="text-xs text-gray-500">{lesson.duration}</div>
                          </div>
                        {isLessonCompleted && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      </div>
                    )
                  })}
                  </div>
              </CardContent>
            </Card>

          {/* Notes */}
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Edit3 className="h-6 w-6" />
                  <span className="text-lg font-bold">📝 My Notes</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-white hover:bg-white/20"
                >
                  {showNotes ? 'Hide' : 'Show'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showNotes ? (
                <div className="space-y-3">
                  {mounted && notes.map((note, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                      {note}
                    </div>
                  ))}
                  
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button onClick={addNote} size="sm" className="w-full">
                      Add Note
            </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <Edit3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Click to view and add notes</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
              <CardTitle className="text-lg font-bold">🧭 Lesson Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handlePreviousLesson}
                disabled={!previousLesson}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {previousLesson ? `Previous: ${previousLesson.title}` : 'No Previous Lesson'}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleNextLesson}
                disabled={!nextLesson}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                {nextLesson ? `Next: ${nextLesson.title}` : 'Course Complete'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Completion */}
      {isCompleted && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-semibold text-green-900 mb-2">
              Lesson Completed! 🎉
            </h3>
            <p className="text-green-700 mb-4">
              Great job! You've completed this lesson. Your progress has been saved.
            </p>
            <div className="flex space-x-3 justify-center">
              {nextLesson ? (
                <Button
                  onClick={handleNextLesson}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Continue to Next Lesson
                </Button>
              ) : (
                <Button
                  onClick={() => router.push(`/dashboard/training/courses/${courseId}`)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Back to Course
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/training/courses/${courseId}`)}
              >
                View All Lessons
              </Button>
            </div>
            </CardContent>
          </Card>
      )}
      </div>
    </div>
  )
}
