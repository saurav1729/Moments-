"use client"

import { useEffect, useState } from "react"
import { Calendar } from "@/components/calendar"
import { EventList } from "@/components/event-list"
import { EventForm } from "@/components/event-form"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Event } from "@/lib/db-types"

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/events", {
        headers: { "x-user-id": "default-user" },
      })
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (data: Partial<Event>) => {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": "default-user" },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        await fetchEvents()
        setShowForm(false)
        setEditingEvent(undefined)
      }
    } catch (error) {
      console.error("Failed to create event:", error)
    }
  }

  const handleUpdateEvent = async (data: Partial<Event>) => {
    if (!editingEvent?._id) return
    try {
      const response = await fetch(`/api/events/${editingEvent._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-id": "default-user" },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        await fetchEvents()
        setShowForm(false)
        setEditingEvent(undefined)
      }
    } catch (error) {
      console.error("Failed to update event:", error)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": "default-user" },
      })
      if (response.ok) await fetchEvents()
    } catch (error) {
      console.error("Failed to delete event:", error)
    }
  }

  // Filter events: If a date is selected, show events for that date.
  // Otherwise, show all upcoming events.
  const filteredEvents = selectedDate
    ? events.filter((e) => new Date(e.date).toDateString() === selectedDate.toDateString())
    : events

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden selection:bg-purple-500/30">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-3/4 w-3/4  bg-purple-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-3/4 w-3/4 bg-blue-600/20 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 h-full">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-linear-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Moments
            </h1>
            <p className="text-slate-400 mt-1">Never miss a special day again.</p>
          </div>
          
          <Button
            onClick={() => {
              setShowForm(!showForm)
              setEditingEvent(undefined)
            }}
            className="rounded-full px-6 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20 transition-all duration-300 transform hover:scale-105"
          >
            {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {showForm ? "Close" : "New Event"}
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Calendar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-6 space-y-6"
          >
             <Calendar
              events={events.map((e) => ({
                date: e.date.toString(),
                name: e.name,
                type: e.type,
              }))}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
          </motion.div>

          {/* Right Column: List & Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-6 space-y-6"
          >
            <AnimatePresence mode="wait">
              {showForm ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <EventForm
                    event={editingEvent}
                    onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
                    onCancel={() => {
                      setShowForm(false)
                      setEditingEvent(undefined)
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">
                      {selectedDate 
                        ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
                        : "Upcoming"}
                    </h2>
                    {selectedDate && (
                      <button 
                        onClick={() => setSelectedDate(undefined)}
                        className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        View All
                      </button>
                    )}
                  </div>
                  
                  {loading ? (
                     <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>
                  ) : (
                    <EventList
                      events={filteredEvents}
                      onEdit={(e) => {
                        setEditingEvent(e)
                        setShowForm(true)
                      }}
                      onDelete={handleDeleteEvent}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </main>
  )
}