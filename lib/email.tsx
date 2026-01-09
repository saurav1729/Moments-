// Using Nodemailer for email notifications
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendEmailReminder(
  to: string,
  eventName: string,
  eventDate: Date,
  daysUntil: number,
): Promise<boolean> {
  try {
    const formattedDate = eventDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })

    let subject = ""
    let htmlBody = ""

    if (daysUntil === 0) {
      subject = `Happy ${eventName}! 🎉`
      htmlBody = `
        <h2>Happy ${eventName}!</h2>
        <p>Today is the special day! Don't forget to celebrate.</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
      `
    } else {
      subject = `Reminder: ${eventName} in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`
      htmlBody = `
        <h2>${eventName} Reminder</h2>
        <p>${eventName} is coming up in <strong>${daysUntil} day${daysUntil !== 1 ? "s" : ""}</strong>!</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p>Make sure to make the necessary preparations.</p>
      `
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html: htmlBody,
    })

    console.log(`[v0] Email sent successfully to ${to}`)
    return true
  } catch (error) {
    console.error("[v0] Failed to send email:", error)
    return false
  }
}
