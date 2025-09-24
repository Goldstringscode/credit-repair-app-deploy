import React from 'react'
import { VideoPlayer } from '@/components/training/video-player'

export default function TestVideoPlayer() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">VideoPlayer Test</h1>
      <VideoPlayer
        videoUrl="demo"
        lessonId="test-lesson-1"
        courseId="test-course-1"
        lessonTitle="Test Lesson"
        lessonDescription="This is a test lesson"
        lessonDuration={120}
        onProgressUpdate={(progress) => console.log('Progress:', progress)}
        onComplete={() => console.log('Lesson completed')}
        initialProgress={0}
        isCompleted={false}
      />
    </div>
  )
}

