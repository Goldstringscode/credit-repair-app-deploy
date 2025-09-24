"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { CustomVideoPlayer } from "@/components/video-player/custom-video-player"
import {
  Play,
  SkipForward,
  SkipBack,
  List,
  Clock,
  CheckCircle,
  Lock,
  Star,
  BookOpen,
  Users,
  Award,
  Settings,
  Share,
  Download,
  ArrowLeft,
} from "lucide-react"
import type { Playlist, PlaylistVideo, PlaylistProgress } from "@/lib/playlist-system"
import { getNextVideo, getPreviousVideo, formatDuration, calculatePlaylistProgress } from "@/lib/playlist-system"
import Link from "next/link"

interface PlaylistPlayerProps {
  playlist: Playlist
  initialVideoId?: string
  onVideoComplete?: (videoId: string) => void
  onPlaylistComplete?: () => void
}

export function PlaylistPlayer({ playlist, initialVideoId, onVideoComplete, onPlaylistComplete }: PlaylistPlayerProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Player state
  const [currentVideo, setCurrentVideo] = useState<PlaylistVideo | null>(null)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [showPlaylist, setShowPlaylist] = useState(true)
  const [completedVideos, setCompletedVideos] = useState<string[]>([])
  const [playlistProgress, setPlaylistProgress] = useState<PlaylistProgress | null>(null)

  // Initialize current video
  useEffect(() => {
    const videoToPlay = initialVideoId ? playlist.videos.find((v) => v.id === initialVideoId) : playlist.videos[0]

    if (videoToPlay) {
      setCurrentVideo(videoToPlay)
    }

    // Load progress from localStorage
    loadPlaylistProgress()
  }, [playlist, initialVideoId])

  const loadPlaylistProgress = () => {
    try {
      const saved = localStorage.getItem(`playlist-progress-${playlist.id}`)
      if (saved) {
        const progress: PlaylistProgress = JSON.parse(saved)
        setCompletedVideos(progress.videosCompleted)
        setPlaylistProgress(progress)
      }
    } catch (error) {
      console.error("Error loading playlist progress:", error)
    }
  }

  const savePlaylistProgress = (updatedCompletedVideos: string[], currentVideoId: string) => {
    try {
      const progress: PlaylistProgress = {
        playlistId: playlist.id,
        userId: "current-user", // In real app, get from auth
        videosCompleted: updatedCompletedVideos,
        currentVideoId,
        overallProgress: calculatePlaylistProgress(playlist, updatedCompletedVideos),
        timeSpent: 0, // Would track actual time spent
        startedAt: playlistProgress?.startedAt || new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        completedAt: updatedCompletedVideos.length === playlist.videos.length ? new Date().toISOString() : undefined,
        notes: playlistProgress?.notes || {},
        bookmarks: playlistProgress?.bookmarks || {},
      }

      localStorage.setItem(`playlist-progress-${playlist.id}`, JSON.stringify(progress))
      setPlaylistProgress(progress)
    } catch (error) {
      console.error("Error saving playlist progress:", error)
    }
  }

  const handleVideoComplete = (videoId: string) => {
    if (!completedVideos.includes(videoId)) {
      const updatedCompleted = [...completedVideos, videoId]
      setCompletedVideos(updatedCompleted)
      savePlaylistProgress(updatedCompleted, videoId)

      onVideoComplete?.(videoId)

      toast({
        title: "Video Completed!",
        description: `You've finished "${currentVideo?.title}"`,
      })

      // Check if playlist is complete
      if (updatedCompleted.length === playlist.videos.length) {
        toast({
          title: "Playlist Complete! 🎉",
          description: `Congratulations! You've completed "${playlist.title}"`,
        })
        onPlaylistComplete?.()
      } else if (isAutoPlay) {
        // Auto-advance to next video
        setTimeout(() => {
          handleNextVideo()
        }, 2000)
      }
    }
  }

  const handleVideoSelect = (video: PlaylistVideo) => {
    // Check prerequisites
    if (video.prerequisites && video.prerequisites.length > 0) {
      const unmetPrereqs = video.prerequisites.filter((prereq) => !completedVideos.includes(prereq))
      if (unmetPrereqs.length > 0) {
        toast({
          title: "Prerequisites Required",
          description: "Complete previous videos to unlock this content",
          variant: "destructive",
        })
        return
      }
    }

    setCurrentVideo(video)
    if (playlistProgress) {
      savePlaylistProgress(completedVideos, video.id)
    }
  }

  const handleNextVideo = () => {
    if (!currentVideo) return
    const nextVideo = getNextVideo(playlist, currentVideo.id)
    if (nextVideo) {
      handleVideoSelect(nextVideo)
    }
  }

  const handlePreviousVideo = () => {
    if (!currentVideo) return
    const prevVideo = getPreviousVideo(playlist, currentVideo.id)
    if (prevVideo) {
      handleVideoSelect(prevVideo)
    }
  }

  const isVideoLocked = (video: PlaylistVideo): boolean => {
    if (!video.prerequisites || video.prerequisites.length === 0) return false
    return video.prerequisites.some((prereq) => !completedVideos.includes(prereq))
  }

  const isVideoCompleted = (videoId: string): boolean => {
    return completedVideos.includes(videoId)
  }

  const getPlaylistCompletionPercentage = (): number => {
    return calculatePlaylistProgress(playlist, completedVideos)
  }

  if (!currentVideo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Video Selected</h3>
          <p className="text-gray-600">Select a video from the playlist to start watching.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/mlm/training">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Training
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-2xl font-bold">{playlist.title}</h1>
            <p className="text-gray-600">{playlist.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{playlist.type.charAt(0).toUpperCase() + playlist.type.slice(1)}</Badge>
          <Badge variant="secondary">{playlist.difficulty}</Badge>
          {playlist.certificateAwarded && (
            <Badge className="bg-yellow-500">
              <Award className="h-3 w-3 mr-1" />
              Certificate
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Overall Progress</span>
              </div>
              <div className="text-2xl font-bold">{getPlaylistCompletionPercentage()}%</div>
              <Progress value={getPlaylistCompletionPercentage()} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Videos Completed</span>
              </div>
              <div className="text-2xl font-bold">
                {completedVideos.length} / {playlist.totalVideos}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Total Duration</span>
              </div>
              <div className="text-2xl font-bold">{formatDuration(playlist.totalDuration)}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Rating</span>
              </div>
              <div className="text-2xl font-bold">{playlist.rating}/5</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Video Player */}
        <div className={`${showPlaylist ? "lg:col-span-3" : "lg:col-span-4"} space-y-4`}>
          {/* Current Video Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>
                      Video {currentVideo.order}: {currentVideo.title}
                    </span>
                    {isVideoCompleted(currentVideo.id) && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">{currentVideo.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{currentVideo.difficulty}</Badge>
                  <Badge variant="secondary">{formatDuration(currentVideo.duration)}</Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Video Player */}
          <CustomVideoPlayer
            videoUrl={currentVideo.videoUrl}
            title={currentVideo.title}
            duration={currentVideo.duration}
            chapters={currentVideo.chapters}
            transcript={currentVideo.transcript}
            onComplete={() => handleVideoComplete(currentVideo.id)}
            courseId={playlist.id}
            lessonId={currentVideo.id}
          />

          {/* Video Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousVideo}
                    disabled={!getPreviousVideo(playlist, currentVideo.id)}
                  >
                    <SkipBack className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextVideo}
                    disabled={!getNextVideo(playlist, currentVideo.id)}
                  >
                    Next
                    <SkipForward className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch checked={isAutoPlay} onCheckedChange={setIsAutoPlay} id="autoplay" />
                    <label htmlFor="autoplay" className="text-sm">
                      Auto-play next video
                    </label>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowPlaylist(!showPlaylist)}>
                    <List className="h-4 w-4 mr-2" />
                    {showPlaylist ? "Hide" : "Show"} Playlist
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Details */}
          <Card>
            <CardHeader>
              <CardTitle>About This Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Instructor</h4>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <span>{currentVideo.instructor}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {currentVideo.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {currentVideo.prerequisites && currentVideo.prerequisites.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Prerequisites</h4>
                    <div className="space-y-1">
                      {currentVideo.prerequisites.map((prereqId) => {
                        const prereqVideo = playlist.videos.find((v) => v.id === prereqId)
                        return prereqVideo ? (
                          <div key={prereqId} className="flex items-center space-x-2 text-sm">
                            {isVideoCompleted(prereqId) ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                            <span className={isVideoCompleted(prereqId) ? "text-green-600" : "text-gray-600"}>
                              {prereqVideo.title}
                            </span>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Playlist Sidebar */}
        {showPlaylist && (
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Playlist</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {completedVideos.length} of {playlist.totalVideos} completed
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-1 p-4">
                    {playlist.videos.map((video, index) => {
                      const isCompleted = isVideoCompleted(video.id)
                      const isLocked = isVideoLocked(video)
                      const isCurrent = currentVideo?.id === video.id

                      return (
                        <button
                          key={video.id}
                          onClick={() => !isLocked && handleVideoSelect(video)}
                          disabled={isLocked}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            isCurrent
                              ? "bg-blue-50 border border-blue-200"
                              : isLocked
                                ? "bg-gray-50 cursor-not-allowed"
                                : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {isLocked ? (
                                <Lock className="h-4 w-4 text-gray-400" />
                              ) : isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : isCurrent ? (
                                <Play className="h-4 w-4 text-blue-600" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-500">Video {video.order}</span>
                                <span className="text-xs text-gray-500">{formatDuration(video.duration)}</span>
                              </div>
                              <h4
                                className={`font-medium text-sm ${
                                  isLocked ? "text-gray-400" : isCurrent ? "text-blue-600" : "text-gray-900"
                                }`}
                              >
                                {video.title}
                              </h4>
                              <p
                                className={`text-xs mt-1 line-clamp-2 ${isLocked ? "text-gray-400" : "text-gray-600"}`}
                              >
                                {video.description}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {video.difficulty}
                                </Badge>
                                {video.isRequired && (
                                  <Badge variant="secondary" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
