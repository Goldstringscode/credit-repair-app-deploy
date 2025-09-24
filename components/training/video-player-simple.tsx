'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface VideoPlayerSimpleProps {
  videoUrl: string
  lessonId: string
  courseId: string
  lessonTitle: string
}

export function VideoPlayerSimple({
  videoUrl,
  lessonId,
  courseId,
  lessonTitle
}: VideoPlayerSimpleProps) {
  console.log('VideoPlayerSimple rendering with:', { videoUrl, lessonId, courseId, lessonTitle })
  
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-bold mb-2">{lessonTitle}</h2>
      <p className="text-gray-600 mb-4">Lesson ID: {lessonId}</p>
      <p className="text-gray-600 mb-4">Course ID: {courseId}</p>
      <p className="text-gray-600 mb-4">Video URL: {videoUrl}</p>
      <Button>Test Button</Button>
    </div>
  )
}

