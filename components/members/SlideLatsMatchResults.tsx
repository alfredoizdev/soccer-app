'use client'
import * as React from 'react'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { Button } from '../ui/button'
import { type CarouselApi } from '@/components/ui/carousel'

export interface MatchListItem {
  id: string
  date: string | Date
  team1: string
  team2: string
  team1Id: string
  team2Id: string
  team1Goals: number
  team2Goals: number
  team1Avatar: string
  team2Avatar: string
  duration?: number | null
  status?: string
}

interface SlideLatsMatchResultsProps {
  matches: MatchListItem[]
}

export default function SlideLatsMatchResults({
  matches,
}: SlideLatsMatchResultsProps) {
  const [current, setCurrent] = React.useState(0)
  const emblaApiRef = React.useRef<CarouselApi | null>(null)

  // Manejar el API de Embla para saber el slide actual
  const handleSetApi = React.useCallback((api: CarouselApi) => {
    if (!api) return
    emblaApiRef.current = api
    setCurrent(api.selectedScrollSnap())
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [])

  return (
    <>
      <div className='block md:hidden text-center text-xs text-gray-500 py-5 font-semibold'>
        {current + 1} / {matches.length} matches
      </div>
      <Carousel
        opts={{
          align: 'start',
        }}
        setApi={handleSetApi}
        className='max-w-screen-sm xl:max-w-screen-xl mx-auto'
      >
        <CarouselContent>
          {matches.map((match) => (
            <CarouselItem
              key={match.id}
              className='md:basis-1/2 lg:basis-1/2 xl:basis-1/4'
            >
              <div className='p-1'>
                <Card className='rounded-none border-none'>
                  <CardContent className='flex aspect-square flex-col items-center justify-center p-1 h-full w-full'>
                    <span className='text-xs text-gray-400'>
                      {typeof match.date === 'string'
                        ? new Date(match.date).toLocaleDateString()
                        : match.date.toLocaleDateString()}
                    </span>
                    {/* Fecha en la esquina superior derecha */}
                    <div className='flex justify-center items-center gap-4 relative w-full'>
                      <div className='flex flex-col justify-center items-center gap-2'>
                        <Avatar>
                          <AvatarImage
                            src={match.team1Avatar}
                            className='w-20 h-20'
                          />
                          <AvatarFallback>{match.team1[0]}</AvatarFallback>
                        </Avatar>
                        <span>{match.team1}</span>
                        <span
                          className={`text-3xl font-semibold rounded-full p-2 ${
                            match.team1Goals > match.team2Goals
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {match.team1Goals}
                        </span>
                      </div>
                      <span className='textsm font-semibold text-gray-500 rounded-full bg-gray-200 p-2'>
                        VS
                      </span>
                      <div className='flex flex-col justify-center items-center gap-2'>
                        <Avatar>
                          <AvatarImage
                            src={match.team2Avatar}
                            className='w-20 h-20'
                          />
                          <AvatarFallback>{match.team2[0]}</AvatarFallback>
                        </Avatar>
                        <span>{match.team2}</span>
                        <span
                          className={`text-3xl font-semibold rounded-full p-2 ${
                            match.team2Goals > match.team1Goals
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {match.team2Goals}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className='flex justify-center items-center'>
                    <Button className='w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded transition-colors'>
                      See details
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Flechas debajo y ocultas en mobile */}
        <div className='hidden md:flex justify-center gap-2 mt-2'>
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </>
  )
}
