import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if environment variables exist
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        message: "Missing Supabase environment variables",
        details: `Missing: ${!supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL " : ""}${!supabaseServiceKey ? "SUPABASE_SERVICE_ROLE_KEY" : ""}`.trim(),
      })
    }

    // Validate URL format
    if (!supabaseUrl.startsWith("https://") || !supabaseUrl.includes(".supabase.co")) {
      return NextResponse.json({
        success: false,
        message: "Invalid Supabase URL format",
        details: "URL should be in format: https://your-project-id.supabase.co",
      })
    }

    // Test connection
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // First, try to query the users table to see if it exists
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .limit(1)

    if (error) {
      // Check if it's a table not found error
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        return NextResponse.json({
          success: false,
          message: "Database schema not set up",
          details: "Run the database schema in Supabase SQL Editor to create required tables. The 'users' table does not exist.",
        })
      }

      // Check for permission errors
      if (error.message.includes("permission denied") || error.message.includes("RLS")) {
        return NextResponse.json({
          success: false,
          message: "Database permission issue",
          details: "Row Level Security (RLS) may be blocking access. This is normal - the connection works but RLS policies need user authentication.",
        })
      }

      return NextResponse.json({
        success: false,
        message: "Database connection failed",
        details: error.message,
      })
    }

    // If we get here, the connection and table access worked
    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      details: "Database is accessible and the users table exists. Connection is working properly!",
    })

  } catch (error) {
    // Handle any other errors
    if (error instanceof Error) {
      // Check for network/connection errors
      if (error.message.includes("fetch")) {
        return NextResponse.json({
          success: false,
          message: "Network connection failed",
          details: "Cannot reach Supabase. Check your NEXT_PUBLIC_SUPABASE_URL is correct.",
        })
      }

      // Check for authentication errors
      if (error.message.includes("Invalid API key") || error.message.includes("unauthorized")) {
        return NextResponse.json({
          success: false,
          message: "Authentication failed",
          details: "Invalid Supabase service role key. Check your SUPABASE_SERVICE_ROLE_KEY is correct.",
        })
      }
    }

    return NextResponse.json({
      success: false,
      message: "Supabase test failed",
      details: error instanceof Error ? error.message : "Unknown error occurred",
    })
  }
}
