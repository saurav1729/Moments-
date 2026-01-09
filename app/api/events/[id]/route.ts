import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = request.headers.get("x-user-id") || "default-user"
    const body = await request.json()

    const eventsCollection = await getCollection("events")
    const result = await eventsCollection.updateOne(
      { _id: new ObjectId(id), userId },
      {
        $set: {
          name: body.name,
          type: body.type,
          date: new Date(body.date),
          description: body.description,
          phoneNumber: body.phoneNumber,
          email: body.email,
          reminderDays: body.reminderDays,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update event:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = request.headers.get("x-user-id") || "default-user"

    const eventsCollection = await getCollection("events")
    const result = await eventsCollection.deleteOne({
      _id: new ObjectId(id),
      userId,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete event:", error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
