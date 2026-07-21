import { NextRequest, NextResponse } from "next/server"
import { extractUserId, getServiceClient } from "@/lib/training/quiz-auth"
import { getQuiz, gradeQuiz, resolveQuizId } from "@/lib/training/quiz-data"

export const dynamic = "force-dynamic"

function sanitizeAnswers(raw: unknown): Record<string, number> {
  const out: Record<string, number> = {}
  if (raw && typeof raw === "object") {
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 50) {
        out[String(key).slice(0, 64)] = value
      }
    }
  }
  return out
}

/**
 * POST /api/training/quiz/attempt
 *
 * Body:
 *   { quizId, action: "save",   answers, currentQuestionIndex, timeTakenSeconds }
 *   { quizId, action: "submit", answers, timeTakenSeconds }
 *
 * "save"   — upserts the user's single in-progress attempt (resume support).
 * "submit" — grades server-side against lib/training/quiz-data, completes the
 *            attempt, stores per-question answers, and returns the full result
 *            (including correct answers + explanations for the review screen).
 */
export async function POST(request: NextRequest) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const action = body?.action === "save" ? "save" : "submit"
    const rawQuizId = body?.quizId
    if (!rawQuizId || typeof rawQuizId !== "string") {
      return NextResponse.json({ success: false, error: "quizId is required" }, { status: 400 })
    }

    const quizId = resolveQuizId(rawQuizId)
    const quiz = getQuiz(quizId)
    if (!quiz) {
      return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 })
    }

    const answers = sanitizeAnswers(body?.answers)
    const timeTakenSeconds =
      typeof body?.timeTakenSeconds === "number" && body.timeTakenSeconds >= 0
        ? Math.min(Math.round(body.timeTakenSeconds), 24 * 60 * 60)
        : 0

    const supabase = getServiceClient()

    // Find the user's current in-progress attempt for this quiz, if any
    const { data: existing, error: existingError } = await supabase
      .from("user_quiz_attempts")
      .select("id, started_at")
      .eq("user_id", userId)
      .eq("quiz_id", quizId)
      .eq("status", "in_progress")
      .maybeSingle()

    if (existingError) {
      console.error("Failed to look up in-progress attempt:", existingError)
      return NextResponse.json({ success: false, error: "Failed to load attempt" }, { status: 500 })
    }

    if (action === "save") {
      const rawIndex = body?.currentQuestionIndex
      const currentQuestionIndex =
        typeof rawIndex === "number" && Number.isInteger(rawIndex)
          ? Math.min(Math.max(rawIndex, 0), quiz.questions.length - 1)
          : 0

      if (existing) {
        const { error } = await supabase
          .from("user_quiz_attempts")
          .update({
            answers,
            current_question_index: currentQuestionIndex,
            time_taken_seconds: timeTakenSeconds,
          })
          .eq("id", existing.id)
          .eq("user_id", userId)

        if (error) {
          console.error("Failed to save quiz progress:", error)
          return NextResponse.json({ success: false, error: "Failed to save progress" }, { status: 500 })
        }
        return NextResponse.json({ success: true, attemptId: existing.id })
      }

      const { data: created, error } = await supabase
        .from("user_quiz_attempts")
        .insert({
          user_id: userId,
          quiz_id: quizId,
          course_id: quiz.courseId,
          status: "in_progress",
          answers,
          current_question_index: currentQuestionIndex,
          time_taken_seconds: timeTakenSeconds,
          total_questions: quiz.questions.length,
        })
        .select("id")
        .single()

      if (error) {
        console.error("Failed to create quiz attempt:", error)
        return NextResponse.json({ success: false, error: "Failed to save progress" }, { status: 500 })
      }
      return NextResponse.json({ success: true, attemptId: created.id })
    }

    // action === "submit": grade server-side
    const result = gradeQuiz(quizId, answers)
    if (!result) {
      return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 })
    }

    const now = new Date().toISOString()
    const completedFields = {
      status: "completed" as const,
      answers,
      completed_at: now,
      score: result.score,
      max_score: result.maxScore,
      percentage: result.percentage,
      passed: result.passed,
      correct_answers: result.correctAnswers,
      total_questions: result.totalQuestions,
      time_taken_seconds: timeTakenSeconds,
    }

    let attemptId: string

    if (existing) {
      const { error } = await supabase
        .from("user_quiz_attempts")
        .update(completedFields)
        .eq("id", existing.id)
        .eq("user_id", userId)

      if (error) {
        console.error("Failed to complete quiz attempt:", error)
        return NextResponse.json({ success: false, error: "Failed to save quiz attempt" }, { status: 500 })
      }
      attemptId = existing.id
    } else {
      const { data: created, error } = await supabase
        .from("user_quiz_attempts")
        .insert({
          user_id: userId,
          quiz_id: quizId,
          course_id: quiz.courseId,
          started_at: now,
          ...completedFields,
        })
        .select("id")
        .single()

      if (error) {
        console.error("Failed to create completed quiz attempt:", error)
        return NextResponse.json({ success: false, error: "Failed to save quiz attempt" }, { status: 500 })
      }
      attemptId = created.id
    }

    // Store per-question answers for this attempt
    const answerRows = result.review.map(r => ({
      attempt_id: attemptId,
      user_id: userId,
      question_id: r.questionId,
      selected_option_index: r.selectedIndex,
      is_correct: r.isCorrect,
      points_earned: r.pointsEarned,
    }))

    const { error: answersError } = await supabase.from("user_quiz_answers").insert(answerRows)
    if (answersError) {
      // The attempt itself is saved; log but don't fail the submission
      console.error("Failed to save quiz answers:", answersError)
    }

    return NextResponse.json({
      success: true,
      attemptId,
      result: {
        ...result,
        timeTakenSeconds,
        quizId,
      },
    })
  } catch (error) {
    console.error("Error in quiz attempt API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

/**
 * GET /api/training/quiz/attempt?quizId=<slug>
 * Returns the authenticated user's completed attempts (all quizzes, or one).
 */
export async function GET(request: NextRequest) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const rawQuizId = searchParams.get("quizId")

    const supabase = getServiceClient()
    let query = supabase
      .from("user_quiz_attempts")
      .select(
        "id, quiz_id, status, started_at, completed_at, score, max_score, percentage, passed, correct_answers, total_questions, time_taken_seconds"
      )
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })

    if (rawQuizId) {
      query = query.eq("quiz_id", resolveQuizId(rawQuizId))
    }

    const { data, error } = await query
    if (error) {
      console.error("Failed to fetch quiz attempts:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch attempts" }, { status: 500 })
    }

    return NextResponse.json({ success: true, attempts: data ?? [] })
  } catch (error) {
    console.error("Error in quiz attempt GET:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
