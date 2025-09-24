import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, quizId, courseId, lessonId, answers, timeTaken } = body

    if (!userId || !quizId || !courseId || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, quizId, courseId, answers' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get quiz details and questions
    const { data: quiz, error: quizError } = await supabase
      .from('training_quizzes')
      .select('*')
      .eq('id', quizId)
      .single()

    if (quizError) {
      console.error('Error fetching quiz:', quizError)
      return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
    }

    // Get questions with correct answers
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('sort_order')

    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    // Calculate score
    let score = 0
    let maxScore = 0
    let correctAnswers = 0
    let totalQuestions = questions.length

    for (const question of questions) {
      maxScore += question.points
      
      const userAnswer = answers.find((a: any) => a.questionId === question.id)
      if (userAnswer) {
        if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
          // Get correct answer option
          const { data: correctOption } = await supabase
            .from('quiz_answer_options')
            .select('*')
            .eq('question_id', question.id)
            .eq('is_correct', true)
            .single()

          if (correctOption && userAnswer.selectedOptionId === correctOption.id) {
            score += question.points
            correctAnswers++
          }
        } else if (question.question_type === 'fill_blank') {
          // Simple text matching for fill in the blank
          if (userAnswer.text && userAnswer.text.toLowerCase().trim() === question.correct_answer?.toLowerCase().trim()) {
            score += question.points
            correctAnswers++
          }
        }
        // Essay questions would need manual grading
      }
    }

    const passed = score >= (maxScore * (quiz.passing_score / 100))
    const percentage = Math.round((score / maxScore) * 100)

    // Create quiz attempt record
    const { data: attempt, error: attemptError } = await supabase
      .from('user_quiz_attempts')
      .insert({
        user_id: userId,
        quiz_id: quizId,
        course_id: courseId,
        lesson_id: lessonId,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        score: score,
        max_score: maxScore,
        passed: passed,
        time_taken_seconds: timeTaken || 0
      })
      .select()
      .single()

    if (attemptError) {
      console.error('Error creating quiz attempt:', attemptError)
      return NextResponse.json({ error: 'Failed to save quiz attempt' }, { status: 500 })
    }

    // Save individual answers
    for (const answer of answers) {
      await supabase
        .from('user_quiz_answers')
        .insert({
          user_id: userId,
          quiz_attempt_id: attempt.id,
          question_id: answer.questionId,
          selected_option_id: answer.selectedOptionId,
          text_answer: answer.text,
          is_correct: questions.find(q => q.id === answer.questionId)?.correct_answer === answer.text
        })
    }

    const result = {
      attemptId: attempt.id,
      score,
      maxScore,
      passed,
      percentage,
      correctAnswers,
      totalQuestions,
      timeTaken: timeTaken || 0,
      passingScore: quiz.passing_score
    }

    return NextResponse.json({ result })

  } catch (error) {
    console.error('Error in quiz attempt API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
