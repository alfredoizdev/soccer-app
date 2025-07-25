'use client'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import MatchCalendarEvent, { MatchEvent } from './MatchCalendarEvent'
import MatchCalendarEventModal from './MatchCalendarEventModal'
import { useState } from 'react'

interface MatchCalendarProps {
  events: MatchEvent[]
}

const locales = {
  es,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

export default function MatchCalendar({ events }: MatchCalendarProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<MatchEvent | null>(null)

  return (
    <div className='h-[600px] bg-white rounded-lg shadow p-4'>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor='start'
        endAccessor='end'
        style={{ height: 500 }}
        popup
        views={['month', 'week', 'day', 'agenda']}
        eventPropGetter={() => ({
          style: {
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: 0,
            border: '1px solid #222',
          },
        })}
        components={{
          event: MatchCalendarEvent,
        }}
        onSelectEvent={(event) => {
          setSelectedEvent(event)
          setModalOpen(true)
        }}
      />
      <MatchCalendarEventModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        event={selectedEvent}
      />
    </div>
  )
}
