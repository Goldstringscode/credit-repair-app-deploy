"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubscriptionGate } from "@/components/subscription-gate"
import { mockUserSubscription } from "@/lib/subscription"
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
import { progressTrackingService } from "@/lib/progress-tracking"
import { useToast } from "@/hooks/use-toast"
import { VideoPlayer } from "@/components/training/video-player"

export default function AdvancedDisputesCoursePage() {
  const router = useRouter()
  const [currentLesson, setCurrentLesson] = useState(1)
  const [mounted, setMounted] = useState(false)
  const [userProgress, setUserProgress] = useState<any>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  // Progress tracking functions
  const refreshProgress = () => {
    const progress = progressTrackingService.getUserProgress()
    console.log('Advanced Disputes: Refreshing progress, got:', progress)
    setUserProgress(progress)
    setRefreshTrigger(prev => prev + 1)
    console.log('Advanced Disputes: Progress refreshed, trigger updated')
  }

  const getLessonCompletionStatus = (lessonId: string): boolean => {
    if (!userProgress) {
      console.log(`Advanced Disputes: No userProgress for lesson ${lessonId}`)
      return false
    }
    const lessonProgress = userProgress.lessons.find((l: any) => l.lessonId === lessonId && l.courseId === 'advanced-disputes')
    console.log(`Advanced Disputes: Lesson ${lessonId} completion status:`, lessonProgress?.completed || false)
    return lessonProgress?.completed || false
  }

  const updateLessonProgress = (lessonId: string, currentTime: number, completed: boolean = false) => {
    progressTrackingService.updateLessonProgress(
      lessonId, 
      currentTime, 
      completed, 
      'advanced-disputes', 
      courseData.lessons[currentLesson - 1]?.title || `Lesson ${currentLesson}`, 
      720 // Default 12 minutes
    )
    refreshProgress()
    console.log(`Updated lesson ${lessonId}:`, { currentTime, completed, courseId: 'advanced-disputes' })
  }

  const handleMarkComplete = () => {
    console.log('🚀 Advanced Disputes: handleMarkComplete called!')
    console.log('🚀 Button click detected!')
    alert('Button clicked! Function is working!')
    const lessonId = `lesson-${currentLesson}`
    const lessonTitle = courseData.lessons[currentLesson - 1]?.title || `Lesson ${currentLesson}`
    
    console.log('Advanced Disputes: Marking lesson as complete:', lessonId, lessonTitle)
    
    progressTrackingService.updateLessonProgress(
      lessonId,
      720, // Mark as completed (12 minutes)
      true,
      'advanced-disputes',
      lessonTitle,
      720
    )
    
    console.log('Advanced Disputes: Progress updated, refreshing...')
    refreshProgress()
    
    toast({
      title: "Lesson Completed! 🎉",
      description: `Great job completing "${lessonTitle}"! Your progress has been saved.`,
    })
  }

  const handleMarkIncomplete = () => {
    const lessonId = `lesson-${currentLesson}`
    const lessonTitle = courseData.lessons[currentLesson - 1]?.title || `Lesson ${currentLesson}`
    
    progressTrackingService.updateLessonProgress(
      lessonId,
      0, // Reset progress
      false,
      'advanced-disputes',
      lessonTitle,
      720
    )
    
    refreshProgress()
    toast({
      title: "Lesson Unmarked",
      description: `"${lessonTitle}" has been marked as incomplete.`,
    })
  }

  useEffect(() => {
    setMounted(true)
    refreshProgress()

    // Listen for lesson completion changes
    const handleLessonCompletionChange = () => {
      console.log('Lesson completion change detected in advanced-disputes')
      refreshProgress()
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user-learning-progress') {
        console.log('Storage change detected in advanced-disputes')
        refreshProgress()
      }
    }

    window.addEventListener('lessonCompletionChanged', handleLessonCompletionChange)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('lessonCompletionChanged', handleLessonCompletionChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const courseData = {
    id: "advanced-disputes",
    title: "Advanced Dispute Strategies",
    description: "Master advanced dispute strategies and legal techniques to maximize your credit repair success.",
    instructor: "Credit Repair Pro",
    rating: 4.9,
    students: 2847,
    difficulty: "Advanced",
    duration: "2 hours",
    lessons: [
      {
        id: 1,
        title: "Advanced Dispute Letter Strategies",
        duration: "12 min",
        completed: false,
        description: "Learn sophisticated dispute letter techniques that go beyond basic challenges.",
        content: `
          <h3>Advanced Dispute Strategies</h3>
          <p>Advanced dispute strategies involve sophisticated techniques that go beyond simple "not mine" disputes.</p>
          
          <h4>Key Advanced Techniques:</h4>
          <ul>
            <li>Procedural dispute strategies</li>
            <li>Legal precedent research</li>
            <li>Timing optimization</li>
            <li>Multiple round strategies</li>
          </ul>
          
          <h4>Procedural Disputes:</h4>
          <ul>
            <li>FCRA compliance violations</li>
            <li>Investigation procedure failures</li>
            <li>Timeline violations</li>
            <li>Documentation requirements</li>
          </ul>
        `,
      },
      {
        id: 2,
        title: "Legal Framework Mastery",
        duration: "15 min",
        completed: false,
        description: "Understand the legal foundations that support advanced dispute strategies.",
        content: `
          <h3>Legal Framework for Disputes</h3>
          <p>Understanding the legal framework is crucial for effective dispute strategies.</p>
          
          <h4>Key Legal Concepts:</h4>
          <ul>
            <li>FCRA requirements and violations</li>
            <li>FDCPA compliance issues</li>
            <li>State law variations</li>
            <li>Statute of limitations</li>
          </ul>
          
          <h4>Building Legal Cases:</h4>
          <ul>
            <li>Documentation requirements</li>
            <li>Evidence collection</li>
            <li>Legal precedent research</li>
            <li>Regulatory complaint preparation</li>
          </ul>
        `,
      },
      {
        id: 3,
        title: "Procedural Dispute Mastery",
        duration: "18 min",
        completed: false,
        description: "Master procedural disputes that focus on violations rather than accuracy.",
        content: `
          <h3>Procedural Dispute Mastery</h3>
          <p>Procedural disputes focus on violations of credit reporting laws and procedures rather than just accuracy.</p>
          
          <h4>Key Procedural Areas:</h4>
          <ul>
            <li>FCRA compliance violations</li>
            <li>Reporting timeline violations</li>
            <li>Notification requirement failures</li>
            <li>Investigation procedure violations</li>
          </ul>
          
          <h4>Common Procedural Violations:</h4>
          <ul>
            <li>Failure to provide required notices</li>
            <li>Inadequate investigation procedures</li>
            <li>Reporting beyond statute of limitations</li>
            <li>Mixing files or identity errors</li>
          </ul>
          
          <h4>Building Procedural Cases:</h4>
          <ul>
            <li>Document all communications</li>
            <li>Track response times</li>
            <li>Identify pattern violations</li>
            <li>Prepare regulatory complaints</li>
          </ul>
        `,
      },
      {
        id: 4,
        title: "Timing and Strategy Optimization",
        duration: "14 min",
        completed: false,
        description: "Learn when and how to time your disputes for maximum effectiveness.",
        content: `
          <h3>Strategic Timing for Disputes</h3>
          <p>Timing your disputes strategically can significantly improve your success rates.</p>
          
          <h4>Optimal Timing Windows:</h4>
          <ul>
            <li>End of fiscal quarters</li>
            <li>Summer vacation periods</li>
            <li>Tax season impacts</li>
          </ul>
          
          <h4>Multiple Round Strategy:</h4>
          <ul>
            <li>Space disputes appropriately</li>
            <li>Vary dispute reasons</li>
            <li>Escalate complexity over time</li>
            <li>Use different communication methods</li>
          </ul>
        `,
      },
    ],
  }

  const currentLessonData = courseData.lessons.find((lesson) => lesson.id === currentLesson)
  
  // Get real completion data from progress tracking service (only on client side)
  const completedLessons = useMemo(() => {
    if (!mounted || !userProgress) {
      console.log('Advanced Disputes: No userProgress available or not mounted')
      return 0
    }
    const courseLessons = userProgress.lessons.filter((l: any) => l.courseId === 'advanced-disputes')
    console.log('Advanced Disputes: courseLessons found:', courseLessons)
    const completed = courseLessons.filter((l: any) => l.completed)
    console.log('Advanced Disputes: completed lessons:', completed)
    return completed.length
  }, [mounted, userProgress, refreshTrigger])

  return (
    <SubscriptionGate
      requiredTier="professional"
      currentSubscription={mockUserSubscription}
      feature="Advanced Dispute Strategies Course"
    >
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
                <Badge variant="destructive" className="font-semibold">
                  Advanced
                </Badge>
                <Badge variant="outline" className="font-semibold">
                  Professional
                </Badge>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 bg-clip-text text-transparent mb-4">
                {courseData.title}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl leading-relaxed mb-6">
                Master advanced dispute strategies and legal techniques to maximize your credit repair success. 
                Learn sophisticated approaches used by professional credit repair companies.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{courseData.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{courseData.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{courseData.lessons.length} lessons</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4" />
                  <span>Certificate</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                <Lock className="h-3 w-3 mr-1" />
                PREMIUM
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="lesson">Lesson</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="border-0 bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-900">Course Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">What You'll Learn</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Advanced dispute letter strategies and legal frameworks</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Procedural vs factual dispute techniques</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Timing strategies for maximum effectiveness</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Legal precedent research and application</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Professional-grade documentation and tracking</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Course Requirements</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start space-x-2">
                          <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Completion of Credit Basics 101 course</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Professional subscription tier</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Basic understanding of credit reporting laws</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Curriculum Tab */}
              <TabsContent value="curriculum" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Course Curriculum</CardTitle>
                    <p className="text-gray-600">Complete all lessons to earn your certificate</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {courseData.lessons.map((lesson, index) => (
                        <div
                          key={lesson.id}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            currentLesson === lesson.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            setCurrentLesson(lesson.id)
                            setActiveTab("lesson")
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                mounted && getLessonCompletionStatus(`lesson-${lesson.id}`)
                                  ? 'bg-green-600 text-white'
                                  : currentLesson === lesson.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-600'
                              }`}>
                                {mounted && getLessonCompletionStatus(`lesson-${lesson.id}`) ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                                <p className="text-sm text-gray-600">{lesson.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{lesson.duration}</Badge>
                              {mounted && getLessonCompletionStatus(`lesson-${lesson.id}`) && (
                                <Badge variant="default" className="bg-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Lesson Tab */}
              <TabsContent value="lesson" className="space-y-4">
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
                          {currentLessonData?.title}
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">{currentLessonData?.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="font-semibold bg-blue-100 text-blue-700 border-blue-200">
                        Video
                      </Badge>
                      <Badge variant="secondary" className="font-semibold bg-green-100 text-green-700 border-green-200">
                        {currentLessonData?.duration}
                      </Badge>
                    </div>
                  </div>

                  {/* Lesson Content */}
                  <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-2xl">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-xl font-bold">🎥 Video Lesson</span>
                        <div className="flex items-center space-x-2 text-blue-100">
                          <Clock className="h-5 w-5" />
                          <span className="font-semibold">{currentLessonData?.duration}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Video Player */}
                      <VideoPlayer
                        videoUrl="demo"
                        lessonTitle={currentLessonData?.title || ""}
                        lessonDuration={720} // 12 minutes
                        lessonId={`lesson-${currentLesson}`}
                        courseId="advanced-disputes"
                        initialProgress={0}
                        isCompleted={mounted ? getLessonCompletionStatus(`lesson-${currentLesson}`) : false}
                        onProgressUpdate={() => {}}
                        onComplete={() => {}}
                      />

                      {/* Completion Action Buttons */}
                      <div className="mt-6 flex justify-center">
                        {mounted && (() => {
                          const lessonId = `lesson-${currentLesson}`
                          const isCompleted = getLessonCompletionStatus(lessonId)
                          
                          console.log('Advanced Disputes: Button rendering - mounted:', mounted, 'lessonId:', lessonId, 'isCompleted:', isCompleted)
                          
                          return isCompleted ? (
                            <Button
                              onClick={handleMarkIncomplete}
                              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-12 py-4 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                              size="lg"
                            >
                              <XCircle className="h-6 w-6 mr-3" />
                              Unmark as Complete
                            </Button>
                          ) : (
                            <Button
                              onClick={handleMarkComplete}
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
                          disabled={currentLesson === 1}
                          onClick={() => setCurrentLesson(currentLesson - 1)}
                          className="flex items-center space-x-2"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous Lesson
                        </Button>
                        
                        <div className="text-sm text-gray-600">
                          Lesson {currentLesson} of {courseData.lessons.length}
                        </div>
                        
                        <Button
                          variant="outline"
                          disabled={currentLesson === courseData.lessons.length}
                          onClick={() => setCurrentLesson(currentLesson + 1)}
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
                    const lessonId = `lesson-${currentLesson}`
                    const isCompleted = getLessonCompletionStatus(lessonId)
                    
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
                            {currentLesson < courseData.lessons.length ? (
                              <Button
                                onClick={() => setCurrentLesson(currentLesson + 1)}
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
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Course Resources</CardTitle>
                    <p className="text-gray-600">Downloadable materials and additional resources</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center space-x-3 mb-3">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div>
                            <h3 className="font-semibold">Dispute Letter Templates</h3>
                            <p className="text-sm text-gray-600">Professional templates for all dispute types</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center space-x-3 mb-3">
                          <Target className="h-8 w-8 text-green-600" />
                          <div>
                            <h3 className="font-semibold">Strategy Worksheets</h3>
                            <p className="text-sm text-gray-600">Planning and tracking worksheets</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Progress Card */}
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <CardTitle className="text-lg font-bold">📊 Course Progress</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold">Progress</span>
                      <span className="font-bold text-blue-600">{Math.round((completedLessons / courseData.lessons.length) * 100)}%</span>
                    </div>
                    <Progress value={(completedLessons / courseData.lessons.length) * 100} className="h-3" />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">
                      {completedLessons} of {courseData.lessons.length} lessons completed
                    </p>
                    <p className="flex items-center mt-2">
                      <Clock className="h-3 w-3 mr-1" />
                      {courseData.lessons.length * 12} min total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lessons List */}
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="text-lg font-bold">📚 Course Lessons</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {courseData.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        currentLesson === lesson.id
                          ? 'bg-blue-50 border-2 border-blue-200'
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                      onClick={() => {
                        setCurrentLesson(lesson.id)
                        setActiveTab("lesson")
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            mounted && getLessonCompletionStatus(`lesson-${lesson.id}`)
                              ? 'bg-green-600 text-white'
                              : currentLesson === lesson.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-600'
                          }`}>
                            {mounted && getLessonCompletionStatus(`lesson-${lesson.id}`) ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">{lesson.title}</div>
                            <div className="text-xs text-gray-500">{lesson.duration}</div>
                          </div>
                        </div>
                        {mounted && getLessonCompletionStatus(`lesson-${lesson.id}`) && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SubscriptionGate>
  )
}