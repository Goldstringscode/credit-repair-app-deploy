"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ChevronLeft, 
  Play, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Star, 
  Users, 
  Download, 
  FileText,
  Video,
  Target,
  Award,
  Lock,
  Loader2,
  AlertCircle,
  XCircle
} from "lucide-react"
import { toast } from "sonner"
import { trainingService, type TrainingCourse, type TrainingLesson } from "@/lib/services/training-service"
import { VideoPlayer } from "@/components/training/video-player"
import { progressTrackingService } from "@/lib/progress-tracking"
// import { QuizComponent } from "@/components/training/quiz-component"

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState<TrainingCourse | null>(null)
  const [lessons, setLessons] = useState<TrainingLesson[]>([])
  const [currentLesson, setCurrentLesson] = useState<TrainingLesson | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [enrolling, setEnrolling] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Mock user ID - in real app, get from auth context
  const userId = "550e8400-e29b-41d4-a716-446655440000"

  useEffect(() => {
    setMounted(true)
    if (courseId) {
      loadCourseData()
    }
  }, [courseId])

  // Refresh progress when page becomes visible (e.g., returning from lesson)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadCourseData()
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user-learning-progress') {
        console.log('Storage change detected, refreshing course data')
        loadCourseData()
      }
    }

    const handleLessonCompletionChange = () => {
      console.log('Lesson completion change detected, refreshing course data')
      loadCourseData()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('lessonCompletionChanged', handleLessonCompletionChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('lessonCompletionChanged', handleLessonCompletionChange)
    }
  }, [])

  const loadCourseData = async () => {
    try {
      setLoading(true)
      
      const [courseData, lessonsData] = await Promise.all([
        trainingService.getCourseById(courseId, userId),
        trainingService.getCourseLessons(courseId, userId)
      ])

      setCourse(courseData)
      setLessons(lessonsData)
      
      // Set first lesson as current if user has progress
      if (lessonsData.length > 0) {
        const firstIncompleteLesson = lessonsData.find(l => !l.userProgress?.isCompleted) || lessonsData[0]
        setCurrentLesson(firstIncompleteLesson)
      }

    } catch (error) {
      console.error("Failed to load course data:", error)
      toast.error("Failed to load course data")
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!course) return

    try {
      setEnrolling(true)
      
      const response = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enroll',
          userId,
          courseId: course.id
        })
      })

      if (response.ok) {
        toast.success("Successfully enrolled in course!")
        loadCourseData() // Refresh data
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to enroll in course")
      }
    } catch (error) {
      console.error("Failed to enroll:", error)
      toast.error("Failed to enroll in course")
    } finally {
      setEnrolling(false)
    }
  }

  const handleLessonSelect = (lesson: TrainingLesson) => {
    setCurrentLesson(lesson)
    setActiveTab("lesson")
  }

  const handleLessonComplete = () => {
    // Refresh lessons to update progress
    loadCourseData()
    toast.success("Lesson completed! 🎉")
    
    // Force a page refresh to update all progress indicators
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleProgressUpdate = (progress: number) => {
    // Update local state if needed
    console.log("Progress updated:", progress)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading course...</span>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Course not found</h3>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/dashboard/training')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Training
          </Button>
        </div>
      </div>
    )
  }

  const isEnrolled = !!course.userProgress
  const progressPercentage = course.userProgress?.progressPercentage || 0
  
  // Get real completion data from progress tracking service (only on client side)
  const userProgress = mounted ? progressTrackingService.getUserProgress() : { courses: [], lessons: [] }
  const courseProgress = userProgress.courses.find(c => c.courseId === courseId)
  const completedLessons = courseProgress?.lessonsCompleted || 0
  const totalLessons = lessons.length

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push('/dashboard/training')} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Training
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge
                variant={
                  course.level === "Beginner"
                    ? "secondary"
                    : course.level === "Intermediate"
                      ? "default"
                      : "destructive"
                }
              >
                {course.level}
              </Badge>
              {course.category && (
                <Badge variant="outline">{course.category.name}</Badge>
              )}
              {course.isFeatured && (
                <Badge variant="default" className="bg-yellow-600">
                  Featured
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
            <p className="text-gray-600 text-lg mb-4">
              {course.description || course.shortDescription || "No description available"}
            </p>
            
            {/* Course Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{Math.round(course.durationMinutes / 60 * 10) / 10} hours</span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpen className="h-4 w-4" />
                <span>{course.lessonsCount} lessons</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{course.enrolledCount} students enrolled</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{course.rating.toFixed(1)} rating</span>
              </div>
            </div>

            {/* Progress Bar */}
            {isEnrolled && (
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Course Progress</span>
                  <span>{courseProgress?.overallProgress || 0}%</span>
                </div>
                <Progress value={courseProgress?.overallProgress || 0} className="h-2" />
                <div className="text-sm text-gray-600">
                  {completedLessons} of {totalLessons} lessons completed
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {!isEnrolled ? (
                <Button 
                  onClick={handleEnroll} 
                  disabled={enrolling}
                  size="lg"
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Enroll Now
                    </>
                  )}
                </Button>
              ) : (
                <Button size="lg" onClick={() => setActiveTab("lesson")}>
                  <Play className="h-4 w-4 mr-2" />
                  Continue Learning
                </Button>
              )}
              
              {course.previewVideoUrl && (
                <Button variant="outline" size="lg">
                  <Video className="h-4 w-4 mr-2" />
                  Preview Course
                </Button>
              )}
            </div>
          </div>

          {/* Course Thumbnail */}
          {course.thumbnailUrl && (
            <div className="ml-8">
              <img 
                src={course.thumbnailUrl} 
                alt={course.title}
                className="w-48 h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Course Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="lesson" disabled={!isEnrolled}>Lesson</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Course Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {course.description || "This course provides comprehensive training on the subject matter."}
                </p>
                
                {course.instructorName && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Instructor</h4>
                    <p className="text-gray-600">{course.instructorName}</p>
                    {course.instructorBio && (
                      <p className="text-gray-500 text-sm mt-1">{course.instructorBio}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Features */}
            <Card>
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Comprehensive understanding of the subject</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Practical skills and techniques</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Real-world applications</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Certificate upon completion</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Course Tags */}
          {course.tags && course.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Course Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Curriculum Tab */}
        <TabsContent value="curriculum" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
              <p className="text-sm text-gray-600">
                {totalLessons} lessons • {Math.round(course.durationMinutes / 60 * 10) / 10} hours total
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lessons.map((lesson, index) => {
                  // Check completion status from progress tracking service (only on client side)
                  const isLessonCompleted = mounted ? (() => {
                    const lessonProgress = userProgress.lessons.find(l => l.lessonId === lesson.id)
                    return lessonProgress?.completed || false
                  })() : false
                  
                  return (
                    <div
                      key={lesson.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isLessonCompleted 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isLessonCompleted 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {isLessonCompleted ? '✓' : index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{lesson.title}</h4>
                            {isLessonCompleted && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{lesson.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {lesson.contentType}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {lesson.durationMinutes} min
                            </span>
                            {lesson.isFree && (
                              <Badge variant="secondary" className="text-xs">
                                Free
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isEnrolled ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLessonSelect(lesson)}
                          >
                            {isLessonCompleted ? 'Review' : 'Start'}
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            <Lock className="h-3 w-3 mr-1" />
                            Locked
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lesson Tab */}
        <TabsContent value="lesson" className="space-y-4">
          {!isEnrolled ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Enroll to Access Lessons</h3>
                <p className="text-gray-600 mb-4">You need to enroll in this course to access the lessons.</p>
                <Button onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Enroll Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : !currentLesson ? (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Lesson Selected</h3>
                <p className="text-gray-600">Please select a lesson from the curriculum to begin learning.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 -m-4 p-6 space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("curriculum")}
                    className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Curriculum
                  </Button>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2">
                      {currentLesson.title}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">{currentLesson.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="font-semibold bg-blue-100 text-blue-700 border-blue-200">
                    {currentLesson.contentType}
                  </Badge>
                  <Badge variant="secondary" className="font-semibold bg-green-100 text-green-700 border-green-200">
                    {currentLesson.durationMinutes} min
                  </Badge>
                </div>
              </div>

              {/* Lesson Content */}
              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-xl font-bold">🎥 {currentLesson.contentType === 'video' ? 'Video' : '📚'} Lesson</span>
                    <div className="flex items-center space-x-2 text-blue-100">
                      <Clock className="h-5 w-5" />
                      <span className="font-semibold">{currentLesson.durationMinutes} min</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Lesson Content */}
                  {currentLesson.contentType === 'video' && currentLesson.videoUrl ? (
                    <VideoPlayer
                      videoUrl={currentLesson.videoUrl}
                      lessonTitle={currentLesson.title}
                      lessonDuration={currentLesson.durationMinutes * 60}
                      lessonId={currentLesson.id}
                      courseId={course.id}
                      onProgressUpdate={handleProgressUpdate}
                      onComplete={handleLessonComplete}
                      initialProgress={mounted ? (() => {
                        const currentLessonProgress = userProgress.lessons.find(l => l.lessonId === currentLesson.id)
                        return currentLessonProgress?.currentTime ? 
                          (currentLessonProgress.currentTime / (currentLesson.durationMinutes * 60)) * 100 : 0
                      })() : 0}
                      isCompleted={mounted ? (() => {
                        const currentLessonProgress = userProgress.lessons.find(l => l.lessonId === currentLesson.id)
                        return currentLessonProgress?.completed || false
                      })() : false}
                    />
                  ) : currentLesson.contentType === 'text' ? (
                    <div className="prose max-w-none py-6">
                      <div dangerouslySetInnerHTML={{ __html: currentLesson.content || 'No content available' }} />
                    </div>
                  ) : currentLesson.contentType === 'quiz' ? (
                    <div className="text-center py-12">
                      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz Component</h3>
                      <p className="text-gray-600">Quiz functionality will be implemented here.</p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Content</h3>
                      <p className="text-gray-600">Interactive lesson content will be displayed here.</p>
                    </div>
                  )}

                  {/* Completion Action Buttons */}
                  <div className="mt-6 flex justify-center">
                    {mounted && (() => {
                      const currentLessonProgress = userProgress.lessons.find(l => l.lessonId === currentLesson.id)
                      const isCompleted = currentLessonProgress?.completed || false
                      
                      return isCompleted ? (
                        <Button
                          onClick={() => {
                            // Mark as incomplete
                            progressTrackingService.updateLessonProgress(
                              currentLesson.id,
                              0,
                              false,
                              courseId,
                              currentLesson.title,
                              currentLesson.durationMinutes * 60
                            )
                            handleLessonComplete() // Refresh the page
                          }}
                          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-12 py-4 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                          size="lg"
                        >
                          <XCircle className="h-6 w-6 mr-3" />
                          Unmark as Complete
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            // Mark as complete
                            progressTrackingService.updateLessonProgress(
                              currentLesson.id,
                              currentLesson.durationMinutes * 60,
                              true,
                              courseId,
                              currentLesson.title,
                              currentLesson.durationMinutes * 60
                            )
                            handleLessonComplete() // Refresh the page
                          }}
                          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-12 py-4 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                          size="lg"
                        >
                          <CheckCircle className="h-6 w-6 mr-3" />
                          Mark as Complete
                        </Button>
                      )
                    })()}
                  </div>

                  {/* Navigation */}
                  <div className="mt-8 flex justify-between items-center pt-6 border-t">
                    <Button
                      variant="outline"
                      disabled={lessons.indexOf(currentLesson) === 0}
                      onClick={() => {
                        const currentIndex = lessons.indexOf(currentLesson)
                        if (currentIndex > 0) {
                          setCurrentLesson(lessons[currentIndex - 1])
                        }
                      }}
                      className="flex items-center space-x-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous Lesson
                    </Button>
                    
                    <div className="text-sm text-gray-600">
                      Lesson {lessons.indexOf(currentLesson) + 1} of {lessons.length}
                    </div>
                    
                    <Button
                      variant="outline"
                      disabled={lessons.indexOf(currentLesson) === lessons.length - 1}
                      onClick={() => {
                        const currentIndex = lessons.indexOf(currentLesson)
                        if (currentIndex < lessons.length - 1) {
                          setCurrentLesson(lessons[currentIndex + 1])
                        }
                      }}
                      className="flex items-center space-x-2"
                    >
                      Next Lesson
                      <ChevronLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Completion Status */}
              {mounted && (() => {
                const currentLessonProgress = userProgress.lessons.find(l => l.lessonId === currentLesson.id)
                const isCompleted = currentLessonProgress?.completed || false
                
                return isCompleted && (
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
                        {lessons.indexOf(currentLesson) < lessons.length - 1 ? (
                          <Button
                            onClick={() => {
                              const currentIndex = lessons.indexOf(currentLesson)
                              setCurrentLesson(lessons[currentIndex + 1])
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Continue to Next Lesson
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setActiveTab("overview")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Back to Course Overview
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab("curriculum")}
                        >
                          View All Lessons
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}
            </div>
          )}
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Course Materials</h4>
                      <p className="text-sm text-gray-600">Downloadable resources and materials</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium">Certificate</h4>
                      <p className="text-sm text-gray-600">Earn your completion certificate</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled={!isEnrolled}>
                    {isEnrolled ? 'View' : 'Enroll to Access'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
