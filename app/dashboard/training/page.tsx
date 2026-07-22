"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrainingSkeleton } from "@/components/loading-skeletons"
import { CertificatesViewer } from "@/components/training/certificates-viewer"
import {
  GraduationCap,
  Clock,
  Users,
  Star,
  BookOpen,
  Award,
  Target,
  TrendingUp,
  Search,
  Play,
  CheckCircle,
  Lock,
  X,
  AlertCircle,
  RotateCcw,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { NotesDashboard } from "@/components/training/notes-dashboard"

interface CourseCardData {
  id: string
  title: string
  description: string
  instructor: string
  rating: number
  students: number
  level: "Beginner" | "Intermediate" | "Advanced"
  category: string
  duration: string
  tags: string[]
  requiresPaid: boolean
  lessonCount: number
  locked: boolean
  completedLessons: number
  progressPercentage: number
  completed: boolean
  lastAccessed: string | null
}

interface TrainingStats {
  coursesCompleted: number
  lessonsCompleted: number
  certificatesEarned: number
  totalCourses: number
}

export default function TrainingPage() {
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [showCertificates, setShowCertificates] = useState(false)

  const [courses, setCourses] = useState<CourseCardData[]>([])
  const [stats, setStats] = useState<TrainingStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const res = await fetch("/api/training/courses")
      if (res.status === 401) {
        setLoadError("Please sign in to view your training progress.")
        return
      }
      if (!res.ok) {
        setLoadError("Something went wrong loading your courses. Please try again.")
        return
      }
      const json = await res.json()
      if (!json.success) {
        setLoadError(json.error || "Something went wrong loading your courses.")
        return
      }
      setCourses(json.courses ?? [])
      setStats(json.stats ?? null)
    } catch (err) {
      console.error("Failed to load training courses:", err)
      setLoadError("Something went wrong loading your courses. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (isLoading) {
    return <TrainingSkeleton />
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-xl mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">{loadError}</p>
            <Button onClick={loadData} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // The most recently accessed course with progress that isn't finished yet
  const resumeCourse = [...courses]
    .filter(c => c.completedLessons > 0 && !c.completed && c.lastAccessed)
    .sort((a, b) => (b.lastAccessed! > a.lastAccessed! ? 1 : -1))[0]

  const quickStats = [
    {
      title: "Courses Completed",
      value: stats?.coursesCompleted ?? 0,
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Lessons Completed",
      value: stats?.lessonsCompleted ?? 0,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Certificates Earned",
      value: stats?.certificatesEarned ?? 0,
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Success Rate",
      value:
        courses.length > 0
          ? Math.round(courses.reduce((acc, c) => acc + c.progressPercentage, 0) / courses.length) + "%"
          : "0%",
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const quickActions = [
    {
      title: "Take Quiz",
      description: "Test your knowledge",
      icon: Target,
      href: "/dashboard/training/quizzes",
      color: "bg-blue-500",
    },
    {
      title: resumeCourse ? "Continue Learning" : "Start Learning",
      description: resumeCourse ? `Resume: ${resumeCourse.title}` : "Begin your credit repair journey",
      icon: Play,
      onClick: () =>
        router.push(`/dashboard/training/courses/${resumeCourse ? resumeCourse.id : "credit-basics"}`),
      color: "bg-green-500",
      showProgress: !!resumeCourse,
      progressData: resumeCourse,
    },
    {
      title: "View Certificates",
      description: "See your achievements",
      icon: Award,
      onClick: () => setShowCertificates(true),
      color: "bg-purple-500",
    },
    {
      title: "Track Progress",
      description: "Monitor your learning",
      icon: TrendingUp,
      href: "/dashboard/training/progress",
      color: "bg-orange-500",
    },
    {
      title: "My Notes",
      description: "View all your notes",
      icon: BookOpen,
      href: "/dashboard/training/notes",
      color: "bg-indigo-500",
    },
  ]

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel
    return matchesSearch && matchesCategory && matchesLevel
  })

  const categories = ["all", ...Array.from(new Set(courses.map(c => c.category)))]
  const levels = ["all", ...Array.from(new Set(courses.map(c => c.level)))]

  const levelBadgeVariant = (level: string) =>
    level === "Beginner" ? "secondary" : level === "Intermediate" ? "default" : "destructive"

  const renderCourseCard = (course: CourseCardData) => (
    <Card
      key={course.id}
      className={`group border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 ${
        course.locked ? "opacity-60" : "hover:-translate-y-2"
      } ${course.completed ? "ring-2 ring-green-200 bg-green-50/50" : ""}`}
    >
      <CardHeader className="pb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <Badge variant={levelBadgeVariant(course.level)} className="font-semibold">
              {course.level}
            </Badge>
            <Badge variant="outline" className="font-medium">
              {course.category}
            </Badge>
            {course.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
            {course.locked && <Lock className="h-5 w-5 text-gray-400" />}
          </div>
          <CardTitle className="text-xl mb-2 font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
            {course.title}
          </CardTitle>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{course.description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{course.duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span className="font-medium">{course.lessonCount} lessons</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span className="font-medium">{course.students.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{course.rating}</span>
          </div>
        </div>

        {course.progressPercentage > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-semibold">
              <span>Progress</span>
              <span>{course.progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${course.progressPercentage}%` }}
              />
            </div>
            <div className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
              📚 Lessons Completed: {course.completedLessons}/{course.lessonCount}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {course.tags.map((tag, i) => (
            <Badge key={i} variant="outline" className="text-xs font-medium bg-gray-50">
              {tag}
            </Badge>
          ))}
        </div>

        <Button
          className={`w-full h-12 font-semibold text-lg transition-all duration-300 ${
            course.locked
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : course.progressPercentage > 0
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
          }`}
          disabled={course.locked}
          asChild={!course.locked}
        >
          {course.locked ? (
            <span>
              <Lock className="h-5 w-5 mr-2 inline" />
              Locked
            </span>
          ) : (
            <a href={`/dashboard/training/courses/${course.id}`}>
              {course.progressPercentage > 0 ? (
                <>
                  <Play className="h-5 w-5 mr-2 inline" />
                  Continue Learning
                </>
              ) : (
                <>
                  <BookOpen className="h-5 w-5 mr-2 inline" />
                  Start Course
                </>
              )}
            </a>
          )}
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Training Center
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Master credit repair with our comprehensive courses and certifications. Transform your financial
            future with expert-led training.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`p-4 rounded-2xl ${stat.bgColor} mx-auto mb-4 w-fit group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-600">{stat.title}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Card
                key={index}
                className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border-0 bg-white/90 backdrop-blur-sm overflow-hidden"
                onClick={() => {
                  if (action.onClick) action.onClick()
                  else if (action.href) router.push(action.href)
                }}
              >
                <CardContent className="p-8 text-center relative">
                  <div
                    className={`p-4 rounded-2xl ${action.color} mx-auto mb-4 w-fit group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-800">{action.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{action.description}</p>

                  {action.showProgress && action.progressData && (
                    <div className="mt-4 text-left bg-gray-50 rounded-lg p-3">
                      <div className="text-xs font-medium text-gray-700 mb-2">{action.progressData.title}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${action.progressData.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Search and Filters */}
        <Card className="mb-12 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search courses, topics, or skills..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-full md:w-40 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level === "all" ? "All Levels" : level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Course Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl p-1">
            <TabsTrigger
              value="all"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold"
            >
              All Courses
            </TabsTrigger>
            <TabsTrigger
              value="in-progress"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold"
            >
              In Progress
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold"
            >
              My Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-8">
            {filteredCourses.length === 0 ? (
              <p className="text-center text-gray-500 py-16">No courses match your search.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map(renderCourseCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="in-progress" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.filter(c => c.progressPercentage > 0 && !c.completed).map(renderCourseCard)}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.filter(c => c.completed).map(renderCourseCard)}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <NotesDashboard />
          </TabsContent>
        </Tabs>

        {/* Certificates Viewer Modal */}
        {showCertificates && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Certificates</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCertificates(false)} className="hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4">
                <CertificatesViewer
                  userId="demo-user-123"
                  courseId="demo-course-456"
                  onClose={() => setShowCertificates(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
