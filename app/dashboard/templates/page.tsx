"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  FileText,
  Search,
  Filter,
  Star,
  Download,
  Eye,
  ShoppingCart,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Crown,
  Zap,
  Shield,
  Award,
  Heart,
  BookOpen,
  Target,
} from "lucide-react"

interface Template {
  id: string
  title: string
  description: string
  category: string
  type: "free" | "premium" | "pro"
  price: number
  rating: number
  downloads: number
  successRate: number
  author: string
  authorType: "community" | "expert" | "attorney"
  tags: string[]
  preview: string
  createdAt: string
  updatedAt: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedTime: string
  legalReviewed: boolean
}

export default function TemplatesPage() {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [sortBy, setSortBy] = useState("popular")
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const templates: Template[] = [
    {
      id: "1",
      title: "Professional Late Payment Dispute",
      description:
        "Comprehensive dispute letter for challenging incorrect late payment records with strong legal backing",
      category: "dispute",
      type: "premium",
      price: 12.99,
      rating: 4.9,
      downloads: 2847,
      successRate: 89,
      author: "Sarah Johnson, Esq.",
      authorType: "attorney",
      tags: ["late payment", "dispute", "fcra", "professional"],
      preview:
        "Dear [Credit Bureau],\n\nI am writing to formally dispute the following information on my credit report...",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20",
      difficulty: "intermediate",
      estimatedTime: "15 minutes",
      legalReviewed: true,
    },
    {
      id: "2",
      title: "Identity Theft Comprehensive Package",
      description: "Complete set of letters for reporting and disputing identity theft accounts across all bureaus",
      category: "identity-theft",
      type: "pro",
      price: 24.99,
      rating: 4.8,
      downloads: 1923,
      successRate: 94,
      author: "Michael Chen, Attorney",
      authorType: "attorney",
      tags: ["identity theft", "fraud", "police report", "comprehensive"],
      preview:
        "IDENTITY THEFT AFFIDAVIT AND DISPUTE LETTER\n\nDear [Credit Bureau],\n\nI am a victim of identity theft...",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-18",
      difficulty: "advanced",
      estimatedTime: "45 minutes",
      legalReviewed: true,
    },
    {
      id: "3",
      title: "Basic Goodwill Letter Template",
      description:
        "Simple but effective goodwill letter template for requesting removal of accurate but negative items",
      category: "goodwill",
      type: "free",
      price: 0,
      rating: 4.3,
      downloads: 5621,
      successRate: 67,
      author: "Community Template",
      authorType: "community",
      tags: ["goodwill", "removal", "basic", "beginner"],
      preview: "Dear [Creditor],\n\nI hope this letter finds you well. I am writing as a long-standing customer...",
      createdAt: "2024-01-05",
      updatedAt: "2024-01-12",
      difficulty: "beginner",
      estimatedTime: "10 minutes",
      legalReviewed: false,
    },
    {
      id: "4",
      title: "Advanced Debt Validation Letter",
      description: "Legally-backed debt validation request with FDCPA citations and compliance requirements",
      category: "validation",
      type: "premium",
      price: 15.99,
      rating: 4.7,
      downloads: 1456,
      successRate: 82,
      author: "David Rodriguez, Credit Expert",
      authorType: "expert",
      tags: ["debt validation", "fdcpa", "collections", "legal"],
      preview: "DEBT VALIDATION REQUEST\n\nDear Debt Collector,\n\nThis letter is sent in response to a notice...",
      createdAt: "2024-01-08",
      updatedAt: "2024-01-16",
      difficulty: "intermediate",
      estimatedTime: "20 minutes",
      legalReviewed: true,
    },
    {
      id: "5",
      title: "Cease and Desist Collection Calls",
      description: "Stop harassment from debt collectors with this legally-compliant cease and desist letter",
      category: "cease-desist",
      type: "premium",
      price: 9.99,
      rating: 4.6,
      downloads: 3241,
      successRate: 91,
      author: "Lisa Thompson, Esq.",
      authorType: "attorney",
      tags: ["cease desist", "harassment", "fdcpa", "collections"],
      preview: "CEASE AND DESIST COMMUNICATION\n\nYou are hereby notified under provisions of Public Law 95-109...",
      createdAt: "2024-01-12",
      updatedAt: "2024-01-19",
      difficulty: "beginner",
      estimatedTime: "8 minutes",
      legalReviewed: true,
    },
    {
      id: "6",
      title: "Pay for Delete Negotiation",
      description: "Strategic pay-for-delete letter template with negotiation tactics and legal protections",
      category: "pay-delete",
      type: "pro",
      price: 19.99,
      rating: 4.5,
      downloads: 987,
      successRate: 73,
      author: "Robert Kim, Credit Specialist",
      authorType: "expert",
      tags: ["pay for delete", "negotiation", "settlement", "strategy"],
      preview: "SETTLEMENT OFFER AND DELETION REQUEST\n\nDear [Creditor/Collector],\n\nI am writing to propose...",
      createdAt: "2024-01-14",
      updatedAt: "2024-01-21",
      difficulty: "advanced",
      estimatedTime: "30 minutes",
      legalReviewed: true,
    },
    {
      id: "7",
      title: "Student Loan Dispute Package",
      description: "Specialized templates for disputing student loan reporting errors and rehabilitation issues",
      category: "student-loans",
      type: "premium",
      price: 17.99,
      rating: 4.4,
      downloads: 756,
      successRate: 78,
      author: "Amanda Foster, Education Law",
      authorType: "attorney",
      tags: ["student loans", "rehabilitation", "dispute", "education"],
      preview: "STUDENT LOAN DISPUTE LETTER\n\nDear [Loan Servicer/Credit Bureau],\n\nI am disputing...",
      createdAt: "2024-01-11",
      updatedAt: "2024-01-17",
      difficulty: "intermediate",
      estimatedTime: "25 minutes",
      legalReviewed: true,
    },
    {
      id: "8",
      title: "Medical Debt Dispute Template",
      description: "Specialized template for disputing medical collections with HIPAA privacy protections",
      category: "medical-debt",
      type: "free",
      price: 0,
      rating: 4.2,
      downloads: 4123,
      successRate: 71,
      author: "Healthcare Credit Coalition",
      authorType: "expert",
      tags: ["medical debt", "hipaa", "collections", "healthcare"],
      preview: "MEDICAL DEBT DISPUTE WITH HIPAA PROTECTIONS\n\nDear [Credit Bureau/Collector]...",
      createdAt: "2024-01-09",
      updatedAt: "2024-01-15",
      difficulty: "beginner",
      estimatedTime: "12 minutes",
      legalReviewed: false,
    },
  ]

  const categories = [
    { id: "all", name: "All Categories", count: templates.length },
    { id: "dispute", name: "Credit Disputes", count: templates.filter((t) => t.category === "dispute").length },
    {
      id: "identity-theft",
      name: "Identity Theft",
      count: templates.filter((t) => t.category === "identity-theft").length,
    },
    { id: "goodwill", name: "Goodwill Letters", count: templates.filter((t) => t.category === "goodwill").length },
    { id: "validation", name: "Debt Validation", count: templates.filter((t) => t.category === "validation").length },
    {
      id: "cease-desist",
      name: "Cease & Desist",
      count: templates.filter((t) => t.category === "cease-desist").length,
    },
    { id: "pay-delete", name: "Pay for Delete", count: templates.filter((t) => t.category === "pay-delete").length },
    {
      id: "student-loans",
      name: "Student Loans",
      count: templates.filter((t) => t.category === "student-loans").length,
    },
    { id: "medical-debt", name: "Medical Debt", count: templates.filter((t) => t.category === "medical-debt").length },
  ]

  const filteredTemplates = templates
    .filter((template) => {
      const matchesSearch =
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
      const matchesType = selectedType === "all" || template.type === selectedType

      return matchesSearch && matchesCategory && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.downloads - a.downloads
        case "rating":
          return b.rating - a.rating
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "success-rate":
          return b.successRate - a.successRate
        default:
          return 0
      }
    })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "free":
        return <Heart className="h-4 w-4 text-green-600" />
      case "premium":
        return <Crown className="h-4 w-4 text-orange-600" />
      case "pro":
        return <Zap className="h-4 w-4 text-purple-600" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: string, price: number) => {
    switch (type) {
      case "free":
        return <Badge className="bg-green-100 text-green-800">Free</Badge>
      case "premium":
        return <Badge className="bg-orange-100 text-orange-800">${price}</Badge>
      case "pro":
        return <Badge className="bg-purple-100 text-purple-800">${price}</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getAuthorBadge = (authorType: string) => {
    switch (authorType) {
      case "attorney":
        return (
          <Badge className="bg-blue-100 text-blue-800 text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Attorney
          </Badge>
        )
      case "expert":
        return (
          <Badge className="bg-purple-100 text-purple-800 text-xs">
            <Award className="h-3 w-3 mr-1" />
            Expert
          </Badge>
        )
      case "community":
        return (
          <Badge className="bg-gray-100 text-gray-800 text-xs">
            <Users className="h-3 w-3 mr-1" />
            Community
          </Badge>
        )
      default:
        return null
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-600"
      case "intermediate":
        return "text-yellow-600"
      case "advanced":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Template Marketplace</h1>
              <p className="text-gray-600 mt-1">Professional letter templates from attorneys and credit experts</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-800">
                <BookOpen className="h-4 w-4 mr-1" />
                {templates.length} Templates
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                <Target className="h-4 w-4 mr-1" />
                85% Avg Success Rate
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Featured Templates */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Featured Templates</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {templates
                .filter((t) => t.rating >= 4.7)
                .slice(0, 3)
                .map((template) => (
                  <div key={template.id} className="bg-white p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(template.type)}
                        <span className="font-semibold text-sm">{template.title}</span>
                      </div>
                      {getTypeBadge(template.type, template.price)}
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          <span className="text-xs">{template.rating}</span>
                        </div>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{template.downloads} downloads</span>
                      </div>
                      <Button size="sm" className="text-xs">
                        {template.type === "free" ? "Download" : "Purchase"}
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} ({category.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="success-rate">Success Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Templates:</span>
                  <span className="text-sm font-semibold">{templates.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Free Templates:</span>
                  <span className="text-sm font-semibold">{templates.filter((t) => t.type === "free").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Attorney Reviewed:</span>
                  <span className="text-sm font-semibold">{templates.filter((t) => t.legalReviewed).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Success Rate:</span>
                  <span className="text-sm font-semibold text-green-600">
                    {Math.round(templates.reduce((acc, t) => acc + t.successRate, 0) / templates.length)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Templates Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {filteredTemplates.length} Template{filteredTemplates.length !== 1 ? "s" : ""} Found
              </h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(template.type)}
                        <div>
                          <h3 className="font-semibold text-sm leading-tight">{template.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            {getAuthorBadge(template.authorType)}
                            {template.legalReviewed && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Legal
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {getTypeBadge(template.type, template.price)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{template.rating}</span>
                          <span className="text-gray-500">({template.downloads})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-green-600 font-medium">{template.successRate}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{template.estimatedTime}</span>
                        </div>
                        <span className={`font-medium ${getDifficultyColor(template.difficulty)}`}>
                          {template.difficulty}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{template.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Template Preview:</h4>
                                <div className="text-sm font-mono whitespace-pre-wrap bg-white p-3 rounded border max-h-64 overflow-y-auto">
                                  {template.preview}
                                </div>
                              </div>
                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p>
                                    <strong>Author:</strong> {template.author}
                                  </p>
                                  <p>
                                    <strong>Success Rate:</strong> {template.successRate}%
                                  </p>
                                  <p>
                                    <strong>Downloads:</strong> {template.downloads}
                                  </p>
                                </div>
                                <div>
                                  <p>
                                    <strong>Difficulty:</strong> {template.difficulty}
                                  </p>
                                  <p>
                                    <strong>Time Required:</strong> {template.estimatedTime}
                                  </p>
                                  <p>
                                    <strong>Legal Review:</strong> {template.legalReviewed ? "Yes" : "No"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button className="flex-1">
                                  {template.type === "free" ? (
                                    <>
                                      <Download className="h-4 w-4 mr-2" />
                                      Download Free
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingCart className="h-4 w-4 mr-2" />
                                      Purchase ${template.price}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button size="sm" className="flex-1">
                          {template.type === "free" ? (
                            <>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-1" />${template.price}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                    setSelectedType("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
