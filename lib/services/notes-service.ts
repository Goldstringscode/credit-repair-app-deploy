import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface LessonNote {
  id: string
  user_id: string
  lesson_id: string
  course_id: string
  title: string
  content: string
  tags: string[]
  video_timestamp?: number
  is_bookmarked: boolean
  created_at: string
  updated_at: string
}

export interface CreateNoteData {
  userId: string
  lessonId: string
  courseId: string
  title: string
  content: string
  tags?: string[]
  videoTimestamp?: number
  isBookmarked?: boolean
}

export interface UpdateNoteData {
  title?: string
  content?: string
  tags?: string[]
  videoTimestamp?: number
  isBookmarked?: boolean
}

export class NotesService {
  /**
   * Get all notes for a user, optionally filtered by lesson or course
   */
  async getUserNotes(userId: string, lessonId?: string, courseId?: string): Promise<LessonNote[]> {
    try {
      let query = supabase
        .from('lesson_notes')
        .select('*')
        .eq('user_id', userId)

      if (lessonId) {
        query = query.eq('lesson_id', lessonId)
      }

      if (courseId) {
        query = query.eq('course_id', courseId)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user notes:', error)
        throw new Error('Failed to fetch notes')
      }

      return data || []
    } catch (error) {
      console.error('NotesService.getUserNotes error:', error)
      throw error
    }
  }

  /**
   * Get a single note by ID
   */
  async getNoteById(noteId: string): Promise<LessonNote | null> {
    try {
      const { data, error } = await supabase
        .from('lesson_notes')
        .select('*')
        .eq('id', noteId)
        .single()

      if (error) {
        console.error('Error fetching note:', error)
        throw new Error('Failed to fetch note')
      }

      return data
    } catch (error) {
      console.error('NotesService.getNoteById error:', error)
      throw error
    }
  }

  /**
   * Create a new note
   */
  async createNote(noteData: CreateNoteData): Promise<LessonNote> {
    try {
      const { data, error } = await supabase
        .from('lesson_notes')
        .insert([{
          user_id: noteData.userId,
          lesson_id: noteData.lessonId,
          course_id: noteData.courseId,
          title: noteData.title.trim(),
          content: noteData.content.trim(),
          tags: noteData.tags || [],
          video_timestamp: noteData.videoTimestamp || null,
          is_bookmarked: noteData.isBookmarked || false
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating note:', error)
        throw new Error('Failed to create note')
      }

      return data
    } catch (error) {
      console.error('NotesService.createNote error:', error)
      throw error
    }
  }

  /**
   * Update an existing note
   */
  async updateNote(noteId: string, updates: UpdateNoteData): Promise<LessonNote> {
    try {
      const { data, error } = await supabase
        .from('lesson_notes')
        .update(updates)
        .eq('id', noteId)
        .select()
        .single()

      if (error) {
        console.error('Error updating note:', error)
        throw new Error('Failed to update note')
      }

      return data
    } catch (error) {
      console.error('NotesService.updateNote error:', error)
      throw error
    }
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('lesson_notes')
        .delete()
        .eq('id', noteId)

      if (error) {
        console.error('Error deleting note:', error)
        throw new Error('Failed to delete note')
      }
    } catch (error) {
      console.error('NotesService.deleteNote error:', error)
      throw error
    }
  }

  /**
   * Search notes by content, title, or tags
   */
  async searchNotes(userId: string, searchTerm: string): Promise<LessonNote[]> {
    try {
      const { data, error } = await supabase
        .from('lesson_notes')
        .select('*')
        .eq('user_id', userId)
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching notes:', error)
        throw new Error('Failed to search notes')
      }

      return data || []
    } catch (error) {
      console.error('NotesService.searchNotes error:', error)
      throw error
    }
  }

  /**
   * Get notes by tags
   */
  async getNotesByTags(userId: string, tags: string[]): Promise<LessonNote[]> {
    try {
      const { data, error } = await supabase
        .from('lesson_notes')
        .select('*')
        .eq('user_id', userId)
        .overlaps('tags', tags)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching notes by tags:', error)
        throw new Error('Failed to fetch notes by tags')
      }

      return data || []
    } catch (error) {
      console.error('NotesService.getNotesByTags error:', error)
      throw error
    }
  }

  /**
   * Get bookmarked notes for a user
   */
  async getBookmarkedNotes(userId: string): Promise<LessonNote[]> {
    try {
      const { data, error } = await supabase
        .from('lesson_notes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_bookmarked', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching bookmarked notes:', error)
        throw new Error('Failed to fetch bookmarked notes')
      }

      return data || []
    } catch (error) {
      console.error('NotesService.getBookmarkedNotes error:', error)
      throw error
    }
  }

  /**
   * Get notes statistics for a user
   */
  async getUserNotesStats(userId: string): Promise<{
    totalNotes: number
    totalBookmarks: number
    notesThisWeek: number
    notesThisMonth: number
    mostUsedTags: { tag: string; count: number }[]
  }> {
    try {
      // Get total notes and bookmarks
      const { data: notes, error: notesError } = await supabase
        .from('lesson_notes')
        .select('*')
        .eq('user_id', userId)

      if (notesError) {
        throw new Error('Failed to fetch notes for stats')
      }

      const totalNotes = notes?.length || 0
      const totalBookmarks = notes?.filter(note => note.is_bookmarked).length || 0

      // Calculate weekly and monthly counts
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const notesThisWeek = notes?.filter(note => 
        new Date(note.created_at) >= weekAgo
      ).length || 0

      const notesThisMonth = notes?.filter(note => 
        new Date(note.created_at) >= monthAgo
      ).length || 0

      // Calculate most used tags
      const tagCounts: { [key: string]: number } = {}
      notes?.forEach(note => {
        note.tags?.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      })

      const mostUsedTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return {
        totalNotes,
        totalBookmarks,
        notesThisWeek,
        notesThisMonth,
        mostUsedTags
      }
    } catch (error) {
      console.error('NotesService.getUserNotesStats error:', error)
      throw error
    }
  }

  /**
   * Export notes for a user (course or all)
   */
  async exportNotes(userId: string, courseId?: string): Promise<string> {
    try {
      const notes = await this.getUserNotes(userId, undefined, courseId)
      
      const exportData = notes.map(note => ({
        title: note.title,
        content: note.content,
        tags: note.tags.join(', '),
        timestamp: note.video_timestamp ? this.formatTimestamp(note.video_timestamp) : 'N/A',
        created: new Date(note.created_at).toLocaleDateString(),
        updated: new Date(note.updated_at).toLocaleDateString()
      }))

      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error('NotesService.exportNotes error:', error)
      throw error
    }
  }

  /**
   * Format timestamp from seconds to MM:SS format
   */
  private formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
}
