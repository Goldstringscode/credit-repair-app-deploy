"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Play,
  Clock,
  Users,
  BookOpen,
  Video,
  CheckCircle,
  Calendar,
  Search,
  Filter,
  Star,
  Award,
  TrendingUp,
  MessageSquare,
  Target,
  Zap,
} from "lucide-react"

interface TrainingModule {
  id: string
  title: string
  description: string
  category: "Beginner" | "Intermediate" | "Advanced" | "Expert"
  duration: number
  lessons: number
  completed: boolean
  progress: number
  instructor: string
  rating: number
  enrolledCount: number
  prerequisites?: string[]
  skills: string[]
  certificate: boolean
  lastUpdated: string
}

interface TeamMember {
  id: string
  name: string
  avatar: string
  rank: string
  completedModules: number
  totalModules: number
  overallProgress: number
  lastActivity: string
  strengths: string[]
  needsImprovement: string[]
}

interface LiveSession {
  id: string
  title: string
  instructor: string
  date: string
  time: string
  duration: number
  attendees: number
  maxAttendees: number
  category: string
  description: string
  isRecorded: boolean
}

export function TeamTrainingPortal() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  const trainingModules: TrainingModule[] = [
    {
      id: "mlm-fundamentals",
      title: "MLM Fundamentals & Credit Repair Basics",
      description: "Master the core concepts of multi-level marketing and credit repair industry fundamentals",
      category: "Beginner",
      duration: 180,
      lessons: 12,
      completed: true,
      progress: 100,
      instructor: "Sarah Johnson",
      rating: 4.9,
      enrolledCount: 847,
      skills: ["MLM Basics", "Credit Repair", "Industry Knowledge", "Compliance"],
      certificate: true,
      lastUpdated: "2024-01-15",
    },
    {
      id: "advanced-prospecting",
      title: "Advanced Prospecting & Lead Generation",
      description: "Learn cutting-edge techniques for finding and qualifying high-quality prospects",
      category: "Intermediate",
      duration: 240,
      lessons: 16,
      completed: false,
      progress: 65,
      instructor: "Mike Rodriguez",
      rating: 4.8,
      enrolledCount: 623,
      prerequisites: ["mlm-fundamentals"],
      skills: ["Lead Generation", "Social Media", "Cold Calling", "Referral Systems"],
      certificate: true,
      lastUpdated: "2024-01-20",
    },
    {
      id: "sales-mastery",
      title: "Sales Mastery & Objection Handling",
      description: "Develop expert-level sales skills and learn to overcome any objection",
      category: "Advanced",
      duration: 300,
      lessons: 20,
      completed: false,
      progress: 30,
      instructor: "Lisa Chen",
      rating: 4.9,
      enrolledCount: 456,
      prerequisites: ["mlm-fundamentals", "advanced-prospecting"],
      skills: ["Sales Techniques", "Objection Handling", "Closing", "Psychology"],
      certificate: true,
      lastUpdated: "2024-01-18",
    },
    {
      id: "team-leadership",
      title: "Team Leadership & Management",
      description: "Build and lead high-performing MLM teams with proven leadership strategies",
      category: "Advanced",
      duration: 360,
      lessons: 24,
      completed: false,
      progress: 0,
      instructor: "David Wilson",
      rating: 4.7,
      enrolledCount: 289,
      prerequisites: ["sales-mastery"],
      skills: ["Leadership", "Team Building", "Motivation", "Performance Management"],
      certificate: true,
      lastUpdated: "2024-01-22",
    },
    {
      id: "digital-marketing",
      title: "Digital Marketing for MLM Success",
      description: "Leverage digital channels to build your MLM business and generate leads online",
      category: "Intermediate",
      duration: 210,
      lessons: 14,
      completed: false,
      progress: 45,
      instructor: "Emily Davis",
      rating: 4.6,
      enrolledCount: 534,
      skills: ["Digital Marketing", "Social Media", "Content Creation", "Email Marketing"],
      certificate: true,
      lastUpdated: "2024-01-19",
    },
    {
      id: "financial-mastery",
      title: "Financial Planning & Wealth Building",
      description: "Master personal finance and help your team build long-term wealth",
      category: "Expert",
      duration: 420,
      lessons: 28,
      completed: false,
      progress: 0,
      instructor: "Robert Taylor",
      rating: 4.8,
      enrolledCount: 167,
      prerequisites: ["team-leadership"],
      skills: ["Financial Planning", "Investment", "Tax Strategy", "Wealth Building"],
      certificate: true,
      lastUpdated: "2024-01-25",
    },
  ]

  const teamMembers: TeamMember[] = [
    {
      id: "member-1",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40&text=SJ",
      rank: "Director",
      completedModules: 4,
      totalModules: 6,
      overallProgress: 85,
      lastActivity: "2 hours ago",
      strengths: ["Sales", "Leadership", "Training"],
      needsImprovement: ["Digital Marketing", "Financial Planning"],
    },
    {
      id: "member-2",
      name: "Mike Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40&text=MR",
      rank: "Manager",
      completedModules: 3,
      totalModules: 6,
      overallProgress: 72,
      lastActivity: "5 hours ago",
      strengths: ["Prospecting", "Team Building"],
      needsImprovement: ["Advanced Sales", "Digital Marketing"],
    },
    {
      id: "member-3",
      name: "Lisa Chen",
      avatar: "/placeholder.svg?height=40&width=40&text=LC",
      rank: "Consultant",
      completedModules: 2,
      totalModules: 6,
      overallProgress: 58,
      lastActivity: "1 day ago",
      strengths: ["Communication", "Organization"],
      needsImprovement: ["Sales Techniques", "Leadership"],
    },
    {
      id: "member-4",
      name: "David Wilson",
      avatar: "/placeholder.svg?height=40&width=40&text=DW",
      rank: "Associate",
      completedModules: 1,
      totalModules: 6,
      overallProgress: 25,
      lastActivity: "3 days ago",
      strengths: ["Enthusiasm", "Learning"],
      needsImprovement: ["All Core Skills"],
    },
  ]

  const liveSessions: LiveSession[] = [
    {
      id: "session-1",
      title: "Advanced Closing Techniques Masterclass",
      instructor: "Sarah Johnson",
      date: "2024-02-15",
      time: "7:00 PM EST",
      duration: 90,
      attendees: 45,
      maxAttendees: 100,
      category: "Sales",
      description: "Learn the most effective closing techniques used by top MLM performers",
      isRecorded: true,
    },
    {
      id: "session-2",
      title: "Social Media Lead Generation Workshop",
      instructor: "Emily Davis",
      date: "2024-02-18",
      time: "8:00 PM EST",
      duration: 120,
      attendees: 67,
      maxAttendees: 150,
      category: "Marketing",
      description: "Master Facebook, Instagram, and LinkedIn for MLM prospecting",
      isRecorded: true,
    },
    {
      id: "session-3",
      title: "Team Motivation & Recognition Strategies",
      instructor: "David Wilson",
      date: "2024-02-22",
      time: "6:00 PM EST",
      duration: 75,
      attendees: 23,
      maxAttendees: 75,
      category: "Leadership",
      description: "Keep your team motivated and engaged for long-term success",
      isRecorded: false,
    },
  ]

  const filteredModules = trainingModules.filter((module) => {
    const matchesSearch =
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || module.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const overallTeamProgress = Math.round(
    teamMembers.reduce((acc, member) => acc + member.overallProgress, 0) / teamMembers.length,
  )

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Progress</p>
                <p className="text-2xl font-bold text-blue-600">{overallTeamProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 text-xs text-blue-600">+12% this month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Learners</p>
                <p className="text-2xl font-bold text-green-600">{teamMembers.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 text-xs text-green-600">All team members</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Modules Available</p>
                <p className="text-2xl font-bold text-purple-600">{trainingModules.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 text-xs text-purple-600">Comprehensive curriculum</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Certificates Earned</p>
                <p className="text-2xl font-bold text-orange-600">
                  {teamMembers.reduce((acc, member) => acc + member.completedModules, 0)}
                </p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 text-xs text-orange-600">Team achievements</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules">Training Modules</TabsTrigger>
          <TabsTrigger value="team">Team Progress</TabsTrigger>
          <TabsTrigger value="live">Live Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search training modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white"
              >
                <option value="All">All Categories</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Training Modules Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredModules.map((module) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        {module.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {module.certificate && <Award className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{module.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{module.duration} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-3 w-3" />
                          <span>{module.lessons} lessons</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{module.enrolledCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span>{module.rating}</span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        module.category === "Beginner"
                          ? "default"
                          : module.category === "Intermediate"
                            ? "secondary"
                            : module.category === "Advanced"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {module.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Prerequisites */}
                    {module.prerequisites && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Prerequisites:</p>
                        <div className="flex flex-wrap gap-1">
                          {module.prerequisites.map((prereq) => (
                            <Badge key={prereq} variant="outline" className="text-xs">
                              {trainingModules.find((m) => m.id === prereq)?.title || prereq}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Skills you'll learn:</p>
                      <div className="flex flex-wrap gap-1">
                        {module.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{module.progress}%</span>
                      </div>
                      <Progress value={module.progress} className="h-2" />
                    </div>

                    {/* Instructor */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">
                            {module.instructor
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <span className="text-gray-600">{module.instructor}</span>
                      </div>
                      <span className="text-xs text-gray-500">Updated {module.lastUpdated}</span>
                    </div>

                    <Button className="w-full" variant={module.completed ? "outline" : "default"}>
                      {module.completed ? "Review Module" : module.progress > 0 ? "Continue Learning" : "Start Module"}
                      <Play className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Team Overview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Team Training Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedMember === member.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={member.avatar || "/placeholder.svg"}
                            alt={member.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <h4 className="font-medium">{member.name}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{member.rank}</Badge>
                              <span className="text-sm text-gray-500">{member.lastActivity}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{member.overallProgress}%</div>
                          <div className="text-sm text-gray-500">
                            {member.completedModules}/{member.totalModules} modules
                          </div>
                        </div>
                      </div>

                      <Progress value={member.overallProgress} className="h-2 mb-3" />

                      {selectedMember === member.id && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          <div>
                            <p className="text-sm font-medium text-green-700 mb-1">Strengths:</p>
                            <div className="flex flex-wrap gap-1">
                              {member.strengths.map((strength) => (
                                <Badge key={strength} className="bg-green-100 text-green-800 text-xs">
                                  {strength}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-orange-700 mb-1">Needs Improvement:</p>
                            <div className="flex flex-wrap gap-1">
                              {member.needsImprovement.map((area) => (
                                <Badge key={area} className="bg-orange-100 text-orange-800 text-xs">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                            <Button size="sm" variant="outline">
                              <Target className="h-4 w-4 mr-2" />
                              Set Goals
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Team Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{overallTeamProgress}%</div>
                  <div className="text-sm text-gray-600">Average Progress</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Completed Modules</span>
                    <span className="font-medium">
                      {teamMembers.reduce((acc, member) => acc + member.completedModules, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Modules</span>
                    <span className="font-medium">
                      {teamMembers.reduce((acc, member) => acc + member.totalModules, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Learners</span>
                    <span className="font-medium">{teamMembers.length}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h5 className="font-medium mb-2">Top Performers</h5>
                  <div className="space-y-2">
                    {teamMembers
                      .sort((a, b) => b.overallProgress - a.overallProgress)
                      .slice(0, 3)
                      .map((member, index) => (
                        <div key={member.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-yellow-600">#{index + 1}</span>
                            </div>
                            <span>{member.name}</span>
                          </div>
                          <span className="font-medium">{member.overallProgress}%</span>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="live" className="space-y-6">
          <div className="grid gap-6">
            {liveSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{session.title}</h3>
                      <p className="text-gray-600 mb-3">{session.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {session.date} at {session.time}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{session.duration} minutes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {session.attendees}/{session.maxAttendees} registered
                          </span>
                        </div>
                        {session.isRecorded && (
                          <div className="flex items-center space-x-1">
                            <Video className="h-4 w-4" />
                            <span>Recorded</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="mb-2">{session.category}</Badge>
                      <div className="text-sm text-gray-600 mb-2">Instructor</div>
                      <div className="font-semibold">{session.instructor}</div>
                      <Button className="mt-4">
                        {new Date(session.date) > new Date() ? "Register Now" : "Watch Recording"}
                      </Button>
                    </div>
                  </div>
                  <Progress value={(session.attendees / session.maxAttendees) * 100} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">
                    {session.maxAttendees - session.attendees} spots remaining
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">78%</div>
                  <div className="text-sm text-gray-600">Average completion rate</div>
                  <div className="text-xs text-green-600 mt-1">+15% vs last month</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Engagement Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">92%</div>
                  <div className="text-sm text-gray-600">Team engagement</div>
                  <div className="text-xs text-blue-600 mt-1">Excellent level</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {teamMembers.reduce((acc, member) => acc + member.completedModules, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total earned</div>
                  <div className="text-xs text-purple-600 mt-1">+8 this month</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Training Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Most Popular Modules</h4>
                  <div className="space-y-2">
                    {trainingModules
                      .sort((a, b) => b.enrolledCount - a.enrolledCount)
                      .slice(0, 3)
                      .map((module, index) => (
                        <div key={module.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-600">#{index + 1}</span>
                            </div>
                            <span className="font-medium">{module.title}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{module.enrolledCount} enrolled</span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-sm">{module.rating}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Skills Development Progress</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {["Sales", "Leadership", "Marketing", "Communication"].map((skill) => (
                      <div key={skill} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{skill}</span>
                          <span>{Math.floor(Math.random() * 30) + 60}%</span>
                        </div>
                        <Progress value={Math.floor(Math.random() * 30) + 60} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
