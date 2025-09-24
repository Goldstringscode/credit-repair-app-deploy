"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCourse } from "@/lib/course-context"
import {
  Trophy,
  Star,
  Crown,
  Shield,
  Target,
  Flame,
  BookOpen,
  CheckCircle,
  Lock,
  Search,
  Zap,
  Gem,
  Medal,
  Sparkles,
  Users,
  Clock,
  Brain,
  Rocket,
  Diamond,
  Heart,
  Lightbulb,
  ThumbsUp,
  Mountain,
} from "lucide-react"

interface BadgeItem {
  id: string
  title: string
  description: string
  icon: any
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic"
  category: "Learning" | "Achievement" | "Mastery" | "Special" | "Community" | "Streak"
  earned: boolean
  earnedDate?: string
  progress: number
  maxProgress: number
  requirement: string
  points: number
  xp: number
}

const rarityStyles = {
  Common: {
    bg: "bg-gradient-to-br from-gray-100 to-gray-200",
    border: "border-gray-300",
    text: "text-gray-800",
    glow: "shadow-gray-200",
    icon: "text-gray-600",
  },
  Uncommon: {
    bg: "bg-gradient-to-br from-green-100 to-emerald-200",
    border: "border-green-300",
    text: "text-green-800",
    glow: "shadow-green-200",
    icon: "text-green-600",
  },
  Rare: {
    bg: "bg-gradient-to-br from-blue-100 to-cyan-200",
    border: "border-blue-300",
    text: "text-blue-800",
    glow: "shadow-blue-200",
    icon: "text-blue-600",
  },
  Epic: {
    bg: "bg-gradient-to-br from-purple-100 to-violet-200",
    border: "border-purple-300",
    text: "text-purple-800",
    glow: "shadow-purple-200",
    icon: "text-purple-600",
  },
  Legendary: {
    bg: "bg-gradient-to-br from-yellow-100 to-orange-200",
    border: "border-yellow-300",
    text: "text-yellow-800",
    glow: "shadow-yellow-200",
    icon: "text-yellow-600",
  },
  Mythic: {
    bg: "bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-200",
    border: "border-pink-300",
    text: "text-pink-800",
    glow: "shadow-pink-200",
    icon: "text-pink-600",
  },
}

