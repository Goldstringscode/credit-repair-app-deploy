"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Users,
  Award,
  Lock,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react"
import { getCourse } from "@/lib/training/course-data"

/**
 * Standard template for every training course. All 6 courses render
 * through this one component — content differs, behavior does not.
 *
 * Progress and completion are real, persisted per signed-in user in the
 * `training_progress` Supabase table via /api/training/progress. Access
 * gating uses the user's real subscription_tier via /api/training/courses,
 * never a mock/demo subscription.
 */

function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/(\d+)/)
  const minutes = match ? parseInt(match[1], 10) : 10
  return minutes * 60
}

export function CourseView({ courseId }: { courseId: string }) {
  const router = useRouter()
  const course = getCourse(courseId)

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set())

  const [activeTab, setActiveTab] = useState("overview")
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const loadData = useCallback(async () => {
    if (!course) return
    setIsLoading(true)
    setLoadError(null)
    try {
      const [coursesRes, progressRes] = await Promise.all([
        fetch("/api/training/courses"),
        fetch(`/api/training/progress?courseId=${encodeURIComponent(courseId)}`),
      ])

      if (coursesRes.status === 401 || progressRes.status === 401) {
        if (mountedRef.current) setLoadError("Please sign in to view this course.")
        return
      }
      if (!coursesRes.ok || !progressRes.ok) {
        if (mountedRef.current) setLoadError("Something went wrong loading this course. Please try again.")
        return
      }

      const coursesJson = await coursesRes.json()
      const progressJson = await progressRes.json()

      if (!mountedRef.current) return

      const thisCourse = coursesJson.courses?.find((c: { id: string }) => c.id === courseId)
      setLocked(!!thisCourse?.locked)

      const completed = new Set<string>(
        (progressJson.data ?? [])
          .filter((row: { is_completed: boolean }) => row.is_completed)
          .map((row: { lesson_id: string }) => row.lesson_id)
      )
      setCompletedLessonIds(completed)
    } catch (err) {
      console.error("Failed to load course:", err)
      if (mountedRef.current) setLoadError("Something went wrong loading this course. Please try again.")
    } finally {
      if (mountedRef.current) setIsLoading(false)
    }
  }, [courseId, course])

  useEffect(() => {
    loadData()
  }, [loadData])

  const setLessonCompletion = useCallback(
    async (lessonId: string, isCompleted: boolean) => {
      if (!course) return
      setIsSubmitting(true)
      setActionError(null)
      const lesson = course.lessons.find(l => l.id === lessonId)
      const seconds = lesson ? parseDurationToSeconds(lesson.duration) : 0

      try {
        const res = await fetch("/api/training/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId,
            lessonId,
            videoProgressSeconds: isCompleted ? seconds : 0,
            videoDurationSeconds: seconds,
            isCompleted,
          }),
        })
        if (!res.ok) {
          setActionError("Couldn't save your progress. Please try again.")
          return
        }
        setCompletedLessonIds(prev => {
          const next = new Set(prev)
          if (isCompleted) next.add(lessonId)
          else next.delete(lessonId)
          return next
        })
      } catch (err) {
        console.error("Failed to update lesson progress:", err)
        setActionError("Couldn't save your progress. Check your connection and try again.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [course, courseId]
  )

  // ----- Render states -----

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-xl mx-auto mt-16">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">This course doesn't exist.</p>
            <Button variant="outline" onClick={() => router.push("/dashboard/training")}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Training
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mb-3" />
          <p>Loading course…</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-xl mx-auto mt-16">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">{loadError}</p>
            <Button onClick={loadData} variant="outline">
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (locked) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push("/dashboard/training")} className="mb-6">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Training
        </Button>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
              <Lock className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-6">
              This course is part of a paid plan. Upgrade your plan to unlock {course.title} and the rest of our
              premium training library.
            </p>
            <Button onClick={() => router.push("/dashboard/billing")} size="lg">
              View Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentLesson = course.lessons[currentLessonIndex]
  const completedCount = course.lessons.filter(l => completedLessonIds.has(l.id)).length
  const courseProgress = Math.round((completedCount / course.lessons.length) * 100)
  const isCurrentComplete = completedLessonIds.has(currentLesson.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push("/dashboard/training")} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Training
        </Button>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-[280px]">
            <div className="flex items-center space-x-2 mb-2">
              <Badge
                variant={course.level === "Advanced" ? "destructive" : "outline"}
                className="font-semibold"
              >
                {course.level}
              </Badge>
              <Badge variant="outline" className="font-semibold">
                {course.category}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 bg-clip-text text-transparent mb-4">
              {course.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl leading-relaxed mb-6">{course.description}</p>
            <div className="flex items-center space-x-6 text-sm text-gray-600 flex-wrap gap-y-2">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">{course.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{course.students.toLocaleString()} students</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{course.lessons.length} lessons</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award className="h-4 w-4" />
                <span>Certificate</span>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-64">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Your progress</span>
              <span className="font-semibold">{courseProgress}%</span>
            </div>
            <Progress value={courseProgress} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              {completedCount} of {course.lessons.length} lessons complete
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="lesson">Lesson</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-6">
              <Card className="border-0 bg-gradient-to-r from-purple-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">Course Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">What You'll Learn</h3>
                    <ul className="space-y-2 text-gray-700">
                      {course.whatYouWillLearn.map((point, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Topics Covered</h3>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button
                      onClick={() => {
                        setActiveTab("lesson")
                      }}
                      size="lg"
                    >
                      {completedCount > 0 ? "Continue Course" : "Start Course"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Curriculum */}
            <TabsContent value="curriculum" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Course Curriculum</CardTitle>
                  <p className="text-gray-600">Complete all lessons to earn your certificate</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {course.lessons.map((lesson, index) => {
                      const isDone = completedLessonIds.has(lesson.id)
                      return (
                        <div
                          key={lesson.id}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            currentLessonIndex === index
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setCurrentLessonIndex(index)
                            setActiveTab("lesson")
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  isDone
                                    ? "bg-green-600 text-white"
                                    : currentLessonIndex === index
                                      ? "bg-blue-600 text-white"
                                      : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {isDone ? <CheckCircle className="h-4 w-4" /> : index + 1}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                                <p className="text-sm text-gray-600">{lesson.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{lesson.duration}</Badge>
                              {isDone && (
                                <Badge variant="default" className="bg-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Lesson */}
            <TabsContent value="lesson" className="space-y-4">
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 -m-4 p-6 space-y-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-6">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("curriculum")}
                      className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back to Curriculum
                    </Button>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-1">
                        {currentLesson.title}
                      </h1>
                      <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
                        {currentLesson.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-semibold bg-green-100 text-green-700 border-green-200">
                    {currentLesson.duration}
                  </Badge>
                </div>

                <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-2xl">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span className="text-xl font-bold">
                        Lesson {currentLessonIndex + 1} of {course.lessons.length}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div
                      className="prose prose-slate max-w-none prose-h3:text-xl prose-h3:font-bold prose-h4:text-base prose-h4:font-semibold prose-h4:mt-4 prose-ul:my-2 prose-li:my-1"
                      dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                    />

                    {actionError && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {actionError}
                      </div>
                    )}

                    <div className="mt-8 flex justify-center">
                      {isCurrentComplete ? (
                        <Button
                          onClick={() => setLessonCompletion(currentLesson.id, false)}
                          disabled={isSubmitting}
                          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-12 py-4 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                          size="lg"
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                          ) : (
                            <XCircle className="h-6 w-6 mr-3" />
                          )}
                          Unmark as Complete
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setLessonCompletion(currentLesson.id, true)}
                          disabled={isSubmitting}
                          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-12 py-4 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                          size="lg"
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-6 w-6 mr-3" />
                          )}
                          Mark as Complete
                        </Button>
                      )}
                    </div>

                    <div className="mt-8 flex justify-between items-center pt-6 border-t">
                      <Button
                        variant="outline"
                        disabled={currentLessonIndex === 0}
                        onClick={() => setCurrentLessonIndex(i => Math.max(i - 1, 0))}
                        className="flex items-center space-x-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Previous Lesson</span>
                      </Button>

                      <div className="text-sm text-gray-600">
                        Lesson {currentLessonIndex + 1} of {course.lessons.length}
                      </div>

                      <Button
                        variant="outline"
                        disabled={currentLessonIndex === course.lessons.length - 1}
                        onClick={() => setCurrentLessonIndex(i => Math.min(i + 1, course.lessons.length - 1))}
                        className="flex items-center space-x-2"
                      >
                        <span>Next Lesson</span>
                        <ChevronLeft className="h-4 w-4 rotate-180" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {isCurrentComplete && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-6 text-center">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
                      <h3 className="text-xl font-semibold text-green-900 mb-2">Lesson Complete!</h3>
                      <p className="text-green-700">
                        Great work. {completedCount === course.lessons.length
                          ? "You've completed every lesson in this course."
                          : `${course.lessons.length - completedCount} lesson${course.lessons.length - completedCount === 1 ? "" : "s"} left to finish the course.`}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Resources */}
            <TabsContent value="resources" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Course Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <Award className="h-6 w-6 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Course Certificate</h4>
                      <p className="text-sm text-gray-600">
                        Complete all {course.lessons.length} lessons in this course to become eligible for a
                        completion certificate.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <BookOpen className="h-6 w-6 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Keep Learning</h4>
                      <p className="text-sm text-gray-600">
                        Head back to the training hub to explore the rest of the courses in your plan.
                      </p>
                      <Button
                        variant="link"
                        className="px-0 h-auto"
                        onClick={() => router.push("/dashboard/training")}
                      >
                        Browse all courses →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
