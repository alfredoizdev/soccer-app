'use client'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './MatchCalendarCustom.css'
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

const VIEWS: View[] = ['month', 'week', 'day', 'agenda']

type CalendarView = (typeof VIEWS)[number]

export default function MatchCalendar({ events }: MatchCalendarProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<MatchEvent | null>(null)
  const [view, setView] = useState<CalendarView>('month')

  return (
    <div className='h-[900px] bg-white rounded-none shadow p-4 flex flex-col'>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor='start'
        endAccessor='end'
        style={{ height: 900 }}
        popup
        views={VIEWS}
        view={view}
        onView={(v) => setView(v as CalendarView)}
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
