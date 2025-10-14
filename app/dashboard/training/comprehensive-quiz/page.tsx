"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Clock, CheckCircle, XCircle, Award, Target, RotateCcw, ArrowLeft, ArrowRight, Flag, Timer } from "lucide-react"
import Link from "next/link"
import { useNotifications } from "@/lib/notification-context"

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: "Easy" | "Medium" | "Hard"
  category: string
  points: number
}

const comprehensiveQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the most significant factor affecting your credit score?",
    options: ["Credit utilization ratio", "Payment history", "Length of credit history", "Types of credit used"],
    correctAnswer: 1,
    explanation:
      "Payment history accounts for 35% of your credit score, making it the most important factor. Consistently making on-time payments is crucial for maintaining a good credit score.",
    difficulty: "Easy",
    category: "Credit Basics",
    points: 5,
  },
  {
    id: 2,
    question:
      "Under the Fair Credit Reporting Act (FCRA), how long can most negative information remain on your credit report?",
    options: ["5 years", "7 years", "10 years", "15 years"],
    correctAnswer: 1,
    explanation:
      "Most negative information, including late payments, collections, and charge-offs, can remain on your credit report for 7 years from the date of first delinquency.",
    difficulty: "Medium",
    category: "Legal Rights",
    points: 10,
  },
  {
    id: 3,
    question: "What is the ideal credit utilization ratio to maintain for optimal credit scores?",
    options: ["Under 50%", "Under 30%", "Under 10%", "Under 5%"],
    correctAnswer: 2,
    explanation:
      "While keeping utilization under 30% is generally recommended, maintaining it under 10% typically results in the highest credit scores. Lower utilization demonstrates better credit management.",
    difficulty: "Medium",
    category: "Credit Optimization",
    points: 10,
  },
  {
    id: 4,
    question: "Which dispute method involves requesting verification of debt under Section 609 of the FCRA?",
    options: ["Direct dispute with creditor", "609 verification method", "Goodwill letter", "Pay-for-delete agreement"],
    correctAnswer: 1,
    explanation:
      "The 609 method involves requesting that credit bureaus provide verification and documentation of negative items on your credit report, as required under Section 609 of the FCRA.",
    difficulty: "Hard",
    category: "Advanced Disputes",
    points: 15,
  },
  {
    id: 5,
    question: "How many days do credit bureaus have to investigate a dispute under the FCRA?",
    options: ["15 days", "30 days", "45 days", "60 days"],
    correctAnswer: 1,
    explanation:
      "Credit bureaus must complete their investigation within 30 days of receiving a dispute, unless they determine the dispute is frivolous or irrelevant.",
    difficulty: "Medium",
    category: "Legal Rights",
    points: 10,
  },
  {
    id: 6,
    question: "What happens to your credit score when you close an old credit card account?",
    options: ["It always improves", "It typically decreases", "It has no effect", "It only affects utilization"],
    correctAnswer: 1,
    explanation:
      "Closing old credit cards typically decreases your credit score by reducing your available credit (increasing utilization) and potentially shortening your credit history length.",
    difficulty: "Medium",
    category: "Credit Management",
    points: 10,
  },
  {
    id: 7,
    question: "Which type of credit inquiry does NOT affect your credit score?",
    options: ["Mortgage application", "Credit card application", "Employer background check", "Auto loan application"],
    correctAnswer: 2,
    explanation:
      "Employer background checks are considered 'soft inquiries' and do not affect your credit score. Only 'hard inquiries' from credit applications impact your score.",
    difficulty: "Easy",
    category: "Credit Basics",
    points: 5,
  },
  {
    id: 8,
    question: "What is a 'pay-for-delete' agreement?",
    options: [
      "Paying to remove accurate information",
      "Negotiating to remove negative items upon payment",
      "Paying credit bureaus to delete reports",
      "Automatic deletion after payment",
    ],
    correctAnswer: 1,
    explanation:
      "A pay-for-delete agreement is a negotiation with a creditor or collection agency where they agree to remove the negative item from your credit report in exchange for payment.",
    difficulty: "Hard",
    category: "Advanced Disputes",
    points: 15,
  },
  {
    id: 9,
    question: "How long does a bankruptcy remain on your credit report?",
    options: ["7 years", "10 years", "15 years", "Permanently"],
    correctAnswer: 1,
    explanation:
      "Chapter 7 bankruptcy remains on your credit report for 10 years, while Chapter 13 bankruptcy remains for 7 years from the filing date.",
    difficulty: "Medium",
    category: "Legal Rights",
    points: 10,
  },
  {
    id: 10,
    question: "What is the primary purpose of a goodwill letter?",
    options: [
      "To dispute inaccurate information",
      "To request removal of accurate negative items",
      "To negotiate payment terms",
      "To request credit limit increases",
    ],
    correctAnswer: 1,
    explanation:
      "A goodwill letter is used to request the removal of accurate negative information based on your positive payment history and relationship with the creditor.",
    difficulty: "Medium",
    category: "Credit Repair Strategies",
    points: 10,
  },
  {
    id: 11,
    question: "Which credit scoring model is most commonly used by lenders?",
    options: ["VantageScore 3.0", "FICO Score 8", "TransUnion Score", "Experian Score"],
    correctAnswer: 1,
    explanation:
      "FICO Score 8 is the most widely used credit scoring model by lenders, though newer versions like FICO Score 9 and 10 are being adopted.",
    difficulty: "Medium",
    category: "Credit Basics",
    points: 10,
  },
  {
    id: 12,
    question: "What is 'credit piggybacking'?",
    options: [
      "Using someone else's credit card",
      "Being added as an authorized user",
      "Copying someone's credit profile",
      "Sharing credit accounts illegally",
    ],
    correctAnswer: 1,
    explanation:
      "Credit piggybacking involves being added as an authorized user on someone else's credit card account to potentially benefit from their positive payment history.",
    difficulty: "Hard",
    category: "Advanced Strategies",
    points: 15,
  },
  {
    id: 13,
    question: "How often should you check your credit reports for errors?",
    options: ["Monthly", "Quarterly", "Annually", "Only when applying for credit"],
    correctAnswer: 2,
    explanation:
      "You should check your credit reports at least annually from all three bureaus. You're entitled to one free report per year from each bureau through annualcreditreport.com.",
    difficulty: "Easy",
    category: "Credit Monitoring",
    points: 5,
  },
  {
    id: 14,
    question: "What is the statute of limitations for most debts?",
    options: ["3-6 years", "7-10 years", "10-15 years", "No limit"],
    correctAnswer: 0,
    explanation:
      "The statute of limitations for most debts varies by state and debt type but typically ranges from 3-6 years. After this period, creditors cannot sue you for the debt.",
    difficulty: "Hard",
    category: "Legal Rights",
    points: 15,
  },
  {
    id: 15,
    question: "What is the best strategy for building credit from scratch?",
    options: [
      "Apply for multiple credit cards",
      "Get a secured credit card",
      "Take out a large loan",
      "Wait for credit to build naturally",
    ],
    correctAnswer: 1,
    explanation:
      "A secured credit card is often the best way to build credit from scratch. It requires a deposit but helps establish payment history and credit utilization patterns.",
    difficulty: "Easy",
    category: "Credit Building",
    points: 5,
  },
]

