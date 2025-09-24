"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Trophy, Target } from "lucide-react"

interface IsolatedQuizProps {
  onComplete?: (result: any) => void
}

export function IsolatedQuiz({ onComplete }: IsolatedQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isCompleted, setIsCompleted] = useState(false)

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
    
    setIsCompleted(true)
    
    // Call the parent callback
    if (onComplete) {
      console.log('🚀 Calling onComplete with result:', { score: finalScore, passed: finalScore >= 70 })
      onComplete({ score: finalScore, passed: finalScore >= 70 })
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setIsCompleted(false)
  }

  if (isCompleted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quiz Completed! 🎉</CardTitle>
          <p className="text-gray-600">Check the console for results</p>
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
        <CardTitle className="text-center">Isolated Quiz Test</CardTitle>
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
