import { type NextRequest, NextResponse } from "next/server"
import { mlmStripeService } from "@/lib/mlm/stripe-service"
import { mlmDatabaseService } from "@/lib/mlm/database-service"
import { mlmCommissionEngine } from "@/lib/mlm/commission-engine"
import { requireAuth } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limiter"

export const POST = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const body = await request.json()
      const { 
        userId, 
        payoutMethod = 'bank_account',
        minPayoutAmount = 50,
        commissionIds = []
      } = body

      const targetUserId = userId || user.id

      // Get user's pending commissions
      const pendingCommissions = await mlmDatabaseService.getCommissions(targetUserId)
        .then(commissions => 
          commissions.filter(c => c.status === 'pending' && c.amount >= minPayoutAmount)
        )

      if (pendingCommissions.length === 0) {
        return NextResponse.json({
          success: true,
          message: "No eligible commissions for payout",
          data: {
            eligibleCommissions: 0,
            totalAmount: 0,
            minPayoutAmount
          }
        })
      }

      // Calculate total payout amount
      const totalAmount = pendingCommissions.reduce((sum, c) => sum + c.amount, 0)
      const commissionIdsToProcess = commissionIds.length > 0 
        ? commissionIds 
        : pendingCommissions.map(c => c.id)

      // Process payout with Stripe
          const payout = await mlmStripeService.instance.processCommissionPayout({
        userId: targetUserId,
        amount: totalAmount,
        currency: 'USD',
        commissionIds: commissionIdsToProcess,
        payoutMethod
      })

      // Update commission statuses
      for (const commissionId of commissionIdsToProcess) {
        try {
          // In a real app, you would update the commission status in the database
          console.log(`Marking commission ${commissionId} as processing`)
        } catch (error) {
          console.error(`Error updating commission ${commissionId}:`, error)
        }
      }

      return NextResponse.json({
        success: true,
        message: "Payout processed successfully",
        data: {
          payoutId: payout.id,
          amount: totalAmount,
          currency: 'USD',
          method: payoutMethod,
          commissionCount: commissionIdsToProcess.length,
          status: 'processing',
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
        }
      })
    } catch (error) {
      console.error("Payout processing error:", error)
      return NextResponse.json({ 
        success: false,
        error: "Failed to process payout",
        details: (error as Error)?.message ?? 'Unknown error'
      }, { status: 500 })
    }
  }),
  'general'
)

// Automated payout processing (runs daily)
export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      // This endpoint would typically be called by a cron job
      // Process all eligible payouts for all users
      
      const eligibleUsers = await getEligibleUsersForPayout()
      const results = []

      for (const user of eligibleUsers) {
        try {
          const payout = await processUserPayout(user.id)
          results.push({
            userId: user.id,
            success: true,
            payoutId: payout.id,
            amount: payout.amount
          })
        } catch (error) {
          results.push({
            userId: user.id,
            success: false,
            error: (error as Error)?.message ?? 'Unknown error'
          })
        }
      }

      return NextResponse.json({
        success: true,
        message: "Automated payout processing completed",
        data: {
          processedUsers: results.length,
          successfulPayouts: results.filter(r => r.success).length,
          failedPayouts: results.filter(r => !r.success).length,
          results
        }
      })
    } catch (error) {
      console.error("Automated payout processing error:", error)
      return NextResponse.json({ 
        success: false,
        error: "Failed to process automated payouts" 
      }, { status: 500 })
    }
  }),
  'general'
)

// Helper functions
async function getEligibleUsersForPayout(): Promise<any[]> {
  try {
    const minPayoutAmount = 50
    const pendingCommissions = await mlmDatabaseService.getAllPendingCommissions()
    // Filter per-commission (matching processUserPayout which requires each commission to be >= threshold)
    const eligible = pendingCommissions.filter(c => c.amount >= minPayoutAmount)

    // Group by userId and sum pending amounts
    const userMap = new Map<string, number>()
    for (const commission of eligible) {
      const current = userMap.get(commission.userId) ?? 0
      userMap.set(commission.userId, current + commission.amount)
    }

    return Array.from(userMap.entries()).map(([id, pendingAmount]) => ({ id, pendingAmount }))
  } catch (error) {
    console.error('Error fetching eligible users for payout:', error)
    return []
  }
}

async function processUserPayout(userId: string): Promise<any> {
  // Process payout for a specific user
  const pendingCommissions = await mlmDatabaseService.getCommissions(userId)
    .then(commissions => 
      commissions.filter(c => c.status === 'pending' && c.amount >= 50)
    )

  if (pendingCommissions.length === 0) {
    throw new Error('No eligible commissions')
  }

  const totalAmount = pendingCommissions.reduce((sum, c) => sum + c.amount, 0)
  
  return await mlmStripeService.instance.processCommissionPayout({
    userId,
    amount: totalAmount,
    currency: 'USD',
    commissionIds: pendingCommissions.map(c => c.id),
    payoutMethod: 'bank_account'
  })
}
