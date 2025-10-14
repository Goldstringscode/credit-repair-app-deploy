"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  Target, 
  Award, 
  Clock, 
  BookOpen, 
  Star, 
  Calendar,
  Trophy,
  CheckCircle,
  Loader2,
  BarChart3,
  Activity,
  Download
} from "lucide-react"
import { toast } from "sonner"
import { trainingService } from "@/lib/services/training-service"

export default function ProgressPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCourses: 0,
    enrolledCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
    totalQuizzes: 0,
    passedQuizzes: 0,
    perfectQuizScores: 0,
    certificatesEarned: 0,
    achievementsEarned: 0,
    totalLearningTime: 0,
    currentStreak: 0,
    averageScore: 0
  })
  const [achievements, setAchievements] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  // Mock user ID - in real app, get from auth context
  const userId = "550e8400-e29b-41d4-a716-446655440000"

  useEffect(() => {
    loadProgressData()
  }, [])

  const loadProgressData = async () => {
    try {
      setLoading(true)
      
      const [statsData, achievementsData, certificatesData] = await Promise.all([
        trainingService.getUserTrainingStats(userId),
        (trainingService as any).getUserAchievements?.(userId) || Promise.resolve([]),
        trainingService.getUserCertificates(userId)
      ])

      setStats(statsData)
      setAchievements(achievementsData)
      setCertificates(certificatesData)

      // Mock recent activity - in real app, fetch from API
      setRecentActivity([
        {
          id: 1,
          type: 'lesson_completed',
          title: 'Completed "Understanding Credit Scores"',
          course: 'Credit Basics 101',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          icon: CheckCircle,
          color: 'text-green-600'
        },
        {
          id: 2,
          type: 'quiz_passed',
          title: 'Passed "Credit Fundamentals Quiz"',
          course: 'Credit Basics 101',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          icon: Target,
          color: 'text-blue-600'
        },
        {
          id: 3,
          type: 'achievement_earned',
          title: 'Earned "First Steps" achievement',
          course: null,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          icon: Trophy,
          color: 'text-yellow-600'
        }
      ])

    } catch (error) {
      console.error("Failed to load progress data:", error)
      toast.error("Failed to load progress data")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading progress...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Learning Progress</h1>
        <p className="text-gray-600 mt-1">Track your learning journey and celebrate your achievements</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="p-3 rounded-full bg-blue-50 mx-auto mb-3 w-fit">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold mb-1">{stats.completedCourses}</div>
            <div className="text-sm text-gray-600">Courses Completed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="p-3 rounded-full bg-green-50 mx-auto mb-3 w-fit">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatTime(stats.totalLearningTime)}</div>
            <div className="text-sm text-gray-600">Total Learning Time</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="p-3 rounded-full bg-purple-50 mx-auto mb-3 w-fit">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold mb-1">{stats.averageScore}%</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="p-3 rounded-full bg-yellow-50 mx-auto mb-3 w-fit">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold mb-1">{stats.achievementsEarned}</div>
            <div className="text-sm text-gray-600">Achievements</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Learning Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Learning Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Courses</span>
                    <span>{stats.completedCourses}/{stats.enrolledCourses}</span>
                  </div>
                  <Progress 
                    value={stats.enrolledCourses > 0 ? (stats.completedCourses / stats.enrolledCourses) * 100 : 0} 
                    className="h-2" 
                  />
                  
                  <div className="flex justify-between text-sm">
                    <span>Lessons</span>
                    <span>{stats.completedLessons}/{stats.totalLessons}</span>
                  </div>
                  <Progress 
                    value={stats.totalLessons > 0 ? (stats.completedLessons / stats.totalLessons) * 100 : 0} 
                    className="h-2" 
                  />
                  
                  <div className="flex justify-between text-sm">
                    <span>Quizzes</span>
                    <span>{stats.passedQuizzes}/{stats.totalQuizzes}</span>
                  </div>
                  <Progress 
                    value={stats.totalQuizzes > 0 ? (stats.passedQuizzes / stats.totalQuizzes) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.averageScore}%</div>
                    <div className="text-sm text-blue-600">Quiz Average</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.perfectQuizScores}</div>
                    <div className="text-sm text-green-600">Perfect Scores</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Streak</span>
                    <span className="font-medium">{stats.currentStreak} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Learning Time</span>
                    <span className="font-medium">{formatTime(stats.totalLearningTime)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Enrolled Courses</h4>
                      <p className="text-sm text-gray-600">Active learning courses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{stats.enrolledCourses}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Completed Courses</h4>
                      <p className="text-sm text-gray-600">Successfully finished</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{stats.completedCourses}</div>
                    <div className="text-sm text-gray-600">
                      {stats.enrolledCourses > 0 ? Math.round((stats.completedCourses / stats.enrolledCourses) * 100) : 0}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Activity className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">In Progress</h4>
                      <p className="text-sm text-gray-600">Currently learning</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">{stats.inProgressCourses}</div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Achievements Earned</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                {stats.achievementsEarned} of {achievements.length + 5} achievements unlocked
              </p>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Achievements Yet</h3>
                  <p className="text-gray-600">Complete courses and lessons to earn your first achievements!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="p-4 border rounded-lg text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-yellow-600" />
                      </div>
                      <h4 className="font-medium mb-1">{achievement.achievement?.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{achievement.achievement?.description}</p>
                      <Badge variant="outline" className="text-xs">
                        Earned {formatDate(achievement.earnedAt)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Certificates Earned</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                {stats.certificatesEarned} certificates earned from completed courses
              </p>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Yet</h3>
                  <p className="text-gray-600">Complete courses to earn your first certificates!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certificates.map((certificate) => (
                    <div key={certificate.id} className="p-4 border rounded-lg text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                        <Award className="h-8 w-8 text-green-600" />
                      </div>
                      <h4 className="font-medium mb-1">Course Certificate</h4>
                      <p className="text-sm text-gray-600 mb-2">#{certificate.certificateNumber}</p>
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-xs">
                          Issued {formatDate(certificate.issuedAt)}
                        </Badge>
                        {certificate.expiresAt && (
                          <Badge variant="secondary" className="text-xs">
                            Expires {formatDate(certificate.expiresAt)}
                          </Badge>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Learning Activity</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Your latest learning milestones and achievements
              </p>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
                  <p className="text-gray-600">Start learning to see your activity here!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon
                    return (
                      <div key={activity.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${activity.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          {activity.course && (
                            <p className="text-sm text-gray-600">{activity.course}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">{formatDate(activity.timestamp)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <div className="mt-8 text-center">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="py-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Continue Learning?</h3>
            <p className="text-gray-600 mb-4">Keep building your skills and earning achievements</p>
            <Button size="lg" onClick={() => window.location.href = '/dashboard/training'}>
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
