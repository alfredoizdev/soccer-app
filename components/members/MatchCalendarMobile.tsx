'use client'
import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isAfter,
  startOfDay,
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
    return events.filter((event) => {
      const eventDate = new Date(event.start)
      return isSameDay(eventDate, date)
    })
  }

  const handleEventClick = (event: MatchEvent) => {
    setSelectedEvent(event)
    setModalOpen(true)
  }

  // Función mejorada para filtrar eventos según la pestaña activa
  const filterEventsByTab = (events: MatchEvent[]) => {
    const now = startOfDay(new Date())

    switch (activeTab) {
      case 'upcoming':
        return events.filter((event) => {
          const eventDate = new Date(event.start)
          const isActive = event.resource?.status === 'active'
          const isFuture = isAfter(eventDate, now) || isSameDay(eventDate, now)
          return isActive && isFuture
        })
      case 'past':
        return events.filter((event) => {
          const eventDate = new Date(event.start)
          const isInactive = event.resource?.status === 'inactive'
          const isPast = isAfter(now, eventDate) && !isSameDay(eventDate, now)
          return isInactive || isPast
        })
      default:
        return events // general - mostrar todos
    }
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
        {activeTab === 'upcoming'
          ? // Vista especial para upcoming: mostrar todos los eventos futuros organizados por fecha
            (() => {
              const upcomingEvents = events.filter((event) => {
                const eventDate = new Date(event.start)
                const now = startOfDay(new Date())
                const isActive = event.resource?.status === 'active'
                const isFuture =
                  isAfter(eventDate, now) || isSameDay(eventDate, now)
                return isActive && isFuture
              })

              // Agrupar eventos por fecha
              const eventsByDate = upcomingEvents.reduce((acc, event) => {
                const eventDate = new Date(event.start)
                const dateKey = format(eventDate, 'yyyy-MM-dd')
                if (!acc[dateKey]) {
                  acc[dateKey] = []
                }
                acc[dateKey].push(event)
                return acc
              }, {} as Record<string, MatchEvent[]>)

              // Ordenar fechas
              const sortedDates = Object.keys(eventsByDate).sort()

              if (sortedDates.length === 0) {
                return (
                  <Card className='text-center py-8 rounded-none'>
                    <CardContent>
                      <CalendarIcon className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                      <p className='text-gray-600'>No upcoming matches found</p>
                    </CardContent>
                  </Card>
                )
              }

              return sortedDates.map((dateKey) => {
                const dayEvents = eventsByDate[dateKey]
                const day = new Date(dateKey)
                const isToday = isSameDay(day, new Date())

                return (
                  <Card key={dateKey} className='shadow-sm rounded-none'>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm flex items-center justify-between'>
                        <span
                          className={`font-medium ${
                            isToday ? 'text-blue-600' : 'text-gray-700'
                          }`}
                        >
                          {format(day, 'EEEE, d MMMM yyyy', { locale: enUS })}
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
                            key={`${dateKey}-${index}`}
                            onClick={() => handleEventClick(event)}
                            className='p-3 rounded-lg cursor-pointer transition-colors bg-green-50 border border-green-200 hover:bg-green-100'
                          >
                            <div className='flex items-center gap-3'>
                              <div className='w-3 h-3 rounded-full bg-green-400' />
                              <div className='flex-1'>
                                <h4 className='font-medium text-sm'>
                                  {event.resource?.team1} vs{' '}
                                  {event.resource?.team2}
                                </h4>
                                <p className='text-xs text-gray-600 mt-1'>
                                  {format(new Date(event.start), 'HH:mm')} -{' '}
                                  {event.resource?.location || 'No location'}
                                </p>
                              </div>
                              <div className='text-xs text-gray-500'>
                                Scheduled
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            })()
          : // Vista normal para general y past: mostrar solo eventos del mes actual
            daysInMonth.map((day) => {
              const allDayEvents = getEventsForDay(day)
              const dayEvents = filterEventsByTab(allDayEvents)
              const isToday = isSameDay(day, new Date())

              if (dayEvents.length === 0) return null

              return (
                <Card
                  key={day.toISOString()}
                  className='shadow-sm rounded-none'
                >
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
                                {event.resource?.team1} vs{' '}
                                {event.resource?.team2}
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
            <CalendarIcon className='w-12 h-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-600'>
              No {activeTab === 'general' ? 'matches' : activeTab} matches for{' '}
              {format(currentDate, 'MMMM yyyy', { locale: enUS })}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Mensaje cuando no hay eventos en el mes actual pero sí hay upcoming */}
      {events.length > 0 &&
        daysInMonth.every((day) => {
          const allDayEvents = getEventsForDay(day)
          const dayEvents = filterEventsByTab(allDayEvents)
          return dayEvents.length === 0
        }) &&
        activeTab === 'upcoming' && (
          <Card className='text-center py-8 rounded-none'>
            <CardContent>
              <CalendarIcon className='w-12 h-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600 font-medium'>
                No upcoming matches in{' '}
                {format(currentDate, 'MMMM yyyy', { locale: enUS })}
              </p>
              <p className='text-sm text-gray-500 mt-2'>
                Try navigating to a different month or check the
                &quot;General&quot; tab
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
