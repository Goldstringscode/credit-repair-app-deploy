"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TrainingSkeleton } from "@/components/loading-skeletons"
import { CertificatesViewer } from "@/components/training/certificates-viewer"
import { progressTrackingService } from "@/lib/progress-tracking"
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
  RotateCcw,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { NotesDashboard } from "@/components/training/notes-dashboard"

export default function TrainingPage() {

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [showCertificates, setShowCertificates] = useState(false)
  const [userProgress, setUserProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load user progress
  useEffect(() => {
    const loadProgress = () => {
      const progress = progressTrackingService.getUserProgress()
      setUserProgress(progress)
      setLoading(false)
    }

    loadProgress()

    // Listen for localStorage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userProgress') {
        console.log('Storage change detected, refreshing progress')
        loadProgress()
      }
    }

    // Listen for visibility changes (when user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, refreshing progress')
        loadProgress()
      }
    }

    // Listen for lesson completion changes
    const handleLessonCompletionChange = () => {
      console.log('Lesson completion change detected, refreshing progress')
      loadProgress()
    }

    window.addEventListener('storage', handleStorageChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('lessonCompletionChanged', handleLessonCompletionChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('lessonCompletionChanged', handleLessonCompletionChange)
    }
  }, [])

  if (loading || !userProgress) {
    return <TrainingSkeleton />
  }

  // Get resume data for the Continue Learning button
  const resumeData = userProgress ? (() => {
    // Find the most recently accessed lesson with progress
    const lessonsWithProgress = userProgress.lessons.filter((l: any) => l.currentTime > 0)
    if (lessonsWithProgress.length === 0) return null
    
    const mostRecentLesson = lessonsWithProgress.reduce((latest: any, current: any) => {
      return new Date(current.lastAccessed) > new Date(latest.lastAccessed) ? current : latest
    })
    
    const course = userProgress.courses.find((c: any) => c.courseId === mostRecentLesson.courseId)
    
    return {
      lessonId: mostRecentLesson.lessonId,
      currentTime: mostRecentLesson.currentTime,
      lessonTitle: mostRecentLesson.lessonTitle,
      courseTitle: course?.courseTitle || "Continue Learning",
      progress: Math.round((mostRecentLesson.currentTime / mostRecentLesson.duration) * 100),
      timeRemaining: mostRecentLesson.duration - mostRecentLesson.currentTime,
      lastAccessed: new Date(mostRecentLesson.lastAccessed)
    }
  })() : null
  
  const resumeUrl = resumeData?.lessonId ? (() => {
    // Map course titles to course IDs
    const courseIdMap: Record<string, string> = {
      'Credit Basics & Fundamentals': 'credit-basics',
      'Advanced Dispute Strategies': 'advanced-disputes'
    }
    const courseId = courseIdMap[resumeData.courseTitle] || 'credit-basics'
    return `/dashboard/training/courses/${courseId}`
  })() : null

  const quickActions = [
    {
      title: "Take Quiz",
      description: "Test your knowledge",
      icon: Target,
      href: "/dashboard/training/quizzes",
      color: "bg-blue-500",
    },
    {
      title: resumeData ? "Continue Learning" : "Start Learning",
      description: resumeData ? 
        `Resume: ${resumeData.lessonTitle}` : 
        "Begin your credit repair journey",
      icon: Play,
      onClick: () => resumeUrl && router.push(resumeUrl),
      color: "bg-green-500",
      showProgress: !!resumeData,
      progressData: resumeData,
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

  // Get courses with real progress data from progress tracking service
  const getCoursesWithProgress = () => {
    const baseCourses = [
      {
        id: "credit-basics",
        title: "Credit Basics & Fundamentals",
        description: "Learn the foundation of credit repair and understand how credit scores work.",
        level: "Beginner",
        category: "Fundamentals",
        duration: "2 hours",
        lessons: 8,
        students: 1234,
        rating: 4.8,
        locked: false,
        tags: ["Credit Score", "Basics", "FICO"],
      },
      {
        id: "advanced-disputes",
        title: "Advanced Dispute Strategies",
        description: "Master advanced techniques for disputing negative items on credit reports.",
        level: "Advanced",
        category: "Dispute Strategies",
        duration: "3 hours",
        lessons: 12,
        students: 856,
        rating: 4.9,
        locked: false,
        tags: ["Disputes", "Advanced", "Letters"],
      },
      {
        id: "legal-rights",
        title: "Consumer Legal Rights",
        description: "Understand your rights under FCRA, FDCPA, and other consumer protection laws.",
        level: "Intermediate",
        category: "Legal",
        duration: "2.5 hours",
        lessons: 10,
        students: 967,
        rating: 4.7,
        locked: false,
        tags: ["FCRA", "FDCPA", "Legal Rights"],
      },
      {
        id: "credit-building",
        title: "Credit Building Strategies",
        description: "Learn proven methods to build and maintain excellent credit scores.",
        level: "Intermediate",
        category: "Credit Building",
        duration: "2 hours",
        lessons: 9,
        students: 1456,
        rating: 4.6,
        locked: false,
        tags: ["Credit Building", "Strategies", "Maintenance"],
      },
      {
        id: "business-credit",
        title: "Business Credit Mastery",
        description: "Establish and build business credit separate from personal credit.",
        level: "Advanced",
        category: "Business",
        duration: "4 hours",
        lessons: 15,
        students: 543,
        rating: 4.8,
        locked: true,
        tags: ["Business Credit", "EIN", "D-U-N-S"],
      },
      {
        id: "mortgage-preparation",
        title: "Mortgage Preparation",
        description: "Prepare your credit for mortgage approval and get the best rates.",
        level: "Intermediate",
        category: "Mortgage",
        duration: "1.5 hours",
        lessons: 6,
        students: 789,
        rating: 4.5,
        locked: true,
        tags: ["Mortgage", "Home Buying", "Rates"],
      },
    ]

    // Add real progress data from progress tracking service
    return baseCourses.map(course => {
      const courseProgress = userProgress?.courses.find((c: any) => c.courseId === course.id)
      const overallProgress = courseProgress?.overallProgress || 0
      
      // Get current lesson and completion stats
      const currentLesson = progressTrackingService.getCurrentLessonForCourse(course.id)
      const completionStats = progressTrackingService.getCourseCompletionStats(course.id)
      
      return {
        ...course,
        progress: completionStats.percentage,
        completed: completionStats.percentage >= 100,
        currentLesson: currentLesson,
        completionStats: completionStats,
        lastAccessed: currentLesson?.lastAccessed || new Date(),
      }
    })
  }

  const courses = getCoursesWithProgress()

  const quickStats = [
    {
      title: "Courses Completed",
      value: courses.filter(c => c.completed).length,
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Lessons Completed",
      value: courses.reduce((acc, c) => acc + (c.completionStats?.completed || 0), 0),
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Certificates Earned",
      value: courses.filter(c => c.completed).length,
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Success Rate",
      value: courses.length > 0 ? 
        Math.round(courses.reduce((acc, c) => acc + (c.completionStats?.percentage || 0), 0) / courses.length) + '%' : 
        '0%',
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel

    return matchesSearch && matchesCategory && matchesLevel
  })

  const categories = ["all", ...Array.from(new Set(courses.map((course) => course.category)))]
  const levels = ["all", ...Array.from(new Set(courses.map((course) => course.level)))]

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
            Master credit repair with our comprehensive courses and certifications. 
            Transform your financial future with expert-led training.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className={`p-4 rounded-2xl ${stat.bgColor} mx-auto mb-4 w-fit group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-600">{stat.title}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Card 
                key={index} 
                className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border-0 bg-white/90 backdrop-blur-sm overflow-hidden"
                onClick={() => {
                  if (action.onClick) {
                    action.onClick()
                  } else if (action.href) {
                    router.push(action.href)
                  }
                }}
              >
                <CardContent className="p-8 text-center relative">
                  <div className={`p-4 rounded-2xl ${action.color} mx-auto mb-4 w-fit group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-800">{action.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                  
                  {/* Show progress for Continue Learning button */}
                  {action.showProgress && action.progressData && (
                    <div className="mt-4 text-left bg-gray-50 rounded-lg p-3">
                      <div className="text-xs font-medium text-gray-700 mb-2">
                        {action.progressData.courseTitle}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${action.progressData.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-600">
                        {Math.round(action.progressData.timeRemaining / 60)}m remaining • {action.progressData.lastAccessed.toLocaleDateString()}
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Demo Section */}
        <Card className="mb-12 border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <CardContent className="p-8 relative">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-white/20 rounded-lg mr-3">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">🎬 Try Our Video Learning System</h3>
                </div>
                <p className="text-blue-100 text-lg mb-6 max-w-2xl">
                  Experience our professional video player with a sample lesson on credit report basics. 
                  See how our interactive learning platform can transform your credit repair education.
                </p>
                <Button 
                  onClick={() => router.push('/dashboard/training/demo')}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo Lesson
                </Button>
              </div>
              <div className="hidden lg:block ml-8">
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-16 w-16 text-white/80" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="mb-12 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search courses, topics, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
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
                  {levels.map((level) => (
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
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold">All Courses</TabsTrigger>
            <TabsTrigger value="in-progress" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold">In Progress</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold">Completed</TabsTrigger>
            <TabsTrigger value="notes" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold">My Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  className={`group border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 ${
                    course.locked ? "opacity-60" : "hover:-translate-y-2"
                  } ${course.completed ? "ring-2 ring-green-200 bg-green-50/50" : ""}`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge
                            variant={
                              course.level === "Beginner"
                                ? "secondary"
                                : course.level === "Intermediate"
                                  ? "default"
                                  : "destructive"
                            }
                            className="font-semibold"
                          >
                            {course.level}
                          </Badge>
                          <Badge variant="outline" className="font-medium">{course.category}</Badge>
                          {course.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {course.locked && <Lock className="h-5 w-5 text-gray-400" />}
                        </div>
                        <CardTitle className="text-xl mb-2 font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{course.title}</CardTitle>
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{course.description}</p>
                      </div>
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
                          <span className="font-medium">{course.lessons} lessons</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">{course.students}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{course.rating}</span>
                      </div>
                    </div>

                    {course.progress > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <div className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                          📚 Lessons Completed: {course.completionStats?.completed || 0}/{course.completionStats?.total || course.lessons}
                        </div>
                        {course.currentLesson && (
                          <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            Last: {course.currentLesson.lessonTitle}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs font-medium bg-gray-50">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button 
                      className={`w-full h-12 font-semibold text-lg transition-all duration-300 ${
                        course.locked 
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                          : course.progress > 0
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                          : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
                      }`}
                      disabled={course.locked} 
                      asChild={!course.locked}
                    >
                      {course.locked ? (
                        <>
                          <Lock className="h-5 w-5 mr-2" />
                          Locked
                        </>
                      ) : (
                        <>
                          {course.progress > 0 ? (
                            <a href={`/dashboard/training/courses/${course.id}`}>
                              <Play className="h-5 w-5 mr-2" />
                              Continue Learning
                            </a>
                          ) : (
                            <a href={`/dashboard/training/courses/${course.id}`}>
                              <BookOpen className="h-5 w-5 mr-2" />
                              Start Course
                            </a>
                          )}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses
              .filter((course) => course.progress > 0 && !course.completed)
              .map((course) => (
                <Card key={course.id} className="border-2 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge
                            variant={
                              course.level === "Beginner"
                                ? "secondary"
                                : course.level === "Intermediate"
                                  ? "default"
                                  : "destructive"
                            }
                          >
                            {course.level}
                          </Badge>
                          <Badge variant="outline">{course.category}</Badge>
                        </div>
                        <CardTitle className="text-lg mb-1">{course.title}</CardTitle>
                        <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>

                    <Button className="w-full" asChild>
                      <a href={`/dashboard/training/courses/${course.id}`}>
                        <Play className="h-4 w-4 mr-2" />
                        Continue Learning
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses
              .filter((course) => course.completed)
              .map((course) => (
                <Card key={course.id} className="border-2 border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge
                            variant={
                              course.level === "Beginner"
                                ? "secondary"
                                : course.level === "Intermediate"
                                  ? "default"
                                  : "destructive"
                            }
                          >
                            {course.level}
                          </Badge>
                          <Badge variant="outline">{course.category}</Badge>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <CardTitle className="text-lg mb-1">{course.title}</CardTitle>
                        <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Completed</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating}</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <a href={`/dashboard/training/courses/${course.id}`}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Review Course
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
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
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setShowCertificates(false)}
                 className="hover:bg-gray-100"
               >
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
