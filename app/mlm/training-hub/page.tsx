"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  Star,
  Target,
  Brain,
  Trophy,
  Video,
  ArrowRight,
  BarChart3,
  Flame,
} from "lucide-react"
import Link from "next/link"

export default function TrainingHubPage() {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data - in real app, this would come from API/database
  const trainingStats = {
    hoursCompleted: 47,
    modulesFinished: 12,
    certificatesEarned: 3,
    currentRank: "Silver Consultant",
    nextRank: "Gold Leader",
    rankProgress: 68,
    weeklyGoal: 5,
    weeklyProgress: 3,
    streak: 7,
    totalPoints: 2450,
  }

  const quickAccessItems = [
    {
      title: "Training Courses",
      description: "Access all 8 comprehensive training modules",
      icon: BookOpen,
      href: "/mlm/training",
      color: "bg-blue-500",
      stats: "8 Modules",
    },
    {
      title: "Live Webinars",
      description: "Join upcoming live training sessions",
      icon: Video,
      href: "/mlm/training/webinars",
      color: "bg-red-500",
      stats: "3 This Week",
    },
    {
      title: "Certifications",
      description: "Track your professional certifications",
      icon: Award,
      href: "/mlm/training/certifications",
      color: "bg-yellow-500",
      stats: "6 Available",
    },
    {
      title: "Team Training Portal",
      description: "Train and develop your team members",
      icon: Users,
      href: "/mlm/team-training",
      color: "bg-green-500",
      stats: "15 Team Members",
    },
    {
      title: "Onboarding Guide",
      description: "Essential setup and initial training",
      icon: Target,
      href: "/mlm/onboarding",
      color: "bg-purple-500",
      stats: "5 Steps",
    },
    {
      title: "Welcome Center",
      description: "Resources for new team members",
      icon: Star,
      href: "/mlm/welcome",
      color: "bg-indigo-500",
      stats: "New",
    },
  ]

  const recentActivity = [
    {
      type: "module",
      title: "Completed Advanced Prospecting Module",
      time: "2 hours ago",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      type: "certificate",
      title: "Earned Sales Mastery Certificate",
      time: "1 day ago",
      icon: Award,
      color: "text-yellow-600",
    },
    {
      type: "webinar",
      title: "Attended Leadership Excellence Webinar",
      time: "2 days ago",
      icon: Video,
      color: "text-blue-600",
    },
    {
      type: "quiz",
      title: "Scored 95% on Credit Repair Fundamentals Quiz",
      time: "3 days ago",
      icon: Brain,
      color: "text-purple-600",
    },
    {
      type: "milestone",
      title: "Reached 50 Hours of Training Milestone",
      time: "1 week ago",
      icon: Trophy,
      color: "text-orange-600",
    },
  ]

  const upcomingEvents = [
    {
      title: "Advanced Sales Techniques Masterclass",
      presenter: "Sarah Johnson",
      date: "Tomorrow, 2:00 PM EST",
      duration: "90 minutes",
      registered: true,
      capacity: "45/50",
    },
    {
      title: "Team Leadership Workshop",
      presenter: "Michael Chen",
      date: "Friday, 1:00 PM EST",
      duration: "2 hours",
      registered: false,
      capacity: "28/40",
    },
    {
      title: "Compliance & Legal Updates",
      presenter: "Lisa Rodriguez",
      date: "Next Monday, 3:00 PM EST",
      duration: "60 minutes",
      registered: true,
      capacity: "67/100",
    },
    {
      title: "Q4 Strategy Planning Session",
      presenter: "David Kim",
      date: "Next Wednesday, 11:00 AM EST",
      duration: "2.5 hours",
      registered: false,
      capacity: "15/25",
    },
  ]

  const learningPaths = [
    {
      title: "Beginner Path",
      description: "Perfect for new MLM professionals",
      modules: 4,
      duration: "8-12 hours",
      difficulty: 2,
      progress: 75,
      color: "bg-green-100 border-green-200",
    },
    {
      title: "Sales Mastery Path",
      description: "Advanced sales and persuasion techniques",
      modules: 6,
      duration: "15-20 hours",
      difficulty: 4,
      progress: 40,
      color: "bg-blue-100 border-blue-200",
    },
    {
      title: "Leadership Excellence Path",
      description: "Build and manage high-performing teams",
      modules: 5,
      duration: "12-16 hours",
      difficulty: 5,
      progress: 20,
      color: "bg-purple-100 border-purple-200",
    },
  ]

  const achievements = [
    {
      title: "First Steps",
      description: "Complete your first training module",
      progress: 100,
      earned: true,
      date: "2 weeks ago",
    },
    {
      title: "Knowledge Seeker",
      description: "Complete 10 training modules",
      progress: 100,
      earned: true,
      date: "1 week ago",
    },
    {
      title: "Quiz Master",
      description: "Score 90%+ on 5 quizzes",
      progress: 80,
      earned: false,
      date: null,
    },
    {
      title: "Dedicated Learner",
      description: "Maintain a 7-day learning streak",
      progress: 100,
      earned: true,
      date: "Today",
    },
    {
      title: "Team Builder",
      description: "Train 5 team members",
      progress: 60,
      earned: false,
      date: null,
    },
    {
      title: "Expert Level",
      description: "Complete all advanced modules",
      progress: 25,
      earned: false,
      date: null,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Training & Development Hub
              </h1>
              <p className="text-gray-600 mt-1">Master your skills and advance your MLM career</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-600">Current Rank</div>
                <div className="text-lg font-bold">{trainingStats.currentRank}</div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Hours Completed</p>
                  <p className="text-3xl font-bold">{trainingStats.hoursCompleted}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Modules Finished</p>
                  <p className="text-3xl font-bold">{trainingStats.modulesFinished}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Certificates Earned</p>
                  <p className="text-3xl font-bold">{trainingStats.certificatesEarned}</p>
                </div>
                <Award className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Learning Streak</p>
                  <p className="text-3xl font-bold flex items-center">
                    {trainingStats.streak}
                    <Flame className="h-6 w-6 ml-1 text-orange-300" />
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Tracking */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Rank Advancement Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{trainingStats.currentRank}</span>
                  <span className="text-sm text-gray-600">→ {trainingStats.nextRank}</span>
                </div>
                <Progress value={trainingStats.rankProgress} className="h-3" />
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{trainingStats.rankProgress}% Complete</span>
                  <span>{100 - trainingStats.rankProgress}% Remaining</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Weekly Learning Goal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">This Week's Progress</span>
                  <span className="text-sm text-gray-600">
                    {trainingStats.weeklyProgress} / {trainingStats.weeklyGoal} hours
                  </span>
                </div>
                <Progress value={(trainingStats.weeklyProgress / trainingStats.weeklyGoal) * 100} className="h-3" />
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{Math.round((trainingStats.weeklyProgress / trainingStats.weeklyGoal) * 100)}% Complete</span>
                  <span>{trainingStats.weeklyGoal - trainingStats.weeklyProgress} hours remaining</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickAccessItems.map((item, index) => (
              <Link key={index} href={item.href}>
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 ${item.color} rounded-lg group-hover:scale-110 transition-transform`}>
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <Badge variant="outline">{item.stats}</Badge>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Recent Activity</TabsTrigger>
            <TabsTrigger value="events">Upcoming Events</TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Training Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                      <div className={`p-2 rounded-full bg-gray-100`}>
                        <activity.icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Upcoming Training Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{event.title}</h4>
                          <p className="text-sm text-gray-600">Presenter: {event.presenter}</p>
                        </div>
                        <Badge variant={event.registered ? "default" : "outline"}>
                          {event.registered ? "Registered" : "Available"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{event.date}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{event.duration}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{event.capacity}</span>
                          </span>
                        </div>
                        {!event.registered && <Button size="sm">Register Now</Button>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paths" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {learningPaths.map((path, index) => (
                <Card key={index} className={`border-2 ${path.color}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{path.title}</CardTitle>
                    <p className="text-sm text-gray-600">{path.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>{path.modules} modules</span>
                        <span>{path.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Difficulty:</span>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < path.difficulty ? "bg-orange-400" : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{path.progress}%</span>
                        </div>
                        <Progress value={path.progress} className="h-2" />
                      </div>
                      <Button className="w-full" variant={path.progress > 0 ? "default" : "outline"}>
                        {path.progress > 0 ? "Continue Learning" : "Start Path"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <Card key={index} className={achievement.earned ? "bg-green-50 border-green-200" : ""}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-full ${achievement.earned ? "bg-green-500" : "bg-gray-200"}`}>
                        <Trophy className={`h-6 w-6 ${achievement.earned ? "text-white" : "text-gray-400"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{achievement.title}</h4>
                          {achievement.earned && (
                            <Badge className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Earned
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <Progress value={achievement.progress} className="h-2" />
                        </div>
                        {achievement.earned && achievement.date && (
                          <p className="text-xs text-green-600 mt-2">Earned {achievement.date}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
