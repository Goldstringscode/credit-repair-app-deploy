"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BookOpen, 
  Search, 
  Filter, 
  SortAsc, 
  Clock, 
  Edit3, 
  Trash2, 
  Download,
  Star,
  Tag,
  Calendar,
  Plus,
  ArrowLeft,
  CheckSquare,
  Square,
  Check
} from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  video_timestamp?: number
  is_bookmarked: boolean
  created_at: string
  updated_at: string
  lesson_id: string
  course_id: string
  lesson_title?: string
  course_title?: string
}

export default function AllNotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'title' | 'timestamp'>('created')
  const [isLoading, setIsLoading] = useState(true)
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false)
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])
  const [isSelectMode, setIsSelectMode] = useState(false)

  // Mock user ID - in real app, get from auth context
  const mockUserId = '550e8400-e29b-41d4-a716-446655440000'

  useEffect(() => {
    loadNotes()
  }, [])

  useEffect(() => {
    filterNotes()
  }, [notes, searchTerm, selectedTags, selectedCourse, sortBy, showBookmarkedOnly])

  const loadNotes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/training/notes?userId=${mockUserId}`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
      } else {
        console.error('Failed to load notes')
        toast.error("Failed to load notes")
      }
    } catch (error) {
      console.error('Error loading notes:', error)
      toast.error("Error loading notes")
    } finally {
      setIsLoading(false)
    }
  }

  const filterNotes = () => {
    let filtered = [...notes]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note =>
        selectedTags.some(tag => note.tags.includes(tag))
      )
    }

    // Apply course filter
    if (selectedCourse && selectedCourse !== "all") {
      filtered = filtered.filter(note => note.course_id === selectedCourse)
    }

    // Apply bookmarked filter
    if (showBookmarkedOnly) {
      filtered = filtered.filter(note => note.is_bookmarked)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'timestamp':
          return (b.video_timestamp || 0) - (a.video_timestamp || 0)
        default:
          return 0
      }
    })

    setFilteredNotes(filtered)
  }

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/training/notes?noteId=${noteId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          setNotes(prev => prev.filter(note => note.id !== noteId))
          toast.success("Note deleted successfully!")
        } else {
          throw new Error('Failed to delete note')
        }
      } catch (error) {
        console.error('Failed to delete note:', error)
        toast.error("Failed to delete note. Please try again.")
      }
    }
  }

  const handleExportNotes = () => {
    const notesText = filteredNotes.map(note => {
      const createdDate = note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Unknown'
      const updatedDate = note.updated_at ? new Date(note.updated_at).toLocaleDateString() : 'Unknown'
      const timestamp = note.video_timestamp ? formatTimestamp(note.video_timestamp) : 'N/A'
      
      return `# ${note.title}\n\n${note.content}\n\nCourse: ${note.course_title || 'Unknown'}\nLesson: ${note.lesson_title || 'Unknown'}\nTimestamp: ${timestamp}\nTags: ${note.tags.join(', ')}\nCreated: ${createdDate}\nUpdated: ${updatedDate}\n\n---\n`
    }).join('\n')
    
    const blob = new Blob([notesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `notes-export-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success("Notes exported successfully!")
  }

  const handleExportSelectedNotes = () => {
    if (selectedNotes.length === 0) {
      toast.error("Please select notes to export")
      return
    }

    const selectedNotesData = filteredNotes.filter(note => selectedNotes.includes(note.id))
    const notesText = selectedNotesData.map(note => {
      const createdDate = note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Unknown'
      const updatedDate = note.updated_at ? new Date(note.updated_at).toLocaleDateString() : 'Unknown'
      const timestamp = note.video_timestamp ? formatTimestamp(note.video_timestamp) : 'N/A'
      
      return `# ${note.title}\n\n${note.content}\n\nCourse: ${note.course_title || 'Unknown'}\nLesson: ${note.lesson_title || 'Unknown'}\nTimestamp: ${timestamp}\nTags: ${note.tags.join(', ')}\nCreated: ${createdDate}\nUpdated: ${updatedDate}\n\n---\n`
    }).join('\n')
    
    const blob = new Blob([notesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `selected-notes-export-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`${selectedNotes.length} selected notes exported successfully!`)
  }

  const handleDeleteSelectedNotes = async () => {
    if (selectedNotes.length === 0) {
      toast.error("Please select notes to delete")
      return
    }

    const confirmMessage = `Are you sure you want to delete ${selectedNotes.length} selected note${selectedNotes.length > 1 ? 's' : ''}? This action cannot be undone.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      // Delete each selected note
      const deletePromises = selectedNotes.map(noteId => 
        fetch(`/api/training/notes?noteId=${noteId}`, {
          method: 'DELETE'
        })
      )

      const results = await Promise.all(deletePromises)
      const failedDeletes = results.filter(response => !response.ok)

      if (failedDeletes.length > 0) {
        throw new Error(`${failedDeletes.length} notes failed to delete`)
      }

      // Remove deleted notes from state
      setNotes(prev => prev.filter(note => !selectedNotes.includes(note.id)))
      setSelectedNotes([])
      
      toast.success(`${selectedNotes.length} notes deleted successfully!`)
    } catch (error) {
      console.error('Failed to delete selected notes:', error)
      toast.error("Failed to delete some notes. Please try again.")
    }
  }

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Selection functions
  const toggleNoteSelection = (noteId: string) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    )
  }

  const selectAllNotes = () => {
    setSelectedNotes(filteredNotes.map(note => note.id))
  }

  const deselectAllNotes = () => {
    setSelectedNotes([])
  }

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode)
    if (isSelectMode) {
      setSelectedNotes([])
    }
  }

  const isAllSelected = filteredNotes.length > 0 && selectedNotes.length === filteredNotes.length
  const isPartiallySelected = selectedNotes.length > 0 && selectedNotes.length < filteredNotes.length

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)))
  const allCourses = Array.from(new Set(notes.map(note => note.course_id)))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading notes...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard/training')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <BookOpen className="h-8 w-8 mr-3" />
                All My Notes
              </h1>
              <p className="text-gray-600 mt-1">View, search, and manage all your learning notes</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant={isSelectMode ? "default" : "outline"} 
              onClick={toggleSelectMode}
            >
              {isSelectMode ? (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Exit Select
                </>
              ) : (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Select Notes
                </>
              )}
            </Button>
            <Button onClick={handleExportNotes} disabled={filteredNotes.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Bookmarks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{notes.filter(note => note.is_bookmarked).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {notes.filter(note => new Date(note.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {notes.filter(note => new Date(note.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SortAsc className="h-4 w-4 mr-2" />
                <span>Sort by</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Date Created</SelectItem>
                <SelectItem value="updated">Last Updated</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="timestamp">Video Time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <span>{selectedCourse !== 'all' ? 'Course Filtered' : 'All Courses'}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {allCourses.map(courseId => (
                  <SelectItem key={courseId} value={courseId}>
                    {notes.find(n => n.course_id === courseId)?.course_title || courseId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="bookmarked-only"
                checked={showBookmarkedOnly}
                onChange={(e) => setShowBookmarkedOnly(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="bookmarked-only" className="text-sm">Bookmarked Only</label>
            </div>
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Filter by Tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag) 
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      )
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">
              Notes ({filteredNotes.length})
            </h2>
            {isSelectMode && filteredNotes.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isAllSelected ? deselectAllNotes : selectAllNotes}
                >
                  {isAllSelected ? (
                    <>
                      <CheckSquare className="h-4 w-4 mr-1" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Square className="h-4 w-4 mr-1" />
                      Select All
                    </>
                  )}
                </Button>
                {selectedNotes.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedNotes.length} selected
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            {isSelectMode && selectedNotes.length > 0 && (
              <>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleExportSelectedNotes}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected ({selectedNotes.length})
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDeleteSelectedNotes}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedNotes.length})
                </Button>
              </>
            )}
            {filteredNotes.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleExportNotes}>
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            )}
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No notes found</p>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredNotes.map(note => (
              <Card key={note.id} className={`hover:shadow-md transition-shadow ${isSelectMode ? 'border-2 border-blue-200' : ''} ${selectedNotes.includes(note.id) ? 'border-blue-500 bg-blue-50' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {isSelectMode && (
                        <div className="flex items-center pt-1">
                          <button
                            onClick={() => toggleNoteSelection(note.id)}
                            className="flex items-center justify-center w-5 h-5 border-2 border-gray-300 rounded hover:border-blue-500 transition-colors"
                          >
                            {selectedNotes.includes(note.id) && (
                              <Check className="h-3 w-3 text-blue-600" />
                            )}
                          </button>
                        </div>
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          {note.title}
                          {note.is_bookmarked && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Bookmarked
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-3 w-3" />
                            <span>{note.course_title || 'Unknown Course'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{note.video_timestamp ? formatTimestamp(note.video_timestamp) : 'No timestamp'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // In a real app, this would open the note in edit mode
                          toast.info("Edit functionality would open the note editor")
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-700 mb-3 line-clamp-3">{note.content}</p>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
