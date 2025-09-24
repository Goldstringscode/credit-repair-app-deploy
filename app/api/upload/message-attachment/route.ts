import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Upload API: Received request');
    const formData = await request.formData()
    console.log('📤 Upload API: FormData keys:', Array.from(formData.keys()));
    const file = formData.get('file') as File
    console.log('📤 Upload API: File received:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      isFile: file instanceof File
    });

    if (!file) {
      console.error('📤 Upload API: No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'text/plain',
      'audio/webm',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/mpeg',
      'audio/mp4'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'File type not allowed. Allowed types: PDF, DOC, DOCX, JPG, PNG, GIF, TXT, WEBM, MP3, WAV, OGG, MP4' 
      }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'messages')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    const filePath = join(uploadsDir, uniqueFileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return file info
    const fileUrl = `/uploads/messages/${uniqueFileName}`
    
    return NextResponse.json({
      id: uuidv4(),
      url: fileUrl,
      name: file.name,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
