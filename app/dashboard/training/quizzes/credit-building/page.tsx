"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Trophy,
  Target,
  Star,
  AlertTriangle,
} from "lucide-react"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  category: string
  difficulty: "Easy" | "Medium" | "Hard"
  points: number
}

const creditBuildingQuestions: Question[] = [
  {
    id: "cb1",
    question: "What is the best first step for someone with no credit history?",
    options: [
      "Apply for multiple credit cards",
      "Get a secured credit card",
      "Take out a personal loan",
      "Wait until you're older",
    ],
    correctAnswer: 1,
    explanation:
      "A secured credit card is the best first step for building credit from scratch. It requires a deposit that serves as your credit limit, making it accessible even with no credit history.",
    category: "Credit Building Basics",
    difficulty: "Easy",
    points: 5,
  },
  {
    id: "cb2",
    question: "How much should you deposit on a secured credit card?",
    options: ["$50-100", "$200-500", "$1000+", "As much as possible"],
    correctAnswer: 1,
    explanation:
      "$200-500 is typically the sweet spot for a secured card deposit. It provides enough credit limit to be useful while not tying up too much money.",
    category: "Secured Cards",
    difficulty: "Easy",
    points: 5,
  },
  {
    id: "cb3",
    question: "What is 'credit piggybacking'?",
    options: [
      "Using someone else's credit card",
      "Being added as an authorized user",
      "Copying someone's credit information",
      "Sharing credit accounts illegally",
    ],
    correctAnswer: 1,
    explanation:
      "Credit piggybacking involves being added as an authorized user on someone else's credit card account to potentially benefit from their positive payment history and low utilization.",
    category: "Authorized Users",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "cb4",
    question: "Which type of account helps build credit mix?",
    options: ["Only credit cards", "Only loans", "A variety of credit types", "Checking accounts"],
    correctAnswer: 2,
    explanation:
      "Credit mix accounts for 10% of your FICO score. Having different types of credit (credit cards, auto loans, mortgages, etc.) shows you can manage various forms of credit responsibly.",
    category: "Credit Mix",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "cb5",
    question: "How long does it typically take to build a good credit score from scratch?",
    options: ["1-3 months", "6-12 months", "2-3 years", "5+ years"],
    correctAnswer: 1,
    explanation:
      "With responsible use, you can typically build a good credit score (700+) within 6-12 months. However, building excellent credit (800+) usually takes 2-3 years or more.",
    category: "Timeline",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "cb6",
    question: "What is a credit builder loan?",
    options: [
      "A loan to pay off credit cards",
      "A loan where funds are held until paid off",
      "A loan for home improvements",
      "A loan with no interest",
    ],
    correctAnswer: 1,
    explanation:
      "A credit builder loan is where the lender holds the loan amount in a savings account while you make payments. Once paid off, you receive the funds, and the payment history helps build credit.",
    category: "Credit Builder Loans",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "cb7",
    question: "Should you close your first credit card once you get better cards?",
    options: ["Yes, to avoid fees", "No, keep it open", "Only if it has an annual fee", "It doesn't matter"],
    correctAnswer: 1,
    explanation:
      "Generally, you should keep your first credit card open as it helps with credit history length and available credit. Only consider closing if there's a high annual fee and you can't get it waived.",
    category: "Account Management",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "cb8",
    question: "What's the ideal number of credit cards for building credit?",
    options: ["1 card", "2-4 cards", "5-10 cards", "As many as possible"],
    correctAnswer: 1,
    explanation:
      "2-4 credit cards is typically ideal for building credit. This provides enough credit mix and available credit without being difficult to manage or appearing risky to lenders.",
    category: "Credit Cards",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "cb9",
    question: "When should you ask for a credit limit increase?",
    options: [
      "Immediately after getting the card",
      "After 6-12 months of good payment history",
      "Only when you need more credit",
      "Never ask, wait for automatic increases",
    ],
    correctAnswer: 1,
    explanation:
      "After 6-12 months of responsible use and on-time payments, you can request a credit limit increase. This can help lower your utilization ratio and improve your credit score.",
    category: "Credit Limits",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "cb10",
    question: "What is the 'thin file' problem?",
    options: [
      "Having too many credit accounts",
      "Having insufficient credit history",
      "Having a low credit score",
      "Having errors on your credit report",
    ],
    correctAnswer: 1,
    explanation:
      "A 'thin file' refers to having insufficient credit history to generate a credit score. This typically affects people new to credit or those who haven't used credit in a long time.",
    category: "Credit History",
    difficulty: "Hard",
    points: 15,
  },
  {
    id: "cb11",
    question: "Which secured card feature is most important for credit building?",
    options: ["Low fees", "High credit limit", "Reports to all three credit bureaus", "Rewards program"],
    correctAnswer: 2,
    explanation:
      "The most important feature is that the secured card reports to all three major credit bureaus (Experian, Equifax, TransUnion). Without reporting, the card won't help build your credit.",
    category: "Secured Cards",
    difficulty: "Hard",
    points: 15,
  },
  {
    id: "cb12",
    question: "What is 'credit seasoning'?",
    options: [
      "Adding spices to credit applications",
      "The aging process of credit accounts",
      "Improving credit through disputes",
      "Paying off all debts at once",
    ],
    correctAnswer: 1,
    explanation:
      "Credit seasoning refers to the aging process of credit accounts. Older accounts with good payment history are viewed more favorably and contribute to a stronger credit profile.",
    category: "Credit History",
    difficulty: "Hard",
    points: 15,
  },
  {
    id: "cb13",
    question: "How does being an authorized user affect the primary cardholder?",
    options: [
      "It always hurts their credit",
      "It has no effect on their credit",
      "It can affect their credit if the AU overspends",
      "It always helps their credit",
    ],
    correctAnswer: 2,
    explanation:
      "The authorized user's spending affects the primary cardholder's utilization ratio and payment obligations. If the AU overspends or doesn't pay their portion, it can negatively impact the primary cardholder's credit.",
    category: "Authorized Users",
    difficulty: "Hard",
    points: 15,
  },
  {
    id: "cb14",
    question: "What is the 'credit utilization sweet spot' for building credit?",
    options: ["0% utilization", "1-9% utilization", "10-30% utilization", "30-50% utilization"],
    correctAnswer: 1,
    explanation:
      "1-9% utilization is the sweet spot for building credit. 0% can sometimes be viewed as inactive, while 1-9% shows you use credit responsibly without being dependent on it.",
    category: "Credit Utilization",
    difficulty: "Hard",
    points: 15,
  },
  {
    id: "cb15",
    question: "Which strategy helps build credit fastest?",
    options: [
      "Making minimum payments only",
      "Paying off balances in full monthly",
      "Carrying small balances",
      "Using cash for everything",
    ],
    correctAnswer: 1,
    explanation:
      "Paying off balances in full monthly is the fastest way to build credit. It shows responsible use, keeps utilization low, avoids interest charges, and demonstrates strong payment history.",
    category: "Payment Strategy",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "cb16",
    question: "What is a 'student credit card' and who should use it?",
    options: [
      "Any card used by students",
      "Cards designed for students with limited credit history",
      "Cards only for graduate students",
      "Cards with educational rewards",
    ],
    correctAnswer: 1,
    explanation:
      "Student credit cards are designed for college students with limited or no credit history. They typically have lower credit requirements and may offer educational resources about credit management.",
    category: "Student Credit",
    difficulty: "Easy",
    points: 5,
  },
  {
    id: "cb17",
    question: "How often should you check your credit when building credit?",
    options: ["Daily", "Weekly", "Monthly", "Annually"],
    correctAnswer: 2,
    explanation:
      "Monthly monitoring is ideal when building credit. It allows you to track progress, catch errors early, and understand how your actions affect your credit score without obsessing over daily fluctuations.",
    category: "Credit Monitoring",
    difficulty: "Easy",
    points: 5,
  },
  {
    id: "cb18",
    question: "What is the biggest mistake people make when building credit?",
    options: [
      "Not using credit at all",
      "Applying for too many cards at once",
      "Only making minimum payments",
      "Not checking their credit report",
    ],
    correctAnswer: 1,
    explanation:
      "Applying for too many cards at once is a major mistake. It results in multiple hard inquiries, can lower your credit score, and makes you appear desperate for credit to lenders.",
    category: "Common Mistakes",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "cb19",
    question: "How does income affect credit building?",
    options: [
      "Higher income always means better credit",
      "Income doesn't directly affect credit scores",
      "You need high income to build credit",
      "Income determines your credit limit",
    ],
    correctAnswer: 1,
    explanation:
      "Income doesn't directly affect credit scores, but it can influence credit limits and loan approvals. You can build excellent credit regardless of income level through responsible credit management.",
    category: "Income and Credit",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "cb20",
    question: "What should you do if your secured card doesn't graduate to unsecured?",
    options: [
      "Keep it forever",
      "Close it immediately",
      "Apply for an unsecured card elsewhere",
      "Increase the deposit",
    ],
    correctAnswer: 2,
    explanation:
      "If your secured card doesn't graduate after 12-18 months of good payment history, consider applying for an unsecured card elsewhere while keeping the secured card open to maintain credit history.",
    category: "Card Graduation",
    difficulty: "Hard",
    points: 15,
  },
]

