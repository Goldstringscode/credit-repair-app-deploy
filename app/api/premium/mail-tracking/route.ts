import { type NextRequest, NextResponse } from "next/server"

interface PremiumTrackingEvent {
  id: string
  timestamp: string
  status: string
  location: string
  description: string
  details?: string
  isPremium?: boolean
  legalNote?: string
}

interface PremiumTrackingInfo {
  trackingNumber: string
  status: "pending" | "in_transit" | "delivered" | "failed" | "returned"
  estimatedDelivery: string
  actualDelivery?: string
  isPremium: boolean
  packageType: "attorney-reviewed" | "standard"
  legalStatus: "active" | "response_pending" | "resolved" | "escalated"
  recipient: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  sender: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  service: {
    type: string
    features: string[]
    cost: number
    premiumFeatures?: string[]
  }
  events: PremiumTrackingEvent[]
  legalTimeline: {
    disputeSent: string
    responseDeadline: string
    followUpDate?: string
    escalationDate?: string
  }
  metadata: {
    weight: string
    dimensions: string
    mailClass: string
    returnReceipt: boolean
    restrictedDelivery: boolean
    attorneyReviewed: boolean
    legalComplexity: string
  }
}

// Enhanced tracking database for premium services
const premiumTrackingDatabase: Record<string, PremiumTrackingInfo> = {
  "9405511206213414161238": {
    trackingNumber: "9405511206213414161238",
    status: "delivered",
    estimatedDelivery: "2024-01-25",
    actualDelivery: "2024-01-24",
    isPremium: true,
    packageType: "attorney-reviewed",
    legalStatus: "response_pending",
    recipient: {
      name: "Experian Information Solutions",
      address: "P.O. Box 4500",
      city: "Allen",
      state: "TX",
      zipCode: "75013",
    },
    sender: {
      name: "John Smith",
      address: "123 Main Street",
      city: "Dallas",
      state: "TX",
      zipCode: "75201",
    },
    service: {
      type: "Premium Certified Mail",
      features: ["Return Receipt", "Tracking", "Insurance", "Priority Processing"],
      cost: 28.75,
      premiumFeatures: ["Attorney Review", "Legal Strategy", "Priority Support", "Enhanced Tracking"],
    },
    events: [
      {
        id: "1",
        timestamp: "2024-01-24T14:30:00Z",
        status: "delivered",
        location: "ALLEN, TX 75013",
        description: "Delivered to Experian Dispute Department",
        details: "Delivered to authorized recipient at dispute processing center",
        isPremium: true,
        legalNote: "30-day response period begins. Credit bureau must investigate within federal timeline.",
      },
      {
        id: "2",
        timestamp: "2024-01-24T09:15:00Z",
        status: "out_for_delivery",
        location: "ALLEN, TX 75013",
        description: "Out for Priority Delivery",
        details: "Premium service - priority delivery route",
        isPremium: true,
      },
      {
        id: "3",
        timestamp: "2024-01-23T18:45:00Z",
        status: "in_transit",
        location: "DALLAS, TX 75201",
        description: "Priority Processing at USPS Facility",
        details: "Premium service expedited processing",
        isPremium: true,
      },
      {
        id: "4",
        timestamp: "2024-01-22T16:20:00Z",
        status: "accepted",
        location: "DALLAS, TX 75201",
        description: "Premium Attorney-Reviewed Mail Accepted",
        details: "Attorney-reviewed dispute letter accepted for premium processing",
        isPremium: true,
        legalNote: "Legal documentation verified and processed under attorney supervision",
      },
    ],
    legalTimeline: {
      disputeSent: "2024-01-24",
      responseDeadline: "2024-02-23",
      followUpDate: "2024-02-26",
      escalationDate: "2024-03-01",
    },
    metadata: {
      weight: "2.1 oz",
      dimensions: '9" x 12" x 0.5"',
      mailClass: "Priority Mail Express",
      returnReceipt: true,
      restrictedDelivery: true,
      attorneyReviewed: true,
      legalComplexity: "standard",
    },
  },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingNumber = searchParams.get("tracking")

    if (!trackingNumber) {
      return NextResponse.json({ error: "Tracking number is required" }, { status: 400 })
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const trackingInfo = premiumTrackingDatabase[trackingNumber]

    if (!trackingInfo) {
      return NextResponse.json(
        {
          error: "Premium tracking information not found",
          message: "The tracking number you entered is not valid or the premium service has not been processed yet.",
        },
        { status: 404 },
      )
    }

    // Calculate legal timeline status
    const now = new Date()
    const responseDeadline = new Date(trackingInfo.legalTimeline.responseDeadline)
    const daysUntilDeadline = Math.ceil((responseDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    const updatedTrackingInfo = {
      ...trackingInfo,
      lastUpdated: now.toISOString(),
      legalStatus: {
        ...trackingInfo.legalTimeline,
        daysUntilDeadline,
        isOverdue: daysUntilDeadline < 0,
        status: trackingInfo.legalStatus,
      },
      events: trackingInfo.events.map((event) => ({
        ...event,
        timestamp: event.timestamp,
        formattedTime: new Date(event.timestamp).toLocaleString(),
      })),
    }

    return NextResponse.json({
      success: true,
      data: updatedTrackingInfo,
      premiumFeatures: {
        attorneySupport: true,
        legalTimeline: true,
        priorityProcessing: true,
        enhancedTracking: true,
      },
    })
  } catch (error) {
    console.error("Premium tracking API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, trackingNumber, data } = body

    if (action === "schedule_followup") {
      // Schedule follow-up action for premium service
      const trackingInfo = premiumTrackingDatabase[trackingNumber]
      if (trackingInfo) {
        trackingInfo.legalTimeline.followUpDate = data.followUpDate

        return NextResponse.json({
          success: true,
          message: "Follow-up scheduled successfully",
          nextAction: "Attorney will review case and prepare follow-up documentation",
        })
      }
    }

    if (action === "escalate_case") {
      // Escalate case to legal team
      const trackingInfo = premiumTrackingDatabase[trackingNumber]
      if (trackingInfo) {
        trackingInfo.legalStatus = "escalated"
        trackingInfo.legalTimeline.escalationDate = new Date().toISOString().split("T")[0]

        return NextResponse.json({
          success: true,
          message: "Case escalated to legal team",
          nextSteps: [
            "Legal team will review case within 24 hours",
            "Attorney will prepare escalation documentation",
            "Client will be contacted with legal options",
            "Potential FCRA violation claim will be evaluated",
          ],
        })
      }
    }

    // Simulate premium tracking data with enhanced features
    const trackingData = {
      trackingNumber,
      status: "In Transit",
      location: "Dallas, TX Distribution Center",
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      isPremium: true,
      attorneyReviewed: true,
      legalTimeline: {
        disputeDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        responseExpected: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        escalationDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      },
      attorneySupport: {
        available: true,
        contactEmail: "legal@creditrepairai.com",
        nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      },
      events: [
        {
          date: new Date().toLocaleDateString(),
          time: "2:30 PM",
          status: "Processed at Origin",
          location: "Local Post Office",
          description: "Premium certified mail processed with attorney review documentation",
        },
        {
          date: new Date().toLocaleDateString(),
          time: "4:15 PM",
          status: "In Transit",
          location: "Dallas, TX Distribution Center",
          description: "Package in transit to destination facility",
        },
      ],
    }

    return NextResponse.json(trackingData)
  } catch (error) {
    console.error("Premium tracking action error:", error)
    return NextResponse.json({ error: "Failed to update tracking information" }, { status: 500 })
  }
}
