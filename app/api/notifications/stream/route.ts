import { type NextRequest } from "next/server"
import { isSupabaseAvailable, createSupabaseClient } from "@/lib/supabase"

// Mock user ID - in real app, get from auth context
const MOCK_USER_ID = "550e8400-e29b-41d4-a716-446655440000"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') || MOCK_USER_ID

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initialMessage = `data: ${JSON.stringify({
        type: 'connected',
        message: 'Connected to notification stream',
        timestamp: new Date().toISOString()
      })}\n\n`
      
      controller.enqueue(new TextEncoder().encode(initialMessage))

      // Set up periodic check for new notifications
      const checkInterval = setInterval(async () => {
        try {
          // Check if Supabase is available
          if (!isSupabaseAvailable()) {
            console.log('Supabase not available, sending mock heartbeat')
            
            // Send heartbeat when database is not available
            const heartbeatMessage = `data: ${JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date().toISOString(),
              message: 'Database not available, using mock mode'
            })}\n\n`
            
            controller.enqueue(new TextEncoder().encode(heartbeatMessage))
            return
          }

          const supabase = createSupabaseClient()
          const { data: newNotifications, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .eq('read', false)
            .order('created_at', { ascending: false })
            .limit(5)

          if (error) {
            console.error('Error fetching notifications:', error)
            return
          }

          // Send new notifications if any
          if (newNotifications && newNotifications.length > 0) {
            const notificationMessage = `data: ${JSON.stringify({
              type: 'new_notification',
              notifications: newNotifications.map(notification => ({
                id: notification.id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                priority: 'medium',
                timestamp: notification.created_at,
                read: notification.read,
                data: notification.data,
                actions: notification.actions
              }))
            })}\n\n`
            
            controller.enqueue(new TextEncoder().encode(notificationMessage))
          }

          // Send heartbeat every 30 seconds
          const heartbeatMessage = `data: ${JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString()
          })}\n\n`
          
          controller.enqueue(new TextEncoder().encode(heartbeatMessage))

        } catch (error) {
          console.error('Error in notification stream:', error)
          
          // Send error heartbeat
          const errorMessage = `data: ${JSON.stringify({
            type: 'error',
            message: 'Stream error occurred',
            timestamp: new Date().toISOString()
          })}\n\n`
          
          controller.enqueue(new TextEncoder().encode(errorMessage))
        }
      }, 5000) // Check every 5 seconds

      // Cleanup function
      const cleanup = () => {
        clearInterval(checkInterval)
        controller.close()
      }

      // Handle client disconnect
      request.signal.addEventListener('abort', cleanup)
      
      // Cleanup after 5 minutes to prevent memory leaks
      setTimeout(cleanup, 5 * 60 * 1000)
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}

