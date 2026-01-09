"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Event } from "@/lib/db-types"

interface EventFormProps {
  event?: Event
  onSubmit: (data: Partial<Event>) => void
  onCancel: () => void
}

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState({
    name: event?.name || "",
    type: event?.type || "birthday",
    date: event ? new Date(event.date).toISOString().split("T")[0] : "",
    description: event?.description || "",
    email: event?.email || "",
    phoneNumber: event?.phoneNumber || "",
    // reminderDays: event?.reminderDays || 1,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      date: new Date(formData.date),
    })
  }

  const inputClass = "bg-slate-950/50 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-slate-600"
  const labelClass = "text-slate-300 text-xs uppercase tracking-wider font-semibold"

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
      <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">
        {event ? "Edit Event" : "Create New Event"}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className={labelClass}>Event Name</Label>
          <Input
            id="name"
            className={inputClass}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Mom's Birthday"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type" className={labelClass}>Type</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className={`w-full h-10 px-3 rounded-md text-sm ${inputClass}`}
            >
              <option value="birthday">Birthday 🎂</option>
              <option value="anniversary">Anniversary ❤️</option>
              <option value="other">Other 📅</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className={labelClass}>Date</Label>
            <Input
              id="date"
              type="date"
              className={`${inputClass} scheme-dark`}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact" className={labelClass}>Notifications</Label>
          <div className="grid grid-cols-1 gap-3">
             <Input
              className={inputClass}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email address"
            />
            <Input
              className={inputClass}
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="Phone (e.g. +123...)"
            />
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel}
            className="flex-1 text-slate-400 hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white"
          >
            {event ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </div>
  )
}