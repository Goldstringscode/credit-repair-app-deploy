"use client"

import { useState, useEffect } from "react"
import { VideoPlayer } from "@/components/training/video-player"
import { BasicQuiz } from "@/components/training/basic-quiz"
import { ProgressTracker } from "@/components/training/progress-tracker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  FileText,
  Download,
  ExternalLink,
  Brain
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useNotifications } from "@/lib/notification-context"

export default function DemoLessonPage() {
  const router = useRouter()
  const { addNotification } = useNotifications()
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [quizData, setQuizData] = useState<any>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  // Demo lesson data
  const lesson = {
    id: "550e8400-e29b-41d4-a716-446655440001", // UUID format
    title: "Understanding Your Credit Report",
    description: "Learn how to read and interpret your credit report to identify errors and areas for improvement.",
    duration: 720, // 12 minutes in seconds
    videoUrl: "demo" // Demo mode for testing
  }

  const handleProgressUpdate = (newProgress: number) => {
    setProgress(newProgress)
    
    // Mark as completed at 90%
    if (newProgress >= 90 && !isCompleted) {
      setIsCompleted(true)
    }
  }

  const handleComplete = async () => {
    setIsCompleted(true)
    setProgress(100)
    toast.success("Lesson completed! 🎉")
    
    // Send notification
    try {
      await addNotification({
        title: "Lesson Completed! 🎉",
        message: `Great job completing "${lesson.title}" in Credit Repair Fundamentals. You earned 50 points!`,
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

  // Mock quiz data for demo purposes
  useEffect(() => {
    const mockQuiz = {
      id: "mock-quiz-001",
      title: "Credit Report Basics Quiz",
      description: "Test your understanding of credit report fundamentals",
      passing_score: 70,
      time_limit_minutes: 10,
      questions: [
        {
          id: "q1",
          questionText: "What are the three major credit bureaus?",
          questionType: "multiple_choice",
          points: 10,
          sortOrder: 1,
          answerOptions: [
            { id: "a1", optionText: "Experian, Equifax, and TransUnion", isCorrect: true, sortOrder: 1 },
            { id: "a2", optionText: "Visa, Mastercard, and American Express", isCorrect: false, sortOrder: 2 },
            { id: "a3", optionText: "Chase, Bank of America, and Wells Fargo", isCorrect: false, sortOrder: 3 },
            { id: "a4", optionText: "FICO, VantageScore, and Credit Karma", isCorrect: false, sortOrder: 4 }
          ]
        },
        {
          id: "q2",
          questionText: "How often should you review your credit report?",
          questionType: "multiple_choice",
          points: 10,
          sortOrder: 2,
          answerOptions: [
            { id: "a5", optionText: "At least once per year", isCorrect: true, sortOrder: 1 },
            { id: "a6", optionText: "Only when applying for credit", isCorrect: false, sortOrder: 2 },
            { id: "a7", optionText: "Every 6 months", isCorrect: false, sortOrder: 3 },
            { id: "a8", optionText: "Never - it's not necessary", isCorrect: false, sortOrder: 4 }
          ]
        },
        {
          id: "q3",
          questionText: "Credit report errors can affect your credit score.",
          questionType: "true_false",
          points: 10,
          sortOrder: 3,
          answerOptions: [
            { id: "a9", optionText: "True", isCorrect: true, sortOrder: 1 },
            { id: "a10", optionText: "False", isCorrect: false, sortOrder: 2 }
          ]
        }
      ]
    }
    
    setQuizData(mockQuiz)
  }, [])

  const handleQuizComplete = async (result: any) => {
    console.log('🎯 Quiz completion triggered with result:', result)
    console.log('🎯 Result type:', typeof result)
    console.log('🎯 Result keys:', Object.keys(result || {}))
    console.log('🎯 Setting quizCompleted to true')
    
    setQuizCompleted(true)
    
    const score = result && typeof result.score === 'number' ? result.score : 85 // Default demo score
    const passed = score >= 70
    
    if (result && typeof result.score === 'number') {
      toast.success(`Quiz completed! Score: ${result.score}%`)
    } else {
      toast.success(`Quiz completed! 🎉`)
    }
    
    // Send notification
    try {
      await addNotification({
        title: passed ? "Quiz Passed! 🎯" : "Quiz Completed",
        message: `You ${passed ? 'passed' : 'completed'} "${quizData.title}" with a score of ${score}%.${passed ? ' Well done!' : ' Keep studying!'}`,
        type: passed ? "success" : "info",
        priority: passed ? "medium" : "low",
        read: false,
        actions: [
          {
            label: "View Results",
            action: "view_quiz_results",
            variant: "default"
          }
        ]
      })
    } catch (error) {
      console.error('Failed to send quiz completion notification:', error)
    }
    
    // Mock result for demo
    console.log('Quiz completed with result:', result)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <button 
            onClick={() => router.push('/dashboard/training')}
            className="hover:text-gray-700 transition-colors"
          >
            Training
          </button>
          <span>/</span>
          <button 
            onClick={() => router.push('/dashboard/training')}
            className="hover:text-gray-700 transition-colors"
          >
            Credit Repair Fundamentals
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{lesson.title}</span>
        </nav>
      </div>

      {/* Lesson Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
            <p className="text-gray-600 mb-4">{lesson.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{Math.floor(lesson.duration / 60)} minutes</span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpen className="h-4 w-4" />
                <span>Lesson 1 of 5</span>
              </div>
              {isCompleted && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="mb-8">
        <VideoPlayer
          videoUrl={lesson.videoUrl}
          lessonId={lesson.id}
          courseId="550e8400-e29b-41d4-a716-446655440002"
          lessonTitle={lesson.title}
          lessonDescription={lesson.description}
          lessonDuration={lesson.duration}
          onProgressUpdate={handleProgressUpdate}
          onComplete={handleComplete}
          initialProgress={progress}
          isCompleted={isCompleted}
        />
      </div>

      {/* Quiz Section */}
      {quizData && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span>Knowledge Check</span>
                {quizCompleted && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showQuiz ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Test your understanding of this lesson with a quick quiz.
                  </p>
                  <Button 
                    onClick={() => setShowQuiz(true)}
                    disabled={quizCompleted}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Start Quiz
                  </Button>
                </div>
              ) : (
                <BasicQuiz 
                  quizId={quizData.id}
                  questions={quizData.questions}
                  onComplete={handleQuizComplete} 
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lesson Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Lesson Content</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3>What You'll Learn</h3>
                <p>In this lesson, you'll discover the essential components of your credit report and how to interpret them effectively.</p>
                
                <h4>Key Topics Covered:</h4>
                <ul>
                  <li><strong>Personal Information:</strong> How to verify your identity details</li>
                  <li><strong>Account History:</strong> Understanding payment patterns and balances</li>
                  <li><strong>Credit Inquiries:</strong> Differentiating between hard and soft pulls</li>
                  <li><strong>Public Records:</strong> Identifying bankruptcies, liens, and judgments</li>
                  <li><strong>Error Identification:</strong> Spotting common mistakes and inaccuracies</li>
                </ul>

                <h4>Why This Matters</h4>
                <p>Your credit report is the foundation of your financial reputation. Understanding it is the first step toward improving your credit score and achieving your financial goals.</p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h5 className="text-blue-900 font-semibold mb-2">💡 Pro Tip</h5>
                  <p className="text-blue-800 text-sm">
                    Review your credit report at least once per year from each of the three major credit bureaus: Experian, Equifax, and TransUnion.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Resources */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Resources & Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">Credit Report Guide</Badge>
                <Badge variant="outline">Error Checklist</Badge>
                <Badge variant="outline">Sample Dispute Letter</Badge>
                <Badge variant="outline">FCRA Rights</Badge>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Notes
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Additional Resources
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

                 {/* Sidebar */}
         <div className="space-y-6">
           {/* Progress Tracker */}
           <ProgressTracker 
             userId="550e8400-e29b-41d4-a716-446655440000"
             courseId="550e8400-e29b-41d4-a716-446655440002"
             onProgressUpdate={(progress) => {
               console.log('Progress updated:', progress)
             }}
           />

          {/* Lesson Navigation */}
          <Card>
            <CardHeader>
              <CardTitle>Lesson Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-blue-500 bg-blue-50 text-blue-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Lesson 1</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-xs text-gray-500">12m</span>
                  </div>
                  <div className="text-sm text-gray-600 truncate mt-1">Understanding Your Credit Report</div>
                </div>
                
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Lesson 2</span>
                    </div>
                    <span className="text-xs text-gray-500">15m</span>
                  </div>
                  <div className="text-sm text-gray-600 truncate mt-1">Identifying Credit Report Errors</div>
                </button>

                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Lesson 3</span>
                    </div>
                    <span className="text-xs text-gray-500">18m</span>
                  </div>
                  <div className="text-sm text-gray-600 truncate mt-1">Writing Effective Dispute Letters</div>
                </button>

                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Lesson 4</span>
                    </div>
                    <span className="text-xs text-gray-500">20m</span>
                  </div>
                  <div className="text-sm text-gray-600 truncate mt-1">Following Up on Disputes</div>
                </button>

                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Lesson 5</span>
                    </div>
                    <span className="text-xs text-gray-500">25m</span>
                  </div>
                  <div className="text-sm text-gray-600 truncate mt-1">Building and Maintaining Good Credit</div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Test Notification Buttons */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">🧪 Test Notification System</h3>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            onClick={async () => {
              try {
                await addNotification({
                  title: "Lesson Completed! 🎉",
                  message: "Great job completing Test Lesson in Demo Course. You earned 100 points!",
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
                toast.success("Test lesson notification sent!")
              } catch (error) {
                toast.error("Failed to send notification")
                console.error(error)
              }
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            📚 Test Lesson Complete
          </Button>
          
          <Button
            onClick={async () => {
              try {
                await addNotification({
                  title: "Quiz Passed! 🎯",
                  message: "You passed Test Quiz with a score of 85%. Well done!",
                  type: "success",
                  priority: "medium",
                  read: false,
                  actions: [
                    {
                      label: "View Results",
                      action: "view_quiz_results",
                      variant: "default"
                    }
                  ]
                })
                toast.success("Test quiz notification sent!")
              } catch (error) {
                toast.error("Failed to send notification")
                console.error(error)
              }
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            🎯 Test Quiz Complete
          </Button>
          
          <Button
            onClick={async () => {
              try {
                await addNotification({
                  title: "Milestone Achieved! 🏆",
                  message: "Congratulations! You've achieved: Test Milestone. You've achieved a test milestone!",
                  type: "success",
                  priority: "high",
                  read: false,
                  actions: [
                    {
                      label: "View Achievement",
                      action: "view_achievement",
                      variant: "default"
                    }
                  ]
                })
                toast.success("Test milestone notification sent!")
              } catch (error) {
                toast.error("Failed to send notification")
                console.error(error)
              }
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            🏆 Test Milestone
          </Button>
          
          <Button
            onClick={async () => {
              try {
                await addNotification({
                  title: "Course Completed! 🎓",
                  message: "Congratulations! You've successfully completed Test Course. You're making great progress!",
                  type: "success",
                  priority: "high",
                  read: false,
                  actions: [
                    {
                      label: "View Certificate",
                      action: "view_certificate",
                      variant: "default"
                    }
                  ]
                })
                toast.success("Test course completion notification sent!")
              } catch (error) {
                toast.error("Failed to send notification")
                console.error(error)
              }
            }}
            className="bg-orange-600 hover:bg-orange-700"
          >
            🎓 Test Course Complete
          </Button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-12 pt-8 border-t">
        <Button variant="outline" disabled>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous Lesson
        </Button>

        <div className="text-sm text-gray-500">
          Lesson 1 of 5
        </div>

        <Button onClick={() => router.push('/dashboard/training')}>
          Next Lesson
          <CheckCircle className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
