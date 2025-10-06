import { type NextRequest, NextResponse } from "next/server"
import { mlmDatabaseService } from "@/lib/mlm/database-service"
import { requireAuth } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limiter"

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      // Extract memberId from the URL path
      const url = new URL(request.url)
      const pathParts = url.pathname.split('/')
      const memberId = pathParts[pathParts.length - 1]
      
      if (!memberId) {
        return NextResponse.json({ 
          success: false,
          error: "Member ID is required" 
        }, { status: 400 })
      }

      // Get member details
      const member = await mlmDatabaseService.getMLMUser(memberId)
      if (!member) {
        return NextResponse.json({ 
          success: false,
          error: "Member not found" 
        }, { status: 404 })
      }

      // Get additional member details
      const teamStats = await mlmDatabaseService.getTeamStats(memberId, 30)
      const commissions = await mlmDatabaseService.getCommissions(memberId, 'monthly')
      const notifications = await mlmDatabaseService.getNotifications(memberId, true)

      // Get sponsor information
      let sponsor = null
      if (member.sponsorId) {
        sponsor = await mlmDatabaseService.getMLMUser(member.sponsorId)
      }

      const memberDetails = {
        id: member.userId,
        name: `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown User',
        email: member.email || '',
        phone: member.phone || '',
        location: member.location || '',
        rank: member.rank,
        status: member.status,
        joinDate: member.joinDate,
        personalVolume: member.personalVolume,
        teamVolume: member.teamVolume,
        totalEarnings: member.totalEarnings,
        currentMonthEarnings: member.currentMonthEarnings,
        lifetimeEarnings: member.lifetimeEarnings,
        activeDownlines: member.activeDownlines,
        totalDownlines: member.totalDownlines,
        directReferrals: teamStats.overview.directReferrals,
        sponsor: sponsor ? {
          id: sponsor.userId,
          name: `${sponsor.firstName || ''} ${sponsor.lastName || ''}`.trim() || 'Unknown',
          email: sponsor.email || '',
          rank: sponsor.rank.name
        } : null,
        teamStats: {
          totalMembers: teamStats.overview.totalMembers,
          activeMembers: teamStats.overview.activeMembers,
          newMembersThisMonth: teamStats.overview.newMembersThisMonth,
          retentionRate: teamStats.overview.retentionRate
        },
        recentCommissions: commissions.slice(0, 5),
        unreadNotifications: notifications.length,
        lastActivity: member.lastActivity,
        nextRankRequirement: member.nextRankRequirement
      }

      return NextResponse.json({
        success: true,
        data: memberDetails
      })
    } catch (error) {
      console.error("Member details fetch error:", error)
      return NextResponse.json({ 
        success: false,
        error: "Failed to fetch member details" 
      }, { status: 500 })
    }
  }),
  'general'
)
