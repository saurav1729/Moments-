import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { Event } from "@/lib/db-types"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "default-user"
    const eventsCollection = await getCollection("events")

    const events = await eventsCollection.find({ userId }).sort({ date: 1 }).toArray()

    return NextResponse.json(events)
  } catch (error) {
    console.error("Failed to fetch events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

// app/api/events/route.ts (POST function)
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "default-user"
    const body = await request.json()

    const event: Event = {
      userId,
      name: body.name,
      type: body.type || "other",
      date: new Date(body.date),
      description: body.description,
      phoneNumber: body.phoneNumber,
      email: body.email,
      // Initialize tracking fields
      lastCelebratedYear: 0, 
      notificationsSent: { h24: false, h12: false, h1: false },
      totalNotificationsSent: 0,
      
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const eventsCollection = await getCollection("events")
    const result = await eventsCollection.insertOne(event)

    return NextResponse.json({ ...event, _id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Failed to create event:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
