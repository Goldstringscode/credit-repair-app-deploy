import { NextRequest, NextResponse } from "next/server"
import { trainingService } from "@/lib/services/training-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const certificateId = searchParams.get("certificateId")

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      )
    }

    if (certificateId) {
      // Get specific certificate
      const certificate = await trainingService.getCertificateById(certificateId)
      
      if (!certificate) {
        return NextResponse.json(
          { success: false, error: "Certificate not found" },
          { status: 404 }
        )
      }

      // Verify user owns this certificate
      if (certificate.userId !== userId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized access to certificate" },
          { status: 403 }
        )
      }

      return NextResponse.json({
        success: true,
        data: { certificate }
      })
    } else {
      // Get all user certificates
      const certificates = await trainingService.getUserCertificates(userId)
      
      return NextResponse.json({
        success: true,
        data: {
          certificates,
          total: certificates.length
        }
      })
    }
  } catch (error) {
    console.error("Certificates API GET error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificate data" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, courseId } = body

    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: userId, courseId" },
        { status: 400 }
      )
    }

    const certificate = await trainingService.generateCertificate(userId, courseId)
    
    if (!certificate) {
      return NextResponse.json(
        { success: false, error: "Failed to generate certificate. Course may not be completed." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Certificate generated successfully",
      data: { certificate }
    })
  } catch (error) {
    console.error("Certificates API POST error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate certificate" },
      { status: 500 }
    )
  }
}