export default function CreditBuildingQuizPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes
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

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }))
  }

  const handleSubmitQuiz = () => {
    setQuizCompleted(true)

    let correctAnswers = 0
    let earnedPoints = 0

    creditBuildingQuestions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++
        earnedPoints += question.points
      }
    })

    setScore(correctAnswers)
    setTotalPoints(earnedPoints)
    setShowResults(true)
  }

  const getScoreGrade = () => {
    const percentage = (score / creditBuildingQuestions.length) * 100
    if (percentage >= 90) return { grade: "A+", color: "text-green-600", bg: "bg-green-100" }
    if (percentage >= 80) return { grade: "A", color: "text-green-600", bg: "bg-green-100" }
    if (percentage >= 70) return { grade: "B", color: "text-blue-600", bg: "bg-blue-100" }
    if (percentage >= 60) return { grade: "C", color: "text-yellow-600", bg: "bg-yellow-100" }
    return { grade: "F", color: "text-red-600", bg: "bg-red-100" }
  }

  const answeredQuestions = Object.keys(answers).length
  const progressPercentage = (answeredQuestions / creditBuildingQuestions.length) * 100

  if (!quizStarted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quizzes
        </Button>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Credit Building Mastery Quiz</h1>
            <p className="text-gray-600 text-lg">Master the strategies for building credit from scratch</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-6 w-6 mr-2" />
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
                    <div className="font-semibold">20 Questions</div>
                    <div className="text-sm text-gray-600">Comprehensive coverage</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold">30 Minutes</div>
                    <div className="text-sm text-gray-600">Time limit</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Star className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">200 Points</div>
                    <div className="text-sm text-gray-600">Maximum score</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Trophy className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold">75% to Pass</div>
                    <div className="text-sm text-gray-600">Passing score</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Topics Covered:</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  <Badge variant="outline">Secured Credit Cards</Badge>
                  <Badge variant="outline">Authorized Users</Badge>
                  <Badge variant="outline">Credit Mix</Badge>
                  <Badge variant="outline">Credit Builder Loans</Badge>
                  <Badge variant="outline">Payment Strategies</Badge>
                  <Badge variant="outline">Credit Monitoring</Badge>
                </div>
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
    const percentage = (score / creditBuildingQuestions.length) * 100
    const passed = percentage >= 75

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Results</h1>
            <p className="text-gray-600">Credit Building Mastery Quiz Performance</p>
          </div>

          {/* Score Overview */}
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${gradeInfo.bg} mb-4`}>
                <span className={`text-3xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {score}/{creditBuildingQuestions.length} Correct
              </h2>
              <p className="text-gray-600 mb-4">{Math.round(percentage)}% Score</p>

              {passed && (
                <Badge className="bg-green-100 text-green-800 mb-4">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Quiz Passed! Credit Builder Badge Earned!
                </Badge>
              )}

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
                {creditBuildingQuestions.map((question, index) => {
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
            <Button onClick={() => router.push("/dashboard/training/quizzes")}>Back to Quizzes</Button>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = creditBuildingQuestions[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Credit Building Quiz</h1>
              <p className="text-gray-600">
                Question {currentQuestion + 1} of {creditBuildingQuestions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-orange-600">
                <Clock className="h-4 w-4" />
                <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
              </div>

              {Object.keys(answers).length === creditBuildingQuestions.length ? (
                <Button onClick={handleSubmitQuiz} className="bg-green-600 hover:bg-green-700" size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={handleSubmitQuiz} variant="outline" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Submit Incomplete ({Object.keys(answers).length}/{creditBuildingQuestions.length})
                </Button>
              )}
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>
                {answeredQuestions}/{creditBuildingQuestions.length} answered
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
                    {creditBuildingQuestions.map((_, index) => {
                      const isAnswered = answers[creditBuildingQuestions[index].id] !== undefined
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
                      value={answers[currentQ.id] !== undefined ? answers[currentQ.id].toString() : undefined}
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
                      {currentQuestion + 1} of {creditBuildingQuestions.length}
                    </span>

                    {currentQuestion === creditBuildingQuestions.length - 1 ? (
                      <Button
                        onClick={handleSubmitQuiz}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={Object.keys(answers).length < creditBuildingQuestions.length}
                      >
                        Submit Quiz
                        <CheckCircle className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          setCurrentQuestion(Math.min(creditBuildingQuestions.length - 1, currentQuestion + 1))
                        }
                        disabled={answers[currentQ.id] === undefined}
                      >
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
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
