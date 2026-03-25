"use client"

import type { ProgressData } from "@/hooks/useTrainingProgress"

interface LessonProgressIndicatorProps {
  progress: ProgressData | undefined
  showProgressBar?: boolean
}

/**
 * Renders a visual indicator for a single lesson's progress:
 * - Green checkmark badge when completed
 * - Progress bar + "In Progress" pill when started but not complete
 * - Nothing when no progress exists
 */
export function LessonProgressIndicator({
  progress,
  showProgressBar = true,
}: LessonProgressIndicatorProps) {
  if (!progress) return null

  if (progress.isCompleted) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
        title="Completed"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
            clipRule="evenodd"
          />
        </svg>
        Completed
      </span>
    )
  }

  const hasProgress = progress.videoProgressSeconds > 0
  if (!hasProgress) return null

  const percent =
    progress.videoDurationSeconds && progress.videoDurationSeconds > 0
      ? Math.min(
          100,
          Math.round((progress.videoProgressSeconds / progress.videoDurationSeconds) * 100)
        )
      : null

  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
        In Progress
      </span>
      {showProgressBar && percent !== null && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${percent}%` }}
            aria-label={`${percent}% watched`}
          />
        </div>
      )}
    </div>
  )
}
