"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Mic,
  MicOff,
  Brain,
  Play,
  Pause,
  Volume2,
  VolumeX,
  BookOpen,
  Award,
  Target,
  CheckCircle,
  Clock,
  Sparkles,
  Zap,
  MessageSquare,
  ArrowLeft,
  BookmarkIcon,
  Save,
  Trash2,
  Search,
  Calendar,
  Activity,
  Settings,
  Headphones,
  SkipForward,
  SkipBack,
} from "lucide-react"
import Link from "next/link"

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface VoiceModule {
  id: string
  title: string
  description: string
  duration: number
  difficulty: "beginner" | "intermediate" | "advanced"
  topics: string[]
  audioUrl?: string
  completed: boolean
  progress: number
  lessons: VoiceLesson[]
  quiz?: ModuleQuiz
}

interface VoiceLesson {
  id: string
  title: string
  content: string
  duration: number
  audioUrl?: string
  completed: boolean
  transcript?: string
}

interface ModuleQuiz {
  id: string
  questions: QuizQuestion[]
  score: number
  completed: boolean
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface VoiceNote {
  id: string
  title: string
  content: string
  timestamp: Date
  moduleId?: string
  lessonId?: string
}

interface Bookmark {
  id: string
  moduleId: string
  lessonId: string
  timestamp: number
  title: string
  note?: string
  createdAt: Date
}

const voiceModules: VoiceModule[] = [
  {
    id: "mlm-basics",
    title: "MLM Business Fundamentals",
    description: "Learn the core principles of multi-level marketing and network building",
    duration: 45,
    difficulty: "beginner",
    topics: ["MLM Structure", "Compensation Plans", "Team Building", "Legal Compliance"],
    completed: false,
    progress: 0,
    lessons: [
      {
        id: "lesson-1",
        title: "Understanding MLM Structure",
        content:
          "Multi-level marketing operates on a hierarchical structure where distributors earn from both direct sales and their team's sales...",
        duration: 15,
        completed: false,
        transcript:
          "In this lesson, we'll explore the fundamental structure of MLM businesses and how compensation flows through the network...",
      },
      {
        id: "lesson-2",
        title: "Compensation Plan Basics",
        content:
          "Learn about different types of compensation plans including binary, matrix, and unilevel structures...",
        duration: 15,
        completed: false,
        transcript:
          "Compensation plans are the backbone of any MLM business. Let's break down the most common types...",
      },
      {
        id: "lesson-3",
        title: "Building Your Foundation Team",
        content: "Strategies for recruiting and developing your first line of distributors...",
        duration: 15,
        completed: false,
        transcript:
          "Your foundation team will determine your long-term success. Here's how to build it right from the start...",
      },
    ],
    quiz: {
      id: "quiz-basics",
      score: 0,
      completed: false,
      questions: [
        {
          id: "q1",
          question: "What is the primary difference between MLM and traditional sales?",
          options: [
            "MLM only sells products online",
            "MLM involves building a team of distributors",
            "MLM products are always more expensive",
            "MLM doesn't require any sales skills",
          ],
          correctAnswer: 1,
          explanation:
            "MLM involves building and managing a team of distributors, creating multiple income streams through both personal sales and team commissions.",
        },
      ],
    },
  },
  {
    id: "sales-mastery",
    title: "Sales & Prospecting Mastery",
    description: "Advanced techniques for finding and converting prospects",
    duration: 60,
    difficulty: "intermediate",
    topics: ["Lead Generation", "Closing Techniques", "Objection Handling", "Follow-up Systems"],
    completed: false,
    progress: 0,
    lessons: [
      {
        id: "lesson-4",
        title: "Lead Generation Strategies",
        content: "Modern approaches to finding qualified prospects both online and offline...",
        duration: 20,
        completed: false,
        transcript:
          "Effective lead generation is the lifeblood of your MLM business. Let's explore proven strategies...",
      },
      {
        id: "lesson-5",
        title: "The Art of Closing",
        content: "Psychology-based closing techniques that feel natural and build trust...",
        duration: 20,
        completed: false,
        transcript: "Closing isn't about pressure tactics. It's about helping prospects make the right decision...",
      },
      {
        id: "lesson-6",
        title: "Handling Objections",
        content: "Common objections in MLM and how to address them professionally...",
        duration: 20,
        completed: false,
        transcript: "Objections are buying signals in disguise. Here's how to handle the most common ones...",
      },
    ],
    quiz: {
      id: "quiz-sales",
      score: 0,
      completed: false,
      questions: [
        {
          id: "q2",
          question: "What is the best response to the objection 'MLM is a pyramid scheme'?",
          options: [
            "Ignore the objection and change the subject",
            "Agree and move on to another prospect",
            "Explain the legal differences and focus on products/services",
            "Get defensive and argue with the prospect",
          ],
          correctAnswer: 2,
          explanation:
            "Address the concern directly by explaining the legal differences and emphasizing the legitimate products or services your company offers.",
        },
      ],
    },
  },
  {
    id: "leadership-development",
    title: "Leadership & Team Development",
    description: "Build and lead high-performing teams to success",
    duration: 55,
    difficulty: "advanced",
    topics: ["Team Motivation", "Training Systems", "Performance Management", "Culture Building"],
    completed: false,
    progress: 0,
    lessons: [
      {
        id: "lesson-7",
        title: "Motivating Your Team",
        content: "Psychology of motivation and how to inspire consistent action from your team...",
        duration: 18,
        completed: false,
        transcript:
          "Motivation comes from within, but as a leader, you can create the environment for it to flourish...",
      },
      {
        id: "lesson-8",
        title: "Creating Training Systems",
        content: "Develop duplicatable training systems that work at scale...",
        duration: 19,
        completed: false,
        transcript:
          "The key to building a large organization is having systems that work without your constant involvement...",
      },
      {
        id: "lesson-9",
        title: "Building Team Culture",
        content: "Foster a positive, success-oriented culture within your organization...",
        duration: 18,
        completed: false,
        transcript: "Culture eats strategy for breakfast. Here's how to build a winning culture in your team...",
      },
    ],
    quiz: {
      id: "quiz-leadership",
      score: 0,
      completed: false,
      questions: [
        {
          id: "q3",
          question: "What is the most important quality of an effective MLM leader?",
          options: [
            "Being the top earner in the team",
            "Having the most product knowledge",
            "Developing others to succeed",
            "Working the most hours",
          ],
          correctAnswer: 2,
          explanation:
            "The most effective leaders focus on developing others to succeed, creating a multiplication effect throughout the organization.",
        },
      ],
    },
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing for MLM",
    description: "Leverage online platforms to grow your network",
    duration: 50,
    difficulty: "intermediate",
    topics: ["Social Media Strategy", "Content Creation", "Online Prospecting", "Personal Branding"],
    completed: false,
    progress: 0,
    lessons: [
      {
        id: "lesson-10",
        title: "Social Media Strategy",
        content: "Build an effective social media presence that attracts prospects naturally...",
        duration: 17,
        completed: false,
        transcript: "Social media isn't about selling to everyone. It's about attracting the right people to you...",
      },
      {
        id: "lesson-11",
        title: "Content That Converts",
        content: "Create valuable content that builds trust and generates leads...",
        duration: 16,
        completed: false,
        transcript: "Content marketing is about providing value first. Here's how to create content that converts...",
      },
      {
        id: "lesson-12",
        title: "Personal Branding",
        content: "Develop a personal brand that stands out in the crowded MLM space...",
        duration: 17,
        completed: false,
        transcript: "Your personal brand is your most valuable asset. Let's build one that attracts success...",
      },
    ],
    quiz: {
      id: "quiz-digital",
      score: 0,
      completed: false,
      questions: [
        {
          id: "q4",
          question: "What should be the primary focus of your social media content in MLM?",
          options: [
            "Constantly posting about your products",
            "Sharing income claims and lifestyle posts",
            "Providing value and building relationships",
            "Copying successful distributors' content",
          ],
          correctAnswer: 2,
          explanation:
            "The most effective social media strategy focuses on providing value and building genuine relationships, which naturally leads to business opportunities.",
        },
      ],
    },
  },
]

export default function VoiceLearningPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Voice Recognition State
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [lastCommand, setLastCommand] = useState("")
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)

  // Learning State
  const [modules, setModules] = useState(voiceModules)
  const [selectedModule, setSelectedModule] = useState<VoiceModule | null>(null)
  const [currentLesson, setCurrentLesson] = useState<VoiceLesson | null>(null)
  const [currentQuiz, setCurrentQuiz] = useState<ModuleQuiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showQuizResults, setShowQuizResults] = useState(false)

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

  // Notes and Bookmarks
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isRecordingNote, setIsRecordingNote] = useState(false)
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        setVoiceSupported(true)
        recognitionRef.current = new SpeechRecognition()

        const recognition = recognitionRef.current
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"

        recognition.onstart = () => {
          console.log("🎤 Voice recognition started")
          setIsListening(true)
        }

        recognition.onresult = (event: any) => {
          let interimTranscript = ""
          let finalTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          setTranscript(interimTranscript || finalTranscript)

          if (finalTranscript) {
            console.log("🎤 Final transcript:", finalTranscript)
            processVoiceCommand(finalTranscript.toLowerCase().trim())
          }
        }

        recognition.onerror = (event: any) => {
          console.error("🎤 Speech recognition error:", event.error)
          setIsListening(false)
          if (event.error === "not-allowed") {
            toast({
              title: "Microphone Access Denied",
              description: "Please allow microphone access to use voice commands",
              variant: "destructive",
            })
          }
        }

        recognition.onend = () => {
          console.log("🎤 Voice recognition ended")
          setIsListening(false)
          // Auto-restart if voice is enabled
          if (voiceEnabled) {
            setTimeout(() => {
              try {
                recognition.start()
              } catch (error) {
                console.log("🎤 Recognition restart failed:", error)
              }
            }, 1000)
          }
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [voiceEnabled, toast])

  const processVoiceCommand = useCallback(
    (command: string) => {
      console.log("🎤 Processing command:", command)
      setLastCommand(command)

      // Module selection commands
      if (command.includes("select") || command.includes("choose") || command.includes("open")) {
        if (command.includes("basics") || command.includes("fundamental")) {
          setSelectedModule(modules[0])
          toast({ title: "Module Selected", description: "MLM Business Fundamentals" })
        } else if (command.includes("sales") || command.includes("prospecting")) {
          setSelectedModule(modules[1])
          toast({ title: "Module Selected", description: "Sales & Prospecting Mastery" })
        } else if (command.includes("leadership") || command.includes("team development")) {
          setSelectedModule(modules[2])
          toast({ title: "Module Selected", description: "Leadership & Team Development" })
        } else if (command.includes("digital") || command.includes("marketing")) {
          setSelectedModule(modules[3])
          toast({ title: "Module Selected", description: "Digital Marketing for MLM" })
        }
        return
      }

      // Learning control commands
      if (command.includes("start learning") || command.includes("begin module")) {
        if (selectedModule && selectedModule.lessons.length > 0) {
          setCurrentLesson(selectedModule.lessons[0])
          toast({ title: "Starting Module", description: selectedModule.lessons[0].title })
        } else {
          toast({ title: "No Module Selected", description: "Please select a module first" })
        }
        return
      }

      if (command.includes("next lesson")) {
        if (selectedModule && currentLesson) {
          const currentIndex = selectedModule.lessons.findIndex((l) => l.id === currentLesson.id)
          if (currentIndex < selectedModule.lessons.length - 1) {
            setCurrentLesson(selectedModule.lessons[currentIndex + 1])
            toast({ title: "Next Lesson", description: selectedModule.lessons[currentIndex + 1].title })
          } else {
            toast({ title: "Module Complete", description: "You've finished all lessons!" })
          }
        }
        return
      }

      if (command.includes("previous lesson")) {
        if (selectedModule && currentLesson) {
          const currentIndex = selectedModule.lessons.findIndex((l) => l.id === currentLesson.id)
          if (currentIndex > 0) {
            setCurrentLesson(selectedModule.lessons[currentIndex - 1])
            toast({ title: "Previous Lesson", description: selectedModule.lessons[currentIndex - 1].title })
          }
        }
        return
      }

      // Audio control commands
      if (command.includes("play audio") || command === "play" || command === "resume") {
        playAudio()
        return
      }

      if (command.includes("pause audio") || command === "pause" || command.includes("stop")) {
        pauseAudio()
        return
      }

      if (command.includes("skip forward") || command.includes("forward")) {
        skipForward()
        return
      }

      if (command.includes("skip back") || command.includes("backward")) {
        skipBackward()
        return
      }

      if (command.includes("speed up") || command.includes("faster")) {
        setPlaybackRate((prev) => Math.min(2, prev + 0.25))
        toast({ title: "Playback Speed", description: `${Math.min(2, playbackRate + 0.25)}x` })
        return
      }

      if (command.includes("slow down") || command.includes("slower")) {
        setPlaybackRate((prev) => Math.max(0.5, prev - 0.25))
        toast({ title: "Playback Speed", description: `${Math.max(0.5, playbackRate - 0.25)}x` })
        return
      }

      // Quiz commands
      if (command.includes("take quiz") || command.includes("start quiz")) {
        if (selectedModule && selectedModule.quiz) {
          setCurrentQuiz(selectedModule.quiz)
          setCurrentQuestionIndex(0)
          setShowQuizResults(false)
          toast({ title: "Quiz Started", description: `Quiz for ${selectedModule.title}` })
        } else {
          toast({ title: "No Quiz Available", description: "Select a module with a quiz first" })
        }
        return
      }

      if (command.includes("answer") && currentQuiz) {
        const answerMatch = command.match(/answer (\d+)/)
        if (answerMatch) {
          const answerIndex = Number.parseInt(answerMatch[1]) - 1
          handleQuizAnswer(answerIndex)
        }
        return
      }

      if (command.includes("next question") && currentQuiz) {
        if (currentQuestionIndex < currentQuiz.questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1)
        } else {
          setShowQuizResults(true)
          toast({ title: "Quiz Complete", description: `Score: ${currentQuiz.score}/${currentQuiz.questions.length}` })
        }
        return
      }

      if (command.includes("repeat question") && currentQuiz) {
        const currentQuestion = currentQuiz.questions[currentQuestionIndex]
        toast({ title: "Question", description: currentQuestion.question })
        return
      }

      // Note and bookmark commands
      if (command.includes("add bookmark") || command.includes("bookmark this")) {
        addBookmark()
        return
      }

      if (command.includes("start note") || command.includes("record note")) {
        setIsRecordingNote(true)
        toast({ title: "Recording Note", description: "Speak your note content" })
        return
      }

      if (command.includes("save note") && isRecordingNote) {
        saveNote()
        return
      }

      if (command.includes("help") || command.includes("commands")) {
        toast({
          title: "Voice Commands Available",
          description: "Check the Voice Control tab for all available commands",
        })
        return
      }

      console.log("🎤 Command not recognized:", command)
      toast({
        title: "Command Not Recognized",
        description: "Try saying 'help' for available commands",
      })
    },
    [selectedModule, currentLesson, currentQuiz, currentQuestionIndex, playbackRate, isRecordingNote, modules, toast],
  )

  const toggleVoiceRecognition = () => {
    if (!voiceSupported) {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive",
      })
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setVoiceEnabled(false)
    } else {
      setVoiceEnabled(true)
      try {
        recognitionRef.current?.start()
      } catch (error) {
        console.error("Failed to start recognition:", error)
        toast({
          title: "Voice Recognition Error",
          description: "Failed to start voice recognition",
          variant: "destructive",
        })
      }
    }
  }

  const playAudio = () => {
    setIsPlaying(true)
    audioRef.current?.play()
    toast({ title: "Audio Playing", description: currentLesson?.title || "Audio started" })
  }

  const pauseAudio = () => {
    setIsPlaying(false)
    audioRef.current?.pause()
    toast({ title: "Audio Paused", description: "Audio playback paused" })
  }

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 30
      toast({ title: "Skipped Forward", description: "30 seconds" })
    }
  }

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 30
      toast({ title: "Skipped Backward", description: "30 seconds" })
    }
  }

  const handleQuizAnswer = (answerIndex: number) => {
    if (!currentQuiz) return

    const currentQuestion = currentQuiz.questions[currentQuestionIndex]
    const isCorrect = answerIndex === currentQuestion.correctAnswer

    if (isCorrect) {
      setCurrentQuiz((prev) => (prev ? { ...prev, score: prev.score + 1 } : null))
      toast({ title: "Correct!", description: "Great job!" })
    } else {
      toast({
        title: "Incorrect",
        description: currentQuestion.explanation,
        variant: "destructive",
      })
    }

    // Auto-advance to next question after 2 seconds
    setTimeout(() => {
      if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
      } else {
        setShowQuizResults(true)
      }
    }, 2000)
  }

  const addBookmark = () => {
    if (!selectedModule || !currentLesson || !audioRef.current) {
      toast({ title: "Cannot Add Bookmark", description: "No audio playing" })
      return
    }

    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      moduleId: selectedModule.id,
      lessonId: currentLesson.id,
      timestamp: audioRef.current.currentTime,
      title: `${currentLesson.title} - ${Math.floor(audioRef.current.currentTime / 60)}:${(audioRef.current.currentTime % 60).toFixed(0).padStart(2, "0")}`,
      createdAt: new Date(),
    }

    setBookmarks((prev) => [newBookmark, ...prev])
    toast({ title: "Bookmark Added", description: newBookmark.title })
  }

  const saveNote = () => {
    if (!noteTitle && !noteContent) {
      toast({ title: "Empty Note", description: "Please add title or content" })
      return
    }

    const newNote: VoiceNote = {
      id: Date.now().toString(),
      title: noteTitle || `Note - ${new Date().toLocaleDateString()}`,
      content: noteContent || transcript,
      timestamp: new Date(),
      moduleId: selectedModule?.id,
      lessonId: currentLesson?.id,
    }

    setVoiceNotes((prev) => [newNote, ...prev])
    setIsRecordingNote(false)
    setNoteTitle("")
    setNoteContent("")
    toast({ title: "Note Saved", description: newNote.title })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-600 bg-green-50 border-green-200"
      case "intermediate":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "advanced":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const filteredNotes = voiceNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredBookmarks = bookmarks.filter((bookmark) =>
    bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/mlm/training" className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Back to Training Hub</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Voice Learning Center
                </span>
                <Sparkles className="h-6 w-6 text-purple-500" />
              </div>
            </div>

            {/* Voice Status */}
            <div className="flex items-center space-x-4">
              {voiceSupported ? (
                <div
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                    isListening
                      ? "bg-green-50 border-green-200"
                      : voiceEnabled
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isListening ? "bg-green-500 animate-pulse" : voiceEnabled ? "bg-yellow-500" : "bg-gray-400"
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {isListening ? "Listening..." : voiceEnabled ? "Voice Ready" : "Voice Off"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  <MicOff className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">Voice Not Supported</span>
                </div>
              )}

              <Button
                onClick={toggleVoiceRecognition}
                variant={voiceEnabled ? "default" : "outline"}
                disabled={!voiceSupported}
                className={voiceEnabled ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isListening ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
                {voiceEnabled ? "Voice On" : "Voice Off"}
              </Button>
            </div>
          </div>

          {/* Live Transcript */}
          {transcript && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Mic className="h-4 w-4 text-green-600 animate-pulse" />
                <span className="text-sm font-medium text-green-800">Live Transcript:</span>
              </div>
              <p className="text-green-700">&quot;{transcript}&quot;</p>
            </div>
          )}

          {/* Last Command */}
          {lastCommand && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Last Command:</span>
              </div>
              <p className="text-blue-700">&quot;{lastCommand}&quot;</p>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Overview */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500 to-blue-600 text-white">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Your Voice Learning Journey</h1>
                <p className="text-purple-100 mb-6">Master MLM skills through interactive voice-powered lessons</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-2xl font-bold">{modules.reduce((acc, m) => acc + m.duration, 0)}min</div>
                    <div className="text-purple-100 text-sm">Total Content</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-2xl font-bold">{modules.filter((m) => m.completed).length}</div>
                    <div className="text-purple-100 text-sm">Completed</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-4xl font-bold">
                      {Math.round((modules.filter((m) => m.completed).length / modules.length) * 100)}%
                    </div>
                    <div className="text-purple-100">Overall Progress</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{modules.length}</div>
                    <div className="text-purple-100 text-sm">Modules</div>
                  </div>
                </div>
                <Progress
                  value={(modules.filter((m) => m.completed).length / modules.length) * 100}
                  className="h-3 bg-purple-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="modules" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="voice-control">Voice Control</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Module Selection */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Available Modules
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {modules.map((module) => (
                        <div
                          key={module.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                            selectedModule?.id === module.id ? "border-purple-500 bg-purple-50" : "hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedModule(module)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-lg">{module.title}</h3>
                                <Badge className={`text-xs border ${getDifficultyColor(module.difficulty)}`}>
                                  {module.difficulty}
                                </Badge>
                                {module.completed && (
                                  <Badge className="bg-green-100 text-green-800 border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mb-3">{module.description}</p>

                              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {module.duration} min
                                </div>
                                <div className="flex items-center">
                                  <BookOpen className="h-4 w-4 mr-1" />
                                  {module.lessons.length} lessons
                                </div>
                                <div className="flex items-center">
                                  <Headphones className="h-4 w-4 mr-1" />
                                  Audio
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1 mb-3">
                                {module.topics.map((topic, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>

                              {module.progress > 0 && (
                                <div className="mb-3">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span>{module.progress}%</span>
                                  </div>
                                  <Progress value={module.progress} className="h-2" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedModule(module)
                                if (module.lessons.length > 0) {
                                  setCurrentLesson(module.lessons[0])
                                }
                              }}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Start Module
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (module.quiz) {
                                  setCurrentQuiz(module.quiz)
                                  setCurrentQuestionIndex(0)
                                  setShowQuizResults(false)
                                }
                              }}
                              disabled={!module.quiz}
                            >
                              <Award className="h-4 w-4 mr-1" />
                              Take Quiz
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Audio Player & Current Lesson */}
              <div className="space-y-6">
                {/* Audio Player */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Headphones className="h-5 w-5 mr-2" />
                      Audio Player
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentLesson ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h4 className="font-semibold mb-1">{currentLesson.title}</h4>
                          <div className="text-sm text-gray-600 mb-4">Duration: {currentLesson.duration} minutes</div>
                        </div>

                        <div className="flex items-center justify-center space-x-4">
                          <Button size="sm" variant="outline" onClick={skipBackward}>
                            <SkipBack className="h-4 w-4" />
                          </Button>

                          <Button onClick={isPlaying ? pauseAudio : playAudio} className="w-12 h-12 rounded-full">
                            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                          </Button>

                          <Button size="sm" variant="outline" onClick={skipForward}>
                            <SkipForward className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>
                              {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, "0")}
                            </span>
                            <span>{currentLesson.duration}:00</span>
                          </div>
                          <Progress value={(currentTime / (currentLesson.duration * 60)) * 100} className="h-2" />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => setIsMuted(!isMuted)}>
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </Button>
                          <div className="flex-1">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={isMuted ? 0 : volume}
                              onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          <div className="text-xs text-gray-600 w-8">{playbackRate}x</div>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={addBookmark}>
                            <BookmarkIcon className="h-4 w-4 mr-1" />
                            Bookmark
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setIsRecordingNote(true)}>
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Note
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Volume2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Select a module and lesson to start learning</p>
                        <p className="text-sm mt-2">Say &quot;select basics&quot; to get started</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Current Lesson Content */}
                {currentLesson && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2" />
                        Current Lesson
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">{currentLesson.title}</h4>
                          <p className="text-sm text-gray-600 mb-4">{currentLesson.content}</p>
                        </div>

                        {currentLesson.transcript && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h5 className="font-medium mb-2">Audio Transcript:</h5>
                            <p className="text-sm text-gray-700">{currentLesson.transcript}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {currentLesson.duration} minutes
                          </div>
                          {currentLesson.completed && (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Completed
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lesson Navigation */}
                {selectedModule && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Lessons
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedModule.lessons.map((lesson, index) => (
                          <div
                            key={lesson.id}
                            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                              currentLesson?.id === lesson.id
                                ? "bg-purple-50 border-purple-200"
                                : lesson.completed
                                  ? "bg-green-50 border-green-200"
                                  : "hover:bg-gray-50"
                            }`}
                            onClick={() => setCurrentLesson(lesson)}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  currentLesson?.id === lesson.id
                                    ? "bg-purple-500 text-white"
                                    : lesson.completed
                                      ? "bg-green-500 text-white"
                                      : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {lesson.completed ? <CheckCircle className="h-3 w-3" /> : index + 1}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{lesson.title}</div>
                                <div className="text-xs text-gray-500">{lesson.duration} min</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quiz" className="space-y-6">
            {!currentQuiz ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Module Quizzes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {modules
                      .filter((module) => module.quiz)
                      .map((module) => (
                        <div
                          key={module.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div>
                            <div className="font-medium">{module.title} Quiz</div>
                            <div className="text-sm text-gray-600">
                              {module.quiz?.questions.length} questions • Test your knowledge
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {module.quiz?.completed && (
                              <Badge className="bg-green-500">
                                Completed • Score: {module.quiz.score}/{module.quiz.questions.length}
                              </Badge>
                            )}
                            <Button
                              onClick={() => {
                                setSelectedModule(module)
                                setCurrentQuiz(module.quiz!)
                                setCurrentQuestionIndex(0)
                                setShowQuizResults(false)
                              }}
                            >
                              {module.quiz?.completed ? "Retake Quiz" : "Start Quiz"}
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ) : !showQuizResults ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Quiz in Progress
                    </div>
                    <Badge>
                      Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Progress
                      value={((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}
                      className="h-2"
                    />

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">{currentQuiz.questions[currentQuestionIndex].question}</h3>

                      <div className="grid gap-3">
                        {currentQuiz.questions[currentQuestionIndex].options.map((option, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="justify-start text-left h-auto p-4 bg-transparent"
                            onClick={() => handleQuizAnswer(index)}
                          >
                            <span className="font-semibold mr-3">{index + 1}.</span>
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <div>Say &quot;answer [number]&quot; or click an option</div>
                      <div>
                        Score: {currentQuiz.score}/{currentQuestionIndex}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Quiz Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-6xl font-bold text-blue-600">
                      {Math.round((currentQuiz.score / currentQuiz.questions.length) * 100)}%
                    </div>
                    <div className="text-xl">
                      You scored {currentQuiz.score} out of {currentQuiz.questions.length}
                    </div>
                    <div className="text-gray-600">
                      {currentQuiz.score === currentQuiz.questions.length
                        ? "Perfect score! Excellent work!"
                        : currentQuiz.score >= currentQuiz.questions.length * 0.8
                          ? "Great job! You have a solid understanding."
                          : currentQuiz.score >= currentQuiz.questions.length * 0.6
                            ? "Good effort! Review the material and try again."
                            : "Keep studying! You'll get it next time."}
                    </div>
                    <div className="flex justify-center space-x-4">
                      <Button
                        onClick={() => {
                          setCurrentQuiz(null)
                          setShowQuizResults(false)
                        }}
                      >
                        Back to Quizzes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentQuestionIndex(0)
                          setShowQuizResults(false)
                          setCurrentQuiz((prev) => (prev ? { ...prev, score: 0 } : null))
                        }}
                      >
                        Retake Quiz
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            {/* Note Recording Interface */}
            {isRecordingNote && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-800">
                    <Mic className="h-5 w-5 mr-2 animate-pulse" />
                    Recording Voice Note
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      placeholder="Note title..."
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder="Note content (or speak your note)..."
                      value={noteContent || transcript}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={4}
                    />
                    <div className="flex space-x-2">
                      <Button onClick={saveNote}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Note
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsRecordingNote(false)
                          setNoteTitle("")
                          setNoteContent("")
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setIsRecordingNote(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </div>

            {/* Notes List */}
            <div className="space-y-4">
              {filteredNotes.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Notes Yet</h3>
                    <p className="text-gray-500 mb-4">Start taking voice notes to capture important insights</p>
                    <Button onClick={() => setIsRecordingNote(true)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Create Your First Note
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredNotes.map((note) => (
                  <Card key={note.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{note.title}</h3>
                            {note.moduleId && (
                              <Badge variant="outline" className="text-xs">
                                {modules.find((m) => m.id === note.moduleId)?.title}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{note.content}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{note.timestamp.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setVoiceNotes((prev) => prev.filter((n) => n.id !== note.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Bookmarks List */}
            <div className="space-y-4">
              {filteredBookmarks.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BookmarkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Bookmarks Yet</h3>
                    <p className="text-gray-500 mb-4">
                      Add bookmarks while listening to audio lessons to save important moments
                    </p>
                    <p className="text-sm text-gray-400">Say &quot;add bookmark&quot; during audio playback</p>
                  </CardContent>
                </Card>
              ) : (
                filteredBookmarks.map((bookmark) => (
                  <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <BookmarkIcon className="h-4 w-4 text-blue-600" />
                            <h3 className="font-semibold">{bookmark.title}</h3>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            Module: {modules.find((m) => m.id === bookmark.moduleId)?.title}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            Lesson:{" "}
                            {
                              modules
                                .find((m) => m.id === bookmark.moduleId)
                                ?.lessons.find((l) => l.id === bookmark.lessonId)?.title
                            }
                          </div>
                          {bookmark.note && <p className="text-sm text-gray-700 mb-2">{bookmark.note}</p>}
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {Math.floor(bookmark.timestamp / 60)}:
                                {(bookmark.timestamp % 60).toFixed(0).padStart(2, "0")}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{bookmark.createdAt.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const trainingModule = modules.find((m) => m.id === bookmark.moduleId)
                              const lesson = trainingModule?.lessons.find((l) => l.id === bookmark.lessonId)
                              if (trainingModule && lesson) {
                                setSelectedModule(trainingModule)
                                setCurrentLesson(lesson)
                                // TODO: Seek to bookmark timestamp
                              }
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBookmarks((prev) => prev.filter((b) => b.id !== bookmark.id))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="voice-control" className="space-y-6">
            {/* Voice Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Voice Control Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Voice Recognition</span>
                      <Badge className={voiceSupported ? "bg-green-500" : "bg-red-500"}>
                        {voiceSupported ? "Supported" : "Not Supported"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Current Status</span>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isListening ? "bg-green-500 animate-pulse" : voiceEnabled ? "bg-yellow-500" : "bg-gray-400"
                          }`}
                        />
                        <span className="text-sm">
                          {isListening ? "Listening..." : voiceEnabled ? "Ready" : "Disabled"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Language</span>
                      <Badge variant="outline">English (US)</Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Last Command</label>
                      <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                        {lastCommand || "No commands yet"}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Live Transcript</label>
                      <div className="mt-1 p-2 bg-gray-50 rounded border text-sm min-h-[60px]">
                        {transcript || "Speak to see transcript..."}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Commands */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Available Voice Commands
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Module Selection</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Select basics&quot;</span>
                        <span className="text-gray-600">Open MLM Fundamentals</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Choose sales&quot;</span>
                        <span className="text-gray-600">Open Sales & Prospecting</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Select leadership&quot;</span>
                        <span className="text-gray-600">Open Leadership module</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Choose marketing&quot;</span>
                        <span className="text-gray-600">Open Digital Marketing</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Learning Control</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Start learning&quot;</span>
                        <span className="text-gray-600">Begin current module</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Next lesson&quot;</span>
                        <span className="text-gray-600">Move to next lesson</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Previous lesson&quot;</span>
                        <span className="text-gray-600">Go to previous lesson</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Take quiz&quot;</span>
                        <span className="text-gray-600">Start module quiz</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Audio Control</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Play audio&quot;</span>
                        <span className="text-gray-600">Start/resume playback</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Pause audio&quot;</span>
                        <span className="text-gray-600">Pause current audio</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Skip forward&quot;</span>
                        <span className="text-gray-600">Skip ahead 30 seconds</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Skip back&quot;</span>
                        <span className="text-gray-600">Skip back 30 seconds</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Speed up&quot;</span>
                        <span className="text-gray-600">Increase playback speed</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Slow down&quot;</span>
                        <span className="text-gray-600">Decrease playback speed</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Quiz Commands</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Answer 1&quot; / &quot;Answer 2&quot;</span>
                        <span className="text-gray-600">Select quiz answer</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Next question&quot;</span>
                        <span className="text-gray-600">Move to next question</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Repeat question&quot;</span>
                        <span className="text-gray-600">Repeat current question</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Notes & Bookmarks</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Add bookmark&quot;</span>
                        <span className="text-gray-600">Bookmark current position</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Start note&quot;</span>
                        <span className="text-gray-600">Begin recording note</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Save note&quot;</span>
                        <span className="text-gray-600">Save current note</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Help</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-blue-600">&quot;Help&quot; / &quot;Commands&quot;</span>
                        <span className="text-gray-600">Show available commands</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Voice Control Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <strong>Clear Speech:</strong> Speak clearly and at a normal pace for best recognition.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <strong>Quiet Environment:</strong> Use voice commands in a quiet environment for better accuracy.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <strong>Wait for Feedback:</strong> Wait for the system to process each command before speaking
                      again.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <strong>Use Exact Phrases:</strong> Use the exact command phrases shown above for best results.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <strong>Microphone Permission:</strong> Make sure to allow microphone access when prompted.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src="/audio/sample-lesson.mp3" type="audio/mpeg" />
        </audio>
      </div>
    </div>
  )
}
