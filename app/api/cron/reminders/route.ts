import { type NextRequest, NextResponse } from "next/server"
import { checkAndSendReminders } from "@/lib/notifications"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Starting scheduled reminder check...")
    // Verify request is from Vercel Crons
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Starting scheduled reminder check...")
    await checkAndSendReminders()

    return NextResponse.json({
      success: true,
      message: "Reminders processed successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Cron job error:", error)
    return NextResponse.json(
      {
        error: "Failed to process reminders",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