export default function BadgesPage() {
  const { getAllProgress } = useCourse()
  const [badges, setBadges] = useState<BadgeItem[]>([])
  const [filteredBadges, setFilteredBadges] = useState<BadgeItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRarity, setSelectedRarity] = useState("all")
  const [selectedFilter, setSelectedFilter] = useState("all")

  useEffect(() => {
    const allProgress = getAllProgress()
    const totalLessonsCompleted = Object.values(allProgress).reduce(
      (total, progress) => total + progress.completedLessons.length,
      0,
    )
    const completedCourses = Object.values(allProgress).filter((progress) => progress.overallProgress === 100).length

    // Mock data for demonstration - in real app, this would come from backend
    const mockStudyStreak = 7
    const mockStudyTime = 450 // minutes
    const mockQuizzesPassed = 3
    const mockPerfectScores = 1

    const generatedBadges: BadgeItem[] = [
      // Learning Badges
      {
        id: "first_lesson",
        title: "First Steps",
        description: "Complete your very first lesson and begin your credit repair journey",
        icon: BookOpen,
        rarity: "Common",
        category: "Learning",
        earned: totalLessonsCompleted >= 1,
        earnedDate: totalLessonsCompleted >= 1 ? "2024-01-15" : undefined,
        progress: Math.min(totalLessonsCompleted, 1),
        maxProgress: 1,
        requirement: "Complete 1 lesson",
        points: 50,
        xp: 100,
      },
      {
        id: "knowledge_seeker",
        title: "Knowledge Seeker",
        description: "Your thirst for knowledge is admirable - 10 lessons completed!",
        icon: Target,
        rarity: "Uncommon",
        category: "Learning",
        earned: totalLessonsCompleted >= 10,
        earnedDate: totalLessonsCompleted >= 10 ? "2024-01-18" : undefined,
        progress: Math.min(totalLessonsCompleted, 10),
        maxProgress: 10,
        requirement: "Complete 10 lessons",
        points: 150,
        xp: 300,
      },
      {
        id: "scholar",
        title: "Scholar",
        description: "A true student of credit repair - 25 lessons mastered!",
        icon: Brain,
        rarity: "Rare",
        category: "Learning",
        earned: totalLessonsCompleted >= 25,
        progress: Math.min(totalLessonsCompleted, 25),
        maxProgress: 25,
        requirement: "Complete 25 lessons",
        points: 300,
        xp: 600,
      },
      {
        id: "master_student",
        title: "Master Student",
        description: "Exceptional dedication - 50 lessons completed with excellence!",
        icon: Crown,
        rarity: "Epic",
        category: "Learning",
        earned: totalLessonsCompleted >= 50,
        progress: Math.min(totalLessonsCompleted, 50),
        maxProgress: 50,
        requirement: "Complete 50 lessons",
        points: 500,
        xp: 1000,
      },
      {
        id: "legend_learner",
        title: "Legendary Learner",
        description: "You've achieved legendary status with 100 lessons completed!",
        icon: Diamond,
        rarity: "Legendary",
        category: "Learning",
        earned: totalLessonsCompleted >= 100,
        progress: Math.min(totalLessonsCompleted, 100),
        maxProgress: 100,
        requirement: "Complete 100 lessons",
        points: 1000,
        xp: 2000,
      },

      // Achievement Badges
      {
        id: "course_graduate",
        title: "Course Graduate",
        description: "Congratulations on completing your first full course!",
        icon: Trophy,
        rarity: "Uncommon",
        category: "Achievement",
        earned: completedCourses >= 1,
        earnedDate: completedCourses >= 1 ? "2024-01-20" : undefined,
        progress: Math.min(completedCourses, 1),
        maxProgress: 1,
        requirement: "Complete 1 full course",
        points: 200,
        xp: 400,
      },
      {
        id: "multi_course_master",
        title: "Multi-Course Master",
        description: "Impressive! You've mastered multiple areas of credit repair",
        icon: Medal,
        rarity: "Rare",
        category: "Achievement",
        earned: completedCourses >= 3,
        progress: Math.min(completedCourses, 3),
        maxProgress: 3,
        requirement: "Complete 3 full courses",
        points: 400,
        xp: 800,
      },
      {
        id: "course_champion",
        title: "Course Champion",
        description: "You're a true champion - 5 courses completed!",
        icon: Crown,
        rarity: "Epic",
        category: "Achievement",
        earned: completedCourses >= 5,
        progress: Math.min(completedCourses, 5),
        maxProgress: 5,
        requirement: "Complete 5 full courses",
        points: 750,
        xp: 1500,
      },
      {
        id: "ultimate_achiever",
        title: "Ultimate Achiever",
        description: "The pinnacle of achievement - all courses mastered!",
        icon: Gem,
        rarity: "Mythic",
        category: "Achievement",
        earned: completedCourses >= 12,
        progress: Math.min(completedCourses, 12),
        maxProgress: 12,
        requirement: "Complete all available courses",
        points: 2000,
        xp: 4000,
      },

      // Mastery Badges
      {
        id: "quiz_ace",
        title: "Quiz Ace",
        description: "Your quiz skills are impressive - 5 quizzes passed!",
        icon: Target,
        rarity: "Uncommon",
        category: "Mastery",
        earned: mockQuizzesPassed >= 5,
        progress: Math.min(mockQuizzesPassed, 5),
        maxProgress: 5,
        requirement: "Pass 5 quizzes",
        points: 175,
        xp: 350,
      },
      {
        id: "perfectionist",
        title: "Perfectionist",
        description: "Flawless execution - achieved perfect scores on multiple quizzes!",
        icon: Star,
        rarity: "Epic",
        category: "Mastery",
        earned: mockPerfectScores >= 3,
        progress: Math.min(mockPerfectScores, 3),
        maxProgress: 3,
        requirement: "Score 100% on 3 quizzes",
        points: 600,
        xp: 1200,
      },
      {
        id: "speed_demon",
        title: "Speed Demon",
        description: "Lightning fast! Complete a quiz in record time",
        icon: Zap,
        rarity: "Rare",
        category: "Mastery",
        earned: false,
        progress: 0,
        maxProgress: 1,
        requirement: "Complete a quiz in under 5 minutes",
        points: 300,
        xp: 600,
      },

      // Streak Badges
      {
        id: "streak_starter",
        title: "Streak Starter",
        description: "Great start! Keep the momentum going with your study streak",
        icon: Flame,
        rarity: "Common",
        category: "Streak",
        earned: mockStudyStreak >= 3,
        earnedDate: mockStudyStreak >= 3 ? "2024-01-17" : undefined,
        progress: Math.min(mockStudyStreak, 3),
        maxProgress: 3,
        requirement: "Study for 3 consecutive days",
        points: 75,
        xp: 150,
      },
      {
        id: "week_warrior",
        title: "Week Warrior",
        description: "A full week of dedication - your consistency is admirable!",
        icon: Shield,
        rarity: "Uncommon",
        category: "Streak",
        earned: mockStudyStreak >= 7,
        earnedDate: mockStudyStreak >= 7 ? "2024-01-21" : undefined,
        progress: Math.min(mockStudyStreak, 7),
        maxProgress: 7,
        requirement: "Study for 7 consecutive days",
        points: 200,
        xp: 400,
      },
      {
        id: "month_master",
        title: "Month Master",
        description: "Incredible dedication - a full month of consistent learning!",
        icon: Crown,
        rarity: "Epic",
        category: "Streak",
        earned: mockStudyStreak >= 30,
        progress: Math.min(mockStudyStreak, 30),
        maxProgress: 30,
        requirement: "Study for 30 consecutive days",
        points: 800,
        xp: 1600,
      },
      {
        id: "unstoppable_force",
        title: "Unstoppable Force",
        description: "Nothing can stop you - 100 days of pure determination!",
        icon: Mountain,
        rarity: "Legendary",
        category: "Streak",
        earned: mockStudyStreak >= 100,
        progress: Math.min(mockStudyStreak, 100),
        maxProgress: 100,
        requirement: "Study for 100 consecutive days",
        points: 2000,
        xp: 4000,
      },

      // Special Badges
      {
        id: "early_bird",
        title: "Early Bird",
        description: "The early bird catches the worm - studying before sunrise!",
        icon: Sparkles,
        rarity: "Rare",
        category: "Special",
        earned: false,
        progress: 0,
        maxProgress: 1,
        requirement: "Complete a lesson before 6 AM",
        points: 250,
        xp: 500,
      },
      {
        id: "night_owl",
        title: "Night Owl",
        description: "Burning the midnight oil - dedicated to learning at all hours!",
        icon: Lightbulb,
        rarity: "Rare",
        category: "Special",
        earned: false,
        progress: 0,
        maxProgress: 1,
        requirement: "Complete a lesson after 11 PM",
        points: 250,
        xp: 500,
      },
      {
        id: "weekend_warrior",
        title: "Weekend Warrior",
        description: "No rest for the dedicated - learning on weekends too!",
        icon: Rocket,
        rarity: "Uncommon",
        category: "Special",
        earned: false,
        progress: 1,
        maxProgress: 2,
        requirement: "Study on both Saturday and Sunday",
        points: 150,
        xp: 300,
      },
      {
        id: "time_investor",
        title: "Time Investor",
        description: "Time is your most valuable asset - 10 hours invested in learning!",
        icon: Clock,
        rarity: "Rare",
        category: "Special",
        earned: mockStudyTime >= 600,
        progress: Math.min(mockStudyTime, 600),
        maxProgress: 600,
        requirement: "Study for 10 total hours",
        points: 400,
        xp: 800,
      },

      // Community Badges
      {
        id: "helpful_hand",
        title: "Helpful Hand",
        description: "Your kindness shines through - helping fellow students succeed!",
        icon: Heart,
        rarity: "Uncommon",
        category: "Community",
        earned: false,
        progress: 2,
        maxProgress: 5,
        requirement: "Help 5 other students",
        points: 200,
        xp: 400,
      },
      {
        id: "mentor",
        title: "Mentor",
        description: "A true leader - guiding others on their credit repair journey!",
        icon: Users,
        rarity: "Epic",
        category: "Community",
        earned: false,
        progress: 0,
        maxProgress: 10,
        requirement: "Mentor 10 students",
        points: 750,
        xp: 1500,
      },
      {
        id: "feedback_champion",
        title: "Feedback Champion",
        description: "Your insights make our courses better - thank you!",
        icon: ThumbsUp,
        rarity: "Rare",
        category: "Community",
        earned: false,
        progress: 1,
        maxProgress: 5,
        requirement: "Provide feedback on 5 courses",
        points: 300,
        xp: 600,
      },
    ]

    setBadges(generatedBadges)
    setFilteredBadges(generatedBadges)
  }, [getAllProgress])

  useEffect(() => {
    let filtered = badges

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (badge) =>
          badge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          badge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          badge.requirement.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((badge) => badge.category === selectedCategory)
    }

    // Filter by rarity
    if (selectedRarity !== "all") {
      filtered = filtered.filter((badge) => badge.rarity === selectedRarity)
    }

    // Filter by earned status
    if (selectedFilter === "earned") {
      filtered = filtered.filter((badge) => badge.earned)
    } else if (selectedFilter === "locked") {
      filtered = filtered.filter((badge) => !badge.earned)
    } else if (selectedFilter === "progress") {
      filtered = filtered.filter((badge) => !badge.earned && badge.progress > 0)
    }

    setFilteredBadges(filtered)
  }, [badges, searchTerm, selectedCategory, selectedRarity, selectedFilter])

  const earnedBadges = badges.filter((badge) => badge.earned)
  const totalPoints = earnedBadges.reduce((sum, badge) => sum + badge.points, 0)
  const totalXP = earnedBadges.reduce((sum, badge) => sum + badge.xp, 0)
  const completionPercentage = (earnedBadges.length / badges.length) * 100

  const categories = ["all", "Learning", "Achievement", "Mastery", "Streak", "Special", "Community"]
  const rarities = ["all", "Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"]
  const filters = ["all", "earned", "locked", "progress"]

  const BadgeCard = ({ badge }: { badge: BadgeItem }) => {
    const style = rarityStyles[badge.rarity]
    const Icon = badge.icon
    const progressPercentage = (badge.progress / badge.maxProgress) * 100

    return (
      <Card
        className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
          badge.earned
            ? `${style.border} border-2 ${style.glow} shadow-lg hover:shadow-xl`
            : "border-gray-200 opacity-75 hover:opacity-90"
        }`}
      >
        {/* Rarity Indicator */}
        {badge.earned && (
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-current opacity-20" />
        )}

        {/* Animated Glow for Mythic */}
        {badge.earned && badge.rarity === "Mythic" && (
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 opacity-10 animate-pulse" />
        )}

        <CardContent className="p-6 text-center relative z-10">
          {/* Badge Icon */}
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 transition-all duration-300 ${
              badge.earned ? `${style.bg} ${style.glow} shadow-md` : "bg-gray-100"
            }`}
          >
            {badge.earned ? (
              <Icon className={`h-10 w-10 ${style.icon}`} />
            ) : (
              <Lock className="h-10 w-10 text-gray-400" />
            )}
          </div>

          {/* Badge Title */}
          <h3 className="font-bold text-lg text-gray-900 mb-2">{badge.title}</h3>

          {/* Badge Description */}
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">{badge.description}</p>

          {/* Rarity and Category */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Badge className={`${style.bg} ${style.text} border-0 font-semibold`}>{badge.rarity}</Badge>
            <Badge variant="outline" className="text-xs">
              {badge.category}
            </Badge>
          </div>

          {/* Points and XP */}
          <div className="flex items-center justify-center space-x-4 mb-4 text-sm">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">{badge.points} pts</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{badge.xp} XP</span>
            </div>
          </div>

          {/* Progress or Earned Status */}
          {badge.earned ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center text-green-600 text-sm font-medium">
                <CheckCircle className="h-4 w-4 mr-1" />
                Earned {badge.earnedDate}
              </div>
              <div className="text-xs text-gray-500">Requirement: {badge.requirement}</div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span className="font-medium">
                  {badge.progress}/{badge.maxProgress}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="text-xs text-gray-500">{badge.requirement}</div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Badge Collection</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Showcase your achievements and track your progress through our comprehensive badge system
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-yellow-100 rounded-full w-fit mx-auto mb-3">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{earnedBadges.length}</div>
            <div className="text-sm text-gray-600">Badges Earned</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalPoints.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalXP.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Experience Points</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{Math.round(completionPercentage)}%</div>
            <div className="text-sm text-gray-600">Collection Complete</div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Collection Progress</h3>
            <span className="text-sm text-gray-600">
              {earnedBadges.length} of {badges.length} badges
            </span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search badges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-4">
              {/* Categories */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category === "all" ? "All" : category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Rarities */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Rarity</label>
                <div className="flex flex-wrap gap-2">
                  {rarities.map((rarity) => (
                    <Button
                      key={rarity}
                      variant={selectedRarity === rarity ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRarity(rarity)}
                    >
                      {rarity === "all" ? "All" : rarity}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Status Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter) => (
                    <Button
                      key={filter}
                      variant={selectedFilter === filter ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter(filter)}
                    >
                      {filter === "all"
                        ? "All"
                        : filter === "earned"
                          ? "Earned"
                          : filter === "locked"
                            ? "Locked"
                            : "In Progress"}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badge Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBadges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No badges found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
