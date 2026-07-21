import { NextRequest, NextResponse } from "next/server"
import { extractUserId, getServiceClient } from "@/lib/training/quiz-auth"
import { getSanitizedQuiz, resolveQuizId } from "@/lib/training/quiz-data"

export const dynamic = "force-dynamic"

/**
 * GET /api/training/quiz?quizId=<slug>
 *
 * Returns the quiz (questions WITHOUT correct answers or explanations — grading
 * happens server-side on submit) plus the user's in-progress attempt, if any,
 * so the client can resume where they left off.
 *
 * Legacy slugs (credit-fundamentals, basic-disputes, credit-building,
 * legal-rights, credit-score-quiz) resolve to their canonical quiz.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const rawQuizId = searchParams.get("quizId")
    if (!rawQuizId) {
      return NextResponse.json({ success: false, error: "quizId is required" }, { status: 400 })
    }

    const quizId = resolveQuizId(rawQuizId)
    const quiz = getSanitizedQuiz(quizId)
    if (!quiz) {
      return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 })
    }

    const supabase = getServiceClient()
    const { data: inProgress, error } = await supabase
      .from("user_quiz_attempts")
      .select("id, current_question_index, answers, started_at, time_taken_seconds")
      .eq("user_id", userId)
      .eq("quiz_id", quizId)
      .eq("status", "in_progress")
      .maybeSingle()

    if (error) {
      console.error("Failed to fetch in-progress attempt:", error)
      // Quiz is still usable without resume state
    }

    return NextResponse.json({
      success: true,
      quiz,
      inProgress: inProgress
        ? {
            id: inProgress.id,
            currentQuestionIndex: inProgress.current_question_index ?? 0,
            answers: (inProgress.answers as Record<string, number>) ?? {},
            startedAt: inProgress.started_at,
            timeTakenSeconds: inProgress.time_taken_seconds ?? 0,
          }
        : null,
    })
  } catch (error) {
    console.error("Error in quiz API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
