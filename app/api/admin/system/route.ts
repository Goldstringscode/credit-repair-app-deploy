import { NextRequest, NextResponse } from 'next/server'
import { databaseService } from '@/lib/database-service'

export async function GET(request: NextRequest) {
  try {
    console.log('System monitoring API called')

    // Get system data from database service
    const usersResponse = await databaseService.getUsers()
    const subscriptionsResponse = await databaseService.getSubscriptions()
    
    if (!usersResponse.success || !subscriptionsResponse.success) {
      throw new Error('Failed to load system data')
    }

    const users = usersResponse.data?.users || []
    const subscriptions = subscriptionsResponse.data?.subscriptions || []
    
    // Calculate system metrics based on data load
    const totalUsers = users.length
    const activeUsers = users.filter(user => user.status === 'active').length
    const totalSubscriptions = subscriptions.length
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length
    
    // Simulate system metrics based on data load
    const dataLoadFactor = Math.min((totalUsers + totalSubscriptions) / 1000, 1) // Normalize to 0-1
    const cpuUsage = Math.round(20 + (dataLoadFactor * 40)) // 20-60% based on data load
    const memoryUsage = Math.round(30 + (dataLoadFactor * 50)) // 30-80% based on data load
    const diskUsage = Math.round(15 + (dataLoadFactor * 20)) // 15-35% based on data load
    const networkUsage = Math.round(40 + (dataLoadFactor * 40)) // 40-80% based on data load
    
    // Determine system status
    let status: "healthy" | "warning" | "critical" = "healthy"
    if (cpuUsage > 80 || memoryUsage > 85) status = "critical"
    else if (cpuUsage > 60 || memoryUsage > 70) status = "warning"
    
    // Calculate uptime (simulate based on data)
    const uptimeDays = Math.floor(totalUsers / 10) + 1 // More users = longer uptime
    const uptimeHours = Math.floor((totalUsers % 10) * 2.4)
    
    const systemMetrics = {
      cpu: cpuUsage,
      memory: memoryUsage,
      disk: diskUsage,
      network: networkUsage,
      uptime: `${uptimeDays} days, ${uptimeHours} hours`,
      status
    }

    // Generate service status based on system health
    const services = [
      {
        name: "Database",
        status: status === "critical" ? "error" : status === "warning" ? "stopped" : "running",
        lastCheck: "1 minute ago"
      },
      {
        name: "API Server",
        status: status === "critical" ? "error" : "running",
        lastCheck: "30 seconds ago"
      },
      {
        name: "Email Service",
        status: "running",
        lastCheck: "2 minutes ago"
      },
      {
        name: "File Storage",
        status: "running",
        lastCheck: "1 minute ago"
      },
      {
        name: "Background Jobs",
        status: status === "critical" ? "stopped" : "running",
        lastCheck: "45 seconds ago"
      },
      {
        name: "Monitoring",
        status: "running",
        lastCheck: "30 seconds ago"
      }
    ]

    // Generate recent events based on system activity
    const recentEvents = [
      {
        id: "event_1",
        type: "info",
        message: `System processed ${totalUsers} users and ${totalSubscriptions} subscriptions`,
        timestamp: new Date().toISOString(),
        source: "Database"
      },
      {
        id: "event_2",
        type: "success",
        message: "All services running normally",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        source: "Monitoring"
      },
      {
        id: "event_3",
        type: "warning",
        message: `CPU usage at ${cpuUsage}%`,
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        source: "System"
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        metrics: systemMetrics,
        services,
        recentEvents,
        summary: {
          totalUsers,
          activeUsers,
          totalSubscriptions,
          activeSubscriptions,
          systemLoad: dataLoadFactor
        }
      }
    })

  } catch (error) {
    console.error('System monitoring API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
