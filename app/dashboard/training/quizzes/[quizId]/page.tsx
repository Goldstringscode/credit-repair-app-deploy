"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
  AlertCircle,
} from "lucide-react"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  category: string
}

interface QuizData {
  id: string
  title: string
  description: string
  questions: Question[]
  timeLimit: number
  passingScore: number
  points: number
}

const quizData: Record<string, QuizData> = {
  "credit-fundamentals": {
    id: "credit-fundamentals",
    title: "Credit Fundamentals Quiz",
    description: "Test your understanding of basic credit concepts, scores, and reports",
    timeLimit: 20,
    passingScore: 70,
    points: 100,
    questions: [
      {
        id: "q1",
        question: "What is the most important factor in determining your credit score?",
        options: [
          "Length of credit history",
          "Payment history",
          "Credit utilization ratio",
          "Types of credit accounts",
        ],
        correctAnswer: 1,
        explanation:
          "Payment history accounts for 35% of your FICO score, making it the most important factor. Consistently making on-time payments is crucial for maintaining a good credit score.",
        category: "Credit Basics",
      },
      {
        id: "q2",
        question: "What percentage of your available credit should you ideally use?",
        options: ["50% or less", "30% or less", "10% or less", "90% or less"],
        correctAnswer: 2,
        explanation:
          "Credit experts recommend keeping your credit utilization below 10% for the best credit scores. While 30% is often cited as acceptable, lower utilization typically results in higher scores.",
        category: "Credit Utilization",
      },
      {
        id: "q3",
        question: "How often should you check your credit report?",
        options: ["Once a year", "Every six months", "Monthly", "Only when applying for credit"],
        correctAnswer: 0,
        explanation:
          "You're entitled to one free credit report from each bureau annually through AnnualCreditReport.com. However, monitoring more frequently through other services can help catch errors early.",
        category: "Credit Monitoring",
      },
      {
        id: "q4",
        question: "Which of the following will NOT appear on your credit report?",
        options: ["Bankruptcy records", "Your income", "Credit inquiries", "Payment history"],
        correctAnswer: 1,
        explanation:
          "Your income is not reported to credit bureaus and does not appear on your credit report. Lenders may ask for income information separately when you apply for credit.",
        category: "Credit Reports",
      },
      {
        id: "q5",
        question: "What is a 'hard inquiry' on your credit report?",
        options: [
          "When you check your own credit",
          "When a lender checks your credit for a loan application",
          "When an employer checks your credit",
          "When you dispute an error",
        ],
        correctAnswer: 1,
        explanation:
          "A hard inquiry occurs when a lender checks your credit as part of a loan or credit application. These can temporarily lower your credit score by a few points.",
        category: "Credit Inquiries",
      },
      {
        id: "q6",
        question: "How long do most negative items stay on your credit report?",
        options: ["3 years", "5 years", "7 years", "10 years"],
        correctAnswer: 2,
        explanation:
          "Most negative items, including late payments, collections, and charge-offs, remain on your credit report for 7 years from the date of first delinquency.",
        category: "Credit History",
      },
      {
        id: "q7",
        question: "What does FICO stand for?",
        options: [
          "Fair Isaac Credit Organization",
          "Fair Isaac Corporation",
          "Federal Insurance Credit Office",
          "Financial Industry Credit Organization",
        ],
        correctAnswer: 1,
        explanation:
          "FICO stands for Fair Isaac Corporation, the company that created the FICO credit scoring model used by most lenders.",
        category: "Credit Scores",
      },
      {
        id: "q8",
        question: "Which credit score range is considered 'excellent'?",
        options: ["650-699", "700-749", "750-799", "800-850"],
        correctAnswer: 3,
        explanation:
          "A FICO score of 800-850 is considered excellent credit. This range typically qualifies for the best interest rates and credit terms.",
        category: "Credit Scores",
      },
      {
        id: "q9",
        question: "What is the difference between a credit report and a credit score?",
        options: [
          "They are the same thing",
          "A credit report is a detailed history; a credit score is a numerical summary",
          "A credit score is more detailed than a credit report",
          "Credit reports are only for lenders",
        ],
        correctAnswer: 1,
        explanation:
          "A credit report is a detailed record of your credit history, while a credit score is a three-digit number that summarizes your creditworthiness based on that report.",
        category: "Credit Basics",
      },
      {
        id: "q10",
        question: "Which action will help improve your credit score the fastest?",
        options: [
          "Opening new credit accounts",
          "Paying down existing balances",
          "Closing old credit cards",
          "Applying for a personal loan",
        ],
        correctAnswer: 1,
        explanation:
          "Paying down existing balances reduces your credit utilization ratio, which can improve your credit score relatively quickly since utilization is calculated monthly.",
        category: "Credit Improvement",
      },
      {
        id: "q11",
        question: "What is a credit mix and why is it important?",
        options: [
          "Having different types of credit accounts",
          "Mixing good and bad credit",
          "Using multiple credit cards",
          "Having both personal and business credit",
        ],
        correctAnswer: 0,
        explanation:
          "Credit mix refers to having different types of credit accounts (credit cards, auto loans, mortgages, etc.). It accounts for 10% of your FICO score and shows you can manage various types of credit responsibly.",
        category: "Credit Types",
      },
      {
        id: "q12",
        question: "What should you do if you find an error on your credit report?",
        options: [
          "Ignore it if it's small",
          "Contact the credit bureau to dispute it",
          "Wait for it to fall off naturally",
          "Contact the police",
        ],
        correctAnswer: 1,
        explanation:
          "You should dispute errors with the credit bureau in writing. They have 30 days to investigate and must remove or correct inaccurate information.",
        category: "Credit Disputes",
      },
      {
        id: "q13",
        question: "How many major credit bureaus are there in the United States?",
        options: ["Two", "Three", "Four", "Five"],
        correctAnswer: 1,
        explanation:
          "There are three major credit bureaus in the United States: Experian, Equifax, and TransUnion. Each maintains separate credit files and may have slightly different information.",
        category: "Credit Bureaus",
      },
      {
        id: "q14",
        question: "What is the minimum age to have a credit report?",
        options: ["16 years old", "18 years old", "21 years old", "There is no minimum age"],
        correctAnswer: 3,
        explanation:
          "There is no minimum age to have a credit report. Minors can be added as authorized users on parents' accounts, and some may even have reports due to identity theft or errors.",
        category: "Credit Basics",
      },
      {
        id: "q15",
        question: "What happens to your credit score when you close a credit card?",
        options: [
          "It always improves",
          "It always gets worse",
          "It may decrease due to reduced available credit",
          "Nothing happens",
        ],
        correctAnswer: 2,
        explanation:
          "Closing a credit card reduces your total available credit, which can increase your credit utilization ratio and potentially lower your score. It may also affect your credit history length over time.",
        category: "Credit Management",
      },
    ],
  },
  "basic-disputes": {
    id: "basic-disputes",
    title: "Basic Dispute Strategies",
    description: "Learn fundamental dispute techniques and credit bureau processes",
    timeLimit: 22,
    passingScore: 70,
    points: 125,
    questions: [
      {
        id: "q1",
        question: "What is the first step in the credit dispute process?",
        options: [
          "Contact the creditor directly",
          "Hire a credit repair company",
          "Obtain and review your credit reports",
          "File a complaint with the CFPB",
        ],
        correctAnswer: 2,
        explanation:
          "The first step is always to obtain and carefully review your credit reports from all three bureaus to identify inaccurate, incomplete, or unverifiable information.",
        category: "Dispute Process",
      },
      {
        id: "q2",
        question:
          "Under the Fair Credit Reporting Act (FCRA), how long do credit bureaus have to investigate a dispute?",
        options: ["15 days", "30 days", "45 days", "60 days"],
        correctAnswer: 1,
        explanation:
          "Credit bureaus have 30 days to investigate disputes under the FCRA. This can be extended to 45 days if you provide additional information during the investigation.",
        category: "Legal Requirements",
      },
      {
        id: "q3",
        question: "What should you include when disputing an item with a credit bureau?",
        options: [
          "Only a verbal explanation",
          "A detailed letter with supporting documentation",
          "Just your personal opinion",
          "A demand for money",
        ],
        correctAnswer: 1,
        explanation:
          "Effective disputes include a detailed letter explaining the error and supporting documentation. This provides the bureau with specific information to investigate your claim.",
        category: "Dispute Documentation",
      },
      {
        id: "q4",
        question: "What is 'frivolous' dispute and why should you avoid it?",
        options: [
          "A dispute without merit that bureaus can dismiss",
          "A dispute filed too frequently",
          "A dispute for small amounts",
          "A dispute filed online",
        ],
        correctAnswer: 0,
        explanation:
          "A frivolous dispute is one without merit or basis. Credit bureaus can dismiss these without investigation, so it's important to have legitimate grounds for your disputes.",
        category: "Dispute Strategy",
      },
      {
        id: "q5",
        question: "Which method of dispute submission is generally most effective?",
        options: ["Online dispute forms", "Phone calls", "Certified mail", "Email"],
        correctAnswer: 2,
        explanation:
          "Certified mail provides proof of delivery and creates a paper trail. While online disputes are convenient, mail disputes often receive more thorough investigation.",
        category: "Dispute Methods",
      },
      {
        id: "q6",
        question: "What happens if a credit bureau doesn't respond to your dispute within the required timeframe?",
        options: [
          "Nothing, you must wait longer",
          "The item must be removed",
          "You can file a lawsuit immediately",
          "The dispute is automatically denied",
        ],
        correctAnswer: 1,
        explanation:
          "If a credit bureau fails to respond within 30 days (or 45 days if extended), they must remove the disputed item from your credit report.",
        category: "Legal Rights",
      },
      {
        id: "q7",
        question: "What is the difference between disputing with credit bureaus vs. creditors?",
        options: [
          "There is no difference",
          "Bureaus investigate accuracy; creditors investigate validity",
          "Only bureaus can remove items",
          "Creditors are faster",
        ],
        correctAnswer: 1,
        explanation:
          "Credit bureaus investigate whether information is accurate and verifiable, while creditors (furnishers) investigate the validity and completeness of the debt itself.",
        category: "Dispute Strategy",
      },
      {
        id: "q8",
        question: "What should you do if your dispute is denied?",
        options: [
          "Give up immediately",
          "File the same dispute again",
          "Request method of verification or dispute with the creditor",
          "Hire an attorney immediately",
        ],
        correctAnswer: 2,
        explanation:
          "If denied, you can request the method of verification from the bureau or dispute directly with the creditor. You may also have grounds for a second dispute with additional information.",
        category: "Dispute Follow-up",
      },
      {
        id: "q9",
        question: "What is a 'method of verification' request?",
        options: [
          "Asking how the bureau verified disputed information",
          "Requesting your credit score calculation",
          "Asking for proof of your identity",
          "Requesting a copy of your credit report",
        ],
        correctAnswer: 0,
        explanation:
          "A method of verification request asks the credit bureau to explain how they verified the disputed information, which can reveal weaknesses in their investigation process.",
        category: "Advanced Disputes",
      },
      {
        id: "q10",
        question: "Which items are typically easiest to dispute successfully?",
        options: [
          "Recent accurate items",
          "Old, incomplete, or inaccurate items",
          "Large debt amounts",
          "Items from major banks",
        ],
        correctAnswer: 1,
        explanation:
          "Older items, incomplete information, or clearly inaccurate data are typically easier to dispute successfully because they're harder for creditors to verify.",
        category: "Dispute Strategy",
      },
      {
        id: "q11",
        question: "What is the 'nuclear option' in credit disputes?",
        options: [
          "Filing bankruptcy",
          "Disputing everything at once",
          "Hiring multiple attorneys",
          "Closing all credit accounts",
        ],
        correctAnswer: 1,
        explanation:
          "The 'nuclear option' refers to disputing all negative items simultaneously. While sometimes effective, it can backfire if bureaus flag your disputes as frivolous.",
        category: "Dispute Strategy",
      },
      {
        id: "q12",
        question: "How should you handle medical collections on your credit report?",
        options: [
          "Ignore them since they don't matter",
          "Pay them immediately",
          "Dispute them and request validation",
          "File for bankruptcy",
        ],
        correctAnswer: 2,
        explanation:
          "Medical collections should be disputed and validated like any other debt. Many medical collections contain errors or may be removed if the original creditor can't verify them properly.",
        category: "Medical Debt",
      },
      {
        id: "q13",
        question: "What is 'pay for delete' and is it legal?",
        options: [
          "An illegal practice that should be avoided",
          "A legal agreement to remove items after payment",
          "A type of credit card",
          "A government program",
        ],
        correctAnswer: 1,
        explanation:
          "Pay for delete is a legal agreement where a creditor agrees to remove a negative item in exchange for payment. While not guaranteed, it's a legitimate negotiation strategy.",
        category: "Negotiation",
      },
      {
        id: "q14",
        question: "What should you do before disputing student loan defaults?",
        options: [
          "File bankruptcy",
          "Ignore them completely",
          "Research rehabilitation and consolidation options",
          "Move to another country",
        ],
        correctAnswer: 2,
        explanation:
          "Before disputing student loan defaults, research rehabilitation, consolidation, or forgiveness programs that might be more beneficial than simple dispute strategies.",
        category: "Student Loans",
      },
      {
        id: "q15",
        question: "How long should you keep dispute-related documentation?",
        options: ["30 days", "1 year", "3 years", "Indefinitely"],
        correctAnswer: 3,
        explanation:
          "Keep all dispute documentation indefinitely. Items can reappear on credit reports, and you may need this documentation for future disputes or legal action.",
        category: "Record Keeping",
      },
      {
        id: "q16",
        question: "What is the best approach for disputing multiple items?",
        options: [
          "Dispute everything at once",
          "Dispute items strategically in small batches",
          "Only dispute the largest items",
          "Wait until all items are old",
        ],
        correctAnswer: 1,
        explanation:
          "Disputing items in small, strategic batches (3-5 items at a time) is often more effective than mass disputes, which may be flagged as frivolous.",
        category: "Dispute Strategy",
      },
      {
        id: "q17",
        question: "What should you do if the same item appears on multiple credit reports?",
        options: [
          "Only dispute it with one bureau",
          "Dispute it with all three bureaus separately",
          "Choose the bureau with the worst version",
          "Ignore the duplicates",
        ],
        correctAnswer: 1,
        explanation:
          "You must dispute the item with each credit bureau separately, as they maintain independent files and don't automatically share dispute results.",
        category: "Multiple Bureaus",
      },
      {
        id: "q18",
        question: "What is a 'goodwill letter' and when should you use it?",
        options: [
          "A legal demand letter",
          "A polite request to remove accurate but negative items",
          "A complaint to regulators",
          "A dispute letter template",
        ],
        correctAnswer: 1,
        explanation:
          "A goodwill letter is a polite request to a creditor asking them to remove accurate but negative information as a gesture of goodwill, often used for isolated late payments.",
        category: "Goodwill Requests",
      },
    ],
  },
  // Add more quiz data for other quizzes...
}

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const quiz = quizData[quizId]

  useEffect(() => {
    if (!quiz) {
      router.push("/dashboard/training/quizzes")
      return
    }

    if (quizStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [quizStarted, timeRemaining, quiz, router])

  if (!quiz) {
    return <div>Quiz not found</div>
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
    setTimeRemaining(quiz.timeLimit * 60) // Convert minutes to seconds
  }

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }))
  }

  const handleSubmitQuiz = () => {
    const correctAnswers = quiz.questions.filter(
      (question) => selectedAnswers[question.id] === question.correctAnswer,
    ).length

    const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100)
    setScore(finalScore)
    setQuizCompleted(true)
    setShowResults(true)
  }

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setQuizStarted(false)
    setQuizCompleted(false)
    setShowResults(false)
    setScore(0)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  if (!quizStarted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quizzes
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
            <p className="text-gray-600">{quiz.description}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold">{quiz.questions.length}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold">{quiz.timeLimit} min</div>
                <div className="text-sm text-gray-600">Time Limit</div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="font-semibold">{quiz.passingScore}%</div>
                <div className="text-sm text-gray-600">To Pass</div>
              </div>
            </div>

            <div className="text-center">
              <Button onClick={handleStartQuiz} size="lg" className="px-8">
                Start Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showResults) {
    const passed = score >= quiz.passingScore
    const correctAnswers = quiz.questions.filter(
      (question) => selectedAnswers[question.id] === question.correctAnswer,
    ).length

    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                passed ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {passed ? (
                <CheckCircle className="h-10 w-10 text-green-600" />
              ) : (
                <XCircle className="h-10 w-10 text-red-600" />
              )}
            </div>

            <CardTitle className="text-2xl mb-2">{passed ? "Congratulations!" : "Keep Studying!"}</CardTitle>

            <div className="text-4xl font-bold mb-2">{score}%</div>

            <p className="text-gray-600">
              You got {correctAnswers} out of {quiz.questions.length} questions correct
            </p>

            {passed && (
              <Badge className="bg-green-100 text-green-800 mt-2">
                <Star className="h-4 w-4 mr-1" />+{quiz.points} points earned!
              </Badge>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Question Review */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Review Your Answers</h3>

              {quiz.questions.map((question, index) => {
                const userAnswer = selectedAnswers[question.id]
                const isCorrect = userAnswer === question.correctAnswer

                return (
                  <Card
                    key={question.id}
                    className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-red-500"}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-1 rounded-full ${isCorrect ? "bg-green-100" : "bg-red-100"}`}>
                          {isCorrect ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium mb-2">
                            Question {index + 1}: {question.question}
                          </h4>

                          <div className="space-y-1 text-sm">
                            <div className="text-gray-600">
                              Your answer: {question.options[userAnswer] || "Not answered"}
                            </div>
                            {!isCorrect && (
                              <div className="text-green-600">
                                Correct answer: {question.options[question.correctAnswer]}
                              </div>
                            )}
                          </div>

                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm font-medium text-blue-800 mb-1">Explanation:</div>
                            <div className="text-sm text-blue-700">{question.explanation}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="flex justify-center space-x-4">
              <Button onClick={handleRetakeQuiz} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>

              <Button onClick={() => router.push("/dashboard/training/quizzes")}>Back to Quizzes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div>
            <h1 className="text-xl font-semibold">{quiz.title}</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4" />
            <span className={timeRemaining < 300 ? "text-red-600 font-semibold" : ""}>{formatTime(timeRemaining)}</span>
          </div>

          {timeRemaining < 300 && (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              Time Running Out!
            </Badge>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">{currentQuestion.question}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <RadioGroup
            value={
              selectedAnswers[currentQuestion.id] !== undefined
                ? selectedAnswers[currentQuestion.id].toString()
                : undefined
            }
            onValueChange={(value) => handleAnswerSelect(currentQuestion.id, Number.parseInt(value))}
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                className="bg-green-600 hover:bg-green-700"
                disabled={Object.keys(selectedAnswers).length < quiz.questions.length}
              >
                Submit Quiz
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                disabled={selectedAnswers[currentQuestion.id] === undefined}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question Navigator */}
      <Card className="max-w-3xl mx-auto mt-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((_, index) => (
              <Button
                key={index}
                variant={currentQuestionIndex === index ? "default" : "outline"}
                size="sm"
                className={`w-10 h-10 ${
                  selectedAnswers[quiz.questions[index].id] !== undefined
                    ? "bg-green-100 border-green-300 text-green-800"
                    : ""
                }`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
