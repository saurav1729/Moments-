import twilio from "twilio"

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const whatsappFromNumber = process.env.TWILIO_WHATSAPP_NUMBER

const client = twilio(accountSid, authToken)

export async function sendWhatsAppReminder(
  to: string,
  eventName: string,
  eventDate: Date,
  timeWindow: "24h" | "12h" | "1h" // <--- Updated Parameter
): Promise<boolean> {
  try {
    const formattedDate = eventDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    })

    let timeText = ""
    if (timeWindow === "24h") timeText = "tomorrow"
    else if (timeWindow === "12h") timeText = "in 12 hours"
    else if (timeWindow === "1h") timeText = "in 1 hour"

    // Construct the message
    const message = `⏰ Reminder: ${eventName} is coming up ${timeText}!\nDate: ${formattedDate}`

    // Ensure phone number is in E.164 format
    const formattedPhone = to.startsWith("+") ? to : `+${to}`

    await client.messages.create({
      body: message,
      from: `whatsapp:${whatsappFromNumber}`,
      to: `whatsapp:${formattedPhone}`,
    })

    console.log(`[v0] WhatsApp sent to ${formattedPhone} for ${timeWindow} reminder`)
    return true
  } catch (error) {
    console.error("[v0] Failed to send WhatsApp:", error)
    return false
  }
}