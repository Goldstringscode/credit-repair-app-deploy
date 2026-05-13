import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          message: 'Prompt is required',
          error: 'Missing prompt'
        },
        { status: 400 }
      );
    }

    // Check if API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: 'ANTHROPIC_API_KEY environment variable is not set',
          error: 'Missing API key'
        },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const openai = new Anthropic({ apiKey: anthropicApiKey });

    // Generate simple response
    const completion = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 50,
      temperature: 0.7
    });

    const response = response.content[0]?.type === 'text' ? response.content[0].text : null?.trim();

    return NextResponse.json({
      success: true,
      message: 'Text generation successful',
      data: {
        prompt: prompt,
        response: response,
        model: completion.model,
        usage: completion.usage,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Simple generation test error:', error);
    
    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json(
        {
          success: false,
          message: 'Anthropic API authentication failed',
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
          message: 'Anthropic API rate limit exceeded',
          error: 'Rate limit',
          details: error.message || 'Too many requests'
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Text generation failed',
        error: error?.message || 'Unknown error',
        details: error
      },
      { status: 500 }
    );
  }
}
