"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, CheckCircle, BookOpen, Target } from "lucide-react"

interface VideoProgressData {
  videoId: string
  title: string
  duration: number
  watchedTime: number
  completed: boolean
  lastWatched: string
  notes: number
  bookmarks: number
}

interface VideoProgressTrackerProps {
  courseId: string
  videos: Array<{
    id: string
    title: string
    duration: number
  }>
}

export function VideoProgressTracker({ courseId, videos }: VideoProgressTrackerProps) {
  const [progressData, setProgressData] = useState<VideoProgressData[]>([])
  const [totalStats, setTotalStats] = useState({
    totalVideos: 0,
    completedVideos: 0,
    totalWatchTime: 0,
    totalDuration: 0,
    totalNotes: 0,
    totalBookmarks: 0,
  })

  useEffect(() => {
    loadProgressData()
  }, [courseId, videos])

  const loadProgressData = () => {
    const data: VideoProgressData[] = videos.map((video) => {
      try {
        const saved = localStorage.getItem(`video-progress-${courseId}-${video.id}`)
        const notes = localStorage.getItem(`video-notes-${courseId}-${video.id}`)

        let progressInfo = {
          currentTime: 0,
          completed: false,
          lastWatched: "",
          watchedSegments: [],
        }

        let notesData: any[] = []

        if (saved) {
          progressInfo = JSON.parse(saved)
        }

        if (notes) {
          notesData = JSON.parse(notes)
        }

        const watchedTime =
          progressInfo.watchedSegments?.reduce((acc: number, seg: any) => acc + (seg.end - seg.start), 0) ||
          progressInfo.currentTime ||
          0

        return {
          videoId: video.id,
          title: video.title,
          duration: video.duration,
          watchedTime: Math.min(watchedTime, video.duration),
          completed: progressInfo.completed || watchedTime >= video.duration * 0.9,
          lastWatched: progressInfo.lastWatched || "",
          notes: notesData.filter((n) => n.type === "note" || n.type === "question").length,
          bookmarks: notesData.filter((n) => n.type === "bookmark").length,
        }
      } catch (error) {
        console.error("Error loading progress for video:", video.id, error)
        return {
          videoId: video.id,
          title: video.title,
          duration: video.duration,
          watchedTime: 0,
          completed: false,
          lastWatched: "",
          notes: 0,
          bookmarks: 0,
        }
      }
    })

    setProgressData(data)

    // Calculate total stats
    const stats = {
      totalVideos: data.length,
      completedVideos: data.filter((d) => d.completed).length,
      totalWatchTime: data.reduce((acc, d) => acc + d.watchedTime, 0),
      totalDuration: data.reduce((acc, d) => acc + d.duration, 0),
      totalNotes: data.reduce((acc, d) => acc + d.notes, 0),
      totalBookmarks: data.reduce((acc, d) => acc + d.bookmarks, 0),
    }
    setTotalStats(stats)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`
    }
    return `${mins}m ${secs}s`
  }

  const getProgressPercentage = (watchedTime: number, duration: number) => {
    return Math.min(100, Math.round((watchedTime / duration) * 100))
  }

  const overallProgress =
    totalStats.totalDuration > 0 ? Math.round((totalStats.totalWatchTime / totalStats.totalDuration) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Play className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overallProgress}%</p>
                <p className="text-sm text-gray-600">Overall Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalStats.completedVideos}/{totalStats.totalVideos}
                </p>
                <p className="text-sm text-gray-600">Videos Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatTime(totalStats.totalWatchTime)}</p>
                <p className="text-sm text-gray-600">Time Watched</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.totalNotes}</p>
                <p className="text-sm text-gray-600">Notes Taken</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Video Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Video Progress Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressData.map((video) => (
              <div key={video.videoId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium">{video.title}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">
                        {formatTime(video.watchedTime)} / {formatTime(video.duration)}
                      </span>
                      {video.completed && (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {video.notes > 0 && <Badge variant="outline">{video.notes} Notes</Badge>}
                      {video.bookmarks > 0 && <Badge variant="outline">{video.bookmarks} Bookmarks</Badge>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{getProgressPercentage(video.watchedTime, video.duration)}%</div>
                    {video.lastWatched && (
                      <div className="text-xs text-gray-500">
                        Last watched: {new Date(video.lastWatched).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <Progress value={getProgressPercentage(video.watchedTime, video.duration)} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Learning Goals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-medium">Complete all videos in this course</span>
              <Badge variant={totalStats.completedVideos === totalStats.totalVideos ? "default" : "secondary"}>
                {totalStats.completedVideos}/{totalStats.totalVideos}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="font-medium">Take comprehensive notes</span>
              <Badge variant={totalStats.totalNotes >= totalStats.totalVideos ? "default" : "secondary"}>
                {totalStats.totalNotes} Notes
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium">Watch at least 80% of content</span>
              <Badge variant={overallProgress >= 80 ? "default" : "secondary"}>{overallProgress}%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
