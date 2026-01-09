"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface CalendarProps {
  events: Array<{ date: string; name: string; type: string }>
  onDateSelect: (date: Date) => void
  selectedDate?: Date
}

export function Calendar({ events, onDateSelect, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const eventsByDate = events.reduce((acc: Record<number, typeof events>, event) => {
    const d = new Date(event.date)
    // Only map events for the current displayed month/year
    if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
      const day = d.getDate()
      acc[day] = [...(acc[day] || []), event]
    }
    return acc
  }, {})

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))

  const handleDateClick = (day: number) => {
    onDateSelect(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <h2 className="text-2xl font-bold text-slate-100">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="hover:bg-white/10 text-slate-300">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextMonth} className="hover:bg-white/10 text-slate-300">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3 md:gap-4">
        {emptyDays.map((i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {daysArray.map((day) => {
          const dayEvents = eventsByDate[day] || []
          const isSelected = selectedDate && 
            selectedDate.getDate() === day && 
            selectedDate.getMonth() === currentDate.getMonth() &&
            selectedDate.getFullYear() === currentDate.getFullYear()
            
          const isToday = new Date().getDate() === day && 
            new Date().getMonth() === currentDate.getMonth() && 
            new Date().getFullYear() === currentDate.getFullYear()

          return (
            <motion.button
              key={day}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDateClick(day)}
              className={cn(
                "relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border",
                isSelected 
                  ? "bg-linear-to-r from-purple-600 to-blue-600 border-transparent shadow-lg shadow-purple-500/30 text-white" 
                  : isToday
                    ? "bg-white/5 border-purple-500/50 text-purple-300"
                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 text-slate-300"
              )}
            >
              <span className={cn("text-lg font-medium", isSelected || isToday ? "font-bold" : "")}>
                {day}
              </span>
              
              {/* Event Dots */}
              <div className="flex gap-1 mt-2 h-1.5">
                {dayEvents.slice(0, 3).map((evt, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      evt.type === 'birthday' ? "bg-pink-500" :
                      evt.type === 'anniversary' ? "bg-red-500" : "bg-cyan-500",
                      isSelected ? "bg-white" : ""
                    )} 
                  />
                ))}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}