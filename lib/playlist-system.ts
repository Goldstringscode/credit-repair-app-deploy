export interface PlaylistVideo {
  id: string
  title: string
  description: string
  duration: number
  videoUrl: string
  thumbnailUrl: string
  transcript?: string
  chapters?: VideoChapter[]
  order: number
  isRequired: boolean
  prerequisites?: string[]
  tags: string[]
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  instructor: string
  createdAt: string
  updatedAt: string
}

export interface VideoChapter {
  id: string
  title: string
  timestamp: number
  duration: number
}

export interface Playlist {
  id: string
  title: string
  description: string
  type: "course" | "custom" | "favorites" | "team" | "certification"
  category: string
  thumbnailUrl: string
  videos: PlaylistVideo[]
  totalDuration: number
  totalVideos: number
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Mixed"
  tags: string[]
  isPublic: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
  enrollmentCount: number
  rating: number
  completionRate: number
  prerequisites?: string[]
  certificateAwarded?: boolean
}

export interface PlaylistProgress {
  playlistId: string
  userId: string
  videosCompleted: string[]
  currentVideoId: string
  overallProgress: number
  timeSpent: number
  startedAt: string
  lastAccessedAt: string
  completedAt?: string
  notes: { [videoId: string]: any[] }
  bookmarks: { [videoId: string]: any[] }
}

export interface PlaylistAnalytics {
  playlistId: string
  totalViews: number
  averageCompletionRate: number
  averageRating: number
  dropOffPoints: { videoId: string; percentage: number }[]
  engagementMetrics: {
    averageWatchTime: number
    replayRate: number
    notesTaken: number
    bookmarksCreated: number
  }
  popularVideos: { videoId: string; views: number; rating: number }[]
  userFeedback: {
    rating: number
    comment: string
    userId: string
    createdAt: string
  }[]
}

