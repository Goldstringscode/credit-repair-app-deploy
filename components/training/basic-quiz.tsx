"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  Trophy,
  ArrowRight,
  RefreshCw
} from "lucide-react"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizResult {
  quizId: string
  score: number
  passed: boolean
  timeTaken: number
  completedAt: Date
  answers: { questionId: string; selectedAnswer: number; correct: boolean }[]
}

interface BasicQuizProps {
  quizId: string
  questions: QuizQuestion[]
  onComplete?: (result: QuizResult) => void
  timeLimit?: number // in seconds
  passingScore?: number
}

export function BasicQuiz({ 
  quizId, 
  questions, 
  onComplete, 
  timeLimit = 300, 
  passingScore = 70 
}: BasicQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({})
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [isStarted, setIsStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isStarted && !isCompleted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            completeQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isStarted, isCompleted, timeRemaining])

  const startQuiz = () => {
    setIsStarted(true)
    setTimeRemaining(timeLimit)
  }

  const selectAnswer = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const completeQuiz = () => {
    const answers = questions.map(question => ({
      questionId: question.id,
      selectedAnswer: selectedAnswers[question.id] ?? -1,
      correct: (selectedAnswers[question.id] ?? -1) === question.correctAnswer
    }))

    const correctAnswers = answers.filter(answer => answer.correct).length
    const score = Math.round((correctAnswers / questions.length) * 100)
    const passed = score >= passingScore
    const timeTaken = timeLimit - timeRemaining

    const result: QuizResult = {
      quizId,
      score,
      passed,
      timeTaken,
      completedAt: new Date(),
      answers
    }

    setQuizResult(result)
    setIsCompleted(true)
    setShowResults(true)

    if (onComplete) {
      onComplete(result)
    }

    // Mock save to console
    console.log('Quiz completed:', result)
  }

  const restartQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setTimeRemaining(timeLimit)
    setIsStarted(false)
    setIsCompleted(false)
    setQuizResult(null)
    setShowResults(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const answeredQuestions = Object.keys(selectedAnswers).length

  if (!isStarted) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Target className="h-6 w-6 text-blue-600" />
            <span>Quiz: {quizId}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Target className="h-10 w-10 text-blue-600" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Test Your Knowledge?</h3>
            <p className="text-gray-600 mb-4">This quiz will help you assess your understanding of the course material.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatTime(timeLimit)}</div>
              <div className="text-sm text-gray-600">Time Limit</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{passingScore}%</div>
              <div className="text-sm text-gray-600">Passing Score</div>
            </div>
          </div>

          <Button onClick={startQuiz} className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg">
            <Target className="h-5 w-5 mr-2" />
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (showResults && quizResult) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            {quizResult.passed ? (
              <Trophy className="h-6 w-6 text-yellow-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            <span>Quiz Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${
            quizResult.passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {quizResult.passed ? (
              <Trophy className="h-12 w-12 text-green-600" />
            ) : (
              <XCircle className="h-12 w-12 text-red-600" />
            )}
          </div>

          <div>
            <h3 className={`text-2xl font-bold mb-2 ${
              quizResult.passed ? 'text-green-600' : 'text-red-600'
            }`}>
              {quizResult.passed ? 'Congratulations! You Passed!' : 'Quiz Not Passed'}
            </h3>
            <p className="text-gray-600">
              {quizResult.passed 
                ? 'Great job! You have a solid understanding of the material.'
                : 'Keep studying and try again. You can do it!'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{quizResult.score}%</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{formatTime(quizResult.timeTaken)}</div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {quizResult.answers.filter(a => a.correct).length}/{questions.length}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={restartQuiz} variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
              <ArrowRight className="h-4 w-4 mr-2" />
              Continue Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          </CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
            <Badge variant="secondary">
              {answeredQuestions}/{questions.length} answered
            </Badge>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
            {currentQuestion.question}
          </h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => selectAnswer(currentQuestion.id, index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswers[currentQuestion.id] === index
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswers[currentQuestion.id] === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswers[currentQuestion.id] === index && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                onClick={nextQuestion}
                disabled={selectedAnswers[currentQuestion.id] === undefined}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next Question
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={completeQuiz}
                disabled={answeredQuestions < questions.length}
                className="bg-green-600 hover:bg-green-700"
              >
                Complete Quiz
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
