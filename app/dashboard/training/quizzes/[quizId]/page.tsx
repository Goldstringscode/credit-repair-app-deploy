"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  Loader2,
  AlertCircle,
} from "lucide-react"

interface SanitizedQuestion {
  id: string
  question: string
  options: string[]
  category: string
  difficulty?: string
  points: number
}

interface QuizData {
  id: string
  title: string
  description: string
  courseTitle: string
  difficulty: string
  timeLimitMinutes: number
  passingScore: number
  questionCount: number
  maxScore: number
  questions: SanitizedQuestion[]
}

interface QuestionReview {
  questionId: string
  question: string
  options: string[]
  selectedIndex: number | null
  correctIndex: number
  isCorrect: boolean
  explanation: string
  points: number
  pointsEarned: number
}

interface QuizResult {
  score: number
  maxScore: number
  percentage: number
  passed: boolean
  correctAnswers: number
  totalQuestions: number
  passingScore: number
  timeTakenSeconds: number
  review: QuestionReview[]
}

const AUTOSAVE_DEBOUNCE_MS = 1500

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizIdParam = params.quizId as string

  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<QuizResult | null>(null)

  // Resume state loaded from the server
  const [hasResumableAttempt, setHasResumableAttempt] = useState(false)
  const [resumeIndex, setResumeIndex] = useState(0)
  const [resumeAnsweredCount, setResumeAnsweredCount] = useState(0)

  // Elapsed-time tracking (survives resume)
  const baseElapsedRef = useRef(0) // seconds already spent in earlier sessions
  const sessionStartRef = useRef<number | null>(null)

  // Refs so autosave/unload handlers always see fresh state
  const answersRef = useRef<Record<string, number>>({})
  const indexRef = useRef(0)
  const startedRef = useRef(false)
  const finishedRef = useRef(false)
  const quizIdRef = useRef<string>(quizIdParam)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const elapsedSeconds = useCallback(() => {
    const live = sessionStartRef.current ? Math.round((Date.now() - sessionStartRef.current) / 1000) : 0
    return baseElapsedRef.current + live
  }, [])

  // Load quiz + any in-progress attempt
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const res = await fetch(`/api/training/quiz?quizId=${encodeURIComponent(quizIdParam)}`)
        if (res.status === 401) {
          if (!cancelled) setLoadError("Please sign in to take this quiz.")
          return
        }
        if (res.status === 404) {
          router.replace("/dashboard/training/quizzes")
          return
        }
        if (!res.ok) {
          if (!cancelled) setLoadError("Something went wrong loading this quiz. Please try again.")
          return
        }
        const json = await res.json()
        if (!json.success || !json.quiz) {
          router.replace("/dashboard/training/quizzes")
          return
        }
        if (cancelled) return

        setQuiz(json.quiz)
        quizIdRef.current = json.quiz.id

        if (json.inProgress) {
          const answers: Record<string, number> = json.inProgress.answers ?? {}
          setHasResumableAttempt(true)
          setSelectedAnswers(answers)
          answersRef.current = answers
          setResumeAnsweredCount(Object.keys(answers).length)
          const idx = Math.min(json.inProgress.currentQuestionIndex ?? 0, json.quiz.questions.length - 1)
          setResumeIndex(idx)
          baseElapsedRef.current = json.inProgress.timeTakenSeconds ?? 0
        }
      } catch (err) {
        console.error("Failed to load quiz:", err)
        if (!cancelled) setLoadError("Something went wrong loading this quiz. Please try again.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizIdParam])

  const saveProgress = useCallback(
    async (useKeepalive = false) => {
      if (!startedRef.current || finishedRef.current) return
      try {
        await fetch("/api/training/quiz/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: useKeepalive,
          body: JSON.stringify({
            quizId: quizIdRef.current,
            action: "save",
            answers: answersRef.current,
            currentQuestionIndex: indexRef.current,
            timeTakenSeconds: elapsedSeconds(),
          }),
        })
      } catch (err) {
        console.error("Failed to autosave quiz progress:", err)
      }
    },
    [elapsedSeconds]
  )

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => saveProgress(), AUTOSAVE_DEBOUNCE_MS)
  }, [saveProgress])

  // Save on tab close / navigation away
  useEffect(() => {
    const onLeave = () => {
      if (startedRef.current && !finishedRef.current) saveProgress(true)
    }
    const onVisibility = () => {
      if (document.visibilityState === "hidden") onLeave()
    }
    window.addEventListener("beforeunload", onLeave)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.removeEventListener("beforeunload", onLeave)
      document.removeEventListener("visibilitychange", onVisibility)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      onLeave()
    }
  }, [saveProgress])

  const handleSubmitQuiz = useCallback(async () => {
    if (finishedRef.current || isSubmitting) return
    setIsSubmitting(true)
    setSubmitError(null)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

    try {
      const res = await fetch("/api/training/quiz/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quizIdRef.current,
          action: "submit",
          answers: answersRef.current,
          timeTakenSeconds: elapsedSeconds(),
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success || !json.result) {
        setSubmitError(json.error || "Your answers couldn't be submitted. Please try again.")
        return
      }
      finishedRef.current = true
      setResult(json.result)
    } catch (err) {
      console.error("Failed to submit quiz:", err)
      setSubmitError("Your answers couldn't be submitted. Check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }, [elapsedSeconds, isSubmitting])

  // Countdown timer
  useEffect(() => {
    if (!quizStarted || result || timeRemaining <= 0) return
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [quizStarted, result, timeRemaining, handleSubmitQuiz])

  const beginQuiz = (fromResume: boolean) => {
    if (!quiz) return
    if (!fromResume) {
      setSelectedAnswers({})
      answersRef.current = {}
      baseElapsedRef.current = 0
      setCurrentQuestionIndex(0)
      indexRef.current = 0
    } else {
      setCurrentQuestionIndex(resumeIndex)
      indexRef.current = resumeIndex
    }
    sessionStartRef.current = Date.now()
    finishedRef.current = false
    startedRef.current = true
    const remaining = Math.max(quiz.timeLimitMinutes * 60 - baseElapsedRef.current, 30)
    setTimeRemaining(remaining)
    setQuizStarted(true)
    // Create/refresh the in-progress attempt right away so it shows on the hub
    saveProgress()
  }

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => {
      const next = { ...prev, [questionId]: answerIndex }
      answersRef.current = next
      return next
    })
    scheduleSave()
  }

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
    indexRef.current = index
    scheduleSave()
  }

  const handleRetakeQuiz = () => {
    setResult(null)
    setSubmitError(null)
    setQuizStarted(false)
    setHasResumableAttempt(false)
    setSelectedAnswers({})
    answersRef.current = {}
    baseElapsedRef.current = 0
    setCurrentQuestionIndex(0)
    indexRef.current = 0
    startedRef.current = false
    finishedRef.current = false
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // ----- Render states -----

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mb-3" />
          <p>Loading quiz…</p>
        </div>
      </div>
    )
  }

  if (loadError || !quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-xl mx-auto mt-16">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">{loadError ?? "Quiz not found."}</p>
            <Button variant="outline" onClick={() => router.push("/dashboard/training/quizzes")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Results screen
  if (result) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 mx-auto ${
                result.passed ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {result.passed ? (
                <CheckCircle className="h-10 w-10 text-green-600" />
              ) : (
                <XCircle className="h-10 w-10 text-red-600" />
              )}
            </div>

            <CardTitle className="text-2xl mb-2">
              {result.passed ? "Congratulations!" : "Keep Studying!"}
            </CardTitle>

            <div className="text-4xl font-bold mb-2">{result.percentage}%</div>

            <p className="text-gray-600">
              You got {result.correctAnswers} out of {result.totalQuestions} questions correct
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Time: {formatTime(result.timeTakenSeconds)} · Passing score: {result.passingScore}%
            </p>

            {result.passed && (
              <Badge className="bg-green-100 text-green-800 mt-3 mx-auto">
                <Trophy className="h-4 w-4 mr-1" />
                +{result.score} points earned!
              </Badge>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Review Your Answers</h3>

              {result.review.map((item, index) => (
                <Card
                  key={item.questionId}
                  className={`border-l-4 ${item.isCorrect ? "border-l-green-500" : "border-l-red-500"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="font-medium text-gray-900">
                        {index + 1}. {item.question}
                      </p>
                      {item.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      )}
                    </div>

                    <div className="space-y-1.5 mb-3">
                      {item.options.map((option, optionIndex) => {
                        const isSelected = item.selectedIndex === optionIndex
                        const isCorrectOption = item.correctIndex === optionIndex
                        return (
                          <div
                            key={optionIndex}
                            className={`text-sm px-3 py-2 rounded-md border ${
                              isCorrectOption
                                ? "bg-green-50 border-green-200 text-green-800"
                                : isSelected
                                  ? "bg-red-50 border-red-200 text-red-800"
                                  : "bg-gray-50 border-gray-100 text-gray-600"
                            }`}
                          >
                            {option}
                            {isCorrectOption && <span className="ml-2 text-xs font-medium">Correct answer</span>}
                            {isSelected && !isCorrectOption && (
                              <span className="ml-2 text-xs font-medium">Your answer</span>
                            )}
                            {isSelected && isCorrectOption && (
                              <span className="ml-2 text-xs font-medium">Your answer</span>
                            )}
                          </div>
                        )
                      })}
                      {item.selectedIndex === null && (
                        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                          You didn't answer this question.
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-md p-3">
                      {item.explanation}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button onClick={handleRetakeQuiz} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
              <Button onClick={() => router.push("/dashboard/training/quizzes")}>
                Back to Quizzes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Intro screen
  if (!quizStarted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/training/quizzes")}
          className="mb-6"
        >
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
                <div className="font-semibold">{quiz.questionCount}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold">{quiz.timeLimitMinutes} min</div>
                <div className="text-sm text-gray-600">Time Limit</div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="font-semibold">{quiz.passingScore}%</div>
                <div className="text-sm text-gray-600">To Pass</div>
              </div>
            </div>

            {hasResumableAttempt ? (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <p className="text-sm text-blue-800 font-medium">
                    You have a quiz in progress — {resumeAnsweredCount} of {quiz.questionCount} questions
                    answered.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => beginQuiz(true)} size="lg" className="px-8">
                    Resume Quiz
                  </Button>
                  <Button onClick={() => beginQuiz(false)} size="lg" variant="outline" className="px-8">
                    Start Over
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Button onClick={() => beginQuiz(false)} size="lg" className="px-8">
                  Start Quiz
                </Button>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center">
              Your answers save automatically, so you can leave and pick up where you left off.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Taking the quiz
  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100
  const answeredCount = Object.keys(selectedAnswers).length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{quiz.title}</h1>
            <p className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {quiz.questions.length} · {answeredCount} answered
            </p>
          </div>
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${
              timeRemaining <= 60
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-gray-50 border-gray-200 text-gray-700"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <Progress value={progress} className="h-2" />

        {/* Question card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-1">
              <Badge variant="secondary" className="text-xs">
                {currentQuestion.category}
              </Badge>
              {currentQuestion.difficulty && (
                <Badge variant="outline" className="text-xs">
                  {currentQuestion.difficulty}
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              key={currentQuestion.id}
              value={
                selectedAnswers[currentQuestion.id] !== undefined
                  ? String(selectedAnswers[currentQuestion.id])
                  : ""
              }
              onValueChange={value => handleAnswerSelect(currentQuestion.id, parseInt(value, 10))}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => (
                <Label
                  key={index}
                  htmlFor={`${currentQuestion.id}-${index}`}
                  className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedAnswers[currentQuestion.id] === index
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <RadioGroupItem value={String(index)} id={`${currentQuestion.id}-${index}`} />
                  <span className="text-sm text-gray-800">{option}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {submitError}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => goToQuestion(Math.max(currentQuestionIndex - 1, 0))}
            disabled={currentQuestionIndex === 0 || isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <Button
              onClick={() => goToQuestion(currentQuestionIndex + 1)}
              disabled={isSubmitting}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Quiz
                </>
              )}
            </Button>
          )}
        </div>

        {answeredCount < quiz.questions.length && currentQuestionIndex === quiz.questions.length - 1 && (
          <p className="text-xs text-amber-700 text-center">
            {quiz.questions.length - answeredCount} question
            {quiz.questions.length - answeredCount === 1 ? "" : "s"} unanswered — unanswered questions
            are marked incorrect.
          </p>
        )}
      </div>
    </div>
  )
}
