'use client'

import * as React from 'react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronDownIcon, CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DateTimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
}

export function DateTimePicker({
  date,
  setDate,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedTime, setSelectedTime] = React.useState<string>('12:00:00')

  // Función para manejar el cambio de fecha
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const dateWithTime = new Date(newDate)
      dateWithTime.setHours(hours, minutes, 0, 0)
      setDate(dateWithTime)
      setOpen(false)
    } else {
      setDate(undefined)
    }
  }

  // Función para manejar el cambio de hora
  const handleTimeChange = (time: string) => {
    setSelectedTime(time)
    if (date) {
      const [hours, minutes] = time.split(':').map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours, minutes, 0, 0)
      setDate(newDate)
    }
  }

  // Inicializar la hora cuando se selecciona una fecha
  React.useEffect(() => {
    if (date && !selectedTime) {
      setSelectedTime(
        `${date.getHours().toString().padStart(2, '0')}:${date
          .getMinutes()
          .toString()
          .padStart(2, '0')}:00`
      )
    }
  }, [date, selectedTime])

  return (
    <div className={cn('flex gap-4', className)}>
      <div className='flex flex-col gap-3'>
        <Label htmlFor='date-picker' className='px-1'>
          Date
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              id='date-picker'
              className='w-full justify-start text-left font-normal'
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {date ? date.toLocaleDateString() : 'Select date'}
              <ChevronDownIcon className='ml-auto h-4 w-4' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
            <Calendar
              mode='single'
              selected={date}
              captionLayout='dropdown'
              onSelect={handleDateSelect}
              disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className='flex flex-col gap-3'>
        <Label htmlFor='time-picker' className='px-1'>
          Time
        </Label>
        <Input
          type='time'
          id='time-picker'
          step='1'
          value={selectedTime}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleTimeChange(e.target.value)
          }
          className='bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
        />
      </div>
    </div>
  )
}
