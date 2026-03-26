"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Clock,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Download,
  MessageSquare,
  Star,
  Volume2,
  Maximize,
  FileText,
  Brain,
  Target,
  Award,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { progressTrackingService } from "@/lib/progress-tracking"

interface ModuleContent {
  id: string
  title: string
  description: string
  lessons: Lesson[]
  instructor: string
  duration: number
  difficulty: number
  skills: string[]
  certificate: boolean
}

interface Lesson {
  id: string
  title: string
  type: "video" | "text" | "quiz" | "interactive" | "practical"
  duration: number
  completed: boolean
  score?: number
  content?: string
  videoUrl?: string
  transcript?: string
  resources?: Resource[]
  quiz?: Quiz
}

interface Resource {
  id: string
  title: string
  type: "pdf" | "doc" | "link" | "template"
  url: string
  description: string
}

interface Quiz {
  id: string
  title: string
  questions: Question[]
  passingScore: number
  timeLimit?: number
}

interface Question {
  id: string
  question: string
  type: "multiple-choice" | "true-false" | "short-answer"
  options?: string[]
  correctAnswer: string | number
  explanation: string
}

export default function ModuleContentPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({})
  const [showTranscript, setShowTranscript] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [userProgress, setUserProgress] = useState<any>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Progress tracking functions
  const refreshProgress = () => {
    const progress = progressTrackingService.getUserProgress()
    setUserProgress(progress)
    setRefreshTrigger(prev => prev + 1)
  }

  const getLessonCompletionStatus = (lessonId: string): boolean => {
    if (!userProgress) return false
    const lessonProgress = userProgress.lessons.find((l: any) => l.lessonId === lessonId)
    return lessonProgress?.completed || false
  }

  const updateLessonProgress = (lessonId: string, currentTime: number, completed: boolean = false) => {
    const moduleId = params.moduleId as string
    const moduleContent = getModuleContent(moduleId)
    const currentLesson = moduleContent.lessons[currentLessonIndex]
    
    progressTrackingService.updateLessonProgress(
      lessonId, 
      currentTime, 
      completed, 
      moduleId, 
      currentLesson?.title || `Lesson ${currentLessonIndex + 1}`, 
      currentLesson?.duration || 600
    )
    refreshProgress()
  }

  const handleMarkComplete = () => {
    const moduleId = params.moduleId as string
    const moduleContent = getModuleContent(moduleId)
    const currentLesson = moduleContent.lessons[currentLessonIndex]
    const lessonId = currentLesson.id
    
    updateLessonProgress(lessonId, currentLesson.duration, true)
    
    toast({
      title: "Lesson Completed! 🎉",
      description: `"${currentLesson.title}" has been marked as complete. Great job!`,
      duration: 5000,
    })
  }

  const handleMarkIncomplete = () => {
    const moduleId = params.moduleId as string
    const moduleContent = getModuleContent(moduleId)
    const currentLesson = moduleContent.lessons[currentLessonIndex]
    const lessonId = currentLesson.id
    
    updateLessonProgress(lessonId, 0, false)
    
    toast({
      title: "Lesson Marked as Incomplete",
      description: `"${currentLesson.title}" has been marked as incomplete. You can complete it again when ready.`,
      duration: 5000,
    })
  }

  // Initialize progress tracking
  useEffect(() => {
    setMounted(true)
    refreshProgress()
  }, [])

  // Listen for completion changes
  useEffect(() => {
    const handleLessonCompletionChange = () => {
      refreshProgress()
    }

    window.addEventListener('lessonCompletionChanged', handleLessonCompletionChange)
    
    return () => {
      window.removeEventListener('lessonCompletionChanged', handleLessonCompletionChange)
    }
  }, [])

  // Mock module content based on moduleId
  const getModuleContent = (moduleId: string): ModuleContent => {
    const modules: Record<string, ModuleContent> = {
      "mlm-fundamentals": {
        id: "mlm-fundamentals",
        title: "MLM Fundamentals & Industry Basics",
        description: "Master the core concepts of multi-level marketing, compensation plans, and industry regulations",
        instructor: "Sarah Johnson",
        duration: 180,
        difficulty: 2,
        skills: ["MLM Basics", "Compensation Plans", "Legal Compliance", "Industry Knowledge"],
        certificate: true,
        lessons: [
          {
            id: "lesson-1",
            title: "Introduction to Multi-Level Marketing",
            type: "video",
            duration: 15,
            completed: true,
            content: "Welcome to the world of Multi-Level Marketing...",
            videoUrl: "/placeholder-video.mp4",
            transcript:
              "Welcome to this comprehensive introduction to Multi-Level Marketing. In this lesson, we'll cover the fundamental concepts that form the foundation of successful MLM businesses...",
            resources: [
              {
                id: "res-1",
                title: "MLM Industry Overview",
                type: "pdf",
                url: "/resources/mlm-overview.pdf",
                description: "Comprehensive overview of the MLM industry landscape",
              },
              {
                id: "res-2",
                title: "Success Stories Template",
                type: "template",
                url: "/templates/success-stories.docx",
                description: "Template for documenting and sharing success stories",
              },
            ],
          },
          {
            id: "lesson-2",
            title: "Understanding Compensation Plans",
            type: "video",
            duration: 20,
            completed: true,
            content: "Compensation plans are the heart of any MLM business...",
            videoUrl: "/placeholder-video.mp4",
            transcript:
              "Compensation plans are the heart of any MLM business. They determine how distributors are rewarded for their efforts in both sales and recruitment...",
            resources: [
              {
                id: "res-3",
                title: "Compensation Plan Comparison Chart",
                type: "pdf",
                url: "/resources/comp-plan-comparison.pdf",
                description: "Side-by-side comparison of different compensation structures",
              },
            ],
          },
          {
            id: "lesson-3",
            title: "Legal and Ethical Considerations",
            type: "text",
            duration: 18,
            completed: false,
            content: `
              <h2>Legal Framework for MLM Operations</h2>
              <p>Understanding the legal landscape is crucial for MLM success. This lesson covers:</p>
              <ul>
                <li>FTC guidelines and regulations</li>
                <li>State-specific MLM laws</li>
                <li>International compliance requirements</li>
                <li>Ethical business practices</li>
              </ul>
              
              <h3>Key Legal Principles</h3>
              <p>The Federal Trade Commission (FTC) has established clear guidelines that distinguish legitimate MLM businesses from illegal pyramid schemes...</p>
              
              <h3>Compliance Best Practices</h3>
              <p>To ensure your MLM business operates within legal boundaries, follow these essential practices:</p>
              <ol>
                <li>Focus on product sales to end consumers</li>
                <li>Avoid emphasis on recruitment over product sales</li>
                <li>Provide accurate income disclosures</li>
                <li>Maintain detailed records of all transactions</li>
              </ol>
            `,
            resources: [
              {
                id: "res-4",
                title: "FTC MLM Guidelines",
                type: "link",
                url: "https://www.ftc.gov/business-guidance/resources/multi-level-marketing",
                description: "Official FTC guidance on MLM business practices",
              },
            ],
          },
          {
            id: "lesson-4",
            title: "Building Your MLM Mindset",
            type: "interactive",
            duration: 12,
            completed: false,
            content: "Interactive mindset assessment and goal-setting exercise",
          },
          {
            id: "lesson-5",
            title: "Knowledge Check: MLM Basics",
            type: "quiz",
            duration: 10,
            completed: false,
            quiz: {
              id: "quiz-1",
              title: "MLM Fundamentals Quiz",
              passingScore: 80,
              timeLimit: 15,
              questions: [
                {
                  id: "q1",
                  question: "What is the primary difference between a legitimate MLM and a pyramid scheme?",
                  type: "multiple-choice",
                  options: [
                    "MLMs focus on product sales to end consumers",
                    "MLMs only recruit new members",
                    "MLMs guarantee income to all participants",
                    "MLMs don't require any investment",
                  ],
                  correctAnswer: 0,
                  explanation:
                    "Legitimate MLMs focus on selling products to end consumers, while pyramid schemes primarily focus on recruitment.",
                },
                {
                  id: "q2",
                  question: "True or False: Income disclosures are required by law for MLM companies.",
                  type: "true-false",
                  options: ["True", "False"],
                  correctAnswer: 0,
                  explanation:
                    "The FTC requires MLM companies to provide accurate income disclosures to potential distributors.",
                },
                {
                  id: "q3",
                  question: "What percentage of MLM participants typically earn significant income?",
                  type: "multiple-choice",
                  options: ["Less than 1%", "About 10%", "Around 25%", "More than 50%"],
                  correctAnswer: 0,
                  explanation:
                    "Studies show that less than 1% of MLM participants earn significant income, which is why realistic expectations are important.",
                },
              ],
            },
          },
        ],
      },
      "prospecting-lead-generation": {
        id: "prospecting-lead-generation",
        title: "Advanced Prospecting & Lead Generation",
        description: "Learn cutting-edge techniques for finding, qualifying, and converting high-quality prospects",
        instructor: "Lisa Chen",
        duration: 300,
        difficulty: 4,
        skills: ["Lead Generation", "Social Media Prospecting", "Cold Calling", "Referral Systems"],
        certificate: true,
        lessons: [
          {
            id: "lesson-1",
            title: "Modern Prospecting Fundamentals",
            type: "video",
            duration: 18,
            completed: true,
            content: "The landscape of prospecting has evolved dramatically...",
            videoUrl: "/placeholder-video.mp4",
            transcript:
              "The landscape of prospecting has evolved dramatically in the digital age. Today's successful MLM professionals must master both traditional and modern prospecting techniques...",
          },
          {
            id: "lesson-2",
            title: "Identifying Your Ideal Prospect",
            type: "interactive",
            duration: 22,
            completed: true,
            content: "Interactive prospect profiling exercise",
          },
          {
            id: "lesson-3",
            title: "Social Media Prospecting Mastery",
            type: "video",
            duration: 35,
            completed: true,
            content: "Social media has revolutionized how we find and connect with prospects...",
            videoUrl: "/placeholder-video.mp4",
            transcript:
              "Social media has revolutionized how we find and connect with prospects. In this comprehensive lesson, we'll explore advanced strategies for each major platform...",
          },
        ],
      },
    }

    return modules[moduleId as string] || modules["mlm-fundamentals"]
  }

  const moduleContent = getModuleContent(params.moduleId as string)
  const currentLesson = moduleContent.lessons[currentLessonIndex]

  const handleNextLesson = () => {
    if (currentLessonIndex < moduleContent.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1)
      setProgress(0)
    }
  }

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1)
      setProgress(0)
    }
  }

  const handleCompleteLesson = () => {
    const moduleId = params.moduleId as string
    const moduleContent = getModuleContent(moduleId)
    const currentLesson = moduleContent.lessons[currentLessonIndex]
    const lessonId = currentLesson.id
    
    console.log('=== MARK COMPLETE DEBUG START ===')
    console.log('Marking lesson as complete:', lessonId)
    console.log('Lesson title:', currentLesson.title)
    
    updateLessonProgress(lessonId, currentLesson.duration, true)
    
    console.log('=== MARK COMPLETE DEBUG END ===')

    toast({
      title: "Lesson Completed! 🎉",
      description: `"${currentLesson.title}" has been marked as complete. Great job!`,
      duration: 5000,
    })

    // Auto-advance to next lesson
    setTimeout(() => {
      if (currentLessonIndex < moduleContent.lessons.length - 1) {
        handleNextLesson()
      }
    }, 2000)
  }

  const handleQuizSubmit = () => {
    if (!currentLesson.quiz) return

    const totalQuestions = currentLesson.quiz.questions.length
    let correctAnswers = 0

    currentLesson.quiz.questions.forEach((question) => {
      if (quizAnswers[question.id] === question.correctAnswer) {
        correctAnswers++
      }
    })

    const score = Math.round((correctAnswers / totalQuestions) * 100)
    const passed = score >= currentLesson.quiz.passingScore

    toast({
      title: passed ? "Quiz Passed!" : "Quiz Failed",
      description: passed
        ? `Excellent! You scored ${score}% and passed the quiz.`
        : `You scored ${score}%. You need ${currentLesson.quiz.passingScore}% to pass. Try again!`,
      variant: passed ? "default" : "destructive",
    })

    if (passed) {
      handleCompleteLesson()
    }
  }

  // Get real completion data from progress tracking service (only on client side)
  const completedLessons = mounted ? (() => {
    if (!userProgress) return 0
    const moduleId = params.moduleId as string
    const courseLessons = userProgress.lessons.filter((l: any) => l.courseId === moduleId)
    return courseLessons.filter((l: any) => l.completed).length
  })() : 0
  
  const moduleProgress = Math.round((completedLessons / moduleContent.lessons.length) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/mlm/training" className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Training</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold">{moduleContent.title}</h1>
                <p className="text-sm text-gray-600">
                  Lesson {currentLessonIndex + 1} of {moduleContent.lessons.length}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium">{moduleProgress}% Complete</div>
                <Progress value={moduleProgress} className="w-32 h-2" />
              </div>
              <Badge variant="outline">{moduleContent.difficulty}/5 Difficulty</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Lesson Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Course Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {moduleContent.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      index === currentLessonIndex
                        ? "bg-blue-100 border-blue-200 border"
                        : lesson.completed
                          ? "bg-green-50 hover:bg-green-100"
                          : "hover:bg-gray-50"
                    }`}
                    onClick={() => setCurrentLessonIndex(index)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {lesson.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : index === currentLessonIndex ? (
                          <Play className="h-5 w-5 text-blue-500" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{lesson.title}</div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{lesson.duration} min</span>
                          <Badge variant="outline" className="text-xs">
                            {lesson.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{currentLesson.title}</CardTitle>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge>{currentLesson.type}</Badge>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{currentLesson.duration} minutes</span>
                      </div>
                      {currentLesson.completed && (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousLesson}
                      disabled={currentLessonIndex === 0}
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextLesson}
                      disabled={currentLessonIndex === moduleContent.lessons.length - 1}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Video Content */}
                {currentLesson.type === "video" && (
                  <div className="space-y-6">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <div className="aspect-video flex items-center justify-center">
                        <div className="text-white text-center">
                          <Play className="h-16 w-16 mx-auto mb-4 opacity-60" />
                          <p className="text-lg">Video Player</p>
                          <p className="text-sm opacity-60">Click to play lesson video</p>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center space-x-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white hover:bg-white/20"
                              onClick={() => setIsPlaying(!isPlaying)}
                            >
                              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <span className="text-sm">0:00 / {currentLesson.duration}:00</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                              <Volume2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                              <Maximize className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Progress value={progress} className="mt-2 h-1" />
                      </div>
                    </div>

                    {/* Video Controls */}
                    <Tabs defaultValue="notes" className="w-full">
                      <TabsList>
                        <TabsTrigger value="notes">Notes</TabsTrigger>
                        <TabsTrigger value="transcript">Transcript</TabsTrigger>
                        <TabsTrigger value="resources">Resources</TabsTrigger>
                      </TabsList>
                      <TabsContent value="notes" className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Key Takeaways</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Understanding the fundamentals is crucial for long-term success</li>
                            <li>• Focus on building genuine relationships with prospects</li>
                            <li>• Compliance with regulations protects your business</li>
                            <li>• Continuous learning and adaptation are essential</li>
                          </ul>
                        </div>
                      </TabsContent>
                      <TabsContent value="transcript" className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                          <p className="text-sm leading-relaxed">
                            {currentLesson.transcript || "Transcript not available for this lesson."}
                          </p>
                        </div>
                      </TabsContent>
                      <TabsContent value="resources" className="space-y-4">
                        {currentLesson.resources && currentLesson.resources.length > 0 ? (
                          <div className="grid md:grid-cols-2 gap-4">
                            {currentLesson.resources.map((resource) => (
                              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <div className="flex items-start space-x-3">
                                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div className="flex-1">
                                      <h5 className="font-medium">{resource.title}</h5>
                                      <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                                      <Button size="sm" variant="outline">
                                        <Download className="h-3 w-3 mr-1" />
                                        Download
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">No additional resources for this lesson.</p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                )}

                {/* Text Content */}
                {currentLesson.type === "text" && (
                  <div className="space-y-6">
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: currentLesson.content || "" }}
                    />
                    {currentLesson.resources && (
                      <div className="border-t pt-6">
                        <h4 className="font-semibold mb-4">Additional Resources</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {currentLesson.resources.map((resource) => (
                            <Card key={resource.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                  <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                                  <div className="flex-1">
                                    <h5 className="font-medium">{resource.title}</h5>
                                    <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                                    <Button size="sm" variant="outline">
                                      <Download className="h-3 w-3 mr-1" />
                                      Access Resource
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz Content */}
                {currentLesson.type === "quiz" && currentLesson.quiz && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{currentLesson.quiz.title}</h4>
                        <Badge>Passing Score: {currentLesson.quiz.passingScore}%</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Answer all questions to complete this lesson. You need {currentLesson.quiz.passingScore}% to
                        pass.
                      </p>
                      {currentLesson.quiz.timeLimit && (
                        <p className="text-sm text-gray-600">Time limit: {currentLesson.quiz.timeLimit} minutes</p>
                      )}
                    </div>

                    <div className="space-y-6">
                      {currentLesson.quiz.questions.map((question, index) => (
                        <Card key={question.id}>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium mb-3">{question.question}</h5>
                                  {question.type === "multiple-choice" && question.options && (
                                    <div className="space-y-2">
                                      {question.options.map((option, optionIndex) => (
                                        <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                                          <input
                                            type="radio"
                                            name={question.id}
                                            value={optionIndex}
                                            onChange={(e) =>
                                              setQuizAnswers({
                                                ...quizAnswers,
                                                [question.id]: Number.parseInt(e.target.value),
                                              })
                                            }
                                            className="w-4 h-4 text-blue-600"
                                          />
                                          <span>{option}</span>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                  {question.type === "true-false" && question.options && (
                                    <div className="space-y-2">
                                      {question.options.map((option, optionIndex) => (
                                        <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                                          <input
                                            type="radio"
                                            name={question.id}
                                            value={optionIndex}
                                            onChange={(e) =>
                                              setQuizAnswers({
                                                ...quizAnswers,
                                                [question.id]: Number.parseInt(e.target.value),
                                              })
                                            }
                                            className="w-4 h-4 text-blue-600"
                                          />
                                          <span>{option}</span>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="flex justify-center">
                      <Button onClick={handleQuizSubmit} size="lg">
                        Submit Quiz
                      </Button>
                    </div>
                  </div>
                )}

                {/* Interactive Content */}
                {currentLesson.type === "interactive" && (
                  <div className="space-y-6">
                    <div className="bg-purple-50 p-6 rounded-lg text-center">
                      <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold mb-2">Interactive Exercise</h4>
                      <p className="text-gray-600 mb-4">Complete the interactive exercise to master this concept</p>
                      <Button>Start Interactive Exercise</Button>
                    </div>
                  </div>
                )}

                {/* Practical Content */}
                {currentLesson.type === "practical" && (
                  <div className="space-y-6">
                    <div className="bg-green-50 p-6 rounded-lg text-center">
                      <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold mb-2">Practical Exercise</h4>
                      <p className="text-gray-600 mb-4">Apply what you've learned with hands-on practice</p>
                      <Button>Begin Practical Exercise</Button>
                    </div>
                  </div>
                )}

                {/* Lesson Actions */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ask Question
                    </Button>
                    <Button variant="outline" size="sm">
                      <Star className="h-4 w-4 mr-2" />
                      Rate Lesson
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    {mounted && (() => {
                      const lessonId = currentLesson.id
                      const isCompleted = getLessonCompletionStatus(lessonId)
                      
                      return isCompleted ? (
                        <Button
                          onClick={handleMarkIncomplete}
                          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Unmark as Complete
                        </Button>
                      ) : (
                        <Button
                          onClick={handleCompleteLesson}
                          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Complete
                        </Button>
                      )
                    })()}
                    {currentLessonIndex < moduleContent.lessons.length - 1 && (
                      <Button onClick={handleNextLesson}>
                        Next Lesson
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Module Completion */}
            {currentLessonIndex === moduleContent.lessons.length - 1 && currentLesson.completed && (
              <Card className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
                  <p className="text-gray-600 mb-4">
                    You've completed the {moduleContent.title} module.
                    {moduleContent.certificate && " You've earned a certificate!"}
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    {moduleContent.certificate && (
                      <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Download Certificate
                      </Button>
                    )}
                    <Link href="/mlm/training">
                      <Button variant="outline">Back to Training</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
