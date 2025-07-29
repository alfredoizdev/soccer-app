'use client'
import { useState, useEffect } from 'react'
import MatchCalendar from './MatchCalendar'
import MatchCalendarMobile from './MatchCalendarMobile'
import { MatchEvent } from './MatchCalendarEvent'

interface MatchCalendarResponsiveProps {
  events: MatchEvent[]
}

export default function MatchCalendarResponsive({
  events,
}: MatchCalendarResponsiveProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768) // 768px es el breakpoint md de Tailwind
    }

    // Verificar al montar
    checkScreenSize()

    // Escuchar cambios de tamaño
    window.addEventListener('resize', checkScreenSize)

    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  if (isMobile) {
    return <MatchCalendarMobile events={events} />
  }

  return <MatchCalendar events={events} />
}
