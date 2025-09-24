"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Target, 
  Brain, 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  BookOpen,
  Star,
  Calendar,
  Play,
  History,
  Award,
  RotateCcw
} from "lucide-react"
import { useRouter } from "next/navigation"
import { progressTrackingService } from "@/lib/progress-tracking"

interface Quiz {
  id: string
  title: string
  description: string
  courseId: string
  courseTitle: string
  questionCount: number
  timeLimit: number // in minutes
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  category: string
  tags: string[]
}

interface QuizResult {
  quizId: string
  score: number
  passed: boolean
  timeTaken: number
  completedAt: Date
  totalQuestions: number
  correctAnswers: number
}

interface QuizStats {
  totalQuizzes: number
  passedQuizzes: number
  averageScore: number
  totalTimeSpent: number
  bestScore: number
  lastQuizDate?: Date
}

export default function QuizzesPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [quizStats, setQuizStats] = useState<QuizStats>({
    totalQuizzes: 0,
    passedQuizzes: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    bestScore: 0
  })

  useEffect(() => {
    loadQuizzesAndResults()
  }, [])

  const loadQuizzesAndResults = () => {
    // Mock quiz data
    const mockQuizzes: Quiz[] = [
      {
        id: "credit-basics-quiz",
        title: "Credit Basics Fundamentals",
        description: "Test your knowledge of credit reports, scores, and basic concepts",
        courseId: "credit-basics",
        courseTitle: "Credit Basics & Fundamentals",
        questionCount: 15,
        timeLimit: 20,
        difficulty: "Beginner",
        category: "Fundamentals",
        tags: ["Credit Report", "FICO Score", "Basics"]
      },
      {
        id: "credit-score-quiz",
        title: "Credit Score Mastery",
        description: "Advanced questions about credit scoring models and factors",
        courseId: "credit-basics",
        courseTitle: "Credit Basics & Fundamentals",
        questionCount: 20,
        timeLimit: 25,
        difficulty: "Intermediate",
        category: "Credit Scoring",
        tags: ["FICO", "VantageScore", "Factors"]
      },
      {
        id: "dispute-strategies-quiz",
        title: "Dispute Strategies & Techniques",
        description: "Test your knowledge of credit dispute methods and legal rights",
        courseId: "advanced-disputes",
        courseTitle: "Advanced Dispute Strategies",
        questionCount: 18,
        timeLimit: 30,
        difficulty: "Advanced",
        category: "Disputes",
        tags: ["FCRA", "Disputes", "Legal Rights"]
      },
      {
        id: "legal-rights-quiz",
        title: "Consumer Legal Rights",
        description: "Understanding your rights under consumer protection laws",
        courseId: "legal-rights",
        courseTitle: "Consumer Legal Rights",
        questionCount: 12,
        timeLimit: 15,
        difficulty: "Intermediate",
        category: "Legal",
        tags: ["FCRA", "FDCPA", "Rights"]
      },
      {
        id: "credit-building-quiz",
        title: "Credit Building Strategies",
        description: "Test knowledge of building and maintaining good credit",
        courseId: "credit-building",
        courseTitle: "Credit Building Strategies",
        questionCount: 16,
        timeLimit: 20,
        difficulty: "Intermediate",
        category: "Credit Building",
        tags: ["Building Credit", "Maintenance", "Strategies"]
      }
    ]

    // Mock quiz results
    const mockResults: QuizResult[] = [
      {
        quizId: "credit-basics-quiz",
        score: 87,
        passed: true,
        timeTaken: 1080, // 18 minutes
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        totalQuestions: 15,
        correctAnswers: 13
      },
      {
        quizId: "credit-score-quiz",
        score: 75,
        passed: true,
        timeTaken: 1200, // 20 minutes
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        totalQuestions: 20,
        correctAnswers: 15
      },
      {
        quizId: "dispute-strategies-quiz",
        score: 92,
        passed: true,
        timeTaken: 1800, // 30 minutes
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        totalQuestions: 18,
        correctAnswers: 17
      }
    ]

    setQuizzes(mockQuizzes)
    setQuizResults(mockResults)

    // Calculate stats
    const stats: QuizStats = {
      totalQuizzes: mockQuizzes.length,
      passedQuizzes: mockResults.filter(r => r.passed).length,
      averageScore: mockResults.length > 0 ? 
        Math.round(mockResults.reduce((acc, r) => acc + r.score, 0) / mockResults.length) : 0,
      totalTimeSpent: mockResults.reduce((acc, r) => acc + r.timeTaken, 0),
      bestScore: mockResults.length > 0 ? Math.max(...mockResults.map(r => r.score)) : 0,
      lastQuizDate: mockResults.length > 0 ? 
        new Date(Math.max(...mockResults.map(r => r.completedAt.getTime()))) : undefined
    }
    setQuizStats(stats)
  }

  const getQuizResult = (quizId: string): QuizResult | undefined => {
    return quizResults.find(r => r.quizId === quizId)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startQuiz = (quizId: string) => {
    router.push(`/dashboard/training/quizzes/${quizId}`)
  }

  const retakeQuiz = (quizId: string) => {
    router.push(`/dashboard/training/quizzes/${quizId}`)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Center</h1>
        <p className="text-gray-600">Test your knowledge and track your progress</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">{quizStats.totalQuizzes}</div>
                <div className="text-sm text-blue-700 font-medium">Available Quizzes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">{quizStats.passedQuizzes}</div>
                <div className="text-sm text-green-700 font-medium">Quizzes Passed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">{quizStats.averageScore}%</div>
                <div className="text-sm text-purple-700 font-medium">Average Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-600">{quizStats.bestScore}%</div>
                <div className="text-sm text-yellow-700 font-medium">Best Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => {
          const result = getQuizResult(quiz.id)
          const hasAttempted = !!result
          const canRetake = hasAttempted && result!.score < 90 // Allow retake if score < 90%

          return (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{quiz.title}</CardTitle>
                    <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
                  </div>
                  <Badge variant="outline" className={getDifficultyColor(quiz.difficulty)}>
                    {quiz.difficulty}
                  </Badge>
                </div>

                {/* Course Info */}
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                  <BookOpen className="h-4 w-4" />
                  <span>{quiz.courseTitle}</span>
                </div>

                {/* Quiz Details */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span>{quiz.questionCount} questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{quiz.timeLimit} min</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {quiz.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Previous Result */}
                {hasAttempted && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Last Attempt</span>
                      <span className={`text-sm font-bold ${getScoreColor(result!.score)}`}>
                        {result!.score}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{result!.correctAnswers}/{result!.totalQuestions} correct</span>
                      <span>{formatTime(result!.timeTaken)}</span>
                    </div>
                    <div className="mt-2">
                      <Progress value={result!.score} className="h-2" />
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      {result!.passed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-xs ${result!.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {result!.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {!hasAttempted ? (
                    <Button 
                      onClick={() => startQuiz(quiz.id)} 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Quiz
                    </Button>
                  ) : canRetake ? (
                    <Button 
                      onClick={() => retakeQuiz(quiz.id)} 
                      variant="outline" 
                      className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Retake Quiz
                    </Button>
                  ) : (
                    <Button 
                      disabled 
                      variant="outline" 
                      className="flex-1 border-green-300 text-green-700 bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mastered
                    </Button>
                  )}

                  {hasAttempted && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => router.push(`/dashboard/training/quizzes/${quiz.id}/results`)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      {quizResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5 text-blue-600" />
              <span>Recent Quiz Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quizResults
                .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
                .slice(0, 5)
                .map((result, index) => {
                  const quiz = quizzes.find(q => q.id === result.quizId)
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          result.passed ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {result.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{quiz?.title || 'Unknown Quiz'}</div>
                          <div className="text-sm text-gray-600">
                            {result.correctAnswers}/{result.totalQuestions} correct • {formatTime(result.timeTaken)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                          {result.score}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.completedAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span>Quiz Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Manage Your Time</h4>
              <p className="text-sm text-gray-600">Each quiz has a time limit. Read questions carefully and pace yourself.</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Review Your Answers</h4>
              <p className="text-sm text-gray-600">Use the remaining time to review your answers before submitting.</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Track Progress</h4>
              <p className="text-sm text-gray-600">Monitor your scores and retake quizzes to improve your knowledge.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