// Mock data for playlists
export const samplePlaylists: Playlist[] = [
  {
    id: "course-credit-fundamentals",
    title: "Credit Repair Fundamentals",
    description: "Complete foundation course covering all aspects of credit repair",
    type: "course",
    category: "Credit Repair",
    thumbnailUrl: "/placeholder.svg?height=200&width=300&text=Credit+Fundamentals",
    videos: [
      {
        id: "video-1",
        title: "Understanding Credit Scores",
        description: "Learn how credit scores are calculated and what factors affect them",
        duration: 1200, // 20 minutes
        videoUrl: "/videos/credit-scores.mp4",
        thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Credit+Scores",
        order: 1,
        isRequired: true,
        tags: ["credit score", "fundamentals", "FICO"],
        difficulty: "Beginner",
        instructor: "Sarah Johnson",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "video-2",
        title: "Reading Credit Reports",
        description: "How to read and interpret credit reports from all three bureaus",
        duration: 1800, // 30 minutes
        videoUrl: "/videos/credit-reports.mp4",
        thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Credit+Reports",
        order: 2,
        isRequired: true,
        prerequisites: ["video-1"],
        tags: ["credit report", "bureaus", "analysis"],
        difficulty: "Beginner",
        instructor: "Sarah Johnson",
        createdAt: "2024-01-16T10:00:00Z",
        updatedAt: "2024-01-16T10:00:00Z",
      },
      {
        id: "video-3",
        title: "Dispute Process Basics",
        description: "Step-by-step guide to disputing errors on credit reports",
        duration: 2400, // 40 minutes
        videoUrl: "/videos/dispute-process.mp4",
        thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Dispute+Process",
        order: 3,
        isRequired: true,
        prerequisites: ["video-1", "video-2"],
        tags: ["disputes", "process", "letters"],
        difficulty: "Intermediate",
        instructor: "Michael Chen",
        createdAt: "2024-01-17T10:00:00Z",
        updatedAt: "2024-01-17T10:00:00Z",
      },
    ],
    totalDuration: 5400, // 90 minutes
    totalVideos: 3,
    difficulty: "Beginner",
    tags: ["credit repair", "fundamentals", "course"],
    isPublic: true,
    createdBy: "admin",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-17T11:00:00Z",
    enrollmentCount: 1247,
    rating: 4.8,
    completionRate: 87,
    certificateAwarded: true,
  },
  {
    id: "course-advanced-sales",
    title: "Advanced Sales Techniques",
    description: "Master advanced sales strategies and closing techniques",
    type: "course",
    category: "Sales Training",
    thumbnailUrl: "/placeholder.svg?height=200&width=300&text=Advanced+Sales",
    videos: [
      {
        id: "video-4",
        title: "Psychology of Selling",
        description: "Understanding buyer psychology and decision-making processes",
        duration: 2100, // 35 minutes
        videoUrl: "/videos/sales-psychology.mp4",
        thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Sales+Psychology",
        order: 1,
        isRequired: true,
        tags: ["psychology", "sales", "buyer behavior"],
        difficulty: "Advanced",
        instructor: "Lisa Rodriguez",
        createdAt: "2024-01-20T10:00:00Z",
        updatedAt: "2024-01-20T10:00:00Z",
      },
      {
        id: "video-5",
        title: "Advanced Closing Techniques",
        description: "Proven closing techniques that convert prospects into clients",
        duration: 2700, // 45 minutes
        videoUrl: "/videos/closing-techniques.mp4",
        thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Closing+Techniques",
        order: 2,
        isRequired: true,
        prerequisites: ["video-4"],
        tags: ["closing", "techniques", "conversion"],
        difficulty: "Advanced",
        instructor: "David Kim",
        createdAt: "2024-01-21T10:00:00Z",
        updatedAt: "2024-01-21T10:00:00Z",
      },
    ],
    totalDuration: 4800, // 80 minutes
    totalVideos: 2,
    difficulty: "Advanced",
    tags: ["sales", "advanced", "techniques"],
    isPublic: true,
    createdBy: "admin",
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-01-21T11:00:00Z",
    enrollmentCount: 892,
    rating: 4.9,
    completionRate: 76,
    certificateAwarded: true,
  },
  {
    id: "custom-favorites",
    title: "My Favorite Training Videos",
    description: "Personal collection of most helpful training content",
    type: "favorites",
    category: "Personal",
    thumbnailUrl: "/placeholder.svg?height=200&width=300&text=Favorites",
    videos: [
      {
        id: "video-1",
        title: "Understanding Credit Scores",
        description: "Learn how credit scores are calculated and what factors affect them",
        duration: 1200,
        videoUrl: "/videos/credit-scores.mp4",
        thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Credit+Scores",
        order: 1,
        isRequired: false,
        tags: ["credit score", "fundamentals"],
        difficulty: "Beginner",
        instructor: "Sarah Johnson",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "video-4",
        title: "Psychology of Selling",
        description: "Understanding buyer psychology and decision-making processes",
        duration: 2100,
        videoUrl: "/videos/sales-psychology.mp4",
        thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Sales+Psychology",
        order: 2,
        isRequired: false,
        tags: ["psychology", "sales"],
        difficulty: "Advanced",
        instructor: "Lisa Rodriguez",
        createdAt: "2024-01-20T10:00:00Z",
        updatedAt: "2024-01-20T10:00:00Z",
      },
    ],
    totalDuration: 3300,
    totalVideos: 2,
    difficulty: "Mixed",
    tags: ["favorites", "personal"],
    isPublic: false,
    createdBy: "user-123",
    createdAt: "2024-01-25T14:00:00Z",
    updatedAt: "2024-01-25T14:30:00Z",
    enrollmentCount: 1,
    rating: 5.0,
    completionRate: 100,
  },
]

export const getPlaylistById = (id: string): Playlist | undefined => {
  return samplePlaylists.find((playlist) => playlist.id === id)
}

export const getPlaylistsByType = (type: Playlist["type"]): Playlist[] => {
  return samplePlaylists.filter((playlist) => playlist.type === type)
}

export const getPlaylistsByCategory = (category: string): Playlist[] => {
  return samplePlaylists.filter((playlist) => playlist.category === category)
}

export const searchPlaylists = (query: string): Playlist[] => {
  const lowercaseQuery = query.toLowerCase()
  return samplePlaylists.filter(
    (playlist) =>
      playlist.title.toLowerCase().includes(lowercaseQuery) ||
      playlist.description.toLowerCase().includes(lowercaseQuery) ||
      playlist.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
  )
}

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export const calculatePlaylistProgress = (playlist: Playlist, completedVideos: string[]): number => {
  if (playlist.videos.length === 0) return 0
  const completedCount = playlist.videos.filter((video) => completedVideos.includes(video.id)).length
  return Math.round((completedCount / playlist.videos.length) * 100)
}

export const getNextVideo = (playlist: Playlist, currentVideoId: string): PlaylistVideo | null => {
  const currentIndex = playlist.videos.findIndex((video) => video.id === currentVideoId)
  if (currentIndex === -1 || currentIndex === playlist.videos.length - 1) {
    return null
  }
  return playlist.videos[currentIndex + 1]
}

export const getPreviousVideo = (playlist: Playlist, currentVideoId: string): PlaylistVideo | null => {
  const currentIndex = playlist.videos.findIndex((video) => video.id === currentVideoId)
  if (currentIndex <= 0) {
    return null
  }
  return playlist.videos[currentIndex - 1]
}
