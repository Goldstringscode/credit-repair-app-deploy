import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const { lessonId } = params
    
    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get quiz for this lesson
    const { data: quiz, error: quizError } = await supabase
      .from('training_quizzes')
      .select('*')
      .eq('lesson_id', lessonId)
      .single()

    if (quizError && quizError.code !== 'PGRST116') {
      console.error('Error fetching quiz:', quizError)
      return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
    }

    if (!quiz) {
      return NextResponse.json({ quiz: null, message: 'No quiz found for this lesson' })
    }

    // Get quiz questions
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quiz.id)
      .order('sort_order')

    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    // Get answer options for each question
    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const { data: options, error: optionsError } = await supabase
          .from('quiz_answer_options')
          .select('*')
          .eq('question_id', question.id)
          .order('sort_order')

        if (optionsError) {
          console.error('Error fetching options:', optionsError)
          return { ...question, answerOptions: [] }
        }

        return { ...question, answerOptions: options }
      })
    )

    const quizData = {
      ...quiz,
      questions: questionsWithOptions
    }

    return NextResponse.json({ quiz: quizData })

  } catch (error) {
    console.error('Error in quiz API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
