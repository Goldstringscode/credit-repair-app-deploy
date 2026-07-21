import { redirect } from "next/navigation"

/**
 * Legacy standalone quiz page. Content now lives in lib/training/quiz-data.ts
 * and is served through the unified quiz experience with saved progress.
 * This static route would otherwise shadow /quizzes/[quizId] for this path.
 */
export default function LegalRightsQuizRedirect() {
  redirect("/dashboard/training/quizzes/legal-rights-quiz")
}
