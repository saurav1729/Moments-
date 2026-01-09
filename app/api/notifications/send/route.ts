import { type NextRequest, NextResponse } from "next/server"
import { checkAndSendReminders } from "@/lib/notifications"

// 1. MUST be GET for Vercel Cron
export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Cron job triggered...")

    // 2. Check the Authorization header (Standard Vercel Cron Security)
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // If manually testing, you might not send 'Bearer', so handle that if needed
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await checkAndSendReminders()

    return NextResponse.json({ 
      success: true, 
      message: "Reminders processed",
      timestamp: new Date().toISOString() 
    })
  } catch (error) {
    console.error("[v0] Cron API error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}