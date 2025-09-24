"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Award, 
  Download, 
  Share2, 
  Star,
  CheckCircle,
  Calendar,
  Clock,
  Trophy,
  TrendingUp,
  Target,
  Zap
} from "lucide-react"

interface CertificatesViewerProps {
  userId: string
  courseId: string
  onClose?: () => void
}

interface Certificate {
  id: string
  title: string
  description: string
  earnedAt: Date
  type: 'course_completion' | 'lesson_mastery' | 'quiz_perfection' | 'milestone'
  score?: number
  timeSpent?: number
  icon: string
  downloadable: boolean
}

export function CertificatesViewer({ userId, courseId, onClose }: CertificatesViewerProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCertificates()
  }, [userId, courseId])

  const loadCertificates = async () => {
    try {
      setLoading(true)
      
      // Mock data for demo
      const mockCertificates: Certificate[] = [
        {
          id: 'first-lesson',
          title: 'First Lesson Mastery',
          description: 'Successfully completed your first lesson',
          earnedAt: new Date(Date.now() - 86400000), // 1 day ago
          type: 'lesson_mastery',
          icon: '🎯',
          downloadable: true
        },
        {
          id: 'quiz-perfection',
          title: 'Quiz Excellence',
          description: 'Achieved perfect score on a quiz',
          earnedAt: new Date(Date.now() - 172800000), // 2 days ago
          type: 'quiz_perfection',
          score: 100,
          icon: '⭐',
          downloadable: true
        },
        {
          id: 'milestone',
          title: 'Learning Milestone',
          description: 'Reached a significant learning milestone',
          earnedAt: new Date(Date.now() - 259200000), // 3 days ago
          type: 'milestone',
          icon: '🏆',
          downloadable: true
        }
      ]
      
      setCertificates(mockCertificates)
    } catch (error) {
      console.error('Failed to load certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (certificate: Certificate) => {
    // Mock download functionality
    console.log('Downloading certificate:', certificate.title)
    // In a real app, this would generate and download a PDF
    alert(`Downloading ${certificate.title}`)
  }

  const handleShare = (certificate: Certificate) => {
    // Mock share functionality
    console.log('Sharing certificate:', certificate.title)
    if (navigator.share) {
      navigator.share({
        title: certificate.title,
        text: certificate.description,
        url: window.location.href
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`${certificate.title} - ${certificate.description}`)
      alert('Certificate details copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <span>Loading Certificates...</span>
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

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Your Certificates
          </h2>
          <p className="text-gray-600 mt-2">Celebrate your achievements and milestones</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose} className="border-2 hover:bg-gray-50">
            Close
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-600">{certificates.length}</div>
                <div className="text-sm text-yellow-700 font-medium">Total Certificates</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {certificates.filter(c => c.type === 'lesson_mastery').length}
                </div>
                <div className="text-sm text-blue-700 font-medium">Lesson Mastery</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {certificates.filter(c => c.type === 'quiz_perfection').length}
                </div>
                <div className="text-sm text-green-700 font-medium">Quiz Excellence</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {certificates.filter(c => c.type === 'milestone').length}
                </div>
                <div className="text-sm text-purple-700 font-medium">Milestones</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates List */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <span>Earned Certificates</span>
            <Badge variant="secondary" className="ml-2">{certificates.length} earned</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No certificates yet</p>
              <p className="text-sm">Complete lessons and quizzes to earn your first certificate</p>
            </div>
          ) : (
            <div className="space-y-4">
              {certificates.map((certificate, index) => (
                <div
                  key={certificate.id}
                  className="flex items-center justify-between p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl">{certificate.icon}</span>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{certificate.title}</div>
                      <div className="text-sm text-gray-600">{certificate.description}</div>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Earned {certificate.earnedAt.toLocaleDateString()}</span>
                        </div>
                        {certificate.score && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>Score: {certificate.score}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {certificate.downloadable && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(certificate)}
                        className="flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(certificate)}
                      className="flex items-center space-x-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Tips */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>How to Earn More Certificates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Complete Lessons</h4>
              <p className="text-sm text-gray-600">Finish each lesson to earn mastery certificates</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Ace Quizzes</h4>
              <p className="text-sm text-gray-600">Get perfect scores to unlock quiz excellence badges</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Reach Milestones</h4>
              <p className="text-sm text-gray-600">Hit learning targets to earn milestone certificates</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
