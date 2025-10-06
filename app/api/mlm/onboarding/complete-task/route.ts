import { type NextRequest, NextResponse } from "next/server"
import { sendTaskCompletionEmail, sendTrainingCompletionEmail } from "@/lib/email-service-server"
import { mlmCommissionEngine } from "@/lib/mlm/commission-engine"

interface TaskCompletion {
  taskId: string
  userId?: string
  completedAt: string
  pointsAwarded: number
}

// Mock task database
const taskDefinitions = {
  "profile-setup": { points: 50, title: "Complete Your Profile" },
  "sponsor-connect": { points: 75, title: "Connect with Your Sponsor" },
  "welcome-bonus": { points: 100, title: "Claim Welcome Bonus" },
  "basic-training": { points: 150, title: "Complete Basic Training" },
  "marketing-materials": { points: 100, title: "Set Up Marketing Materials" },
  "first-referral": { points: 200, title: "Make Your First Referral" },
  "social-media": { points: 75, title: "Set Up Social Media Presence" },
  "advanced-training": { points: 150, title: "Advanced Sales Training" },
  "team-building": { points: 125, title: "Team Building Workshop" },
  "goal-setting": { points: 50, title: "Set 90-Day Goals" },
  "mentor-match": { points: 75, title: "Find a Mentor" },
  "first-sale": { points: 250, title: "Make Your First Sale" },
}

export async function POST(request: NextRequest) {
  try {
    const { taskId, userId = "user_123" } = await request.json()

    if (!taskId) {
      return NextResponse.json({ success: false, error: "Task ID is required" }, { status: 400 })
    }

    const taskDef = taskDefinitions[taskId as keyof typeof taskDefinitions]
    if (!taskDef) {
      return NextResponse.json({ success: false, error: "Invalid task ID" }, { status: 400 })
    }

    // In a real app, you would:
    // 1. Verify user authentication
    // 2. Check if task is already completed
    // 3. Validate task completion requirements
    // 4. Update user progress in database
    // 5. Award points and update rank if necessary
    // 6. Send notifications/emails
    // 7. Trigger any automation workflows

    const completion: TaskCompletion = {
      taskId,
      userId,
      completedAt: new Date().toISOString(),
      pointsAwarded: taskDef.points,
    }

    // Mock database save
    console.log("Task completed:", completion)

    // Check for rank advancement
    const rankAdvancement = await checkRankAdvancement(userId, taskId)

    // Send completion notification
    await sendTaskCompletionNotification(userId, taskDef.title, taskDef.points)

    // Send task completion email
    try {
      await sendTaskCompletionEmail({
        to: `user${userId}@example.com`, // In real app, get from user data
        name: `User ${userId}`, // In real app, get from user data
        taskName: taskDef.title,
        pointsEarned: taskDef.points,
        nextTask: getNextRecommendedTasks(taskId)[0] || "Continue your journey",
        dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/mlm/dashboard`
      })
    } catch (error) {
      console.log('📧 Could not send task completion email, continuing without email')
    }

    // Send training completion email for training tasks
    if (taskId.includes('training')) {
      try {
        await sendTrainingCompletionEmail({
          to: `user${userId}@example.com`, // In real app, get from user data
          name: `User ${userId}`, // In real app, get from user data
          courseName: taskDef.title,
          pointsEarned: taskDef.points,
          nextCourse: getNextRecommendedTasks(taskId)[0] || "Advanced Training",
          dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/mlm/dashboard`
        })
      } catch (error) {
        console.log('📧 Could not send training completion email, continuing without email')
      }
    }

    // Send rank advancement notification if applicable
    if (rankAdvancement.advanced && rankAdvancement.newRank) {
      await sendRankAdvancementNotification(userId, rankAdvancement.newRank, rankAdvancement.pointsNeeded || 0)
      
      // Process rank advancement with email
      try {
        await mlmCommissionEngine.processRankAdvancement(userId)
      } catch (error) {
        console.log('📧 Could not process rank advancement, continuing without rank advancement')
      }
    }

    // Update user statistics
    await updateUserStats(userId, taskDef.points)

    return NextResponse.json({
      success: true,
      completion,
      pointsAwarded: taskDef.points,
      rankAdvancement,
      message: `Congratulations! You've completed "${taskDef.title}" and earned ${taskDef.points} points!`,
      nextRecommendedTasks: getNextRecommendedTasks(taskId),
    })
  } catch (error) {
    console.error("Task completion error:", error)
    return NextResponse.json({ success: false, error: "Failed to complete task" }, { status: 500 })
  }
}

