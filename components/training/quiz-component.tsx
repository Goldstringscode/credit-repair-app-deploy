"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  Trophy,
  AlertCircle,
  ArrowRight,
  ArrowLeft
} from "lucide-react"
import { toast } from "sonner"

interface QuizQuestion {
  id: string
  questionText: string
  questionType: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay'
  points: number
  sortOrder: number
  answerOptions?: QuizAnswerOption[]
}

interface QuizAnswerOption {
  id: string
  optionText: string
  isCorrect: boolean
  sortOrder: number
}

interface QuizComponentProps {
  quizId: string
  courseId: string
  lessonId: string
  userId: string
  title: string
  description?: string
  passingScore: number
  timeLimitMinutes?: number
  questions: QuizQuestion[]
  onComplete?: (result: QuizResult) => void
}

interface QuizResult {
  score: number
  maxScore: number
  passed: boolean
  timeTaken: number
  correctAnswers: number
  totalQuestions: number
}

export function QuizComponent({
  quizId,
  courseId,
  lessonId,
  userId,
  title,
  description,
  passingScore,
  timeLimitMinutes,
  questions,
  onComplete
}: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeRemaining, setTimeRemaining] = useState(timeLimitMinutes ? timeLimitMinutes * 60 : 0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [startTime] = useState(Date.now())

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  // Timer countdown - ONLY for display, no auto-submit
  useEffect(() => {
    if (timeLimitMinutes && timeRemaining > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up - just stop the timer, don't auto-submit
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeRemaining, isSubmitted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    
    try {
      // Calculate score locally first
      let score = 0
      let maxScore = 0
      let correctAnswers = 0
      
      // Calculate score based on answers
      for (const question of questions) {
        maxScore += question.points
        const userAnswer = answers[question.id]
        
        if (userAnswer) {
          if (question.questionType === 'multiple_choice' || question.questionType === 'true_false') {
            // Find the correct answer option
            const correctOption = question.answerOptions?.find(opt => opt.isCorrect)
            if (correctOption && userAnswer === correctOption.id) {
              score += question.points
              correctAnswers++
            }
          }
        }
      }
      
      const passed = score >= (maxScore * (passingScore / 100))
      const timeTaken = Math.round((Date.now() - startTime) / 1000)
      
      // Create quiz result locally
      const quizResult: QuizResult = {
        score,
        maxScore,
        passed,
        timeTaken,
        correctAnswers,
        totalQuestions: questions.length
      }

      // Set result immediately
      setQuizResult(quizResult)
      setIsSubmitted(true)
      onComplete?.(quizResult)

      if (passed) {
        toast.success("Quiz passed! 🎉")
      } else {
        toast.error("Quiz completed. Keep studying!")
      }
      
      // Now try to submit to API (optional, won't break quiz if it fails)
      console.log('Attempting to submit quiz to API...')
      
      try {
        const response = await fetch('/api/training/quiz/attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            quizId,
            courseId,
            lessonId,
            answers: Object.entries(answers).map(([questionId, value]) => ({
              questionId,
              selectedOptionId: typeof value === 'string' ? value : undefined,
              text: typeof value === 'string' ? undefined : value
            })),
            timeTaken
          })
        })
        
        if (response.ok) {
          console.log('✅ Quiz submitted to API successfully')
        } else {
          const errorData = await response.json()
          console.log('⚠️ API submission failed:', errorData)
        }
      } catch (apiError) {
        console.log('⚠️ API submission failed (network error):', apiError)
      }
      
    } catch (error) {
      console.error('❌ Failed to process quiz:', error)
      toast.error("Failed to process quiz. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderQuestion = () => {
    if (!currentQuestion) return null

    const currentAnswer = answers[currentQuestion.id]

    switch (currentQuestion.questionType) {
      case 'multiple_choice':
        return (
          <RadioGroup
            value={currentAnswer}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          >
            {currentQuestion.answerOptions?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="text-sm cursor-pointer">
                  {option.optionText}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'true_false':
        return (
          <RadioGroup
            value={currentAnswer}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true" />
              <Label htmlFor="true" className="text-sm cursor-pointer">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false" />
              <Label htmlFor="false" className="text-sm cursor-pointer">False</Label>
            </div>
          </RadioGroup>
        )

      case 'fill_blank':
        return (
          <Input
            placeholder="Type your answer here..."
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            className="mt-2"
          />
        )

      case 'essay':
        return (
          <Textarea
            placeholder="Write your detailed answer here..."
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            className="mt-2 min-h-[120px]"
          />
        )

      default:
        return null
    }
  }

  const getAnsweredQuestions = () => {
    return Object.keys(answers).length
  }

  const getUnansweredQuestions = () => {
    return totalQuestions - getAnsweredQuestions()
  }

  // Show results after submission
  if (isSubmitted && quizResult) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {quizResult.passed ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {quizResult.passed ? "Quiz Passed! 🎉" : "Quiz Completed"}
          </CardTitle>
          <p className="text-gray-600">
            {quizResult.passed 
              ? "Congratulations! You've successfully completed this quiz."
              : "Keep studying to improve your score."
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {quizResult.score}/{quizResult.maxScore}
            </div>
            <div className="text-lg text-gray-600">
              {Math.round((quizResult.score / quizResult.maxScore) * 100)}%
            </div>
            <div className="mt-2">
              <Badge variant={quizResult.passed ? "default" : "secondary"}>
                {quizResult.passed ? "PASSED" : "NOT PASSED"}
              </Badge>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{quizResult.correctAnswers}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{quizResult.timeTaken}s</div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
          </div>

          {/* Passing Score Info */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600">
              Passing Score: {passingScore}%
            </div>
            <div className="text-xs text-blue-500 mt-1">
              Your Score: {Math.round((quizResult.score / quizResult.maxScore) * 100)}%
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.location.reload()}
            >
              Retake Quiz
            </Button>
            <Button className="flex-1">
              Continue Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Main quiz interface
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            {description && (
              <p className="text-gray-600 mt-1">{description}</p>
            )}
          </div>
          {timeLimitMinutes && (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 w-4 text-orange-600" />
              <span className="font-mono text-lg">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Navigation */}
        <div className="flex flex-wrap gap-2 mt-4">
          {questions.map((_, index) => {
            const isAnswered = answers[questions[index].id]
            const isCurrent = index === currentQuestionIndex
            
            return (
              <Button
                key={index}
                variant={isCurrent ? "default" : isAnswered ? "secondary" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => goToQuestion(index)}
              >
                {index + 1}
              </Button>
            )
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Question */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Question {currentQuestionIndex + 1}</Badge>
            <Badge variant="secondary">{currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}</Badge>
            <Badge variant="outline">{currentQuestion.questionType.replace('_', ' ')}</Badge>
          </div>
          
          <div className="text-lg font-medium">
            {currentQuestion.questionText}
          </div>

          <div className="mt-6">
            {renderQuestion()}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">
              {getAnsweredQuestions()}/{totalQuestions} answered
            </div>
            {getUnansweredQuestions() > 0 && (
              <Badge variant="outline" className="text-orange-600">
                {getUnansweredQuestions()} unanswered
              </Badge>
            )}
          </div>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || getAnsweredQuestions() === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button
              onClick={goToNextQuestion}
              disabled={!answers[currentQuestion.id]}
            >
              Next
              <ArrowRight className="w-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Quiz Info */}
        <div className="text-center text-sm text-gray-500 pt-4 border-t">
          <p>Passing Score: {passingScore}% • Time Limit: {timeLimitMinutes ? `${timeLimitMinutes} minutes` : 'No limit'}</p>
          <p className="mt-1">
            Make sure to answer all questions before submitting.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
