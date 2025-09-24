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
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Trophy,
  Target,
  Star,
  Shield,
  Scale,
  AlertTriangle,
} from "lucide-react"
import { Clock } from "lucide-react"

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

const legalRightsQuestions: Question[] = [
  {
    id: "lr1",
    question: "What does FCRA stand for?",
    options: [
      "Fair Credit Reporting Act",
      "Federal Credit Reporting Agency",
      "Fair Consumer Rights Act",
      "Federal Consumer Reporting Act",
    ],
    correctAnswer: 0,
    explanation:
      "FCRA stands for Fair Credit Reporting Act, the federal law that regulates how consumer credit information is collected, shared, and used.",
    category: "FCRA Basics",
    difficulty: "Easy",
    points: 5,
  },
  {
    id: "lr2",
    question: "Under the FCRA, how long do credit bureaus have to investigate disputes?",
    options: ["15 days", "30 days", "45 days", "60 days"],
    correctAnswer: 1,
    explanation:
      "Credit bureaus have 30 days to investigate disputes under the FCRA. This can be extended to 45 days if you provide additional information during the investigation.",
    category: "FCRA Rights",
    difficulty: "Easy",
    points: 5,
  },
  {
    id: "lr3",
    question: "What does FDCPA stand for?",
    options: [
      "Fair Debt Collection Practices Act",
      "Federal Debt Collection Protection Act",
      "Fair Debt Consumer Protection Act",
      "Federal Debt Collection Procedures Act",
    ],
    correctAnswer: 0,
    explanation:
      "FDCPA stands for Fair Debt Collection Practices Act, which regulates how debt collectors can communicate with and treat consumers.",
    category: "FDCPA Basics",
    difficulty: "Easy",
    points: 5,
  },
  {
    id: "lr4",
    question: "Under the FDCPA, when can debt collectors NOT contact you?",
    options: [
      "Before 8 AM or after 9 PM",
      "At your workplace if prohibited",
      "When you have an attorney",
      "All of the above",
    ],
    correctAnswer: 3,
    explanation:
      "The FDCPA prohibits debt collectors from contacting you before 8 AM or after 9 PM, at work if prohibited, or directly if you have legal representation.",
    category: "FDCPA Rights",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "lr5",
    question: "What is a 'validation letter' under the FDCPA?",
    options: [
      "A letter validating your identity",
      "A letter requesting proof of debt",
      "A letter validating your address",
      "A letter from your attorney",
    ],
    correctAnswer: 1,
    explanation:
      "A validation letter requests that a debt collector provide proof that you owe the debt, including the original creditor's name and the amount owed.",
    category: "Debt Validation",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "lr6",
    question: "How long do you have to request debt validation after first contact?",
    options: ["15 days", "30 days", "45 days", "60 days"],
    correctAnswer: 1,
    explanation:
      "You have 30 days from the first contact to request debt validation. The collector must stop collection efforts until they provide validation.",
    category: "Debt Validation",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "lr7",
    question: "What does FCBA stand for?",
    options: [
      "Fair Credit Billing Act",
      "Federal Credit Bureau Act",
      "Fair Consumer Banking Act",
      "Federal Credit Billing Agency",
    ],
    correctAnswer: 0,
    explanation:
      "FCBA stands for Fair Credit Billing Act, which provides protection against billing errors on credit card and other revolving credit accounts.",
    category: "FCBA Basics",
    difficulty: "Easy",
    points: 5,
  },
  {
    id: "lr8",
    question: "Under the FCBA, how long do you have to dispute a billing error?",
    options: ["30 days", "60 days", "90 days", "120 days"],
    correctAnswer: 1,
    explanation:
      "Under the FCBA, you have 60 days from when the statement was mailed to dispute a billing error in writing.",
    category: "FCBA Rights",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "lr9",
    question: "What is the maximum penalty for willful FCRA violations?",
    options: ["$1,000", "$2,500", "$5,000", "No maximum"],
    correctAnswer: 3,
    explanation:
      "There is no maximum penalty for willful FCRA violations. Courts can award actual damages, punitive damages, and attorney fees.",
    category: "FCRA Violations",
    difficulty: "Hard",
    points: 15,
  },
  {
    id: "lr10",
    question: "What is 'furnisher liability' under the FCRA?",
    options: [
      "Liability of furniture companies",
      "Responsibility of creditors reporting to bureaus",
      "Liability of credit repair companies",
      "Responsibility of consumers",
    ],
    correctAnswer: 1,
    explanation:
      "Furnisher liability refers to the legal responsibility of creditors and other entities that report information to credit bureaus to ensure accuracy.",
    category: "Furnisher Liability",
    difficulty: "Hard",
    points: 15,
  },
  {
    id: "lr11",
    question: "Under the FDCPA, what must be included in the initial communication?",
    options: ["Amount of debt only", "Creditor name only", "Validation notice", "Payment options only"],
    correctAnswer: 2,
    explanation:
      "The initial communication must include a validation notice explaining your right to dispute the debt and request validation within 30 days.",
    category: "FDCPA Requirements",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "lr12",
    question: "What is the statute of limitations for FDCPA violations?",
    options: ["6 months", "1 year", "2 years", "3 years"],
    correctAnswer: 1,
    explanation: "You have one year from the date of the FDCPA violation to file a lawsuit against a debt collector.",
    category: "FDCPA Violations",
    difficulty: "Hard",
    points: 15,
  },
  {
    id: "lr13",
    question: "What is a 'permissible purpose' under the FCRA?",
    options: [
      "Any reason to check credit",
      "Legitimate business need for credit info",
      "Curiosity about someone's credit",
      "Employment background checks only",
    ],
    correctAnswer: 1,
    explanation:
      "A permissible purpose is a legitimate business need for credit information, such as credit applications, employment screening (with consent), or insurance underwriting.",
    category: "Permissible Purpose",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "lr14",
    question: "What is 'method of verification' (MOV) under the FCRA?",
    options: [
      "How you verify your identity",
      "How bureaus verify disputed information",
      "How creditors verify payments",
      "How consumers verify reports",
    ],
    correctAnswer: 1,
    explanation:
      "Method of verification refers to how credit bureaus verify disputed information, which they must provide to consumers upon request.",
    category: "Verification Process",
    difficulty: "Hard",
    points: 15,
  },
  {
    id: "lr15",
    question: "Under the FCRA, who can access your credit report?",
    options: ["Anyone who pays for it", "Only you", "Only those with permissible purpose", "Government agencies only"],
    correctAnswer: 2,
    explanation:
      "Only entities with a permissible purpose under the FCRA can access your credit report, such as lenders, employers (with consent), and landlords.",
    category: "Credit Report Access",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "lr16",
    question: "What is the maximum FDCPA penalty for individual violations?",
    options: ["$500", "$1,000", "$2,500", "$5,000"],
    correctAnswer: 1,
    explanation:
      "The maximum penalty for individual FDCPA violations is $1,000, plus actual damages and attorney fees.",
    category: "FDCPA Penalties",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "lr17",
    question: "What is a 'cease and desist' letter?",
    options: [
      "A letter to stop credit reporting",
      "A letter to stop debt collection contact",
      "A letter to stop credit inquiries",
      "A letter to stop employment checks",
    ],
    correctAnswer: 1,
    explanation:
      "A cease and desist letter instructs debt collectors to stop contacting you. Under the FDCPA, they must comply except to notify you of specific actions.",
    category: "Cease and Desist",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "lr18",
    question: "What is 'reinvestigation' under the FCRA?",
    options: [
      "A second credit check",
      "Bureau's process for investigating disputes",
      "Creditor's review of accounts",
      "Consumer's right to review reports",
    ],
    correctAnswer: 1,
    explanation:
      "Reinvestigation is the credit bureau's process of investigating disputed information by contacting the furnisher of the information.",
    category: "Dispute Process",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "lr19",
    question: "Under the FCRA, what happens if a furnisher doesn't respond to a dispute?",
    options: ["Nothing happens", "Information must be deleted", "Investigation continues", "Consumer pays penalty"],
    correctAnswer: 1,
    explanation:
      "If a furnisher doesn't respond to a dispute within the required timeframe, the credit bureau must delete the disputed information.",
    category: "Furnisher Response",
    difficulty: "Hard",
    points: 15,
  },
  {
    id: "lr20",
    question: "What is the 'business day rule' under the FCBA?",
    options: [
      "Disputes must be filed on business days",
      "Creditors have 2 business days to respond",
      "Payments posted within 2 business days",
      "Statements mailed on business days only",
    ],
    correctAnswer: 1,
    explanation:
      "Under the FCBA, creditors must acknowledge billing error disputes within 30 days and resolve them within 2 billing cycles (but not more than 90 days).",
    category: "FCBA Timeline",
    difficulty: "Hard",
    points: 15,
  },
  {
    id: "lr21",
    question: "What is 'mixed file' under the FCRA?",
    options: [
      "A file with multiple credit types",
      "Information from different consumers mixed together",
      "A file with both positive and negative items",
      "A file with disputed items",
    ],
    correctAnswer: 1,
    explanation:
      "A mixed file occurs when credit information from different consumers is incorrectly combined in one credit report, often due to similar names or SSNs.",
    category: "Credit Report Errors",
    difficulty: "Hard",
    points: 15,
  },
  {
    id: "lr22",
    question: "Under the FDCPA, what constitutes harassment?",
    options: [
      "Calling once per day",
      "Sending written notices",
      "Repeated calls intended to annoy",
      "Requesting payment",
    ],
    correctAnswer: 2,
    explanation:
      "Harassment under the FDCPA includes repeated phone calls intended to annoy, abuse, or harass, as well as threats of violence or use of obscene language.",
    category: "FDCPA Harassment",
    difficulty: "Medium",
    points: 10,
  },
  {
    id: "lr23",
    question: "What is the 'original creditor' exception under the FDCPA?",
    options: [
      "Original creditors are exempt from FDCPA",
      "Original creditors have more rights",
      "Original creditors can't collect debts",
      "Original creditors must validate debts",
    ],
    correctAnswer: 0,
    explanation:
      "Original creditors are generally exempt from the FDCPA. The act primarily applies to third-party debt collectors, not the original creditor collecting their own debts.",
    category: "FDCPA Scope",
    difficulty: "Hard",
    points: 15,
  },
  {
    id: "lr24",
    question: "What is 'summary judgment' in credit law?",
    options: [
      "A quick court decision",
      "A judgment without trial when facts aren't disputed",
      "A judgment in favor of consumers",
      "A judgment requiring payment",
    ],
    correctAnswer: 1,
    explanation:
      "Summary judgment is a court ruling without trial when there are no genuine disputes about material facts, often used in debt collection cases.",
    category: "Legal Procedures",
    difficulty: "Hard",
    points: 15,
  },
  {
    id: "lr25",
    question: "What is the 'bona fide error' defense under the FDCPA?",
    options: [
      "Collectors can make any error",
      "Defense for unintentional violations with procedures to avoid errors",
      "Errors are always acceptable",
      "Defense for intentional violations",
    ],
    correctAnswer: 1,
    explanation:
      "The bona fide error defense protects debt collectors from liability for unintentional violations if they had procedures in place to avoid such errors.",
    category: "FDCPA Defenses",
    difficulty: "Hard",
    points: 15,
  },
]

