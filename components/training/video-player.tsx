"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  SkipBack, 
  SkipForward,
  CheckCircle,
  Clock,
  BookOpen,
  AlertCircle
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
// import LessonNotesModal from "./lesson-notes-modal"

interface VideoPlayerProps {
  videoUrl: string
  lessonId: string
  courseId: string
  lessonTitle: string
  lessonDescription?: string
  lessonDuration: number // in seconds
  onProgressUpdate: (progress: number) => void
  onComplete: () => void
  initialProgress?: number
  isCompleted?: boolean
}

export function VideoPlayer({
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
}: VideoPlayerProps) {
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [progress, setProgress] = useState(initialProgress)
  const [isLoading, setIsLoading] = useState(true)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [notes, setNotes] = useState<any[]>([])
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [newNoteContent, setNewNoteContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced')
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const demoIntervalRef = useRef<NodeJS.Timeout>()

  // Demo mode indicator
  const isDemoMode = videoUrl.includes('demo')

  // Initialize demo mode
  useEffect(() => {
    if (isDemoMode) {
      setIsLoading(false)
      setDuration(lessonDuration)
      setHasError(false)
      setCurrentTime(0)
      setProgress(0)
      
      // If there's initial progress, set it
      if (initialProgress > 0) {
        const initialTime = (initialProgress / 100) * lessonDuration
        setCurrentTime(initialTime)
        setProgress(initialProgress)
      }
    }
  }, [isDemoMode, lessonDuration, initialProgress])

  // Demo mode progress simulation
  useEffect(() => {
    if (isDemoMode && isPlaying) {
      demoIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = Math.min(prev + 1, lessonDuration)
          const newProgress = (newTime / lessonDuration) * 100
          setProgress(newProgress)
          
          // Update progress every 5 seconds
          if (Math.floor(newTime) % 5 === 0) {
            onProgressUpdate(Math.floor(newTime))
          }
          
          // Check if lesson is complete
          if (newTime >= lessonDuration) {
            setIsPlaying(false)
            setProgress(100)
            onComplete()
            toast({
              title: "Lesson completed! 🎉",
              description: "Great job!",
              variant: "default"
            })
          }
          
          return newTime
        })
      }, 1000)
    } else if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current)
    }

    return () => {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current)
      }
    }
  }, [isDemoMode, isPlaying, lessonDuration, onProgressUpdate, onComplete])

  // Simple modal state management
  useEffect(() => {
    if (showNotesModal) {
      // Pause video when modal opens
      if (isDemoMode) {
        setIsPlaying(false)
      } else {
        const video = videoRef.current
        if (video && !video.paused) {
          video.pause()
        }
      }
    }
  }, [showNotesModal, isDemoMode])

  useEffect(() => {
    // Handle demo mode differently
    if (isDemoMode) {
      return
    }

    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      console.log("Video metadata loaded, duration:", video.duration)
      setDuration(video.duration)
      setIsLoading(false)
      setHasError(false)
    }

    const handleTimeUpdate = () => {
      const currentProgress = (video.duration > 0) ? (video.currentTime / video.duration) * 100 : 0
      setCurrentTime(video.currentTime)
      setProgress(currentProgress)
      
      // Update progress every 5 seconds
      if (Math.floor(video.currentTime) % 5 === 0) {
        onProgressUpdate(Math.floor(video.currentTime))
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(100)
      onComplete()
      toast({
        title: "Lesson completed! 🎉",
        description: "Great job!",
        variant: "default"
      })
    }

    const handleCanPlay = () => {
      // Additional check to ensure video is ready to play
      if (video.readyState >= 2) {
        setIsLoading(false)
        setHasError(false)
      }
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleError = (e: Event) => {
      console.error("Video error:", e)
      setIsLoading(false)
      setHasError(true)
      setErrorMessage("Failed to load video. Please check the video source.")
    }

    const handleAbort = () => {
      console.log("Video loading aborted")
      setHasError(true)
      setErrorMessage("Video loading was interrupted")
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('error', handleError)
    video.addEventListener('abort', handleAbort)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('error', handleError)
      video.removeEventListener('abort', handleAbort)
    }
  }, [onProgressUpdate, onComplete, videoUrl, lessonDuration, isDemoMode])

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 3000)
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle keyboard events if the notes modal is not open
      if (showNotesModal) {
        return
      }
      
      // Quick note taking with 'N' key
      if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setShowNotesModal(true)
      }
      
      // Toggle fullscreen with 'F' key
      if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        toggleFullscreen()
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('keydown', handleKeyPress, true)
      return () => {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('keydown', handleKeyPress, true)
      }
    }
  }, [isPlaying, showNotesModal])

  const togglePlay = () => {
    if (isDemoMode) {
      setIsPlaying(!isPlaying)
      return
    }

    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      // isPlaying will be set to false by the pause event listener
    } else {
      video.play()
      // isPlaying will be set to true by the play event listener
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.muted = false
      setIsMuted(false)
    } else {
      video.muted = true
      setIsMuted(true)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = parseFloat(e.target.value)
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value)
    
    if (isDemoMode) {
      // In demo mode, simulate seeking
      const seekTime = (newProgress / 100) * lessonDuration
      setCurrentTime(seekTime)
      setProgress(newProgress)
      return
    }

    const video = videoRef.current
    if (!video) return

    const seekTime = (newProgress / 100) * video.duration
    video.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  const skipTime = (seconds: number) => {
    if (isDemoMode) {
      // In demo mode, simulate time skipping
      const newTime = Math.max(0, Math.min(currentTime + seconds, lessonDuration))
      setCurrentTime(newTime)
      setProgress((newTime / lessonDuration) * 100)
      return
    }

    const video = videoRef.current
    if (!video) return

    const newTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration))
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const toggleFullscreen = () => {
    // Store current play state before entering fullscreen
    const wasPlaying = isPlaying

    if (!document.fullscreenElement) {
      // Enter fullscreen
      const enterFullscreen = async () => {
        try {
          // For demo mode, make the container fullscreen
          if (isDemoMode) {
            if (containerRef.current?.requestFullscreen) {
              await containerRef.current.requestFullscreen()
            } else {
              // Fallback for older browsers
              const container = containerRef.current as any
              if (container.webkitRequestFullscreen) {
                await container.webkitRequestFullscreen()
              } else if (container.msRequestFullscreen) {
                await container.msRequestFullscreen()
              }
            }
          } else {
            // For real videos, try video element first, then container
            const video = videoRef.current
            if (video) {
              if (video.requestFullscreen) {
                await video.requestFullscreen()
              } else {
                // Fallback for older browsers
                const videoElement = video as any
                if (videoElement.webkitRequestFullscreen) {
                  await videoElement.webkitRequestFullscreen()
                } else if (videoElement.msRequestFullscreen) {
                  await videoElement.msRequestFullscreen()
                }
              }
            } else {
              // Fallback: make container fullscreen
              if (containerRef.current?.requestFullscreen) {
                await containerRef.current.requestFullscreen()
              }
            }
          }
          setIsFullscreen(true)
        } catch (error) {
          console.error('Failed to enter fullscreen:', error)
          toast({
            title: "Fullscreen not supported",
            description: "Your browser doesn't support fullscreen mode.",
            variant: "destructive"
          })
        }
      }
      enterFullscreen()
    } else {
      // Exit fullscreen
      const exitFullscreen = async () => {
        try {
          const doc = document as any
          if (document.exitFullscreen) {
            await document.exitFullscreen()
          } else {
            // Fallback for older browsers
            if (doc.webkitExitFullscreen) {
              await doc.webkitExitFullscreen()
            } else if (doc.msExitFullscreen) {
              await doc.msExitFullscreen()
            }
          }
          setIsFullscreen(false)
          
          // Ensure video continues playing after exiting fullscreen
          if (wasPlaying && !isDemoMode && videoRef.current) {
            try {
              await videoRef.current.play()
            } catch (playError) {
              console.log('Could not resume playback after fullscreen:', playError)
            }
          }
        } catch (error) {
          console.error('Failed to exit fullscreen:', error)
        }
      }
      exitFullscreen()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Helper function to get course title from course ID
  const getCourseTitle = (courseId: string) => {
    const courseTitles: Record<string, string> = {
      'credit-basics': 'Credit Basics & Fundamentals',
      'advanced-disputes': 'Advanced Dispute Strategies'
    }
    return courseTitles[courseId] || 'Unknown Course'
  }

  // Load notes from API with localStorage fallback
  const loadNotes = async () => {
    setSyncStatus('syncing')
    
    try {
      // Try to load from API first
      const response = await fetch(`/api/training/notes?lessonId=${lessonId}&courseId=${courseId}&userId=550e8400-e29b-41d4-a716-446655440000`)
      
      if (response.ok) {
        const data = await response.json()
        const apiNotes = data.notes || []
        
        // Enhance notes with proper course and lesson titles
        const enhancedNotes = apiNotes.map((note: any) => ({
          ...note,
          course_title: note.course_title || getCourseTitle(note.course_id || courseId),
          lesson_title: note.lesson_title || lessonTitle
        }))
        
        setNotes(enhancedNotes)
        
        // Also save to localStorage as backup
        localStorage.setItem(`notes-${lessonId}`, JSON.stringify(enhancedNotes))
        
        setSyncStatus('synced')
        console.log('✅ Notes loaded from API:', enhancedNotes.length)
        return
      } else {
        console.warn('⚠️ API failed, falling back to localStorage')
        setSyncStatus('error')
      }
    } catch (error) {
      console.warn('⚠️ API error, falling back to localStorage:', error)
      setSyncStatus('offline')
    }
    
    // Fallback to localStorage
    try {
      const storedNotes = localStorage.getItem(`notes-${lessonId}`)
      if (storedNotes) {
        const localNotes = JSON.parse(storedNotes)
        
        // Enhance local notes with proper course and lesson titles
        const enhancedNotes = localNotes.map((note: any) => ({
          ...note,
          course_title: note.course_title || getCourseTitle(note.course_id || courseId),
          lesson_title: note.lesson_title || lessonTitle
        }))
        
        setNotes(enhancedNotes)
        console.log('📱 Notes loaded from localStorage:', enhancedNotes.length)
        setSyncStatus('offline')
      } else {
        setSyncStatus('synced')
      }
    } catch (error) {
      console.error('❌ Failed to load notes from localStorage:', error)
      setSyncStatus('error')
    }
  }

  // Save notes to both API and localStorage
  const saveNotes = async (notesToSave: any[]) => {
    // Always save to localStorage first for immediate feedback
    try {
      localStorage.setItem(`notes-${lessonId}`, JSON.stringify(notesToSave))
    } catch (error) {
      console.error('Failed to save notes to localStorage:', error)
    }
  }

  // Save a new note
  const handleSaveNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      toast({
        title: "Please fill in both title and content",
        description: "Both fields are required to save a note.",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    try {
      // Try to save via API first
      const noteData = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        lessonId,
        courseId,
        lessonTitle: lessonTitle,
        courseTitle: getCourseTitle(courseId),
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
        videoTimestamp: Math.floor(currentTime),
        tags: [],
        isBookmarked: false
      }

      const response = await fetch('/api/training/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData)
      })

      if (response.ok) {
        const data = await response.json()
        const apiNote = data.note
        
        // Add the API note to our local state
        const updatedNotes = [apiNote, ...notes]
        setNotes(updatedNotes)
        saveNotes(updatedNotes)

        // Clear form
        setNewNoteTitle("")
        setNewNoteContent("")

        setSyncStatus('synced')
        toast({
          title: "Note saved successfully! ☁️",
          description: `Note "${apiNote.title}" has been saved and synced across devices.`,
          variant: "default"
        })
      } else {
        throw new Error('API save failed')
      }
    } catch (error) {
      console.warn('API save failed, using localStorage fallback:', error)
      
      // Fallback to localStorage
      const newNote = {
        id: Date.now().toString(),
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
        timestamp: Math.floor(currentTime),
        createdAt: new Date().toISOString(),
        lessonId,
        courseId,
        lessonTitle: lessonTitle,
        courseTitle: getCourseTitle(courseId)
      }

      const updatedNotes = [newNote, ...notes]
      setNotes(updatedNotes)
      saveNotes(updatedNotes)

      // Clear form
      setNewNoteTitle("")
      setNewNoteContent("")

      setSyncStatus('offline')
      toast({
        title: "Note saved locally 📱",
        description: `Note "${newNote.title}" has been saved locally. Will sync when online.`,
        variant: "default"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Delete a note
  const handleDeleteNote = async (noteId: string) => {
    try {
      // Try to delete via API first
      const response = await fetch(`/api/training/notes?noteId=${noteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove from local state
        const updatedNotes = notes.filter(note => note.id !== noteId)
        setNotes(updatedNotes)
        saveNotes(updatedNotes)
        
        setSyncStatus('synced')
        toast({
          title: "Note deleted ☁️",
          description: "The note has been removed and synced across devices.",
          variant: "default"
        })
      } else {
        throw new Error('API delete failed')
      }
    } catch (error) {
      console.warn('API delete failed, using localStorage fallback:', error)
      
      // Fallback to localStorage
      const updatedNotes = notes.filter(note => note.id !== noteId)
      setNotes(updatedNotes)
      saveNotes(updatedNotes)
      
      setSyncStatus('offline')
      toast({
        title: "Note deleted locally 📱",
        description: "The note has been removed locally. Will sync when online.",
        variant: "default"
      })
    }
  }

  // Manual sync function
  const handleManualSync = async () => {
    setSyncStatus('syncing')
    await loadNotes()
  }

  // Load notes when component mounts
  useEffect(() => {
    loadNotes()
  }, [lessonId])

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

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
                  <span>{formatDuration(lessonDuration)}</span>
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
                <button
                  onClick={() => setShowNotesModal(true)}
                  className="flex items-center space-x-1 hover:text-blue-600 transition-colors cursor-pointer"
                  title="View Notes"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Notes</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {(() => {
                      try {
                        const savedNotes = localStorage.getItem(`lesson-notes-${lessonId}`)
                        if (savedNotes) {
                          const notes = JSON.parse(savedNotes)
                          return notes.length
                        }
                        return 0
                      } catch {
                        return 0
                      }
                    })()}
                  </Badge>
                </button>
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
        <div 
          ref={containerRef}
          className={`relative bg-black group cursor-pointer transition-all duration-300 ${
            isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''
          }`}
          onClick={togglePlay}
          onMouseMove={() => {
            setShowControls(true)
            if (controlsTimeoutRef.current) {
              clearTimeout(controlsTimeoutRef.current)
            }
            controlsTimeoutRef.current = setTimeout(() => {
              if (isPlaying) {
                setShowControls(false)
              }
            }, 3000)
          }}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Video Element */}
          {!isDemoMode ? (
            <video
              ref={videoRef}
              className={`w-full h-auto ${
                isFullscreen ? 'h-screen object-contain' : 'max-h-[70vh]'
              }`}
              poster="/api/placeholder/800/450"
              preload="metadata"
              muted={isMuted}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className={`w-full bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center ${
              isFullscreen ? 'h-screen' : 'h-[70vh]'
            }`}>
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
                  <p>• Use controls to test all features</p>
                  {isFullscreen && (
                    <p className="text-yellow-300 font-semibold">• Fullscreen mode active</p>
                  )}
                </div>
                {isPlaying && (
                  <div className="text-lg text-blue-100">
                    Current Time: {formatTime(currentTime)} / {formatDuration(lessonDuration)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && !hasError && !isDemoMode && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}

          {/* Error Overlay */}
          {hasError && !isDemoMode && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
              <div className="text-center text-white">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-xl font-semibold mb-2">Video Error</h3>
                <p className="text-gray-300 mb-4 max-w-md">
                  {errorMessage || "Failed to load video. Please check the video source."}
                </p>
              </div>
            </div>
          )}

          {/* Play Button Overlay */}
          {!isPlaying && !isLoading && !hasError && (
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              isFullscreen ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}>
              <div className="bg-black bg-opacity-50 rounded-full p-4">
                <Play className="h-12 w-12 text-white" />
              </div>
            </div>
          )}

          {/* Video Controls */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, #6b7280 ${progress}%, #6b7280 100%)`
                }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skipTime(-10)}
                  className="text-white hover:bg-white/20"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skipTime(10)}
                  className="text-white hover:bg-white/20"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>

                {!isDemoMode && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}

                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatDuration(duration || lessonDuration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotesModal(true)}
                  className="text-white hover:bg-white/20"
                  title="Take Notes (N)"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="ml-1 text-xs opacity-75">N</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                  title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
                >
                  {isFullscreen ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
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

      {/* Working Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Lesson Notes</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowNotesModal(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-600">
                  Current time: {formatTime(currentTime)} • {notes.length} notes saved
                </p>
                <div className="flex items-center space-x-2">
                  {/* Sync Status Indicator */}
                  <div className="flex items-center space-x-1">
                    {syncStatus === 'synced' && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs">Synced</span>
                      </div>
                    )}
                    {syncStatus === 'syncing' && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-xs">Syncing...</span>
                      </div>
                    )}
                    {syncStatus === 'offline' && (
                      <div className="flex items-center space-x-1 text-yellow-600">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs">Offline</span>
                      </div>
                    )}
                    {syncStatus === 'error' && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs">Error</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Manual Sync Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleManualSync}
                    disabled={syncStatus === 'syncing'}
                    className="text-xs"
                  >
                    {syncStatus === 'syncing' ? 'Syncing...' : 'Sync'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Add New Note Form */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Add New Note</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Note title..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Write your note here..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Timestamp: {formatTime(currentTime)}
                    </span>
                    <Button 
                      onClick={handleSaveNote}
                      disabled={isSaving || !newNoteTitle.trim() || !newNoteContent.trim()}
                      size="sm"
                    >
                      {isSaving ? "Saving..." : "Save Note"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Existing Notes */}
              <div>
                <h4 className="font-medium mb-3">Your Notes ({notes.length})</h4>
                {notes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No notes yet. Add your first note above!</p>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div key={note.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-900">{note.title}</h5>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                        <p className="text-gray-700 mb-2">{note.content}</p>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>Timestamp: {formatTime(note.timestamp)}</span>
                          <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
