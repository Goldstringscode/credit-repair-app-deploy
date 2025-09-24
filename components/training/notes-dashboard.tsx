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
  TrendingUp,
  Bookmark
} from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"

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

interface NotesStats {
  totalNotes: number
  totalBookmarks: number
  notesThisWeek: number
  notesThisMonth: number
  mostUsedTags: { tag: string; count: number }[]
}

export function NotesDashboard() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [stats, setStats] = useState<NotesStats | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'title' | 'timestamp'>('created')
  const [isLoading, setIsLoading] = useState(true)
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])
  const [showExportOptions, setShowExportOptions] = useState(false)

  // Mock user ID - in real app, get from auth context
  const mockUserId = '550e8400-e29b-41d4-a716-446655440000'

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    loadNotes()
    loadStats()
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
        const rawNotes = data.notes || []
        
        // Enhance notes with proper course and lesson titles
        const enhancedNotes = rawNotes.map((note: Note) => ({
          ...note,
          course_title: note.course_title || getCourseTitle(note.course_id),
          lesson_title: note.lesson_title || getLessonTitle(note.lesson_id, note.course_id)
        }))
        
        setNotes(enhancedNotes)
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

  // Helper function to get course title from course ID
  const getCourseTitle = (courseId: string) => {
    const courseTitles: Record<string, string> = {
      'credit-basics': 'Credit Basics & Fundamentals',
      'advanced-disputes': 'Advanced Dispute Strategies'
    }
    return courseTitles[courseId] || 'Unknown Course'
  }

  // Helper function to get lesson title from lesson ID and course ID
  const getLessonTitle = (lessonId: string, courseId: string) => {
    // Import course lessons data
    const courseLessons: Record<string, any[]> = {
      'credit-basics': [
        { id: 'lesson-1', title: 'What is Credit?' },
        { id: 'lesson-2', title: 'Understanding Credit Scores' },
        { id: 'lesson-3', title: 'Credit Score Knowledge Check' },
        { id: 'lesson-4', title: 'Reading Your Credit Report' },
        { id: 'lesson-5', title: 'Credit Utilization Explained' },
        { id: 'lesson-6', title: 'Building Credit from Scratch' },
        { id: 'lesson-7', title: 'Common Credit Mistakes' },
        { id: 'lesson-8', title: 'Final Assessment' }
      ],
      'advanced-disputes': [
        { id: 'lesson-1', title: 'Advanced Dispute Strategies Overview' },
        { id: 'lesson-2', title: 'The 609 Method Explained' }
      ]
    }
    
    const lessons = courseLessons[courseId] || []
    const lesson = lessons.find(l => l.id === lessonId)
    return lesson?.title || 'Unknown Lesson'
  }

  const loadStats = async () => {
    try {
      // In a real app, this would call a stats API endpoint
      // For now, we'll calculate from the notes we have
      const response = await fetch(`/api/training/notes?userId=${mockUserId}`)
      if (response.ok) {
        const data = await response.json()
        const allNotes = data.notes || []
        
        const now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const stats: NotesStats = {
          totalNotes: allNotes.length,
          totalBookmarks: allNotes.filter(note => note.is_bookmarked).length,
          notesThisWeek: allNotes.filter(note => new Date(note.created_at) >= weekAgo).length,
          notesThisMonth: allNotes.filter(note => new Date(note.created_at) >= monthAgo).length,
          mostUsedTags: calculateMostUsedTags(allNotes)
        }
        
        setStats(stats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const calculateMostUsedTags = (notes: Note[]) => {
    const tagCounts: { [key: string]: number } = {}
    notes.forEach(note => {
      note.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
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

  const handleExportNotes = (notesToExport: Note[] = filteredNotes, filename?: string) => {
    const notesText = notesToExport.map(note => 
      `# ${note.title}\n\n${note.content}\n\nCourse: ${note.course_title || 'Unknown Course'}\nLesson: ${note.lesson_title || 'Unknown Lesson'}\nTimestamp: ${note.video_timestamp ? formatTimestamp(note.video_timestamp) : 'N/A'}\nTags: ${note.tags.join(', ')}\nCreated: ${new Date(note.created_at).toLocaleDateString()}\n\n---\n`
    ).join('\n')
    
    const blob = new Blob([notesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `notes-export-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`${notesToExport.length} note(s) exported successfully!`)
  }

  const handleExportIndividualNote = (note: Note) => {
    handleExportNotes([note], `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-note.txt`)
  }

  const handleExportSelectedNotes = () => {
    const selectedNotesData = filteredNotes.filter(note => selectedNotes.includes(note.id))
    if (selectedNotesData.length === 0) {
      toast.error("Please select notes to export")
      return
    }
    handleExportNotes(selectedNotesData, `selected-notes-${new Date().toISOString().split('T')[0]}.txt`)
    setSelectedNotes([])
  }

  const handleSelectAllNotes = () => {
    if (selectedNotes.length === filteredNotes.length) {
      setSelectedNotes([])
    } else {
      setSelectedNotes(filteredNotes.map(note => note.id))
    }
  }

  const handleSelectNote = (noteId: string) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    )
  }

  const handleMigrateNotes = async () => {
    try {
      const response = await fetch('/api/training/notes?action=migrate', {
        method: 'PATCH'
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success(`Successfully migrated ${data.migrated} notes!`)
        // Reload notes to show updated data
        loadNotes()
      } else {
        throw new Error('Migration failed')
      }
    } catch (error) {
      console.error('Error migrating notes:', error)
      toast.error("Failed to migrate notes. Please try again.")
    }
  }

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <BookOpen className="h-6 w-6 mr-2" />
            My Learning Notes
          </h1>
          <p className="text-gray-600 mt-1">Manage and organize your lesson notes across all courses</p>
        </div>
        <div className="flex space-x-2">
          {selectedNotes.length > 0 && (
            <Button onClick={handleExportSelectedNotes} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Selected ({selectedNotes.length})
            </Button>
          )}
          <Button onClick={() => setShowExportOptions(!showExportOptions)} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Options
          </Button>
          <Button onClick={() => handleExportNotes()} disabled={filteredNotes.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Export Options Panel */}
      {showExportOptions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Export Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => handleExportNotes()} 
                disabled={filteredNotes.length === 0}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Download className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Export All Notes</div>
                  <div className="text-xs text-gray-500">{filteredNotes.length} notes</div>
                </div>
              </Button>
              
              <Button 
                onClick={handleExportSelectedNotes}
                disabled={selectedNotes.length === 0}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Download className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Export Selected</div>
                  <div className="text-xs text-gray-500">{selectedNotes.length} selected</div>
                </div>
              </Button>
              
              <Button 
                onClick={handleSelectAllNotes}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Filter className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">
                    {selectedNotes.length === filteredNotes.length ? 'Deselect All' : 'Select All'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedNotes.length === filteredNotes.length ? 'Clear selection' : 'Select all notes'}
                  </div>
                </div>
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <Button 
                onClick={handleMigrateNotes}
                variant="outline"
                className="w-full"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Migrate Existing Notes
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Update existing notes with proper course and lesson names
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalNotes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Bookmarks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalBookmarks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.notesThisWeek}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.notesThisMonth}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
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
          <h2 className="text-lg font-semibold">
            Notes ({mounted ? filteredNotes.length : '...'})
          </h2>
          {filteredNotes.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExportNotes}>
              <Download className="h-4 w-4 mr-2" />
              Export Filtered
            </Button>
          )}
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
          filteredNotes.map(note => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedNotes.includes(note.id)}
                      onChange={() => handleSelectNote(note.id)}
                      className="mt-1 rounded border-gray-300"
                    />
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
                          <span>{note.lesson_title || 'Unknown Lesson'}</span>
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
                      onClick={() => handleExportIndividualNote(note)}
                      title="Export this note"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
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
          ))
        )}
      </div>
    </div>
  )
}
