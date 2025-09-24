import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: 'OPENAI_API_KEY environment variable is not set',
          error: 'Missing API key'
        },
        { status: 400 }
      );
    }

    // Check if API key format is valid
    if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
      return NextResponse.json(
        {
          success: false,
          message: 'OPENAI_API_KEY format is invalid',
          error: 'Invalid API key format',
          keyPreview: `${process.env.OPENAI_API_KEY.substring(0, 10)}...`
        },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Test connection with a simple API call
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Respond with just the word 'SUCCESS' if you can read this message."
        }
      ],
      max_tokens: 10,
      temperature: 0
    });

    const response = completion.choices[0]?.message?.content?.trim();

    if (response === 'SUCCESS') {
      return NextResponse.json({
        success: true,
        message: 'OpenAI API connection successful',
        data: {
          model: completion.model,
          usage: completion.usage,
          response: response,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'OpenAI API responded but with unexpected content',
          error: 'Unexpected response',
          response: response,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('OpenAI connection test error:', error);
    
    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json(
        {
          success: false,
          message: 'OpenAI API authentication failed',
          error: 'Invalid API key',
          details: error.message || 'Authentication error'
        },
        { status: 401 }
      );
    }
    
    if (error?.status === 429) {
      return NextResponse.json(
        {
          success: false,
          message: 'OpenAI API rate limit exceeded',
          error: 'Rate limit',
          details: error.message || 'Too many requests'
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'OpenAI API connection failed',
        error: error?.message || 'Unknown error',
        details: error
      },
      { status: 500 }
    );
  }
}
