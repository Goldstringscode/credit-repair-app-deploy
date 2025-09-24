import { type NextRequest, NextResponse } from "next/server"
import {
  generateTaxReminders,
  getRemindersToSend,
  markReminderSent,
  markReminderCompleted,
  mockTaxReminders,
  defaultTaxReminderSettings,
} from "@/lib/tax-reminder-system"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const action = searchParams.get("action")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (action === "due-today") {
      const remindersToSend = getRemindersToSend(mockTaxReminders)
      return NextResponse.json({
        success: true,
        data: remindersToSend,
        count: remindersToSend.length,
      })
    }

    // Filter reminders for the user
    const userReminders = mockTaxReminders.filter((reminder) => reminder.userId === userId)

    return NextResponse.json({
      success: true,
      data: userReminders,
    })
  } catch (error) {
    console.error("Tax reminders fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch tax reminders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, reminderId, taxYear, estimatedQuarterlyPayment } = body

    if (action === "generate") {
      if (!userId || !taxYear) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      const settings = { ...defaultTaxReminderSettings, userId }
      const reminders = generateTaxReminders(userId, settings, taxYear, estimatedQuarterlyPayment)

      return NextResponse.json({
        success: true,
        message: `Generated ${reminders.length} tax reminders for ${taxYear}`,
        data: reminders,
      })
    }

    if (action === "mark-sent") {
      if (!reminderId) {
        return NextResponse.json({ error: "Reminder ID is required" }, { status: 400 })
      }

      const reminder = mockTaxReminders.find((r) => r.id === reminderId)
      if (!reminder) {
        return NextResponse.json({ error: "Reminder not found" }, { status: 404 })
      }

      const updatedReminder = markReminderSent(reminder)

      return NextResponse.json({
        success: true,
        message: "Reminder marked as sent",
        data: updatedReminder,
      })
    }

    if (action === "mark-completed") {
      if (!reminderId) {
        return NextResponse.json({ error: "Reminder ID is required" }, { status: 400 })
      }

      const reminder = mockTaxReminders.find((r) => r.id === reminderId)
      if (!reminder) {
        return NextResponse.json({ error: "Reminder not found" }, { status: 404 })
      }

      const updatedReminder = markReminderCompleted(reminder)

      return NextResponse.json({
        success: true,
        message: "Reminder marked as completed",
        data: updatedReminder,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Tax reminders action error:", error)
    return NextResponse.json({ error: "Failed to process tax reminder action" }, { status: 500 })
  }
}
