import { NextRequest, NextResponse } from "next/server"
import { mlmDatabaseService } from "@/lib/mlm/database-service"
import { withRateLimit } from "@/lib/rate-limiter"
import { 
  sendWelcomeEmail, 
  sendTeamJoinEmail, 
  sendTeamCreationEmail,
  sendNewTeamMemberEmail 
} from "@/lib/email-service"
import { mlmNotificationService } from "@/lib/mlm-notification-service"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  return withRateLimit(async (req) => {
    try {
      const body = await req.json()
      const { firstName, lastName, email, phone, password, teamCode } = body

      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        return NextResponse.json({
          success: false,
          error: "First name, last name, email, and password are required"
        }, { status: 400 })
      }

      // Check if user already exists
      const existingUser = await mlmDatabaseService.getMLMUserByEmail(email)
      if (existingUser) {
        return NextResponse.json({
          success: false,
          error: "User with this email already exists"
        }, { status: 409 })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create user account first
      const userData = {
        firstName,
        lastName,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Create user in database
      const userId = await createUserAccount(userData)

      // Create MLM user with team assignment
      const mlmUser = await mlmDatabaseService.createMLMUserWithTeam({
        userId,
        ...userData
      }, teamCode)

      // Send appropriate email based on team assignment
      try {
        if (teamCode) {
          // User joined existing team - get sponsor info
          const teamInfo = await mlmDatabaseService.getTeamByCode(teamCode)
          const sponsorName = teamInfo?.sponsorName || 'Team Leader'
          
          // Send team join email to new member
          await sendTeamJoinEmail({
            to: email,
            name: `${firstName} ${lastName}`,
            teamCode: mlmUser.teamCode,
            sponsorName: sponsorName,
            dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/mlm/dashboard`
          })
          
          // Send new team member notification to sponsor
          if (teamInfo?.sponsorEmail) {
            await sendNewTeamMemberEmail({
              to: teamInfo.sponsorEmail,
              sponsorName: sponsorName,
              newMemberName: `${firstName} ${lastName}`,
              newMemberEmail: email,
              teamCode: mlmUser.teamCode,
              dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/mlm/dashboard`
            })
          }
        } else {
          // User created new team
          await sendTeamCreationEmail({
            to: email,
            name: `${firstName} ${lastName}`,
            teamCode: mlmUser.teamCode,
            dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/mlm/dashboard`
          })
        }
        
        // Always send welcome email
        await sendWelcomeEmail({
          to: email,
          name: `${firstName} ${lastName}`,
          teamCode: mlmUser.teamCode,
          dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/mlm/dashboard`
        })
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
        // Don't fail the request if email fails
      }

      // Send notifications
      try {
        if (teamCode) {
          // User joined existing team - send team join notification
          await mlmNotificationService.sendTeamJoinNotification(
            `${firstName} ${lastName}`,
            mlmUser.teamCode,
            50 // $50 referral bonus
          )
          
          // Send new member notification to sponsor
          if (teamInfo?.sponsorName) {
            await mlmNotificationService.sendNewMemberNotification(
              `${firstName} ${lastName}`,
              email,
              mlmUser.teamCode
            )
          }
        } else {
          // User created new team - send team creation notification
          await mlmNotificationService.sendTeamCreationNotification(
            mlmUser.teamCode,
            `${firstName} ${lastName}`
          )
        }
        
        // Always send welcome notification
        await mlmNotificationService.sendWelcomeNotification(
          `${firstName} ${lastName}`,
          mlmUser.teamCode
        )
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError)
        // Don't fail the request if notification fails
      }

      // Set authentication cookie for the new user
      const response = NextResponse.json({
        success: true,
        message: "MLM account created successfully",
        data: {
          userId,
          mlmUserId: mlmUser.id,
          teamCode: mlmUser.teamCode,
          isTeamLeader: !teamCode // If no team code provided, they're the team leader
        }
      })

      // Set a simple auth cookie for the MLM system
      response.cookies.set('mlm-auth', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      })

      return response
    } catch (error) {
      console.error('Error creating MLM account:', error)
      return NextResponse.json({
        success: false,
        error: "Failed to create MLM account"
      }, { status: 500 })
    }
  })(request)
}

async function createUserAccount(userData: any): Promise<string> {
  // In a real implementation, this would create a user in your users table
  // For now, we'll generate a mock user ID
  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  
  // In a real implementation, you would:
  // 1. Insert into users table
  // 2. Return the actual user ID from the database
  
  console.log('Creating user account:', {
    userId,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName
  })
  
  return userId
}
