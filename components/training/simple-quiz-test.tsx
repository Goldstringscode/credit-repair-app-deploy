"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, Trophy, Target } from "lucide-react"
import { toast } from "sonner"

interface SimpleQuizTestProps {
  onComplete?: (result: any) => void
}

export function SimpleQuizTest({ onComplete }: SimpleQuizTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [score, setScore] = useState(0)

  const questions = [
    {
      id: "q1",
      text: "What are the three major credit bureaus?",
      options: [
        { id: "a1", text: "Experian, Equifax, and TransUnion", correct: true },
        { id: "a2", text: "Visa, Mastercard, and American Express", correct: false },
        { id: "a3", text: "Chase, Bank of America, and Wells Fargo", correct: false }
      ]
    },
    {
      id: "q2", 
      text: "How often should you review your credit report?",
      options: [
        { id: "a4", text: "At least once per year", correct: true },
        { id: "a5", text: "Only when applying for credit", correct: false },
        { id: "a6", text: "Never - it's not necessary", correct: false }
      ]
    },
    {
      id: "q3",
      text: "Credit report errors can affect your credit score.",
      options: [
        { id: "a7", text: "True", correct: true },
        { id: "a8", text: "False", correct: false }
      ]
    }
  ]

  const handleAnswer = (questionId: string, optionId: string) => {
    console.log('🎯 Answer selected:', questionId, optionId)
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }))
  }

  const handleSubmit = () => {
    console.log('🚀 Submit button clicked!')
    console.log('🚀 Current answers:', answers)
    console.log('🚀 Total questions:', questions.length)
    console.log('🚀 Answers count:', Object.keys(answers).length)
    
    // Check if all questions are answered
    if (Object.keys(answers).length < questions.length) {
      console.log('❌ Not all questions answered, submit disabled')
      toast.error("Please answer all questions before submitting")
      return
    }
    
    let correctCount = 0
    questions.forEach(question => {
      const userAnswer = answers[question.id]
      const correctOption = question.options.find(opt => opt.correct)
      if (userAnswer === correctOption?.id) {
        correctCount++
      }
    })
    
    const finalScore = Math.round((correctCount / questions.length) * 100)
    console.log('🚀 Final score calculated:', finalScore)
    
    setScore(finalScore)
    setIsCompleted(true)
    
    // Call the parent callback immediately
    if (onComplete) {
      console.log('🚀 Calling onComplete with result:', { score: finalScore, passed: finalScore >= 70 })
      onComplete({ score: finalScore, passed: finalScore >= 70 })
    } else {
      // Only show local toast if no parent callback
      if (finalScore >= 70) {
        toast.success(`Quiz passed! Score: ${finalScore}% 🎉`)
      } else {
        toast.error(`Quiz completed. Score: ${finalScore}% - Keep studying!`)
      }
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setIsCompleted(false)
    setScore(0)
  }

  // If onComplete is provided, don't show local results - let parent handle it
  if (isCompleted && !onComplete) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {score >= 70 ? (
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
            {score >= 70 ? "Quiz Passed! 🎉" : "Quiz Completed"}
          </CardTitle>
          <p className="text-gray-600">
            Your score: {score}%
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={resetQuiz} className="bg-blue-600 hover:bg-blue-700">
            Take Quiz Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const question = questions[currentQuestion]
  const userAnswer = answers[question.id]
  const allQuestionsAnswered = Object.keys(answers).length === questions.length
  const isLastQuestion = currentQuestion === questions.length - 1

  console.log('🔍 Quiz render state:', {
    currentQuestion,
    userAnswer,
    answersCount: Object.keys(answers).length,
    totalQuestions: questions.length,
    allQuestionsAnswered,
    isLastQuestion
  })

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Simple Quiz Test
        </CardTitle>
        <div className="text-center text-sm text-gray-600">
          Question {currentQuestion + 1} of {questions.length}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-lg font-medium text-center">
          {question.text}
        </div>
        
        <RadioGroup
          value={userAnswer || ""}
          onValueChange={(value) => handleAnswer(question.id, value)}
        >
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id} className="text-sm cursor-pointer">
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              disabled={!userAnswer}
            >
              Next
            </Button>
          )}
        </div>

        <div className="text-center text-sm text-gray-500">
          {Object.keys(answers).length} of {questions.length} questions answered
        </div>
        
        {/* Debug info */}
        <div className="text-xs text-gray-400 border-t pt-2">
          <div>Current Q: {currentQuestion + 1}</div>
          <div>Answered: {Object.keys(answers).length}</div>
          <div>Last Q: {isLastQuestion ? 'Yes' : 'No'}</div>
          <div>All Answered: {allQuestionsAnswered ? 'Yes' : 'No'}</div>
          <div>Submit Disabled: {!allQuestionsAnswered ? 'Yes' : 'No'}</div>
        </div>
      </CardContent>
    </Card>
  )
}
