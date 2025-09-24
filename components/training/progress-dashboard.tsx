"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  BarChart3,
  Star,
  History,
  Activity,
  X
} from "lucide-react"

interface ProgressDashboardProps {
  userId: string
  courseId: string
  onClose?: () => void
}

export function ProgressDashboard({ userId, courseId, onClose }: ProgressDashboardProps) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
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

  // Mock data for demo
  const courseProgress = {
    overallProgress: 65,
    lessonsCompleted: 3,
    totalLessons: 5,
    timeSpent: 1800
  }

  const quizHistory = [
    { quizId: "quiz-001", score: 85, passed: true, timeTaken: 180, completedAt: new Date() },
    { quizId: "quiz-002", score: 92, passed: true, timeTaken: 210, completedAt: new Date() },
    { quizId: "quiz-003", score: 78, passed: true, timeTaken: 195, completedAt: new Date() }
  ]

  const averageScore = Math.round(quizHistory.reduce((sum, quiz) => sum + quiz.score, 0) / quizHistory.length)
  const totalTimeSpent = Math.round(courseProgress.timeSpent / 60)
  const completionRate = Math.round((courseProgress.lessonsCompleted / courseProgress.totalLessons) * 100)

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Learning Progress
          </h2>
          <p className="text-gray-600 mt-2">Track your journey through the course</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose} className="border-2 hover:bg-gray-50">
            Close
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">{courseProgress.overallProgress}%</div>
                <div className="text-sm text-blue-700 font-medium">Overall Progress</div>
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
                <div className="text-3xl font-bold text-green-600">{courseProgress.lessonsCompleted}</div>
                <div className="text-sm text-green-700 font-medium">Lessons Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">{averageScore}%</div>
                <div className="text-sm text-purple-700 font-medium">Average Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">{totalTimeSpent}m</div>
                <div className="text-sm text-orange-700 font-medium">Time Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Progress Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Course Completion</span>
              <span className="text-lg font-bold text-blue-600">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="text-sm text-gray-600">
              {courseProgress.lessonsCompleted} of {courseProgress.totalLessons} lessons completed
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz History */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5 text-purple-600" />
            <span>Quiz Attempts</span>
            <Badge variant="secondary" className="ml-2">{quizHistory.length} quizzes taken</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quizHistory.map((quiz, index) => (
              <div
                key={quiz.quizId}
                className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    quiz.passed ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {quiz.passed ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <X className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">Quiz {index + 1}</div>
                    <div className="text-sm text-gray-600">
                      Completed {quiz.completedAt.toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Time taken: {quiz.timeTaken}s
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{quiz.score}%</div>
                  <Badge variant={quiz.passed ? "default" : "destructive"} className="text-sm">
                    {quiz.passed ? "Passed" : "Failed"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
