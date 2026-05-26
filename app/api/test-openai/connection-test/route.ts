import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function GET() {
  try {
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

    // Check if API key format is valid
    if (!process.env.ANTHROPIC_API_KEY.startsWith('sk-')) {
      return NextResponse.json(
        {
          success: false,
          message: 'ANTHROPIC_API_KEY format is invalid',
          error: 'Invalid API key format',
          keyPreview: `${process.env.ANTHROPIC_API_KEY.substring(0, 10)}...`
        },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const openai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Test connection with a simple API call
    const completion = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      messages: [
        {
          role: "user",
          content: "Respond with just the word 'SUCCESS' if you can read this message."
        }
      ],
      max_tokens: 10,
      temperature: 0
    });

    const response = response.content[0]?.type === 'text' ? response.content[0].text : null?.trim();

    if (response === 'SUCCESS') {
      return NextResponse.json({
        success: true,
        message: 'Anthropic API connection successful',
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
          message: 'Anthropic API responded but with unexpected content',
          error: 'Unexpected response',
          response: response,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Anthropic connection test error:', error);
    
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
        message: 'Anthropic API connection failed',
        error: error?.message || 'Unknown error',
        details: error
      },
      { status: 500 }
    );
  }
}
