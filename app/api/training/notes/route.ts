import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')
    const courseId = searchParams.get('courseId')
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
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

    const { data: notes, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      )
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

    // Enhance notes with proper course and lesson titles
    const enhancedNotes = (notes || []).map((note: any) => ({
      ...note,
      course_title: note.course_title || getCourseTitle(note.course_id),
      lesson_title: note.lesson_title || getLessonTitle(note.lesson_id, note.course_id)
    }))

    return NextResponse.json({ notes: enhancedNotes })
  } catch (error) {
    console.error('Error in GET /api/training/notes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/training/notes - Starting request processing')
    
    const body = await request.json()
    const { userId, lessonId, courseId, title, content, tags, videoTimestamp, isBookmarked } = body

    console.log('📝 POST /api/training/notes - Request body:', body)
    console.log('🔑 Environment check - SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET')
    console.log('🔑 Environment check - SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET')

    // Validation
    if (!userId || !lessonId || !courseId || !title || !content) {
      console.log('❌ Missing required fields:', { userId, lessonId, courseId, title, content })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const noteData = {
      user_id: userId,
      lesson_id: lessonId,
      course_id: courseId,
      title: title.trim(),
      content: content.trim(),
      tags: tags || [],
      video_timestamp: videoTimestamp || null,
      is_bookmarked: isBookmarked || false
    }

    console.log('📊 Attempting to insert note data:', noteData)
    console.log('🔌 Supabase client created, attempting database operation...')

    const supabase = getSupabaseClient()
    const { data: note, error } = await supabase
      .from('lesson_notes')
      .insert([noteData])
      .select()
      .single()

    console.log('📡 Supabase response - data:', note, 'error:', error)

    if (error) {
      console.error('Error creating note:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: 'Failed to create note', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error('💥 CRITICAL ERROR in POST /api/training/notes:', error)
    if (error instanceof Error) {
      console.error('💥 Error stack:', error.stack)
      console.error('💥 Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: 'Internal server error', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { noteId, updates } = body

    if (!noteId) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      )
    }

    // Only allow updating certain fields
    const allowedUpdates = ['title', 'content', 'tags', 'video_timestamp', 'is_bookmarked']
    const filteredUpdates: any = {}
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'title' || key === 'content') {
          filteredUpdates[key] = updates[key].trim()
        } else {
          filteredUpdates[key] = updates[key]
        }
      }
    })

    const supabase = getSupabaseClient()
    const { data: note, error } = await supabase
      .from('lesson_notes')
      .update(filteredUpdates)
      .eq('id', noteId)
      .select()
      .single()

    if (error) {
      console.error('Error updating note:', error)
      return NextResponse.json(
        { error: 'Failed to update note' },
        { status: 500 }
      )
    }

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Error in PUT /api/training/notes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('noteId')

    if (!noteId) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('lesson_notes')
      .delete()
      .eq('id', noteId)

    if (error) {
      console.error('Error deleting note:', error)
      return NextResponse.json(
        { error: 'Failed to delete note' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Note deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/training/notes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'migrate') {
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

      // Get all notes that need migration (missing course_title or lesson_title)
      const supabase = getSupabaseClient()
      const { data: notesToMigrate, error: fetchError } = await supabase
        .from('lesson_notes')
        .select('*')
        .or('course_title.is.null,lesson_title.is.null')

      if (fetchError) {
        console.error('Error fetching notes for migration:', fetchError)
        return NextResponse.json(
          { error: 'Failed to fetch notes for migration' },
          { status: 500 }
        )
      }

      // Update each note with proper titles
      const updatePromises = (notesToMigrate || []).map(async (note) => {
        const updates = {
          course_title: note.course_title || getCourseTitle(note.course_id),
          lesson_title: note.lesson_title || getLessonTitle(note.lesson_id, note.course_id)
        }

        return supabase
          .from('lesson_notes')
          .update(updates)
          .eq('id', note.id)
      })

      await Promise.all(updatePromises)

      return NextResponse.json({ 
        success: true, 
        migrated: notesToMigrate?.length || 0 
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in PATCH /api/training/notes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
