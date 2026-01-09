import { getCollection } from "@/lib/mongodb"
import { sendEmailReminder } from "@/lib/email"
import { sendWhatsAppReminder } from "@/lib/whatsapp"
import type { Event } from "@/lib/db-types"

export async function checkAndSendReminders() {
  try {
    const eventsCollection = await getCollection("events")
    const now = new Date()
    const currentYear = now.getFullYear()

    // Fetch all events
    // (In production with thousands of users, you would filter this query by date range)
    const allEvents = (await eventsCollection.find({}).toArray()) as unknown as Event[]

    console.log(`[v0] Checking ${allEvents.length} events for scheduled reminders...`)

    for (const event of allEvents) {
      // 1. Calculate the Target Date for the CURRENT year
      const originalDate = new Date(event.date)
      
      // Construct a date object for this year's occurrence
      // We assume the event happens at the same time of day as originally stored
      let targetDate = new Date(
        currentYear,
        originalDate.getMonth(),
        originalDate.getDate(),
        originalDate.getHours(), 
        originalDate.getMinutes()
      )

      // If this year's date has passed (by more than 2 days), look at next year
      if (targetDate.getTime() < now.getTime() - (48 * 60 * 60 * 1000)) {
         targetDate.setFullYear(currentYear + 1)
      }

      const targetYear = targetDate.getFullYear()

      // 2. Handle Year Transition / Reset
      // If the 'lastCelebratedYear' in DB is different from the target year,
      // we treat this as a "fresh" event cycle.
      let currentStatus = event.notificationsSent || { h24: false, h12: false, h1: false }
      
      // Reset status if we are tracking a new year
      if (event.lastCelebratedYear !== targetYear) {
        currentStatus = { h24: false, h12: false, h1: false }
      }

      // 3. Calculate Time Difference (Hours)
      const diffMs = targetDate.getTime() - now.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)
      
      let triggerType: "24h" | "12h" | "1h" | null = null

      // --- Logic Windows ---
      // We use a window (e.g. 23.5 - 24.5) to ensure the Cron (running every 10m) catches it.
      
      // 24 HOURS BEFORE
      if (diffHours <= 24.5 && diffHours > 23.5 && !currentStatus.h24) {
        triggerType = "24h"
      }
      // 12 HOURS BEFORE
      else if (diffHours <= 12.5 && diffHours > 11.5 && !currentStatus.h12) {
        triggerType = "12h"
      }
      // 1 HOUR BEFORE
      else if (diffHours <= 1.5 && diffHours > 0.5 && !currentStatus.h1) {
        triggerType = "1h"
      }

      // 4. Send & Update
      if (triggerType) {
        console.log(`[v0] Triggering ${triggerType} reminder for ${event.name}`)
        
        let sent = false

        if (event.email) {
          // CORRECTED: Passing 'triggerType' string
          const emailResult = await sendEmailReminder(event.email, event.name, targetDate, triggerType)
          if (emailResult) sent = true
        }

        if (event.phoneNumber) {
          // CORRECTED: Passing 'triggerType' string
          const waResult = await sendWhatsAppReminder(event.phoneNumber, event.name, targetDate, triggerType)
          if (waResult) sent = true
        }

        // Only update DB if we actually tried to send something
        if (sent) {
          // Update the local status object first
          if (triggerType === "24h") currentStatus.h24 = true
          if (triggerType === "12h") currentStatus.h12 = true
          if (triggerType === "1h") currentStatus.h1 = true

          await eventsCollection.updateOne(
            { _id: event._id },
            {
              $set: {
                lastCelebratedYear: targetYear,
                notificationsSent: currentStatus,
                updatedAt: new Date(),
              },
              $inc: { totalNotificationsSent: 1 }
            }
          )
          console.log(`[v0] DB updated for ${event.name} (${triggerType})`)
        }
      }
    }
    console.log("[v0] Check completed.")
  } catch (error) {
    console.error("[v0] Error in checkAndSendReminders:", error)
  }
}