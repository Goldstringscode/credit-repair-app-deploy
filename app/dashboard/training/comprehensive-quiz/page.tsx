import { redirect } from "next/navigation"

/**
 * Legacy standalone quiz page. Content now lives in lib/training/quiz-data.ts
 * and is served through the unified quiz experience with saved progress.
 */
export default function ComprehensiveQuizRedirect() {
  redirect("/dashboard/training/quizzes/comprehensive-quiz")
}