export default function LegalRightsQuizPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState(40 * 60) // 40 minutes
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
    setTimeLeft(40 * 60)
  }

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }))
  }

  const handleSubmitQuiz = () => {
    setQuizCompleted(true)

    let correctAnswers = 0
    let earnedPoints = 0

    legalRightsQuestions.forEach((question) => {
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
    const percentage = (score / legalRightsQuestions.length) * 100
    if (percentage >= 90) return { grade: "A+", color: "text-green-600", bg: "bg-green-100" }
    if (percentage >= 80) return { grade: "A", color: "text-green-600", bg: "bg-green-100" }
    if (percentage >= 70) return { grade: "B", color: "text-blue-600", bg: "bg-blue-100" }
    if (percentage >= 60) return { grade: "C", color: "text-yellow-600", bg: "bg-yellow-100" }
    return { grade: "F", color: "text-red-600", bg: "bg-red-100" }
  }

  const answeredQuestions = Object.keys(answers).length
  const progressPercentage = (answeredQuestions / legalRightsQuestions.length) * 100

  if (!quizStarted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quizzes
        </Button>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
              <Scale className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Consumer Legal Rights Quiz</h1>
            <p className="text-gray-600 text-lg">Master your rights under FCRA, FDCPA, and FCBA</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-6 w-6 mr-2" />
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
                    <div className="font-semibold">25 Questions</div>
                    <div className="text-sm text-gray-600">Comprehensive legal coverage</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold">40 Minutes</div>
                    <div className="text-sm text-gray-600">Time limit</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Star className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">250 Points</div>
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
                <h4 className="font-semibold text-blue-900 mb-2">Legal Topics Covered:</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  <Badge variant="outline">FCRA Rights & Violations</Badge>
                  <Badge variant="outline">FDCPA Protections</Badge>
                  <Badge variant="outline">FCBA Billing Rights</Badge>
                  <Badge variant="outline">Debt Validation</Badge>
                  <Badge variant="outline">Furnisher Liability</Badge>
                  <Badge variant="outline">Legal Procedures</Badge>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-2">
                  <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">Important Note</h4>
                    <p className="text-sm text-yellow-800">
                      This quiz covers federal consumer protection laws. State laws may provide additional protections.
                      Always consult with a qualified attorney for legal advice.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={handleStartQuiz} size="lg" className="px-8">
                  Start Legal Rights Quiz
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
    const percentage = (score / legalRightsQuestions.length) * 100
    const passed = percentage >= 75

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Results</h1>
            <p className="text-gray-600">Consumer Legal Rights Quiz Performance</p>
          </div>

          {/* Score Overview */}
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${gradeInfo.bg} mb-4`}>
                <span className={`text-3xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {score}/{legalRightsQuestions.length} Correct
              </h2>
              <p className="text-gray-600 mb-4">{Math.round(percentage)}% Score</p>

              {passed && (
                <Badge className="bg-green-100 text-green-800 mb-4">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Quiz Passed! Legal Eagle Badge Earned!
                </Badge>
              )}

              <div className="flex justify-center items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-green-600">{totalPoints}</div>
                  <div className="text-gray-600">Points Earned</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{formatTime(40 * 60 - timeLeft)}</div>
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
                {legalRightsQuestions.map((question, index) => {
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

  const currentQ = legalRightsQuestions[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Legal Rights Quiz</h1>
              <p className="text-gray-600">
                Question {currentQuestion + 1} of {legalRightsQuestions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-orange-600">
                <Clock className="h-4 w-4" />
                <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
              </div>

              {Object.keys(answers).length === legalRightsQuestions.length ? (
                <Button onClick={handleSubmitQuiz} className="bg-green-600 hover:bg-green-700" size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={handleSubmitQuiz} variant="outline" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Submit Incomplete ({Object.keys(answers).length}/{legalRightsQuestions.length})
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>
                {answeredQuestions}/{legalRightsQuestions.length} answered
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
                    {legalRightsQuestions.map((_, index) => {
                      const isAnswered = answers[legalRightsQuestions[index].id] !== undefined
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
                      {currentQuestion + 1} of {legalRightsQuestions.length}
                    </span>

                    {currentQuestion === legalRightsQuestions.length - 1 ? (
                      <Button
                        onClick={handleSubmitQuiz}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={Object.keys(answers).length < legalRightsQuestions.length}
                      >
                        Submit Quiz
                        <CheckCircle className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          setCurrentQuestion(Math.min(legalRightsQuestions.length - 1, currentQuestion + 1))
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
