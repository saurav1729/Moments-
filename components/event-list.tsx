"use client"

import { Trash2, Edit2, Gift, Heart, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Event } from "@/lib/db-types"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface EventListProps {
  events: Event[]
  onEdit: (event: Event) => void
  onDelete: (id: string) => void
}

export function EventList({ events, onEdit, onDelete }: EventListProps) {
  const getEventStyle = (type: string) => {
    switch (type) {
      case "birthday":
        return { icon: Gift, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" }
      case "anniversary":
        return { icon: Heart, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" }
      default:
        return { icon: CalendarIcon, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" }
    }
  }

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-3 max-h-3/4 overflow-y-auto pr-2 custom-scrollbar">
      {sortedEvents.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No events found for this period</p>
        </div>
      ) : (
        sortedEvents.map((event, index) => {
          const style = getEventStyle(event.type)
          const Icon = style.icon
          const dateObj = new Date(event.date)

          return (
            <motion.div
              key={event._id?.toString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "group p-4 rounded-xl border flex items-center justify-between transition-all duration-300",
                "hover:bg-white/5",
                style.bg
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-lg bg-slate-950/30", style.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">{event.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>
                      {dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    {event.description && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        <span className="truncate max-w-(200px)">{event.description}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-800 text-slate-400 hover:text-white" onClick={() => onEdit(event)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-900/30 text-slate-400 hover:text-red-400" onClick={() => onDelete(event._id?.toString() || "")}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )
        })
      )}
    </div>
  )
}