async function checkRankAdvancement(userId: string, completedTaskId: string) {
  // Mock rank advancement logic
  const rankThresholds = {
    Associate: 0,
    Consultant: 300,
    Manager: 750,
    Director: 1500,
    Executive: 3000,
  }

  // In a real app, calculate user's total points from database
  const mockUserPoints = 350 // This would come from database

  const currentRank = Object.entries(rankThresholds)
    .reverse()
    .find(([_, threshold]) => mockUserPoints >= threshold)?.[0]

  const nextRank = Object.entries(rankThresholds).find(([_, threshold]) => mockUserPoints < threshold)?.[0]

  if (completedTaskId === "first-referral" && mockUserPoints >= 300) {
    return {
      advanced: true,
      newRank: "Consultant",
      previousRank: "Associate",
      bonusAwarded: 100,
      message: "🎉 Congratulations! You've been promoted to Consultant rank!",
    }
  }

  return {
    advanced: false,
    currentRank,
    nextRank,
    pointsNeeded: nextRank ? rankThresholds[nextRank as keyof typeof rankThresholds] - mockUserPoints : 0,
  }
}

async function sendTaskCompletionNotification(userId: string, taskTitle: string, points: number) {
  // Import notification service dynamically to avoid circular dependencies
  const { notificationService } = await import('@/lib/notification-service')
  
  try {
    notificationService.addNotification({
      id: `task-completed-${Date.now()}`,
      type: 'success',
      title: "Task Completed! 🎉",
      message: `You've completed "${taskTitle}" and earned ${points} points! Keep up the great work!`,
      timestamp: new Date().toISOString(),
      data: { taskTitle, points }
    })
    
    console.log("MLM task completion notification sent successfully")
  } catch (error) {
    console.error("Failed to send MLM task completion notification:", error)
  }
}

async function sendRankAdvancementNotification(userId: string, newRank: string, pointsNeeded: number) {
  // Import notification service dynamically to avoid circular dependencies
  const { notificationService } = await import('@/lib/notification-service')
  
  try {
    await notificationService.notifyCustom(
      "Rank Advanced! 🏆",
      `Congratulations! You've advanced to ${newRank} rank! You're making great progress in your MLM journey.`,
      "success",
      "high",
      [
        {
          label: "View Rank",
          action: "view_mlm_rank",
          variant: "default"
        },
        {
          label: "View Leaderboard",
          action: "view_leaderboard",
          variant: "outline"
        }
      ]
    )
    
    console.log("MLM rank advancement notification sent successfully")
  } catch (error) {
    console.error("Failed to send MLM rank advancement notification:", error)
  }
}

async function updateUserStats(userId: string, pointsEarned: number) {
  // Mock user stats update
  const statsUpdate = {
    userId,
    pointsEarned,
    tasksCompleted: 1,
    lastActivity: new Date().toISOString(),
    streak: 1, // Days active in a row
  }

  console.log("Updating user stats:", statsUpdate)

  // In a real app, update user statistics in database
  return statsUpdate
}

function getNextRecommendedTasks(completedTaskId: string): string[] {
  // Task dependency logic
  const taskFlow = {
    "profile-setup": ["sponsor-connect", "basic-training"],
    "sponsor-connect": ["basic-training", "goal-setting"],
    "basic-training": ["marketing-materials", "first-referral"],
    "marketing-materials": ["social-media", "first-referral"],
    "first-referral": ["advanced-training", "team-building"],
    "welcome-bonus": ["profile-setup", "basic-training"],
  }

  return taskFlow[completedTaskId as keyof typeof taskFlow] || []
}

// Get user's onboarding progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "user_123"

    // Mock user progress data
    const progress = {
      userId,
      totalTasks: Object.keys(taskDefinitions).length,
      completedTasks: 3,
      totalPoints: Object.values(taskDefinitions).reduce((sum, task) => sum + task.points, 0),
      earnedPoints: 225,
      currentRank: "Associate",
      nextRank: "Consultant",
      daysActive: 2,
      completionPercentage: 25,
      completedTaskIds: ["profile-setup", "sponsor-connect", "welcome-bonus"],
      nextRecommendedTasks: ["basic-training", "first-referral"],
      achievements: [
        {
          id: "first_steps",
          title: "First Steps",
          description: "Completed your first onboarding task",
          icon: "🎯",
          unlockedAt: new Date().toISOString(),
        },
      ],
    }

    return NextResponse.json({
      success: true,
      progress,
    })
  } catch (error) {
    console.error("Progress fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch progress" }, { status: 500 })
  }
}
