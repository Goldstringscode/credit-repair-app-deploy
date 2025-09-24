import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Play, FileText, Calculator, TrendingUp, Shield, Clock, Star } from "lucide-react"

export default function EducationPage() {
  const courses = [
    {
      id: 1,
      title: "Credit Basics 101",
      description: "Learn the fundamentals of credit scores and reports",
      duration: "45 min",
      lessons: 8,
      difficulty: "Beginner",
      progress: 75,
      category: "Fundamentals",
    },
    {
      id: 2,
      title: "Advanced Dispute Strategies",
      description: "Master advanced techniques for credit repair",
      duration: "2 hours",
      lessons: 12,
      difficulty: "Advanced",
      progress: 30,
      category: "Dispute Strategies",
    },
    {
      id: 3,
      title: "Building Credit from Scratch",
      description: "Step-by-step guide to establishing credit",
      duration: "1.5 hours",
      lessons: 10,
      difficulty: "Beginner",
      progress: 0,
      category: "Credit Building",
    },
  ]

  const articles = [
    {
      title: "Understanding Your Credit Report",
      excerpt: "Learn how to read and interpret every section of your credit report",
      readTime: "8 min read",
      category: "Credit Reports",
      featured: true,
    },
    {
      title: "The 609 Dispute Method Explained",
      excerpt: "A detailed guide to using Section 609 for credit disputes",
      readTime: "12 min read",
      category: "Dispute Methods",
      featured: false,
    },
    {
      title: "Credit Utilization: The 30% Rule Myth",
      excerpt: "Why the 30% rule isn't always the best strategy",
      readTime: "6 min read",
      category: "Credit Optimization",
      featured: false,
    },
    {
      title: "Goodwill Letters That Actually Work",
      excerpt: "Templates and strategies for successful goodwill letters",
      readTime: "10 min read",
      category: "Letter Writing",
      featured: true,
    },
  ]

  const tools = [
    {
      name: "Credit Utilization Calculator",
      description: "Calculate optimal credit card balances",
      icon: Calculator,
      category: "Calculators",
    },
    {
      name: "Credit Score Simulator",
      description: "See how actions affect your credit score",
      icon: TrendingUp,
      category: "Simulators",
    },
    {
      name: "Debt Payoff Planner",
      description: "Create a strategic debt payoff plan",
      icon: FileText,
      category: "Planning",
    },
    {
      name: "Identity Theft Checklist",
      description: "Step-by-step identity theft recovery",
      icon: Shield,
      category: "Protection",
    },
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Credit Education</h1>
          <p className="text-gray-600 mt-1">Learn everything you need to know about credit repair and building</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Featured Course */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <Badge className="bg-white/20 text-white mb-4">Featured Course</Badge>
                <h2 className="text-3xl font-bold mb-2">Complete Credit Repair Masterclass</h2>
                <p className="text-blue-100 mb-4">Everything you need to know to repair and build excellent credit</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />4 hours
                  </span>
                  <span className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    25 lessons
                  </span>
                  <span className="flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    4.9 rating
                  </span>
                </div>
              </div>
              <Button size="lg" variant="secondary">
                <Play className="h-5 w-5 mr-2" />
                Start Course
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Courses Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Courses</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getDifficultyColor(course.difficulty)}>{course.difficulty}</Badge>
                    <Badge variant="outline">{course.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <p className="text-gray-600 text-sm">{course.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{course.lessons} lessons</span>
                      <span>{course.duration}</span>
                    </div>

                    {course.progress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                        </div>
                      </div>
                    )}

                    <Button className="w-full">{course.progress > 0 ? "Continue" : "Start Course"}</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Articles Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {articles.map((article, index) => (
              <Card
                key={index}
                className={`hover:shadow-lg transition-shadow ${article.featured ? "border-blue-200" : ""}`}
              >
                <CardContent className="p-6">
                  {article.featured && <Badge className="bg-blue-100 text-blue-800 mb-3">Featured</Badge>}
                  <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                      <span className="text-xs text-gray-500">{article.readTime}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tools Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Credit Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, index) => {
              const Icon = tool.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">{tool.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {tool.category}
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
