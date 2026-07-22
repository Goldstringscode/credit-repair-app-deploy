"use client"

import { useParams } from "next/navigation"
import { CourseView } from "@/components/training/course-view"

export default function CoursePage() {
  const params = useParams()
  const courseId = params.courseId as string
  return <CourseView courseId={courseId} />
}
