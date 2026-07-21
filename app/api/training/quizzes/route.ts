import { NextRequest, NextResponse } from "next/server"
import { extractUserId, getServiceClient } from "@/lib/training/quiz-auth"
import { getQuizList } from "@/lib/training/quiz-data"

export const dynamic = "force-dynamic"

/**
 * GET /api/training/quizzes
 *
 * Returns the quiz catalog plus the authenticated user's real attempt history:
 * - per quiz: last completed attempt, best score, attempt count, and any
 *   in-progress attempt (for "Resume where you left off")
 * - overall stats for the Quiz Center header cards
 */
export async function GET(request: NextRequest) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getServiceClient()

    const { data: attempts, error } = await supabase
      .from("user_quiz_attempts")
      .select(
        "id, quiz_id, status, current_question_index, answers, started_at, completed_at, score, max_score, percentage, passed, correct_answers, total_questions, time_taken_seconds"
      )
      .eq("user_id", userId)
      .order("started_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch quiz attempts:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch attempts" }, { status: 500 })
    }

    const allAttempts = attempts ?? []
    const completed = allAttempts.filter(a => a.status === "completed")

    const quizzes = getQuizList().map(quiz => {
      const quizCompleted = completed.filter(a => a.quiz_id === quiz.id)
      const inProgress = allAttempts.find(a => a.quiz_id === quiz.id && a.status === "in_progress") ?? null
      const lastAttempt = quizCompleted[0] ?? null
      const bestPercentage = quizCompleted.length
        ? Math.max(...quizCompleted.map(a => a.percentage ?? 0))
        : null

      return {
        ...quiz,
        attemptsCount: quizCompleted.length,
        bestPercentage,
        lastAttempt: lastAttempt
          ? {
              id: lastAttempt.id,
              percentage: lastAttempt.percentage ?? 0,
              passed: lastAttempt.passed ?? false,
              correctAnswers: lastAttempt.correct_answers ?? 0,
              totalQuestions: lastAttempt.total_questions ?? quiz.questionCount,
              timeTakenSeconds: lastAttempt.time_taken_seconds ?? 0,
              completedAt: lastAttempt.completed_at,
            }
          : null,
        inProgress: inProgress
          ? {
              id: inProgress.id,
              currentQuestionIndex: inProgress.current_question_index ?? 0,
              answeredCount: inProgress.answers ? Object.keys(inProgress.answers as object).length : 0,
              startedAt: inProgress.started_at,
              timeTakenSeconds: inProgress.time_taken_seconds ?? 0,
            }
          : null,
      }
    })

    // Overall stats from real completed attempts
    const passedQuizIds = new Set(completed.filter(a => a.passed).map(a => a.quiz_id))
    const percentages = completed.map(a => a.percentage ?? 0)
    const stats = {
      totalQuizzes: quizzes.length,
      passedQuizzes: passedQuizIds.size,
      completedAttempts: completed.length,
      averageScore: percentages.length
        ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
        : 0,
      bestScore: percentages.length ? Math.max(...percentages) : 0,
      totalTimeSpent: completed.reduce((acc, a) => acc + (a.time_taken_seconds ?? 0), 0),
      lastQuizDate: completed[0]?.completed_at ?? null,
    }

    const recentActivity = completed.slice(0, 5).map(a => ({
      id: a.id,
      quizId: a.quiz_id,
      percentage: a.percentage ?? 0,
      passed: a.passed ?? false,
      correctAnswers: a.correct_answers ?? 0,
      totalQuestions: a.total_questions ?? 0,
      timeTakenSeconds: a.time_taken_seconds ?? 0,
      completedAt: a.completed_at,
    }))

    return NextResponse.json({ success: true, quizzes, stats, recentActivity })
  } catch (error) {
    console.error("Error in quizzes API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
