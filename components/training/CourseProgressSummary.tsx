"use client"

import { useTrainingProgress } from "@/hooks/useTrainingProgress"

interface CourseProgressSummaryProps {
  courseId: string
  totalLessons: number
}

/**
 * Displays course-level completion progress.
 * Shows a progress bar and "X of Y lessons completed" summary.
 */
export function CourseProgressSummary({ courseId, totalLessons }: CourseProgressSummaryProps) {
  const { progress, courseCompletionPercent, isLoading } = useTrainingProgress(
    courseId,
    totalLessons
  )

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-2 w-24 animate-pulse rounded-full bg-gray-200" />
        <span>Loading progress…</span>
      </div>
    )
  }

  const completedCount = Object.values(progress).filter(p => p.isCompleted).length

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Course Progress</span>
        <span className="text-muted-foreground">
          {completedCount} of {totalLessons} lessons completed
        </span>
      </div>

      {/* Progress ring approximation using a linear bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500"
          style={{ width: `${courseCompletionPercent}%` }}
          aria-label={`${courseCompletionPercent}% complete`}
        />
      </div>

      <p className="text-xs text-muted-foreground">{courseCompletionPercent}% complete</p>
    </div>
  )
}
