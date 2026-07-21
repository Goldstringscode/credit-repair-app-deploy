"use client"

import { useState, useEffect, useCallback } from "react"
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
  Play,
  History,
  RotateCcw,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface QuizListItem {
  id: string
  title: string
  description: string
  courseId: string | null
  courseTitle: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  category: string
  tags: string[]
  timeLimitMinutes: number
  passingScore: number
  questionCount: number
  attemptsCount: number
  bestPercentage: number | null
  lastAttempt: {
    id: string
    percentage: number
    passed: boolean
    correctAnswers: number
    totalQuestions: number
    timeTakenSeconds: number
    completedAt: string | null
  } | null
  inProgress: {
    id: string
    currentQuestionIndex: number
    answeredCount: number
    startedAt: string
    timeTakenSeconds: number
  } | null
}

interface QuizStats {
  totalQuizzes: number
  passedQuizzes: number
  completedAttempts: number
  averageScore: number
  bestScore: number
  totalTimeSpent: number
  lastQuizDate: string | null
}

interface ActivityItem {
  id: string
  quizId: string
  percentage: number
  passed: boolean
  correctAnswers: number
  totalQuestions: number
  timeTakenSeconds: number
  completedAt: string | null
}

export default function QuizzesPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([])
  const [stats, setStats] = useState<QuizStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadQuizzes = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/training/quizzes")
      if (res.status === 401) {
        setError("Please sign in to view your quizzes and progress.")
        return
      }
      if (!res.ok) {
        setError("Something went wrong loading your quizzes. Please try again.")
        return
      }
      const json = await res.json()
      if (!json.success) {
        setError(json.error || "Something went wrong loading your quizzes.")
        return
      }
      setQuizzes(json.quizzes ?? [])
      setStats(json.stats ?? null)
      setRecentActivity(json.recentActivity ?? [])
    } catch (err) {
      console.error("Failed to load quizzes:", err)
      setError("Something went wrong loading your quizzes. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadQuizzes()
  }, [loadQuizzes])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 border-green-200"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Advanced":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const quizTitle = (quizId: string) => quizzes.find(q => q.id === quizId)?.title || "Quiz"

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mb-3" />
          <p>Loading your quizzes…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card className="max-w-xl mx-auto mt-16">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">{error}</p>
            <Button onClick={loadQuizzes} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
                <div className="text-3xl font-bold text-blue-600">{stats?.totalQuizzes ?? 0}</div>
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
                <div className="text-3xl font-bold text-green-600">{stats?.passedQuizzes ?? 0}</div>
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
                <div className="text-3xl font-bold text-purple-600">{stats?.averageScore ?? 0}%</div>
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
                <div className="text-3xl font-bold text-yellow-600">{stats?.bestScore ?? 0}%</div>
                <div className="text-sm text-yellow-700 font-medium">Best Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map(quiz => {
          const result = quiz.lastAttempt
          const hasAttempted = !!result
          const mastered = (quiz.bestPercentage ?? 0) >= 90

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

                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                  <BookOpen className="h-4 w-4" />
                  <span>{quiz.courseTitle}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span>{quiz.questionCount} questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{quiz.timeLimitMinutes} min</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {quiz.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* In-progress banner */}
                {quiz.inProgress && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-blue-800">Quiz in progress</span>
                      <span className="text-blue-700">
                        Question {Math.min(quiz.inProgress.currentQuestionIndex + 1, quiz.questionCount)} of{" "}
                        {quiz.questionCount}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Progress
                        value={(quiz.inProgress.answeredCount / quiz.questionCount) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                )}

                {/* Previous Result */}
                {hasAttempted && result && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Last Attempt</span>
                      <span className={`text-sm font-bold ${getScoreColor(result.percentage)}`}>
                        {result.percentage}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {result.correctAnswers}/{result.totalQuestions} correct
                      </span>
                      <span>{formatTime(result.timeTakenSeconds)}</span>
                    </div>
                    <div className="mt-2">
                      <Progress value={result.percentage} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        {result.passed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-xs ${result.passed ? "text-green-600" : "text-red-600"}`}>
                          {result.passed ? "Passed" : "Not passed"}
                        </span>
                      </div>
                      {quiz.attemptsCount > 1 && (
                        <span className="text-xs text-gray-500">
                          Best: {quiz.bestPercentage}% · {quiz.attemptsCount} attempts
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {quiz.inProgress ? (
                    <Button
                      onClick={() => router.push(`/dashboard/training/quizzes/${quiz.id}`)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Resume Quiz
                    </Button>
                  ) : !hasAttempted ? (
                    <Button
                      onClick={() => router.push(`/dashboard/training/quizzes/${quiz.id}`)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Quiz
                    </Button>
                  ) : mastered ? (
                    <Button
                      onClick={() => router.push(`/dashboard/training/quizzes/${quiz.id}`)}
                      variant="outline"
                      className="flex-1 border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mastered · Retake
                    </Button>
                  ) : (
                    <Button
                      onClick={() => router.push(`/dashboard/training/quizzes/${quiz.id}`)}
                      variant="outline"
                      className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Retake Quiz
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5 text-blue-600" />
              <span>Recent Quiz Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.passed ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      {activity.passed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{quizTitle(activity.quizId)}</div>
                      <div className="text-sm text-gray-600">
                        {activity.correctAnswers}/{activity.totalQuestions} correct ·{" "}
                        {formatTime(activity.timeTakenSeconds)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(activity.percentage)}`}>
                      {activity.percentage}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {activity.completedAt ? new Date(activity.completedAt).toLocaleDateString() : ""}
                    </div>
                  </div>
                </div>
              ))}
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
              <p className="text-sm text-gray-600">
                Each quiz has a time limit. Read questions carefully and pace yourself.
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Pick Up Where You Left Off</h4>
              <p className="text-sm text-gray-600">
                Your answers save automatically, so you can leave and resume any quiz.
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Track Progress</h4>
              <p className="text-sm text-gray-600">
                Monitor your scores and retake quizzes to improve your knowledge.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
