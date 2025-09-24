"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, Play, CheckCircle, Clock, BookOpen, Star, Users, Download, FileText, XCircle } from "lucide-react"
import { progressTrackingService } from "@/lib/progress-tracking"
import { useToast } from "@/hooks/use-toast"

export default function CreditBasicsCoursePage() {
  const [currentLesson, setCurrentLesson] = useState(1)
  const [mounted, setMounted] = useState(false)
  const [userProgress, setUserProgress] = useState<any>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { toast } = useToast()

  // Progress tracking functions
  const refreshProgress = () => {
    const progress = progressTrackingService.getUserProgress()
    setUserProgress(progress)
    setRefreshTrigger(prev => prev + 1)
    console.log('Progress refreshed:', progress)
  }

  const getLessonCompletionStatus = (lessonId: string): boolean => {
    if (!userProgress) return false
    const lessonProgress = userProgress.lessons.find((l: any) => l.lessonId === lessonId)
    return lessonProgress?.completed || false
  }

  const updateLessonProgress = (lessonId: string, currentTime: number, completed: boolean = false) => {
    progressTrackingService.updateLessonProgress(
      lessonId, 
      currentTime, 
      completed, 
      'credit-basics', 
      courseData.lessons[currentLesson - 1]?.title || `Lesson ${currentLesson}`, 
      600 // Default 10 minutes
    )
    refreshProgress()
    console.log(`Updated lesson ${lessonId}:`, { currentTime, completed, courseId: 'credit-basics' })
  }

  const handleMarkComplete = () => {
    const lessonId = `lesson-${currentLesson}`
    const lessonTitle = courseData.lessons[currentLesson - 1]?.title || `Lesson ${currentLesson}`
    
    console.log('=== MARK COMPLETE DEBUG START ===')
    console.log('Marking lesson as complete:', lessonId)
    console.log('Lesson title:', lessonTitle)
    
    updateLessonProgress(lessonId, 600, true) // Mark as complete with full duration
    
    console.log('=== MARK COMPLETE DEBUG END ===')
    
    toast({
      title: "Lesson Completed! 🎉",
      description: `"${lessonTitle}" has been marked as complete. Great job!`,
      duration: 5000,
    })
  }

  const handleMarkIncomplete = () => {
    const lessonId = `lesson-${currentLesson}`
    const lessonTitle = courseData.lessons[currentLesson - 1]?.title || `Lesson ${currentLesson}`
    
    console.log('=== MARK INCOMPLETE DEBUG START ===')
    console.log('Marking lesson as incomplete:', lessonId)
    
    updateLessonProgress(lessonId, 0, false)
    
    console.log('=== MARK INCOMPLETE DEBUG END ===')
    
    toast({
      title: "Lesson Marked as Incomplete",
      description: `"${lessonTitle}" has been marked as incomplete. You can complete it again when ready.`,
      duration: 5000,
    })
  }

  // Initialize progress tracking
  useEffect(() => {
    setMounted(true)
    refreshProgress()
  }, [])

  // Listen for completion changes
  useEffect(() => {
    const handleLessonCompletionChange = () => {
      console.log('Lesson completion change detected, refreshing progress')
      refreshProgress()
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user-learning-progress') {
        console.log('Storage change detected, refreshing progress')
        refreshProgress()
      }
    }

    window.addEventListener('lessonCompletionChanged', handleLessonCompletionChange)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('lessonCompletionChanged', handleLessonCompletionChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const courseData = {
    id: "credit-basics",
    title: "Credit Basics 101",
    description: "Learn the fundamentals of credit scores and reports",
    instructor: "Maria Garcia, Credit Counselor",
    rating: 4.9,
    students: 15847,
    duration: "45 min",
    difficulty: "Beginner",
    progress: 75,
    lessons: [
      {
        id: 1,
        title: "What is Credit?",
        duration: "5 min",
        completed: true,
        description: "Understanding the basic concept of credit and how it works in the financial system.",
        content: `
          <h3>Understanding Credit</h3>
          <p>Credit is essentially trust. When you use credit, you're borrowing money with the promise to pay it back later. This fundamental concept affects nearly every major financial decision you'll make.</p>
          
          <h4>Key Points:</h4>
          <ul>
            <li>Credit allows you to make purchases now and pay later</li>
            <li>Lenders evaluate your creditworthiness before extending credit</li>
            <li>Your credit history becomes a record of how you handle borrowed money</li>
            <li>Good credit opens doors to better financial opportunities</li>
          </ul>
          
          <h4>Types of Credit:</h4>
          <ul>
            <li><strong>Revolving Credit:</strong> Credit cards, lines of credit</li>
            <li><strong>Installment Credit:</strong> Auto loans, mortgages, personal loans</li>
            <li><strong>Open Credit:</strong> Utility bills, cell phone plans</li>
          </ul>
        `,
      },
      {
        id: 2,
        title: "Understanding Credit Scores",
        duration: "8 min",
        completed: true,
        description: "Deep dive into how credit scores are calculated and what they mean.",
        content: `
          <h3>Credit Scores Explained</h3>
          <p>Your credit score is a three-digit number that represents your creditworthiness. Most scores range from 300 to 850, with higher scores indicating better credit.</p>
          
          <h4>Score Ranges:</h4>
          <ul>
            <li><strong>Excellent (800-850):</strong> Best rates and terms</li>
            <li><strong>Very Good (740-799):</strong> Good rates and terms</li>
            <li><strong>Good (670-739):</strong> Fair rates and terms</li>
            <li><strong>Fair (580-669):</strong> Higher rates, limited options</li>
            <li><strong>Poor (300-579):</strong> Difficulty getting approved</li>
          </ul>
          
          <h4>Factors That Affect Your Score:</h4>
          <ul>
            <li>Payment history (35%)</li>
            <li>Credit utilization (30%)</li>
            <li>Length of credit history (15%)</li>
            <li>Credit mix (10%)</li>
            <li>New credit inquiries (10%)</li>
          </ul>
        `,
      },
      {
        id: 3,
        title: "Reading Your Credit Report",
        duration: "12 min",
        completed: true,
        description: "Learn how to read and understand every section of your credit report.",
        content: `
          <h3>Your Credit Report Breakdown</h3>
          <p>Your credit report contains detailed information about your credit history. Understanding each section helps you identify areas for improvement.</p>
          
          <h4>Main Sections:</h4>
          <ul>
            <li><strong>Personal Information:</strong> Name, address, SSN, employment</li>
            <li><strong>Credit Accounts:</strong> All your credit cards, loans, and lines of credit</li>
            <li><strong>Public Records:</strong> Bankruptcies, tax liens, judgments</li>
            <li><strong>Inquiries:</strong> Who has checked your credit recently</li>
          </ul>
          
          <h4>How to Get Your Free Reports:</h4>
          <ul>
            <li>Visit AnnualCreditReport.com</li>
            <li>Request from all three bureaus: Experian, Equifax, TransUnion</li>
            <li>Review for errors and discrepancies</li>
            <li>Dispute any inaccurate information</li>
          </ul>
        `,
      },
      {
        id: 4,
        title: "Credit Utilization Explained",
        duration: "6 min",
        completed: false,
        description: "Master the most important factor in credit scoring after payment history.",
        content: `
          <h3>Credit Utilization Ratio</h3>
          <p>Credit utilization is the percentage of your available credit that you're currently using. It's the second most important factor in your credit score.</p>
          
          <h4>How It's Calculated:</h4>
          <p>Total Credit Card Balances ÷ Total Credit Limits = Utilization Ratio</p>
          
          <h4>Best Practices:</h4>
          <ul>
            <li>Keep overall utilization below 30%</li>
            <li>Aim for under 10% for excellent scores</li>
            <li>Pay down balances before statement dates</li>
            <li>Consider requesting credit limit increases</li>
            <li>Don't close old credit cards</li>
          </ul>
          
          <h4>Per-Card vs Overall Utilization:</h4>
          <ul>
            <li>Both individual card and overall utilization matter</li>
            <li>Avoid maxing out any single card</li>
            <li>Spread balances across multiple cards if needed</li>
          </ul>
        `,
      },
      {
        id: 5,
        title: "Payment History Impact",
        duration: "7 min",
        completed: false,
        description: "Why payment history is the most critical factor in your credit score.",
        content: `
          <h3>Payment History: The Foundation of Credit</h3>
          <p>Payment history accounts for 35% of your credit score, making it the most important factor. Even one late payment can significantly impact your score.</p>
          
          <h4>What Counts as Payment History:</h4>
          <ul>
            <li>Credit card payments</li>
            <li>Loan payments (auto, mortgage, personal)</li>
            <li>Some utility and phone bills</li>
            <li>Collections accounts</li>
          </ul>
          
          <h4>Late Payment Timeline:</h4>
          <ul>
            <li><strong>1-29 days late:</strong> Usually no credit report impact</li>
            <li><strong>30 days late:</strong> Reported to credit bureaus</li>
            <li><strong>60-90 days late:</strong> Increasingly severe impact</li>
            <li><strong>120+ days late:</strong> May be sent to collections</li>
          </ul>
          
          <h4>Recovery Strategies:</h4>
          <ul>
            <li>Set up automatic payments</li>
            <li>Use calendar reminders</li>
            <li>Pay more than the minimum</li>
            <li>Contact lenders if you're struggling</li>
          </ul>
        `,
      },
      {
        id: 6,
        title: "Length of Credit History",
        duration: "4 min",
        completed: false,
        description: "How the age of your accounts affects your credit score.",
        content: `
          <h3>Credit History Length</h3>
          <p>The length of your credit history accounts for 15% of your credit score. Lenders want to see a long track record of responsible credit use.</p>
          
          <h4>What's Considered:</h4>
          <ul>
            <li>Age of your oldest account</li>
            <li>Age of your newest account</li>
            <li>Average age of all accounts</li>
            <li>How long specific accounts have been established</li>
          </ul>
          
          <h4>Strategies to Improve:</h4>
          <ul>
            <li>Keep old accounts open, even if unused</li>
            <li>Use old cards occasionally to keep them active</li>
            <li>Think carefully before closing accounts</li>
            <li>Be patient - time is your friend</li>
          </ul>
          
          <h4>Common Mistakes:</h4>
          <ul>
            <li>Closing your oldest credit card</li>
            <li>Opening too many new accounts quickly</li>
            <li>Letting old accounts close due to inactivity</li>
          </ul>
        `,
      },
      {
        id: 7,
        title: "Types of Credit Accounts",
        duration: "8 min",
        completed: false,
        description: "Understanding different types of credit and how they affect your score.",
        content: `
          <h3>Credit Mix and Account Types</h3>
          <p>Credit mix accounts for 10% of your credit score. Having different types of credit shows lenders you can manage various forms of debt responsibly.</p>
          
          <h4>Types of Credit Accounts:</h4>
          <ul>
            <li><strong>Revolving Credit:</strong> Credit cards, HELOCs</li>
            <li><strong>Installment Loans:</strong> Mortgages, auto loans, personal loans</li>
            <li><strong>Open Credit:</strong> Charge cards, some business accounts</li>
          </ul>
          
          <h4>Building a Good Mix:</h4>
          <ul>
            <li>Start with a credit card</li>
            <li>Add an installment loan when appropriate</li>
            <li>Don't open accounts just for mix</li>
            <li>Focus on accounts you actually need</li>
          </ul>
          
          <h4>Account Status Meanings:</h4>
          <ul>
            <li><strong>Open:</strong> Active account in good standing</li>
            <li><strong>Closed:</strong> Account closed by you or lender</li>
            <li><strong>Paid as Agreed:</strong> Payments made on time</li>
            <li><strong>Charge-off:</strong> Lender wrote off the debt</li>
          </ul>
        `,
      },
      {
        id: 8,
        title: "New Credit Inquiries",
        duration: "5 min",
        completed: false,
        description: "How credit inquiries affect your score and when to be concerned.",
        content: `
          <h3>Credit Inquiries and New Credit</h3>
          <p>New credit inquiries account for 10% of your credit score. While the impact is small, too many inquiries can signal risk to lenders.</p>
          
          <h4>Types of Inquiries:</h4>
          <ul>
            <li><strong>Hard Inquiries:</strong> When you apply for credit (affects score)</li>
            <li><strong>Soft Inquiries:</strong> Background checks, pre-approvals (no impact)</li>
          </ul>
          
          <h4>Hard Inquiry Impact:</h4>
          <ul>
            <li>Usually drops score by 5-10 points</li>
            <li>Effect diminishes over time</li>
            <li>Falls off report after 2 years</li>
            <li>Multiple inquiries for same loan type count as one</li>
          </ul>
          
          <h4>Rate Shopping Rules:</h4>
          <ul>
            <li>Multiple auto/mortgage inquiries within 14-45 days count as one</li>
            <li>Credit card inquiries are always counted separately</li>
            <li>Shop for rates within a focused time period</li>
          </ul>
          
          <h4>Best Practices:</h4>
          <ul>
            <li>Only apply for credit you need</li>
            <li>Space out credit applications</li>
            <li>Check your own credit regularly (soft inquiry)</li>
            <li>Be strategic about timing applications</li>
          </ul>
        `,
      },
    ],
  }

  const currentLessonData = courseData.lessons.find((lesson) => lesson.id === currentLesson)
  
  // Get real completion data from progress tracking service (only on client side)
  const completedLessons = mounted ? (() => {
    if (!userProgress) return 0
    const courseLessons = userProgress.lessons.filter((l: any) => l.courseId === 'credit-basics')
    return courseLessons.filter((l: any) => l.completed).length
  })() : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/dashboard/training">
              <Button
                variant="outline"
                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Training
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2">
                {courseData.title}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">{courseData.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                <span className="flex items-center">
                  <Star className="h-3 w-3 mr-1 text-yellow-500" />
                  {courseData.rating}
                </span>
                <span className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {courseData.students.toLocaleString()} students
                </span>
                <span>By {courseData.instructor}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="font-semibold bg-green-100 text-green-700 border-green-200">
              FREE
            </Badge>
            <Badge variant="secondary" className="font-semibold bg-blue-100 text-blue-700 border-blue-200">
              {courseData.difficulty}
            </Badge>
          </div>
        </div>

        {/* Lesson Content */}
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="flex items-center justify-between">
              <span className="text-xl font-bold">📚 {currentLessonData?.title}</span>
              <div className="flex items-center space-x-2 text-blue-100">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">{currentLessonData?.duration}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Video Player Placeholder */}
            <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-center text-white">
                <Play className="h-16 w-16 mx-auto mb-4 opacity-75" />
                <p className="text-lg">Video: {currentLessonData?.title}</p>
                <p className="text-sm opacity-75">Click to play lesson video</p>
              </div>
            </div>

            {/* Lesson Content */}
            <div className="prose max-w-none py-6">
              <div dangerouslySetInnerHTML={{ __html: currentLessonData?.content || "" }} />
            </div>

            {/* Completion Action Buttons */}
            <div className="mt-6 flex justify-center">
              {mounted && (() => {
                const lessonId = `lesson-${currentLesson}`
                const isCompleted = getLessonCompletionStatus(lessonId)
                
                return isCompleted ? (
                  <Button
                    onClick={handleMarkIncomplete}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-12 py-4 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                    size="lg"
                  >
                    <XCircle className="h-6 w-6 mr-3" />
                    Unmark as Complete
                  </Button>
                ) : (
                  <Button
                    onClick={handleMarkComplete}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-12 py-4 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                    size="lg"
                  >
                    <CheckCircle className="h-6 w-6 mr-3" />
                    Mark as Complete
                  </Button>
                )
              })()}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-between items-center pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentLesson(Math.max(1, currentLesson - 1))}
                disabled={currentLesson === 1}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Lesson
              </Button>

              <div className="text-sm text-gray-600">
                Lesson {currentLesson} of {courseData.lessons.length}
              </div>

              <Button
                onClick={() => setCurrentLesson(Math.min(courseData.lessons.length, currentLesson + 1))}
                disabled={currentLesson === courseData.lessons.length}
                className="flex items-center space-x-2"
              >
                Next Lesson
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Completion Status */}
        {mounted && (() => {
          const lessonId = `lesson-${currentLesson}`
          const isCompleted = getLessonCompletionStatus(lessonId)
          
          return isCompleted && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  Lesson Completed! 🎉
                </h3>
                <p className="text-green-700 mb-4">
                  Great job! You've completed this lesson. Your progress has been saved.
                </p>
                <div className="flex space-x-3 justify-center">
                  {currentLesson < courseData.lessons.length ? (
                    <Button
                      onClick={() => setCurrentLesson(currentLesson + 1)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Continue to Next Lesson
                    </Button>
                  ) : (
                    <Button
                      onClick={() => window.location.href = '/dashboard/training'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Back to Training
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/dashboard/training'}
                  >
                    View All Courses
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })()}

        {/* Sidebar */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* This space is for future content */}
          </div>
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Progress Card */}
              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                  <CardTitle className="text-lg font-bold">📊 Course Progress</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold">Progress</span>
                        <span className="font-bold text-blue-600">{Math.round((completedLessons / courseData.lessons.length) * 100)}%</span>
                      </div>
                      <Progress value={(completedLessons / courseData.lessons.length) * 100} className="h-3" />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">
                        {completedLessons} of {courseData.lessons.length} lessons completed
                      </p>
                      <p className="flex items-center mt-2">
                        <Clock className="h-3 w-3 mr-1" />
                        {courseData.duration} total
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lessons List */}
              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <CardTitle className="text-lg font-bold">📚 Course Lessons</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {courseData.lessons.map((lesson) => {
                      const lessonId = `lesson-${lesson.id}`
                      const isCompleted = mounted ? getLessonCompletionStatus(lessonId) : false
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLesson(lesson.id)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 ${
                            currentLesson === lesson.id
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : isCompleted
                                ? "border-green-200 bg-green-50 hover:border-green-300"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                              )}
                              <div>
                                <p className="font-medium text-sm">{lesson.title}</p>
                                <p className="text-xs text-gray-500">{lesson.duration}</p>
                              </div>
                            </div>
                            {currentLesson === lesson.id && <Play className="h-4 w-4 text-blue-600" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                  <CardTitle className="text-lg font-bold">📁 Course Resources</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-transparent hover:bg-gray-50">
                      <Download className="h-4 w-4 mr-2" />
                      Course Workbook
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent hover:bg-gray-50">
                      <FileText className="h-4 w-4 mr-2" />
                      Credit Score Tracker
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent hover:bg-gray-50">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Additional Reading
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
