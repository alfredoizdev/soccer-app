'use client'
import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from 'date-fns'
import { enUS } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MatchCalendarEventModal from './MatchCalendarEventModal'
import { MatchEvent } from './MatchCalendarEvent'

interface MatchCalendarMobileProps {
  events: MatchEvent[]
}

export default function MatchCalendarMobile({
  events,
}: MatchCalendarMobileProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<MatchEvent | null>(null)
  const [activeTab, setActiveTab] = useState<'general' | 'upcoming' | 'past'>(
    'general'
  )

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.start), date))
  }

  const handleEventClick = (event: MatchEvent) => {
    setSelectedEvent(event)
    setModalOpen(true)
  }

  return (
    <div className='w-full max-w-full mx-auto py-4 px-2'>
      {/* Header con navegación */}
      <div className='flex items-center justify-between mb-4 p-4 bg-white rounded-none shadow'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => navigateMonth('prev')}
          className='p-2'
        >
          <ChevronLeft className='w-4 h-4' />
        </Button>

        <div className='flex items-center gap-2'>
          <CalendarIcon className='w-5 h-5 text-blue-600' />
          <h2 className='text-lg font-semibold'>
            {format(currentDate, 'MMMM yyyy', { locale: enUS })}
          </h2>
        </div>

        <Button
          variant='outline'
          size='sm'
          onClick={() => navigateMonth('next')}
          className='p-2'
        >
          <ChevronRight className='w-4 h-4' />
        </Button>
      </div>

      {/* Tabs para filtrar */}
      <div className='flex mb-4 bg-white rounded-none shadow overflow-hidden'>
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'general'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'past'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Past
        </button>
      </div>

      {/* Vista de lista de días con eventos */}
      <div className='space-y-3 overflow-hidden'>
        {daysInMonth.map((day) => {
          const allDayEvents = getEventsForDay(day)
          const dayEvents = allDayEvents.filter((event) => {
            if (activeTab === 'upcoming') {
              return event.resource?.status === 'active'
            } else if (activeTab === 'past') {
              return event.resource?.status === 'inactive'
            } else {
              return true // general - mostrar todos
            }
          })
          const isToday = isSameDay(day, new Date())

          if (dayEvents.length === 0) return null

          return (
            <Card key={day.toISOString()} className='shadow-sm rounded-none'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm flex items-center justify-between'>
                  <span
                    className={`font-medium ${
                      isToday ? 'text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {format(day, 'EEEE, d MMMM', { locale: enUS })}
                  </span>
                  {isToday && (
                    <span className='text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full'>
                      Today
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='space-y-2'>
                  {dayEvents.map((event, index) => (
                    <div
                      key={`${day.toISOString()}-${index}`}
                      onClick={() => handleEventClick(event)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        event.resource?.status === 'active'
                          ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                          : 'bg-yellow-50 border border-yellow-200 hover:bg-yellow-100'
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            event.resource?.status === 'active'
                              ? 'bg-green-400'
                              : 'bg-yellow-400'
                          }`}
                        />
                        <div className='flex-1'>
                          <h4 className='font-medium text-sm'>
                            {event.resource?.team1} vs {event.resource?.team2}
                          </h4>
                          <p className='text-xs text-gray-600 mt-1'>
                            {format(new Date(event.start), 'HH:mm')} -{' '}
                            {event.resource?.location}
                          </p>
                        </div>
                        <div className='text-xs text-gray-500'>
                          {event.resource?.status === 'active'
                            ? 'Live'
                            : 'Scheduled'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Mensaje cuando no hay eventos */}
      {events.length === 0 && (
        <Card className='text-center py-8 rounded-none'>
          <CardContent>
            <CalendarIcon className='w-12 h-12 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-500'>
              No {activeTab === 'general' ? 'matches' : activeTab} matches for{' '}
              {format(currentDate, 'MMMM yyyy', { locale: enUS })}
            </p>
          </CardContent>
        </Card>
      )}

      <MatchCalendarEventModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        event={selectedEvent}
      />
    </div>
  )
}
