"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  BookmarkPlus,
  StickyNote,
  Download,
  Share,
  Clock,
  Star,
  MessageSquare,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface VideoNote {
  id: string
  timestamp: number
  content: string
  createdAt: string
  type: "note" | "bookmark" | "question"
}

interface VideoChapter {
  id: string
  title: string
  timestamp: number
  duration: number
}

interface VideoPlayerProps {
  videoUrl: string
  title: string
  duration: number
  chapters?: VideoChapter[]
  transcript?: string
  onProgressUpdate?: (progress: number) => void
  onComplete?: () => void
  initialProgress?: number
  courseId?: string
  lessonId?: string
}

export function CustomVideoPlayer({
  videoUrl,
  title,
  duration,
  chapters = [],
  transcript = "",
  onProgressUpdate,
  onComplete,
  initialProgress = 0,
  courseId,
  lessonId,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Video state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [quality, setQuality] = useState("720p")
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)

  // Notes and bookmarks
  const [notes, setNotes] = useState<VideoNote[]>([])
  const [currentNote, setCurrentNote] = useState("")
  const [showNotesPanel, setShowNotesPanel] = useState(false)
  const [activeTab, setActiveTab] = useState("notes")

  // Progress tracking
  const [watchedSegments, setWatchedSegments] = useState<Array<{ start: number; end: number }>>([])
  const [lastSavedProgress, setLastSavedProgress] = useState(0)

  // Load saved progress and notes on mount
  useEffect(() => {
    if (courseId && lessonId) {
      loadVideoProgress()
      loadVideoNotes()
    }
    if (initialProgress > 0 && videoRef.current) {
      videoRef.current.currentTime = initialProgress
    }
  }, [courseId, lessonId, initialProgress])

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isPlaying && showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000)
    }
    return () => clearTimeout(timeout)
  }, [isPlaying, showControls])

  // Save progress periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && Math.abs(currentTime - lastSavedProgress) > 5) {
        saveVideoProgress(currentTime)
        setLastSavedProgress(currentTime)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [isPlaying, currentTime, lastSavedProgress])

  const loadVideoProgress = () => {
    try {
      const saved = localStorage.getItem(`video-progress-${courseId}-${lessonId}`)
      if (saved) {
        const progress = JSON.parse(saved)
        if (videoRef.current && progress.currentTime) {
          videoRef.current.currentTime = progress.currentTime
        }
        setWatchedSegments(progress.watchedSegments || [])
      }
    } catch (error) {
      console.error("Error loading video progress:", error)
    }
  }

  const saveVideoProgress = (time: number) => {
    if (!courseId || !lessonId) return
    try {
      const progress = {
        currentTime: time,
        watchedSegments,
        lastWatched: new Date().toISOString(),
        completed: time >= duration * 0.9,
      }
      localStorage.setItem(`video-progress-${courseId}-${lessonId}`, JSON.stringify(progress))
      onProgressUpdate?.(time)
    } catch (error) {
      console.error("Error saving video progress:", error)
    }
  }

  const loadVideoNotes = () => {
    try {
      const saved = localStorage.getItem(`video-notes-${courseId}-${lessonId}`)
      if (saved) {
        setNotes(JSON.parse(saved))
      }
    } catch (error) {
      console.error("Error loading video notes:", error)
    }
  }

  const saveVideoNotes = (updatedNotes: VideoNote[]) => {
    if (!courseId || !lessonId) return
    try {
      localStorage.setItem(`video-notes-${courseId}-${lessonId}`, JSON.stringify(updatedNotes))
    } catch (error) {
      console.error("Error saving video notes:", error)
    }
  }

  const handlePlayPause = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const time = videoRef.current.currentTime
    setCurrentTime(time)

    // Track watched segments
    const newSegment = { start: Math.floor(time), end: Math.floor(time) + 1 }
    setWatchedSegments((prev) => {
      const exists = prev.some((seg) => seg.start <= newSegment.start && seg.end >= newSegment.end)
      if (!exists) {
        return [...prev, newSegment]
      }
      return prev
    })

    // Check for completion
    if (time >= duration * 0.9) {
      onComplete?.()
    }
  }

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return
    const time = (value[0] / 100) * duration
    videoRef.current.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return
    const vol = value[0] / 100
    videoRef.current.volume = vol
    setVolume(vol)
    setIsMuted(vol === 0)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    if (isMuted) {
      videoRef.current.volume = volume
      setIsMuted(false)
    } else {
      videoRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!isFullscreen) {
      containerRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const handlePlaybackRateChange = (rate: number) => {
    if (!videoRef.current) return
    videoRef.current.playbackRate = rate
    setPlaybackRate(rate)
    toast({
      title: "Playback Speed Changed",
      description: `Now playing at ${rate}x speed`,
    })
  }

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const addNote = (type: "note" | "bookmark" | "question" = "note") => {
    if (!currentNote.trim() && type === "note") return

    const newNote: VideoNote = {
      id: Date.now().toString(),
      timestamp: currentTime,
      content: type === "note" ? currentNote : `${type} at ${formatTime(currentTime)}`,
      createdAt: new Date().toISOString(),
      type,
    }

    const updatedNotes = [...notes, newNote]
    setNotes(updatedNotes)
    saveVideoNotes(updatedNotes)
    setCurrentNote("")

    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Added`,
      description: `Added at ${formatTime(currentTime)}`,
    })
  }

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId)
    setNotes(updatedNotes)
    saveVideoNotes(updatedNotes)
  }

  const jumpToTimestamp = (timestamp: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = timestamp
    setCurrentTime(timestamp)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getWatchedPercentage = () => {
    const totalWatched = watchedSegments.reduce((acc, seg) => acc + (seg.end - seg.start), 0)
    return Math.min(100, (totalWatched / duration) * 100)
  }

  return (
    <div className="space-y-4">
      {/* Video Player Container */}
      <div
        ref={containerRef}
        className="relative bg-black rounded-lg overflow-hidden group"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => !isPlaying || setShowControls(true)}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full aspect-video"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadStart={() => setIsBuffering(true)}
          onCanPlay={() => setIsBuffering(false)}
          onEnded={() => {
            setIsPlaying(false)
            onComplete?.()
          }}
          onFullscreenChange={() => setIsFullscreen(document.fullscreenElement !== null)}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Loading Overlay */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {/* Play Button Overlay */}
        {!isPlaying && !isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              onClick={handlePlayPause}
            >
              <Play className="h-8 w-8 text-white ml-1" />
            </Button>
          </div>
        )}

        {/* Video Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              className="w-full"
              step={0.1}
            />
            <div className="flex justify-between text-xs text-white/70 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => skipTime(-10)}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={handlePlayPause}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => skipTime(10)}>
                <SkipForward className="h-4 w-4" />
              </Button>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                  max={100}
                />
              </div>

              <span className="text-white/70 text-sm">{playbackRate}x</span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Notes Button */}
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setShowNotesPanel(!showNotesPanel)}
              >
                <StickyNote className="h-4 w-4" />
              </Button>

              {/* Bookmark Button */}
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => addNote("bookmark")}
              >
                <BookmarkPlus className="h-4 w-4" />
              </Button>

              {/* Settings */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                    <Settings className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Playback Speed</label>
                      <div className="grid grid-cols-4 gap-1 mt-1">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                          <Button
                            key={rate}
                            size="sm"
                            variant={playbackRate === rate ? "default" : "outline"}
                            onClick={() => handlePlaybackRateChange(rate)}
                            className="text-xs"
                          >
                            {rate}x
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium">Quality</label>
                      <div className="space-y-1 mt-1">
                        {["1080p", "720p", "480p", "360p"].map((q) => (
                          <Button
                            key={q}
                            size="sm"
                            variant={quality === q ? "default" : "ghost"}
                            onClick={() => setQuality(q)}
                            className="w-full justify-start text-xs"
                          >
                            {q}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Fullscreen */}
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Chapter Markers */}
        {chapters.length > 0 && (
          <div className="absolute bottom-16 left-4 right-4">
            <div className="flex space-x-1">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="relative group cursor-pointer"
                  style={{ left: `${(chapter.timestamp / duration) * 100}%` }}
                  onClick={() => jumpToTimestamp(chapter.timestamp)}
                >
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {chapter.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progress Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>Watched: {Math.round(getWatchedPercentage())}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4" />
            <span>{notes.length} Notes</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
          <Button size="sm" variant="outline">
            <Share className="h-3 w-3 mr-1" />
            Share
          </Button>
        </div>
      </div>

      {/* Notes Panel */}
      {showNotesPanel && (
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="notes">Notes ({notes.filter((n) => n.type === "note").length})</TabsTrigger>
                <TabsTrigger value="bookmarks">
                  Bookmarks ({notes.filter((n) => n.type === "bookmark").length})
                </TabsTrigger>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
              </TabsList>

              <TabsContent value="notes" className="space-y-4">
                {/* Add Note */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a note at current timestamp..."
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Current time: {formatTime(currentTime)}</span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => addNote("question")}>
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Question
                      </Button>
                      <Button size="sm" onClick={() => addNote("note")} disabled={!currentNote.trim()}>
                        <StickyNote className="h-3 w-3 mr-1" />
                        Add Note
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Notes List */}
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {notes
                      .filter((note) => note.type === "note" || note.type === "question")
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .map((note) => (
                        <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                                onClick={() => jumpToTimestamp(note.timestamp)}
                              >
                                {formatTime(note.timestamp)}
                              </Button>
                              <Badge variant={note.type === "question" ? "secondary" : "outline"}>{note.type}</Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-800 p-1 h-auto"
                              onClick={() => deleteNote(note.id)}
                            >
                              ×
                            </Button>
                          </div>
                          <p className="text-sm">{note.content}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(note.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    {notes.filter((n) => n.type === "note" || n.type === "question").length === 0 && (
                      <p className="text-center text-gray-500 py-8">No notes yet. Add your first note above!</p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="bookmarks" className="space-y-4">
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {notes
                      .filter((note) => note.type === "bookmark")
                      .sort((a, b) => a.timestamp - b.timestamp)
                      .map((bookmark) => (
                        <div key={bookmark.id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center justify-between">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
                              onClick={() => jumpToTimestamp(bookmark.timestamp)}
                            >
                              {formatTime(bookmark.timestamp)}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-800 p-1 h-auto"
                              onClick={() => deleteNote(bookmark.id)}
                            >
                              ×
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(bookmark.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    {notes.filter((n) => n.type === "bookmark").length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        No bookmarks yet. Click the bookmark button while watching!
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="transcript" className="space-y-4">
                <ScrollArea className="h-64">
                  <div className="prose prose-sm max-w-none">
                    {transcript ? (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">{transcript}</div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">Transcript not available for this video.</p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