export default function ComprehensiveQuizPage() {
  const { addNotification } = useNotifications()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [quizStarted, quizCompleted, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
    setCurrentQuestion(0)
    setAnswers({})
    setQuizCompleted(false)
    setShowResults(false)
    setTimeLeft(30 * 60)
  }

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }))
  }

  const handleSubmitQuiz = () => {
    setQuizCompleted(true)

    let correctAnswers = 0
    let earnedPoints = 0

    comprehensiveQuestions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++
        earnedPoints += question.points
      }
    })

    setScore(correctAnswers)
    setTotalPoints(earnedPoints)
    setShowResults(true)

    // Calculate percentage and determine if passed
    const percentage = (correctAnswers / comprehensiveQuestions.length) * 100
    const passed = percentage >= 70 // 70% passing grade

    // Send notification
    addNotification({
      title: passed ? "Quiz Passed! 🎉" : "Quiz Completed 📝",
      message: `You scored ${Math.round(percentage)}% on "Comprehensive Credit Knowledge Quiz"${passed ? " - Great job!" : " - Keep studying!"}`,
      type: passed ? "success" : "info",
      priority: "medium",
      category: "training",
      read: false
    }).catch(error => {
      console.error('Failed to send quiz completion notification:', error)
    })
  }

  const getScoreGrade = () => {
    const percentage = (score / comprehensiveQuestions.length) * 100
    if (percentage >= 90) return { grade: "A+", color: "text-green-600", bg: "bg-green-100" }
    if (percentage >= 80) return { grade: "A", color: "text-green-600", bg: "bg-green-100" }
    if (percentage >= 70) return { grade: "B", color: "text-blue-600", bg: "bg-blue-100" }
    if (percentage >= 60) return { grade: "C", color: "text-yellow-600", bg: "bg-yellow-100" }
    return { grade: "F", color: "text-red-600", bg: "bg-red-100" }
  }

  const answeredQuestions = Object.keys(answers).length
  const progressPercentage = (answeredQuestions / comprehensiveQuestions.length) * 100

  if (!quizStarted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Credit Repair Quiz</h1>
            <p className="text-gray-600 text-lg">Test your knowledge with our advanced assessment</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-6 w-6 mr-2" />
                Quiz Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">15 Questions</div>
                    <div className="text-sm text-gray-600">Comprehensive coverage</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Timer className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold">30 Minutes</div>
                    <div className="text-sm text-gray-600">Time limit</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">150 Points</div>
                    <div className="text-sm text-gray-600">Maximum score</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Flag className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Mixed Difficulty</div>
                    <div className="text-sm text-gray-600">Easy to Hard</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Topics Covered:</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  <Badge variant="outline">Credit Basics</Badge>
                  <Badge variant="outline">Legal Rights</Badge>
                  <Badge variant="outline">Advanced Disputes</Badge>
                  <Badge variant="outline">Credit Optimization</Badge>
                  <Badge variant="outline">Credit Management</Badge>
                  <Badge variant="outline">Credit Building</Badge>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Read each question carefully</li>
                  <li>• Select the best answer for each question</li>
                  <li>• You can navigate between questions</li>
                  <li>• Submit before time runs out</li>
                  <li>• Review explanations after completion</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button onClick={handleStartQuiz} size="lg" className="px-8">
                  Start Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (showResults) {
    const gradeInfo = getScoreGrade()
    const percentage = (score / comprehensiveQuestions.length) * 100

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Results</h1>
            <p className="text-gray-600">Here's how you performed on the comprehensive quiz</p>
          </div>

          {/* Score Overview */}
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${gradeInfo.bg} mb-4`}>
                <span className={`text-3xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {score}/{comprehensiveQuestions.length} Correct
              </h2>
              <p className="text-gray-600 mb-4">{Math.round(percentage)}% Score</p>

              <div className="flex justify-center items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-green-600">{totalPoints}</div>
                  <div className="text-gray-600">Points Earned</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{formatTime(30 * 60 - timeLeft)}</div>
                  <div className="text-gray-600">Time Taken</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Review */}
          <Card>
            <CardHeader>
              <CardTitle>Question Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {comprehensiveQuestions.map((question, index) => {
                  const userAnswer = answers[question.id]
                  const isCorrect = userAnswer === question.correctAnswer
                  const wasAnswered = userAnswer !== undefined

                  return (
                    <div key={question.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold">Question {index + 1}</span>
                            <Badge variant="outline">{question.difficulty}</Badge>
                            <Badge variant="outline">{question.category}</Badge>
                            <span className="text-sm text-gray-600">{question.points} pts</span>
                          </div>
                          <p className="text-gray-900">{question.question}</p>
                        </div>
                        <div
                          className={`p-2 rounded-full ${
                            !wasAnswered
                              ? "bg-gray-100 text-gray-400"
                              : isCorrect
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                          }`}
                        >
                          {!wasAnswered ? (
                            <XCircle className="h-5 w-5" />
                          ) : isCorrect ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optionIndex) => {
                          const isUserAnswer = userAnswer === optionIndex
                          const isCorrectAnswer = optionIndex === question.correctAnswer

                          return (
                            <div
                              key={optionIndex}
                              className={`p-3 rounded-lg border ${
                                isCorrectAnswer
                                  ? "bg-green-50 border-green-200"
                                  : isUserAnswer
                                    ? "bg-red-50 border-red-200"
                                    : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{option}</span>
                                <div className="flex items-center space-x-2">
                                  {isCorrectAnswer && (
                                    <Badge className="bg-green-100 text-green-800 text-xs">Correct</Badge>
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <Badge variant="destructive" className="text-xs">
                                      Your Answer
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center space-x-4 mt-8">
            <Button onClick={handleStartQuiz} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
            <Link href="/dashboard/training">
              <Button>Back to Training Center</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = comprehensiveQuestions[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Comprehensive Quiz</h1>
              <p className="text-gray-600">
                Question {currentQuestion + 1} of {comprehensiveQuestions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-orange-600">
                <Clock className="h-4 w-4" />
                <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
              </div>
              <Button onClick={handleSubmitQuiz} variant="outline" size="sm">
                Submit Quiz
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>
                {answeredQuestions}/{comprehensiveQuestions.length} answered
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Question Navigator */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Questions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-5 lg:grid-cols-3 gap-2 p-4">
                    {comprehensiveQuestions.map((_, index) => {
                      const isAnswered = answers[comprehensiveQuestions[index].id] !== undefined
                      const isCurrent = index === currentQuestion

                      return (
                        <button
                          key={index}
                          onClick={() => setCurrentQuestion(index)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            isCurrent
                              ? "bg-blue-600 text-white"
                              : isAnswered
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {index + 1}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Question */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{currentQ.difficulty}</Badge>
                      <Badge variant="outline">{currentQ.category}</Badge>
                      <span className="text-sm text-gray-600">{currentQ.points} points</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">{currentQ.question}</h2>

                    <RadioGroup
                      value={answers[currentQ.id]?.toString()}
                      onValueChange={(value) => handleAnswerSelect(currentQ.id, Number.parseInt(value))}
                    >
                      {currentQ.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <Label
                            htmlFor={`option-${index}`}
                            className="flex-1 cursor-pointer p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    <span className="text-sm text-gray-600">
                      {currentQuestion + 1} of {comprehensiveQuestions.length}
                    </span>

                    <Button
                      onClick={() =>
                        setCurrentQuestion(Math.min(comprehensiveQuestions.length - 1, currentQuestion + 1))
                      }
                      disabled={currentQuestion === comprehensiveQuestions.length - 1}
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
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
