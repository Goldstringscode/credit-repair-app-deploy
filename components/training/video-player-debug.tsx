'use client'

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  Pause, 
  Clock,
  BookOpen,
  CheckCircle
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface VideoPlayerDebugProps {
  videoUrl: string
  lessonId: string
  courseId: string
  lessonTitle: string
  lessonDescription?: string
  lessonDuration: number
  onProgressUpdate: (progress: number) => void
  onComplete: () => void
  initialProgress?: number
  isCompleted?: boolean
}

export function VideoPlayerDebug({
  videoUrl,
  lessonId,
  courseId,
  lessonTitle,
  lessonDescription,
  lessonDuration,
  onProgressUpdate,
  onComplete,
  initialProgress = 0,
  isCompleted = false
}: VideoPlayerDebugProps) {
  console.log('VideoPlayerDebug rendering with props:', {
    videoUrl,
    lessonId,
    courseId,
    lessonTitle,
    lessonDuration,
    initialProgress,
    isCompleted
  })
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [progress, setProgress] = useState(initialProgress)
  const [showNotesModal, setShowNotesModal] = useState(false)

  const isDemoMode = videoUrl.includes('demo')

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      // Simulate progress
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = Math.min(prev + 1, lessonDuration)
          const newProgress = (newTime / lessonDuration) * 100
          setProgress(newProgress)
          
          if (newTime >= lessonDuration) {
            setIsPlaying(false)
            onComplete()
            toast({
              title: "Lesson completed! 🎉",
              description: "Great job!",
              variant: "default"
            })
            clearInterval(interval)
          }
          
          return newTime
        })
      }, 1000)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-0">
        {/* Lesson Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{lessonTitle}</h1>
              {lessonDescription && (
                <p className="text-gray-600 mb-3">{lessonDescription}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(lessonDuration)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>Lesson {lessonId}</span>
                </div>
                {isDemoMode && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Demo Mode
                  </Badge>
                )}
                {isCompleted && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative bg-black group cursor-pointer" onClick={togglePlay}>
          <div className="w-full h-[70vh] bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🎥</div>
              <div className="text-2xl font-bold mb-2">Demo Video Player</div>
              <div className="text-lg text-blue-200 mb-4">
                {isPlaying ? "Playing..." : "Click to play demo video"}
              </div>
              <div className="text-sm text-blue-300 max-w-md mb-4">
                <p>• Video playback is simulated</p>
                <p>• Progress tracking works normally</p>
                <p>• Notes and bookmarks are functional</p>
              </div>
              <div className="text-lg text-blue-100">
                Current Time: {formatTime(currentTime)} / {formatTime(lessonDuration)}
              </div>
            </div>
          </div>

          {/* Play/Pause Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                togglePlay()
              }}
            >
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </Button>
          </div>
        </div>

        {/* Lesson Actions */}
        <div className="p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Progress:</span> {Math.round(progress)}%
              </div>
              <Progress value={progress} className="w-32 h-2" />
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowNotesModal(true)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Lesson Notes
              </Button>
              <Button variant="outline" size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Simple Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Lesson Notes</h3>
            <p className="text-gray-600 mb-4">Notes functionality temporarily simplified for debugging.</p>
            <Button onClick={() => setShowNotesModal(false)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

