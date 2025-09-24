"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Play,
  Clock,
  Users,
  Star,
  BookOpen,
  Award,
  Edit,
  Trash2,
  Share,
  Download,
  Copy,
  MoreVertical,
  Grid,
  ListIcon,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Playlist } from "@/lib/playlist-system"
import { samplePlaylists, formatDuration, calculatePlaylistProgress } from "@/lib/playlist-system"

interface PlaylistManagerProps {
  onPlaylistSelect?: (playlist: Playlist) => void
  showCreateButton?: boolean
  viewMode?: "grid" | "list"
}

export function PlaylistManager({
  onPlaylistSelect,
  showCreateButton = true,
  viewMode = "grid",
}: PlaylistManagerProps) {
  const { toast } = useToast()

  // State
  const [playlists, setPlaylists] = useState<Playlist[]>(samplePlaylists)
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>(samplePlaylists)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [sortBy, setSortBy] = useState("updated")
  const [currentViewMode, setCurrentViewMode] = useState(viewMode)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [completedVideos, setCompletedVideos] = useState<{ [playlistId: string]: string[] }>({})

  // New playlist form
  const [newPlaylist, setNewPlaylist] = useState({
    title: "",
    description: "",
    type: "custom" as Playlist["type"],
    category: "",
    isPublic: false,
  })

  // Load completed videos from localStorage
  useEffect(() => {
    const loadCompletedVideos = () => {
      const completed: { [playlistId: string]: string[] } = {}
      playlists.forEach((playlist) => {
        try {
          const saved = localStorage.getItem(`playlist-progress-${playlist.id}`)
          if (saved) {
            const progress = JSON.parse(saved)
            completed[playlist.id] = progress.videosCompleted || []
          }
        } catch (error) {
          console.error(`Error loading progress for playlist ${playlist.id}:`, error)
        }
      })
      setCompletedVideos(completed)
    }
    loadCompletedVideos()
  }, [playlists])

  // Filter and sort playlists
  useEffect(() => {
    let filtered = [...playlists]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (playlist) =>
          playlist.title.toLowerCase().includes(query) ||
          playlist.description.toLowerCase().includes(query) ||
          playlist.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((playlist) => playlist.category === selectedCategory)
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((playlist) => playlist.type === selectedType)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case "rating":
          return b.rating - a.rating
        case "duration":
          return b.totalDuration - a.totalDuration
        case "popularity":
          return b.enrollmentCount - a.enrollmentCount
        default:
          return 0
      }
    })

    setFilteredPlaylists(filtered)
  }, [playlists, searchQuery, selectedCategory, selectedType, sortBy])

  const categories = Array.from(new Set(playlists.map((p) => p.category)))
  const types = Array.from(new Set(playlists.map((p) => p.type)))

  const handleCreatePlaylist = () => {
    if (!newPlaylist.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your playlist",
        variant: "destructive",
      })
      return
    }

    const playlist: Playlist = {
      id: `playlist-${Date.now()}`,
      title: newPlaylist.title,
      description: newPlaylist.description,
      type: newPlaylist.type,
      category: newPlaylist.category || "Custom",
      thumbnailUrl: "/placeholder.svg?height=200&width=300&text=Custom+Playlist",
      videos: [],
      totalDuration: 0,
      totalVideos: 0,
      difficulty: "Mixed",
      tags: [],
      isPublic: newPlaylist.isPublic,
      createdBy: "current-user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      enrollmentCount: 1,
      rating: 0,
      completionRate: 0,
    }

    setPlaylists([playlist, ...playlists])
    setShowCreateDialog(false)
    setNewPlaylist({
      title: "",
      description: "",
      type: "custom",
      category: "",
      isPublic: false,
    })

    toast({
      title: "Playlist Created",
      description: `"${playlist.title}" has been created successfully`,
    })
  }

  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter((p) => p.id !== playlistId))
    toast({
      title: "Playlist Deleted",
      description: "The playlist has been removed",
    })
  }

  const handleDuplicatePlaylist = (playlist: Playlist) => {
    const duplicated: Playlist = {
      ...playlist,
      id: `playlist-${Date.now()}`,
      title: `${playlist.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      enrollmentCount: 1,
    }

    setPlaylists([duplicated, ...playlists])
    toast({
      title: "Playlist Duplicated",
      description: `"${duplicated.title}" has been created`,
    })
  }

  const getPlaylistProgress = (playlistId: string): number => {
    const completed = completedVideos[playlistId] || []
    const playlist = playlists.find((p) => p.id === playlistId)
    return playlist ? calculatePlaylistProgress(playlist, completed) : 0
  }

  const PlaylistCard = ({ playlist }: { playlist: Playlist }) => {
    const progress = getPlaylistProgress(playlist.id)
    const isStarted = progress > 0

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative">
          <img
            src={playlist.thumbnailUrl || "/placeholder.svg"}
            alt={playlist.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg flex items-center justify-center">
            <Button
              size="lg"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              onClick={() => onPlaylistSelect?.(playlist)}
            >
              <Play className="h-6 w-6 text-white mr-2" />
              {isStarted ? "Continue" : "Start"} Playlist
            </Button>
          </div>
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-black/50 text-white">
              {playlist.type.charAt(0).toUpperCase() + playlist.type.slice(1)}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="ghost" className="bg-black/50 hover:bg-black/70 text-white">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="space-y-1">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Playlist
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleDuplicatePlaylist(playlist)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Separator />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600 hover:text-red-700"
                    onClick={() => handleDeletePlaylist(playlist.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg line-clamp-1">{playlist.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">{playlist.description}</p>
            </div>

            {progress > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{playlist.totalVideos} videos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(playlist.totalDuration)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{playlist.rating}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {playlist.difficulty}
                </Badge>
                {playlist.certificateAwarded && (
                  <Badge className="bg-yellow-500 text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    Certificate
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                <span>{playlist.enrollmentCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const PlaylistListItem = ({ playlist }: { playlist: Playlist }) => {
    const progress = getPlaylistProgress(playlist.id)
    const isStarted = progress > 0

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <img
              src={playlist.thumbnailUrl || "/placeholder.svg"}
              alt={playlist.title}
              className="w-24 h-16 object-cover rounded"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{playlist.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-1">{playlist.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {playlist.type}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {playlist.difficulty}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{playlist.totalVideos} videos</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(playlist.totalDuration)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{playlist.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{playlist.enrollmentCount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {progress > 0 && (
                    <div className="flex items-center space-x-2">
                      <Progress value={progress} className="w-20 h-2" />
                      <span className="text-xs text-gray-600">{progress}%</span>
                    </div>
                  )}
                  <Button size="sm" onClick={() => onPlaylistSelect?.(playlist)}>
                    <Play className="h-4 w-4 mr-1" />
                    {isStarted ? "Continue" : "Start"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Playlists</h1>
          <p className="text-gray-600 mt-1">Organize and track your learning journey</p>
        </div>
        {showCreateButton && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Playlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Playlist</DialogTitle>
                <DialogDescription>Create a custom playlist to organize your training videos</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newPlaylist.title}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, title: e.target.value })}
                    placeholder="Enter playlist title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                    placeholder="Describe your playlist"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select
                      value={newPlaylist.type}
                      onValueChange={(value: Playlist["type"]) => setNewPlaylist({ ...newPlaylist, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="favorites">Favorites</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Input
                      value={newPlaylist.category}
                      onChange={(e) => setNewPlaylist({ ...newPlaylist, category: e.target.value })}
                      placeholder="e.g., Sales Training"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePlaylist}>Create Playlist</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search playlists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Recently Updated</SelectItem>
                  <SelectItem value="created">Recently Created</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center border rounded-md">
                <Button
                  variant={currentViewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={currentViewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentViewMode("list")}
                  className="rounded-l-none"
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredPlaylists.length} of {playlists.length} playlists
        </span>
        <div className="flex items-center space-x-4">
          <span>Total Duration: {formatDuration(filteredPlaylists.reduce((acc, p) => acc + p.totalDuration, 0))}</span>
          <span>Total Videos: {filteredPlaylists.reduce((acc, p) => acc + p.totalVideos, 0)}</span>
        </div>
      </div>

      {/* Playlists Grid/List */}
      {currentViewMode === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlaylists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPlaylists.map((playlist) => (
            <PlaylistListItem key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}

      {filteredPlaylists.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Playlists Found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory !== "all" || selectedType !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first playlist to get started"}
            </p>
            {showCreateButton && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Playlist
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
