import { type NextRequest, NextResponse } from "next/server"

interface TestNotificationRequest {
  type: "email" | "sms" | "push" | "all"
  recipient: string
  message?: string
  priority?: "low" | "medium" | "high"
}

interface NotificationResult {
  id: string
  type: string
  status: "sent" | "failed" | "pending"
  recipient: string
  message: string
  timestamp: string
  deliveryTime?: number
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: TestNotificationRequest = await request.json()
    const { type, recipient, message, priority = "medium" } = body

    // Simulate notification sending
    const results: NotificationResult[] = []
    const timestamp = new Date().toISOString()

    const testMessage = message || "This is a test notification from your Credit Repair AI MLM system."

    const sendNotification = async (notificationType: string): Promise<NotificationResult> => {
      const id = `test-${notificationType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Simulate processing time
      const processingTime = Math.floor(Math.random() * 2000) + 500
      await new Promise((resolve) => setTimeout(resolve, processingTime))

      // Simulate success/failure (90% success rate)
      const isSuccess = Math.random() > 0.1

      if (isSuccess) {
        return {
          id,
          type: notificationType,
          status: "sent",
          recipient,
          message: testMessage,
          timestamp,
          deliveryTime: processingTime,
        }
      } else {
        return {
          id,
          type: notificationType,
          status: "failed",
          recipient,
          message: testMessage,
          timestamp,
          error: getRandomError(notificationType),
        }
      }
    }

    // Send notifications based on type
    if (type === "all") {
      const emailResult = await sendNotification("email")
      const smsResult = await sendNotification("sms")
      const pushResult = await sendNotification("push")
      results.push(emailResult, smsResult, pushResult)
    } else {
      const result = await sendNotification(type)
      results.push(result)
    }

    // Calculate summary stats
    const summary = {
      total: results.length,
      sent: results.filter((r) => r.status === "sent").length,
      failed: results.filter((r) => r.status === "failed").length,
      averageDeliveryTime:
        results.filter((r) => r.deliveryTime).reduce((sum, r) => sum + (r.deliveryTime || 0), 0) /
        results.filter((r) => r.deliveryTime).length,
    }

    return NextResponse.json({
      success: true,
      message: "Test notifications processed",
      results,
      summary,
      testInfo: {
        timestamp,
        recipient,
        priority,
        requestedType: type,
      },
    })
  } catch (error) {
    console.error("Test notification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send test notifications",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  // Return test notification templates and settings
  return NextResponse.json({
    success: true,
    templates: {
      email: {
        subject: "Test Email Notification - Credit Repair AI",
        body: "This is a test email notification from your Credit Repair AI MLM system. If you received this, your email notifications are working correctly.",
        format: "html",
      },
      sms: {
        body: "Test SMS from Credit Repair AI: Your notifications are working! Reply STOP to opt out.",
        maxLength: 160,
      },
      push: {
        title: "Credit Repair AI Test",
        body: "Test push notification - your notifications are configured correctly!",
        icon: "/icon-192x192.png",
      },
    },
    settings: {
      supportedTypes: ["email", "sms", "push"],
      maxRetries: 3,
      retryDelay: 5000,
      rateLimit: {
        email: 100, // per hour
        sms: 50, // per hour
        push: 1000, // per hour
      },
    },
    testScenarios: [
      {
        name: "Success Test",
        description: "Test successful notification delivery",
        successRate: 100,
      },
      {
        name: "Partial Failure Test",
        description: "Test with some notifications failing",
        successRate: 70,
      },
      {
        name: "High Volume Test",
        description: "Test notification system under load",
        volume: 100,
      },
      {
        name: "Priority Test",
        description: "Test high-priority notification delivery",
        priority: "high",
      },
    ],
  })
}

function getRandomError(type: string): string {
  const errors = {
    email: [
      "Invalid email address format",
      "SMTP server temporarily unavailable",
      "Recipient mailbox full",
      "Email blocked by spam filter",
      "Authentication failed",
    ],
    sms: [
      "Invalid phone number format",
      "SMS gateway timeout",
      "Insufficient SMS credits",
      "Number opted out of SMS",
      "Carrier rejected message",
    ],
    push: [
      "Device token expired",
      "Push service unavailable",
      "Invalid notification payload",
      "App not installed",
      "Notification permissions denied",
    ],
  }

  const typeErrors = errors[type as keyof typeof errors] || ["Unknown error"]
  return typeErrors[Math.floor(Math.random() * typeErrors.length)]
}
