import { NextRequest, NextResponse } from 'next/server'
import { validateFile } from '@/lib/validation-schemas'

export const POST = async (request: NextRequest) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bureau = formData.get('bureau') as string
    
    if (!file) {
      return NextResponse.json({ 
        error: 'No file provided' 
      }, { status: 400 })
    }
    
    // Validate file
    const fileValidation = validateFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['application/pdf', 'text/plain', 'text/csv'],
      allowedExtensions: ['pdf', 'txt', 'csv']
    })
    
    if (!fileValidation.valid) {
      return NextResponse.json({ 
        error: 'File validation failed',
        message: fileValidation.error 
      }, { status: 400 })
    }
    
    // Validate bureau
    if (!['experian', 'equifax', 'transunion'].includes(bureau)) {
      return NextResponse.json({ 
        error: 'Invalid bureau' 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'File upload validation test passed',
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      bureau: bureau
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'File upload test failed',
      message: (error as Error)?.message ?? 'Unknown error'
    }, { status: 500 })
  }
}

