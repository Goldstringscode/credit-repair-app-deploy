"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
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
  Target,
  Zap,
  Lock,
  Download,
  FileText,
  Trophy,
  Brain,
  Lightbulb,
  BarChart3,
  Mic,
  Headphones,
  Globe,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"

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
  difficulty: number
  practicalExercises: number
  quizzes: number
  videoContent: number
  locked?: boolean
  requirements?: string
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
  questions?: any[]
}

interface Certificate {
  id: string
  title: string
  description: string
  requirements: string[]
  badge: string
  earned: boolean
  earnedDate?: string
  progress?: number
  skills: string[]
  credentialId?: string
}

export default function MLMTrainingPage() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [userProgress, setUserProgress] = useState({
    totalHours: 24.5,
    completedModules: 3,
    certificatesEarned: 2,
    currentStreak: 7,
    rank: "Advanced Learner",
    points: 2450,
  })
  const { toast } = useToast()

  const trainingModules: TrainingModule[] = [
    {
      id: "mlm-fundamentals",
      title: "MLM Fundamentals & Industry Basics",
      description: "Master the core concepts of multi-level marketing, compensation plans, and industry regulations",
      category: "Beginner",
      duration: 180,
      lessons: 12,
      completed: true,
      progress: 100,
      instructor: "Sarah Johnson",
      rating: 4.9,
      enrolledCount: 1247,
      skills: ["MLM Basics", "Compensation Plans", "Legal Compliance", "Industry Knowledge"],
      certificate: true,
      lastUpdated: "2024-01-15",
      difficulty: 2,
      practicalExercises: 5,
      quizzes: 3,
      videoContent: 8,
    },
    {
      id: "credit-repair-mastery",
      title: "Credit Repair Service Mastery",
      description: "Deep dive into credit repair processes, dispute strategies, and client management",
      category: "Beginner",
      duration: 240,
      lessons: 16,
      completed: true,
      progress: 100,
      instructor: "Michael Rodriguez",
      rating: 4.8,
      enrolledCount: 1089,
      skills: ["Credit Analysis", "Dispute Letters", "Client Communication", "FCRA Knowledge"],
      certificate: true,
      lastUpdated: "2024-01-18",
      difficulty: 3,
      practicalExercises: 8,
      quizzes: 4,
      videoContent: 12,
    },
    {
      id: "prospecting-lead-generation",
      title: "Advanced Prospecting & Lead Generation",
      description: "Learn cutting-edge techniques for finding, qualifying, and converting high-quality prospects",
      category: "Intermediate",
      duration: 300,
      lessons: 20,
      completed: false,
      progress: 65,
      instructor: "Lisa Chen",
      rating: 4.9,
      enrolledCount: 823,
      prerequisites: ["mlm-fundamentals"],
      skills: ["Lead Generation", "Social Media Prospecting", "Cold Calling", "Referral Systems"],
      certificate: true,
      lastUpdated: "2024-01-20",
      difficulty: 4,
      practicalExercises: 12,
      quizzes: 5,
      videoContent: 15,
    },
    {
      id: "sales-psychology",
      title: "Sales Psychology & Persuasion Mastery",
      description: "Master the psychology of selling and advanced persuasion techniques for MLM success",
      category: "Intermediate",
      duration: 360,
      lessons: 24,
      completed: false,
      progress: 30,
      instructor: "David Wilson",
      rating: 4.7,
      enrolledCount: 654,
      prerequisites: ["prospecting-lead-generation"],
      skills: ["Sales Psychology", "Persuasion", "Objection Handling", "Closing Techniques"],
      certificate: true,
      lastUpdated: "2024-01-22",
      difficulty: 4,
      practicalExercises: 15,
      quizzes: 6,
      videoContent: 18,
    },
    {
      id: "team-leadership",
      title: "Team Leadership & Management Excellence",
      description: "Build and lead high-performing MLM teams with proven leadership strategies",
      category: "Advanced",
      duration: 420,
      lessons: 28,
      completed: false,
      progress: 0,
      instructor: "Emily Davis",
      rating: 4.8,
      enrolledCount: 456,
      prerequisites: ["sales-psychology"],
      skills: ["Leadership", "Team Building", "Motivation", "Performance Management"],
      certificate: true,
      lastUpdated: "2024-01-25",
      difficulty: 5,
      practicalExercises: 20,
      quizzes: 7,
      videoContent: 22,
    },
    {
      id: "digital-marketing",
      title: "Digital Marketing for MLM Success",
      description: "Leverage digital channels, social media, and online marketing to build your MLM business",
      category: "Intermediate",
      duration: 280,
      lessons: 18,
      completed: false,
      progress: 45,
      instructor: "Robert Taylor",
      rating: 4.6,
      enrolledCount: 734,
      prerequisites: ["prospecting-lead-generation"],
      skills: ["Digital Marketing", "Social Media", "Content Creation", "Email Marketing"],
      certificate: true,
      lastUpdated: "2024-01-19",
      difficulty: 3,
      practicalExercises: 10,
      quizzes: 4,
      videoContent: 14,
    },
    {
      id: "advanced-compensation",
      title: "Advanced Compensation & Rank Strategies",
      description: "Master complex compensation plans and develop strategies for rapid rank advancement",
      category: "Advanced",
      duration: 240,
      lessons: 16,
      completed: false,
      progress: 0,
      instructor: "Jennifer Martinez",
      rating: 4.9,
      enrolledCount: 289,
      prerequisites: ["team-leadership"],
      skills: ["Compensation Analysis", "Rank Advancement", "Team Volume", "Bonus Optimization"],
      certificate: true,
      lastUpdated: "2024-01-28",
      difficulty: 5,
      practicalExercises: 8,
      quizzes: 4,
      videoContent: 12,
      locked: true,
      requirements: "Complete Team Leadership module and achieve Manager rank",
    },
    {
      id: "financial-mastery",
      title: "Financial Planning & Wealth Building",
      description: "Master personal finance, tax strategies, and long-term wealth building for MLM success",
      category: "Expert",
      duration: 480,
      lessons: 32,
      completed: false,
      progress: 0,
      instructor: "Thomas Anderson",
      rating: 4.8,
      enrolledCount: 167,
      prerequisites: ["advanced-compensation"],
      skills: ["Financial Planning", "Tax Strategy", "Investment", "Wealth Building"],
      certificate: true,
      lastUpdated: "2024-01-30",
      difficulty: 5,
      practicalExercises: 25,
      quizzes: 8,
      videoContent: 28,
      locked: true,
      requirements: "Complete Advanced Compensation and achieve Director rank",
    },
  ]

  const certificates: Certificate[] = [
    {
      id: "cert-mlm-specialist",
      title: "Certified MLM Specialist",
      description: "Official certification in multi-level marketing fundamentals and best practices",
      requirements: [
        "Complete MLM Fundamentals module",
        "Pass final exam with 85% or higher",
        "Complete 5 practical scenarios",
        "Submit business plan outline",
      ],
      badge: "🏆",
      earned: true,
      earnedDate: "2024-01-20",
      skills: ["MLM Knowledge", "Compliance", "Business Planning"],
      credentialId: "MLM-SPEC-2024-001",
    },
    {
      id: "cert-credit-expert",
      title: "Credit Repair Expert",
      description: "Advanced certification in credit repair services and client management",
      requirements: [
        "Complete Credit Repair Mastery module",
        "Pass comprehensive exam with 90% or higher",
        "Complete 10 real-world case studies",
        "Demonstrate dispute letter writing skills",
      ],
      badge: "💎",
      earned: true,
      earnedDate: "2024-01-25",
      skills: ["Credit Analysis", "Dispute Resolution", "Client Management"],
      credentialId: "CR-EXP-2024-002",
    },
    {
      id: "cert-sales-professional",
      title: "MLM Sales Professional",
      description: "Professional certification in MLM sales techniques and customer acquisition",
      requirements: [
        "Complete Prospecting & Lead Generation module",
        "Complete Sales Psychology module",
        "Pass advanced sales exam with 85% or higher",
        "Complete 15 sales role-play scenarios",
        "Achieve 10 successful conversions",
      ],
      badge: "🎯",
      earned: false,
      progress: 60,
      skills: ["Sales Techniques", "Lead Generation", "Customer Psychology"],
    },
    {
      id: "cert-team-leader",
      title: "Team Leadership Expert",
      description: "Leadership certification for building and managing high-performing MLM teams",
      requirements: [
        "Complete Team Leadership module",
        "Recruit and train 5+ team members",
        "Pass leadership assessment",
        "Complete team building workshop",
        "Maintain team for 3+ months",
      ],
      badge: "👑",
      earned: false,
      progress: 25,
      skills: ["Leadership", "Team Building", "Mentoring", "Performance Management"],
    },
    {
      id: "cert-digital-marketer",
      title: "Digital Marketing Specialist",
      description: "Certification in digital marketing strategies for MLM business growth",
      requirements: [
        "Complete Digital Marketing module",
        "Create and execute marketing campaign",
        "Generate 50+ qualified leads online",
        "Pass digital marketing exam",
      ],
      badge: "📱",
      earned: false,
      progress: 45,
      skills: ["Digital Marketing", "Social Media", "Content Creation"],
    },
    {
      id: "cert-master-trainer",
      title: "Master Trainer Certification",
      description: "Elite certification for training and developing other MLM professionals",
      requirements: [
        "Complete all prerequisite modules",
        "Achieve Director rank or higher",
        "Train 25+ new team members",
        "Pass master trainer assessment",
        "Complete train-the-trainer program",
      ],
      badge: "🌟",
      earned: false,
      progress: 0,
      skills: ["Training", "Mentoring", "Curriculum Development", "Public Speaking"],
    },
  ]

  const upcomingWebinars = [
    {
      id: "webinar-1",
      title: "Advanced Closing Techniques That Convert",
      presenter: "Sarah Johnson, Presidential Diamond",
      date: "2024-02-15",
      time: "7:00 PM EST",
      duration: 90,
      attendees: 245,
      maxAttendees: 500,
      description: "Learn the exact closing techniques that helped Sarah earn $100K+ per month",
      category: "Sales",
      level: "Intermediate",
    },
    {
      id: "webinar-2",
      title: "Social Media Prospecting Masterclass",
      presenter: "Mike Rodriguez, Executive Director",
      date: "2024-02-18",
      time: "8:00 PM EST",
      duration: 120,
      attendees: 189,
      maxAttendees: 300,
      description: "Master Facebook, Instagram, and LinkedIn for unlimited MLM prospects",
      category: "Marketing",
      level: "Beginner",
    },
    {
      id: "webinar-3",
      title: "Building Million-Dollar Teams",
      presenter: "Lisa Chen, Presidential Diamond",
      date: "2024-02-22",
      time: "6:00 PM EST",
      duration: 75,
      attendees: 156,
      maxAttendees: 400,
      description: "The exact blueprint for building and managing large MLM organizations",
      category: "Leadership",
      level: "Advanced",
    },
    {
      id: "webinar-4",
      title: "Credit Repair Sales Psychology",
      presenter: "David Wilson, Master Trainer",
      date: "2024-02-25",
      time: "7:30 PM EST",
      duration: 60,
      attendees: 98,
      maxAttendees: 250,
      description: "Understand the psychology behind credit repair sales and objection handling",
      category: "Sales",
      level: "Intermediate",
    },
  ]

  const filteredModules = trainingModules.filter((module) => {
    const matchesSearch =
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "All" || module.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalProgress = Math.round(
    trainingModules.reduce((acc, module) => acc + module.progress, 0) / trainingModules.length,
  )

  const handleStartModule = (moduleId: string) => {
    const module = trainingModules.find((m) => m.id === moduleId)
    if (module?.locked) {
      toast({
        title: "Module Locked",
        description: module.requirements || "Complete prerequisite modules to unlock this content.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Starting Module",
      description: `Beginning ${module?.title}. Good luck with your training!`,
    })

    // In a real app, this would navigate to the module content
    setTimeout(() => {
      window.location.href = `/mlm/training/modules/${moduleId}`
    }, 1000)
  }

  const handleRegisterWebinar = (webinarId: string) => {
    const webinar = upcomingWebinars.find((w) => w.id === webinarId)
    toast({
      title: "Registration Successful",
      description: `You're registered for "${webinar?.title}". Check your email for details.`,
    })
  }

  const handleDownloadCertificate = (certId: string) => {
    const cert = certificates.find((c) => c.id === certId)
    toast({
      title: "Certificate Downloaded",
      description: `${cert?.title} certificate has been downloaded to your device.`,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/mlm/dashboard" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MLM Training Academy
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/60 px-3 py-1 rounded-full">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">{userProgress.points} points</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 px-3 py-1 rounded-full">
                <Zap className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">{userProgress.currentStreak} day streak</span>
              </div>
              <Link href="/mlm/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Overview */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Your Training Journey</h1>
                  <p className="text-blue-100 mb-6">Master the skills needed for MLM success</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold">{userProgress.totalHours}h</div>
                      <div className="text-blue-100 text-sm">Training Hours</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold">{userProgress.completedModules}</div>
                      <div className="text-blue-100 text-sm">Modules Complete</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-4xl font-bold">{totalProgress}%</div>
                      <div className="text-blue-100">Overall Progress</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{userProgress.rank}</div>
                      <div className="text-blue-100 text-sm">Current Level</div>
                    </div>
                  </div>
                  <Progress value={totalProgress} className="h-3 bg-blue-400" />
                  <div className="flex justify-between text-sm text-blue-100 mt-2">
                    <span>Beginner</span>
                    <span>Expert</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voice Learning Center Feature */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-full">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Voice Learning Center</h2>
                      <p className="text-purple-100">Interactive voice-powered credit repair training</p>
                    </div>
                    <Badge className="bg-green-500 text-white animate-pulse">
                      <Mic className="h-3 w-3 mr-1" />
                      NEW!
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <Headphones className="h-6 w-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">Audio Lessons</div>
                      <div className="text-xs text-purple-100">18 modules</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <MessageSquare className="h-6 w-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">Voice Commands</div>
                      <div className="text-xs text-purple-100">50+ commands</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <Brain className="h-6 w-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">Interactive Quizzes</div>
                      <div className="text-xs text-purple-100">Voice-activated</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <Globe className="h-6 w-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">Multi-Language</div>
                      <div className="text-xs text-purple-100">4 languages</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Features:</h3>
                    <ul className="text-sm text-purple-100 space-y-1">
                      <li>• Hands-free learning with voice commands</li>
                      <li>• Interactive audio lessons with real-time feedback</li>
                      <li>• Voice-activated quizzes and assessments</li>
                      <li>• Smart bookmarking and note-taking</li>
                      <li>• Progress tracking with voice analytics</li>
                    </ul>
                  </div>
                </div>
                <div className="ml-8">
                  <Link href="/mlm/training/voice-learning">
                    <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-4">
                      <Brain className="h-5 w-5 mr-2" />
                      Enter Voice Learning
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="modules" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="modules">Training Modules</TabsTrigger>
            <TabsTrigger value="webinars">Live Training</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search training modules, skills, or topics..."
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
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            {/* Training Path Recommendations */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-green-600" />
                  Recommended Learning Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                  {["mlm-fundamentals", "credit-repair-mastery", "prospecting-lead-generation", "sales-psychology"].map(
                    (moduleId, index) => {
                      const module = trainingModules.find((m) => m.id === moduleId)
                      if (!module) return null
                      return (
                        <div key={moduleId} className="flex items-center space-x-2 flex-shrink-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              module.completed
                                ? "bg-green-500 text-white"
                                : module.progress > 0
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">{module.title}</span>
                          {index < 3 && <div className="w-4 h-0.5 bg-gray-300"></div>}
                        </div>
                      )
                    },
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Training Modules Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {filteredModules.map((module) => (
                <Card
                  key={module.id}
                  className={`hover:shadow-lg transition-all duration-300 ${
                    module.locked ? "opacity-60" : "hover:scale-[1.02]"
                  } ${selectedModule === module.id ? "ring-2 ring-blue-500" : ""}`}
                  onClick={() => !module.locked && setSelectedModule(module.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-xl">{module.title}</CardTitle>
                          {module.locked && <Lock className="h-5 w-5 text-gray-400" />}
                          {module.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {module.certificate && <Award className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{module.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{module.duration} min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-3 w-3" />
                            <span>{module.lessons} lessons</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Video className="h-3 w-3" />
                            <span>{module.videoContent} videos</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Brain className="h-3 w-3" />
                            <span>{module.quizzes} quizzes</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{module.enrolledCount} enrolled</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{module.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="h-3 w-3" />
                            <span>Level {module.difficulty}/5</span>
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
                        <p className="text-xs font-medium text-gray-600 mb-1">Skills you'll master:</p>
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
                          <span className="font-semibold">{module.progress}%</span>
                        </div>
                        <Progress value={module.progress} className="h-2" />
                      </div>

                      {/* Instructor and Date */}
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

                      {/* Action Button */}
                      {module.locked ? (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-500 italic">{module.requirements}</div>
                          <Button className="w-full bg-transparent" variant="outline" disabled>
                            <Lock className="h-4 w-4 mr-2" />
                            Locked
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="w-full"
                          variant={module.completed ? "outline" : "default"}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartModule(module.id)
                          }}
                        >
                          {module.completed
                            ? "Review Module"
                            : module.progress > 0
                              ? "Continue Learning"
                              : "Start Module"}
                          <Play className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Module Details */}
            {selectedModule && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>{trainingModules.find((m) => m.id === selectedModule)?.title} - Course Outline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">Course Content</h4>
                      {/* Mock lesson content based on module */}
                      {selectedModule === "mlm-fundamentals" && (
                        <div className="space-y-2">
                          {[
                            { title: "Introduction to Multi-Level Marketing", duration: 15, type: "video" },
                            { title: "Understanding Compensation Plans", duration: 20, type: "video" },
                            { title: "Legal and Ethical Considerations", duration: 18, type: "text" },
                            { title: "Building Your MLM Mindset", duration: 12, type: "interactive" },
                            { title: "Knowledge Check: MLM Basics", duration: 10, type: "quiz" },
                            { title: "Setting Up Your Business Structure", duration: 25, type: "practical" },
                            { title: "Understanding Your Target Market", duration: 22, type: "video" },
                            { title: "Creating Your Personal Brand", duration: 16, type: "practical" },
                            { title: "Compliance and Documentation", duration: 14, type: "text" },
                            { title: "Building Your Network Foundation", duration: 20, type: "interactive" },
                            { title: "Goal Setting and Planning", duration: 18, type: "practical" },
                            { title: "Final Assessment", duration: 15, type: "quiz" },
                          ].map((lesson, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200"
                            >
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <div>
                                  <div className="font-medium">{lesson.title}</div>
                                  <div className="text-sm text-gray-600 flex items-center space-x-2">
                                    <span>{lesson.duration} min</span>
                                    <span>•</span>
                                    <span className="capitalize">{lesson.type}</span>
                                  </div>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                Review
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      {selectedModule === "prospecting-lead-generation" && (
                        <div className="space-y-2">
                          {[
                            { title: "Modern Prospecting Fundamentals", duration: 18, type: "video", completed: true },
                            {
                              title: "Identifying Your Ideal Prospect",
                              duration: 22,
                              type: "interactive",
                              completed: true,
                            },
                            { title: "Social Media Prospecting Mastery", duration: 35, type: "video", completed: true },
                            {
                              title: "Cold Market Approach Strategies",
                              duration: 28,
                              type: "practical",
                              completed: true,
                            },
                            { title: "Warm Market Expansion Techniques", duration: 20, type: "video", completed: true },
                            {
                              title: "Online Lead Generation Systems",
                              duration: 32,
                              type: "practical",
                              completed: true,
                            },
                            {
                              title: "Qualifying Prospects Effectively",
                              duration: 25,
                              type: "interactive",
                              completed: true,
                            },
                            {
                              title: "Follow-up Sequences That Convert",
                              duration: 30,
                              type: "practical",
                              completed: true,
                            },
                            { title: "Referral System Development", duration: 24, type: "video", completed: false },
                            { title: "Advanced Prospecting Tools", duration: 26, type: "practical", completed: false },
                            { title: "Tracking and Analytics", duration: 18, type: "text", completed: false },
                            { title: "Prospecting Psychology", duration: 22, type: "video", completed: false },
                            {
                              title: "Objection Prevention Strategies",
                              duration: 20,
                              type: "interactive",
                              completed: false,
                            },
                            {
                              title: "Building Your Prospect Pipeline",
                              duration: 28,
                              type: "practical",
                              completed: false,
                            },
                            { title: "Advanced Techniques Quiz", duration: 15, type: "quiz", completed: false },
                          ].map((lesson, index) => (
                            <div
                              key={index}
                              className={`flex items-center justify-between p-3 border rounded-lg ${
                                lesson.completed ? "bg-green-50 border-green-200" : "bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                {lesson.completed ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <Play className="h-5 w-5 text-gray-400" />
                                )}
                                <div>
                                  <div className="font-medium">{lesson.title}</div>
                                  <div className="text-sm text-gray-600 flex items-center space-x-2">
                                    <span>{lesson.duration} min</span>
                                    <span>•</span>
                                    <span className="capitalize">{lesson.type}</span>
                                  </div>
                                </div>
                              </div>
                              <Button size="sm" variant={lesson.completed ? "outline" : "default"}>
                                {lesson.completed ? "Review" : "Start"}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">What You'll Achieve</h4>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <div className="font-medium">Master Core Skills</div>
                            <div className="text-sm text-gray-600">
                              Develop expertise in all essential areas of this topic
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Award className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <div className="font-medium">Earn Certification</div>
                            <div className="text-sm text-gray-600">
                              Receive official certification upon successful completion
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <div className="font-medium">Boost Your Income</div>
                            <div className="text-sm text-gray-600">
                              Apply learned skills to increase your MLM earnings
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                          <div>
                            <div className="font-medium">Build Your Network</div>
                            <div className="text-sm text-gray-600">
                              Connect with other learners and industry experts
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="webinars" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Video className="h-5 w-5 mr-2" />
                    Upcoming Live Training Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingWebinars.map((webinar) => (
                      <div
                        key={webinar.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{webinar.title}</h3>
                            <Badge variant="outline">{webinar.level}</Badge>
                            <Badge variant="secondary">{webinar.category}</Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{webinar.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {webinar.date} at {webinar.time}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{webinar.duration} min</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>
                                {webinar.attendees}/{webinar.maxAttendees} registered
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Presenter:</span> {webinar.presenter}
                          </div>
                        </div>
                        <div className="ml-4">
                          <Button onClick={() => handleRegisterWebinar(webinar.id)}>Register Free</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Past Webinar Recordings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Play className="h-5 w-5 mr-2" />
                    Recorded Training Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      {
                        title: "The Psychology of MLM Success",
                        presenter: "Dr. Amanda Foster",
                        duration: 85,
                        views: 1247,
                        rating: 4.9,
                        category: "Mindset",
                      },
                      {
                        title: "Credit Repair Objection Handling",
                        presenter: "Marcus Johnson",
                        duration: 72,
                        views: 892,
                        rating: 4.7,
                        category: "Sales",
                      },
                      {
                        title: "Building Passive Income Streams",
                        presenter: "Rachel Kim",
                        duration: 95,
                        views: 1456,
                        rating: 4.8,
                        category: "Strategy",
                      },
                      {
                        title: "Social Media Automation for MLM",
                        presenter: "Tony Martinez",
                        duration: 68,
                        views: 734,
                        rating: 4.6,
                        category: "Marketing",
                      },
                    ].map((recording, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold">{recording.title}</h4>
                          <Badge variant="outline">{recording.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">by {recording.presenter}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{recording.duration} min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{recording.views} views</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{recording.rating}</span>
                          </div>
                        </div>
                        <Button size="sm" className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Watch Recording
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-6">
            <div className="grid gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} className={cert.earned ? "border-green-200 bg-green-50" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{cert.badge}</div>
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <span>{cert.title}</span>
                            {cert.earned && <CheckCircle className="h-5 w-5 text-green-500" />}
                          </CardTitle>
                          <p className="text-gray-600 text-sm">{cert.description}</p>
                          {cert.earned && cert.earnedDate && (
                            <p className="text-green-600 text-sm font-medium">
                              Earned on {new Date(cert.earnedDate).toLocaleDateString()}
                            </p>
                          )}
                          {cert.credentialId && (
                            <p className="text-xs text-gray-500">Credential ID: {cert.credentialId}</p>
                          )}
                        </div>
                      </div>
                      {cert.earned && (
                        <Button variant="outline" onClick={() => handleDownloadCertificate(cert.id)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Skills */}
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Skills Validated:</p>
                        <div className="flex flex-wrap gap-2">
                          {cert.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Requirements */}
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Requirements:</p>
                        <ul className="space-y-1">
                          {cert.requirements.map((req, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              {cert.earned ? (
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              ) : (
                                <div className="w-4 h-4 border-2 border-gray-300 rounded-full mt-0.5 flex-shrink-0" />
                              )}
                              <span className={cert.earned ? "text-green-700" : "text-gray-600"}>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Progress */}
                      {!cert.earned && cert.progress !== undefined && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span className="font-semibold">{cert.progress}%</span>
                          </div>
                          <Progress value={cert.progress} className="h-2" />
                        </div>
                      )}

                      {/* Action Button */}
                      {!cert.earned && (
                        <Button className="w-full bg-transparent" variant="outline">
                          <Target className="h-4 w-4 mr-2" />
                          Start Certification Path
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Training Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Training Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        title: "MLM Success Handbook",
                        type: "PDF Guide",
                        size: "2.4 MB",
                        downloads: 1247,
                        description: "Complete guide to building a successful MLM business",
                      },
                      {
                        title: "Credit Repair Scripts Library",
                        type: "Document Pack",
                        size: "1.8 MB",
                        downloads: 892,
                        description: "Proven scripts for every credit repair scenario",
                      },
                      {
                        title: "Prospecting Worksheet Templates",
                        type: "Excel Templates",
                        size: "0.9 MB",
                        downloads: 1456,
                        description: "Track and organize your prospecting activities",
                      },
                      {
                        title: "Compensation Plan Calculator",
                        type: "Interactive Tool",
                        size: "Web App",
                        downloads: 734,
                        description: "Calculate earnings across different MLM scenarios",
                      },
                    ].map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{resource.title}</div>
                          <div className="text-sm text-gray-600">{resource.description}</div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>{resource.type}</span>
                            <span>{resource.size}</span>
                            <span>{resource.downloads} downloads</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Reference */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2" />
                    Quick Reference
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">MLM Success Metrics</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Daily Prospects:</span>
                          <span className="font-medium">5-10 contacts</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversion Rate:</span>
                          <span className="font-medium">10-20%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Follow-up Frequency:</span>
                          <span className="font-medium">7-touch rule</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Team Growth:</span>
                          <span className="font-medium">2-5 new members/month</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Credit Repair Timeline</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Initial Analysis:</span>
                          <span className="font-medium">1-2 days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>First Disputes:</span>
                          <span className="font-medium">30-45 days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Score Improvement:</span>
                          <span className="font-medium">60-90 days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Full Repair:</span>
                          <span className="font-medium">3-6 months</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Key Compliance Points</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Always disclose income disclaimers</li>
                        <li>• Follow FCRA guidelines for credit repair</li>
                        <li>• Maintain accurate records and documentation</li>
                        <li>• Respect state-specific MLM regulations</li>
                        <li>• Provide clear cancellation policies</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Community & Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Join Training Community Forum
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule 1-on-1 Coaching Call
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Video className="h-4 w-4 mr-2" />
                      Weekly Q&A Sessions
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Submit Training Feedback
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Achievement Tracker */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Your Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                      <div className="text-2xl">🏆</div>
                      <div>
                        <div className="font-medium">First Module Complete</div>
                        <div className="text-sm text-gray-600">Completed MLM Fundamentals</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                      <div className="text-2xl">💎</div>
                      <div>
                        <div className="font-medium">Credit Expert</div>
                        <div className="text-sm text-gray-600">Mastered credit repair basics</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                      <div className="text-2xl">🔥</div>
                      <div>
                        <div className="font-medium">7-Day Streak</div>
                        <div className="text-sm text-gray-600">Consistent daily learning</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                      <div className="text-2xl">⭐</div>
                      <div>
                        <div className="font-medium">Top Performer</div>
                        <div className="text-sm text-gray-600">Top 10% in your cohort</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
