export interface BankVerification {
  id: string
  userId: string
  payoutMethodId: string
  status: "pending" | "deposits_sent" | "verification_pending" | "verified" | "failed"
  microDeposits: {
    amount1: number // in cents
    amount2: number // in cents
    sentAt: Date
    expiresAt: Date
  }
  attempts: number
  maxAttempts: number
  verifiedAt?: Date
  failedAt?: Date
  failureReason?: string
  createdAt: Date
}

export interface BankVerificationAttempt {
  id: string
  verificationId: string
  amount1: number
  amount2: number
  attemptedAt: Date
  success: boolean
  remainingAttempts: number
}

// Generate random micro-deposit amounts (1-99 cents)
export function generateMicroDepositAmounts(): { amount1: number; amount2: number } {
  const amount1 = Math.floor(Math.random() * 99) + 1
  let amount2 = Math.floor(Math.random() * 99) + 1

  // Ensure amounts are different
  while (amount2 === amount1) {
    amount2 = Math.floor(Math.random() * 99) + 1
  }

  return { amount1, amount2 }
}

// Initiate bank verification process
export async function initiateBankVerification(
  userId: string,
  payoutMethodId: string,
  bankDetails: {
    routingNumber: string
    accountNumber: string
    accountHolderName: string
  },
): Promise<BankVerification> {
  const microDeposits = generateMicroDepositAmounts()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days to verify

  const verification: BankVerification = {
    id: `bv_${Date.now()}`,
    userId,
    payoutMethodId,
    status: "deposits_sent",
    microDeposits: {
      ...microDeposits,
      sentAt: now,
      expiresAt,
    },
    attempts: 0,
    maxAttempts: 3,
    createdAt: now,
  }

  // In real implementation, would:
  // 1. Call ACH provider (Stripe, Plaid, etc.) to send micro-deposits
  // 2. Store verification record in database
  // 3. Send email notification to user

  console.log("Micro-deposits sent:", {
    amount1: microDeposits.amount1,
    amount2: microDeposits.amount2,
    bankDetails: {
      ...bankDetails,
      accountNumber: `****${bankDetails.accountNumber.slice(-4)}`,
    },
  })

  return verification
}

// Verify micro-deposit amounts
export function verifyMicroDeposits(
  verification: BankVerification,
  submittedAmount1: number,
  submittedAmount2: number,
): {
  success: boolean
  verification: BankVerification
  message: string
} {
  const now = new Date()

  // Check if verification has expired
  if (now > verification.microDeposits.expiresAt) {
    return {
      success: false,
      verification: {
        ...verification,
        status: "failed",
        failedAt: now,
        failureReason: "Verification expired",
      },
      message: "Verification period has expired. Please request new micro-deposits.",
    }
  }

  // Check if max attempts exceeded
  if (verification.attempts >= verification.maxAttempts) {
    return {
      success: false,
      verification: {
        ...verification,
        status: "failed",
        failedAt: now,
        failureReason: "Maximum attempts exceeded",
      },
      message: "Maximum verification attempts exceeded. Please add a new bank account.",
    }
  }

  const updatedVerification = {
    ...verification,
    attempts: verification.attempts + 1,
  }

  // Check if amounts match (allow either order)
  const correctAmounts =
    (submittedAmount1 === verification.microDeposits.amount1 &&
      submittedAmount2 === verification.microDeposits.amount2) ||
    (submittedAmount1 === verification.microDeposits.amount2 && submittedAmount2 === verification.microDeposits.amount1)

  if (correctAmounts) {
    return {
      success: true,
      verification: {
        ...updatedVerification,
        status: "verified",
        verifiedAt: now,
      },
      message: "Bank account verified successfully!",
    }
  } else {
    const remainingAttempts = verification.maxAttempts - updatedVerification.attempts
    return {
      success: false,
      verification: updatedVerification,
      message: `Incorrect amounts. You have ${remainingAttempts} attempt${remainingAttempts !== 1 ? "s" : ""} remaining.`,
    }
  }
}

// Mock verification data
export const mockBankVerifications: BankVerification[] = [
  {
    id: "bv_001",
    userId: "user_123",
    payoutMethodId: "pm_001",
    status: "verification_pending",
    microDeposits: {
      amount1: 32,
      amount2: 67,
      sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
    attempts: 1,
    maxAttempts: 3,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
]
