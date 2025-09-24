import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const envVars = {
      OPENAI_API_KEY: {
        exists: !!process.env.OPENAI_API_KEY,
        length: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
        preview: process.env.OPENAI_API_KEY 
          ? `${process.env.OPENAI_API_KEY.substring(0, 20)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 10)}`
          : 'Not set',
        isValid: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.startsWith('sk-') : false
      },
      DATABASE_URL: {
        exists: !!process.env.DATABASE_URL,
        length: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
        preview: process.env.DATABASE_URL 
          ? `${process.env.DATABASE_URL.substring(0, 30)}...`
          : 'Not set'
      },
      NEON_DATABASE_URL: {
        exists: !!process.env.NEON_DATABASE_URL,
        length: process.env.NEON_DATABASE_URL ? process.env.NEON_DATABASE_URL.length : 0,
        preview: process.env.NEON_DATABASE_URL 
          ? `${process.env.NEON_DATABASE_URL.substring(0, 30)}...`
          : 'Not set'
      },
      NEXT_PUBLIC_SUPABASE_URL: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        length: process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.length : 0,
        preview: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'
      },
      NODE_ENV: process.env.NODE_ENV || 'Not set',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Environment variables checked successfully',
      data: envVars
    });

  } catch (error) {
    console.error('Error checking environment variables:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error checking environment variables',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
