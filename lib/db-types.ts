import type { ObjectId } from "mongodb"

export interface Event {
  _id?: ObjectId
  userId: string
  name: string
  type: "birthday" | "anniversary" | "other"
  date: Date // The original date (e.g., birthdate: 1990-01-15)
  description?: string
  phoneNumber?: string
  email?: string
  
  // NEW: Tracking fields
  lastCelebratedYear: number // Tracks which year we last handled (e.g., 2025)
  notificationsSent: {
    h24: boolean // 24 hours before
    h12: boolean // 12 hours before
    h1: boolean  // 1 hour before
  }
  totalNotificationsSent: number // Total count over all time
  
  createdAt: Date
  updatedAt: Date   
}