import { NextRequest, NextResponse } from 'next/server';
import { communicationDatabaseService } from '@/lib/database/communication-service';
import { validateDatabaseConfig } from '@/lib/config/database';

export async function GET(request: NextRequest) {
  try {
    // Validate configuration
    validateDatabaseConfig();
    
    // Test database connection
    const startTime = Date.now();
    
    // Try to get channels (simple query to test connection)
    const channels = await communicationDatabaseService.getChannels();
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        responseTime: `${responseTime}ms`,
        channelsCount: channels.length,
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }, { status: 503 });
  }
}
