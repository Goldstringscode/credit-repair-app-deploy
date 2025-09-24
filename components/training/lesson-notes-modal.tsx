'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Tag, Bookmark, Clock, Edit, Trash2, Plus, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export interface LessonNote {
  id: string
  lessonId: string
  courseId: string
  title: string
  content: string
  tags: string[]
  timestamp: string
  videoTimestamp: number
  isBookmarked: boolean
  createdAt: string
  updatedAt: string
}

interface LessonNotesModalProps {
  isOpen: boolean
  onClose: () => void
  lessonId: string
  courseId: string
  lessonTitle?: string
  currentVideoTime?: number
  onSaveNote?: (note: LessonNote) => void
  onUpdateNote?: (noteId: string, note: LessonNote) => void
  onDeleteNote?: (noteId: string) => void
}

export default function LessonNotesModal({
  isOpen,
  onClose,
  lessonId,
  courseId,
  lessonTitle = 'Lesson Notes',
  currentVideoTime = 0,
  onSaveNote,
  onUpdateNote,
  onDeleteNote
}: LessonNotesModalProps) {
  const [notes, setNotes] = useState<LessonNote[]>([])
  const [currentNote, setCurrentNote] = useState<Partial<LessonNote>>({
    title: '',
    content: '',
    tags: [],
    videoTimestamp: currentVideoTime,
    isBookmarked: false
  })
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('create')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [isSaving, setIsSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load existing notes from localStorage
  useEffect(() => {
    if (isOpen && lessonId && mounted) {
      const savedNotes = localStorage.getItem(`lesson-notes-${lessonId}`)
      if (savedNotes) {
        try {
          const parsedNotes = JSON.parse(savedNotes)
          setNotes(Array.isArray(parsedNotes) ? parsedNotes : [])
        } catch (error) {
          console.error('Failed to parse saved notes:', error)
          setNotes([])
        }
      } else {
        setNotes([])
      }
    }
  }, [isOpen, lessonId, mounted])

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (lessonId && mounted) {
      localStorage.setItem(`lesson-notes-${lessonId}`, JSON.stringify(notes))
    }
  }, [notes, lessonId, mounted])

  // Update current note timestamp when video time changes (but only if not currently editing)
  useEffect(() => {
    if (!editingNoteId && currentVideoTime !== undefined) {
      setCurrentNote(prev => ({
        ...prev,
        videoTimestamp: Math.floor(currentVideoTime)
      }))
    }
  }, [currentVideoTime, editingNoteId])

  // Focus title input when switching to create tab
  useEffect(() => {
    if (activeTab === 'create' && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [activeTab])

  const handleSaveNote = async () => {
    if (!currentNote.title?.trim() || !currentNote.content?.trim()) {
      toast.error("Please provide both title and content for your note")
      return
    }

    setIsSaving(true)
    
    try {
      if (editingNoteId) {
        // Update existing note
        const updatedNote: LessonNote = {
          ...notes.find(n => n.id === editingNoteId)!,
          title: currentNote.title!.trim(),
          content: currentNote.content!.trim(),
          tags: currentNote.tags || [],
          videoTimestamp: currentNote.videoTimestamp,
          isBookmarked: currentNote.isBookmarked || false,
          updatedAt: new Date().toISOString()
        }
        
        setNotes(prev => prev.map(n => n.id === editingNoteId ? updatedNote : n))
        onUpdateNote?.(editingNoteId, updatedNote)
        toast.success("Note updated successfully!")
        
      } else {
        // Create new note
        const newNote: LessonNote = {
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          lessonId,
          courseId,
          title: currentNote.title!.trim(),
          content: currentNote.content!.trim(),
          tags: currentNote.tags || [],
          timestamp: new Date().toISOString(),
          videoTimestamp: currentNote.videoTimestamp,
          isBookmarked: currentNote.isBookmarked || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        setNotes(prev => [newNote, ...prev])
        onSaveNote?.(newNote)
        toast.success("Note saved successfully!")
      }

      // Reset form
      setCurrentNote({
        title: '',
        content: '',
        tags: [],
        videoTimestamp: currentVideoTime,
        isBookmarked: false
      })
      setEditingNoteId(null)
      
      // Switch to view tab to show the saved note
      setActiveTab('view')
      
    } catch (error: unknown) {
      console.error('Failed to save note:', error)
      toast.error("Failed to save note. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      try {
        setNotes(prev => prev.filter(note => note.id !== noteId))
        onDeleteNote?.(noteId)
        toast.success("Note deleted successfully!")
      } catch (error: unknown) {
        console.error('Failed to delete note:', error)
        toast.error("Failed to delete note. Please try again.")
      }
    }
  }

  const handleEditNote = (note: LessonNote) => {
    setCurrentNote({
      title: note.title,
      content: note.content,
      tags: note.tags,
      videoTimestamp: note.videoTimestamp,
      isBookmarked: note.isBookmarked
    })
    setEditingNoteId(note.id)
    setActiveTab('create')
  }

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !currentNote.tags?.includes(trimmedTag)) {
      setCurrentNote(prev => ({
        ...prev,
        tags: [...(prev.tags || []), trimmedTag]
      }))
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setCurrentNote(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'title':
        return a.title.localeCompare(b.title)
      case 'timestamp':
        return (b.videoTimestamp || 0) - (a.videoTimestamp || 0)
      default:
        return 0
    }
  })

  if (!mounted) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ zIndex: 9999 }}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                {lessonTitle}
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                Take notes, add timestamps, and organize your learning
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Note</TabsTrigger>
            <TabsTrigger value="view">View Notes ({notes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="flex-1 space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="note-title">Note Title</Label>
                <Input
                  ref={titleInputRef}
                  id="note-title"
                  placeholder="Enter a descriptive title for your note..."
                  value={currentNote.title || ''}
                  onChange={(e) => setCurrentNote(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="note-content">Note Content</Label>
                <Textarea
                  ref={textareaRef}
                  id="note-content"
                  placeholder="Write your notes here... You can include key points, questions, or insights from the lesson."
                  value={currentNote.content || ''}
                  onChange={(e) => setCurrentNote(prev => ({ ...prev, content: e.target.value }))}
                  className="mt-1 min-h-[200px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentNote.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2 mt-2">
                  <Input
                    placeholder="Add a tag..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const input = e.target as HTMLInputElement
                        handleAddTag(input.value)
                        input.value = ''
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add a tag..."]') as HTMLInputElement
                      if (input && input.value.trim()) {
                        handleAddTag(input.value)
                        input.value = ''
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Video Time: {formatTime(currentNote.videoTimestamp || 0)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentNote(prev => ({ ...prev, isBookmarked: !prev.isBookmarked }))}
                    className={currentNote.isBookmarked ? 'text-yellow-600' : 'text-gray-500'}
                  >
                    <Bookmark className={`h-4 w-4 ${currentNote.isBookmarked ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveNote}
                  disabled={isSaving || !currentNote.title?.trim() || !currentNote.content?.trim()}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : editingNoteId ? 'Update Note' : 'Save Note'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="view" className="flex-1 space-y-4 mt-4">
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">By Title</option>
                  <option value="timestamp">By Video Time</option>
                </select>
              </div>
            </div>

            {/* Notes List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sortedNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No notes match your search.' : 'No notes yet. Create your first note!'}
                </div>
              ) : (
                sortedNotes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{note.title}</h3>
                          {note.isBookmarked && (
                            <Bookmark className="h-4 w-4 text-yellow-600 fill-current" />
                          )}
                        </div>
                        <p className="text-gray-700 mb-3 whitespace-pre-wrap">{note.content}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(note.videoTimestamp)}
                          </span>
                          <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>

                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {note.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditNote(note)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
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
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

