'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CheckCircle, XCircle } from 'lucide-react'
import { useGlobalStore } from '@/lib/stores/globalStore'

interface JerseyNumberSelectorProps {
  value?: string | number | null
  onChange: (value: string) => void
  organizationId?: string | null
  playerId?: string
  disabled?: boolean
}

export default function JerseyNumberSelector({
  value,
  onChange,
  organizationId,
  playerId,
  disabled = false,
}: JerseyNumberSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [availabilityMap, setAvailabilityMap] = React.useState<
    Record<number, boolean>
  >({})
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasLoaded, setHasLoaded] = React.useState(false)
  const { getJerseyAvailability, setJerseyAvailability } = useGlobalStore()

  // Cargar disponibilidad de números cuando se abre el diálogo
  const loadAvailability = React.useCallback(async () => {
    if (!organizationId) {
      // Si no hay equipo, todos los números están disponibles
      const allAvailable: Record<number, boolean> = {}
      for (let i = 1; i <= 99; i++) {
        allAvailable[i] = true
      }
      setAvailabilityMap(allAvailable)
      return
    }

    setIsLoading(true)
    try {
      // Solo verificar números comunes (1-20) para reducir peticiones
      const numbersToCheck = Array.from({ length: 20 }, (_, i) => i + 1)

      // Verificar qué números ya están en cache
      const numbersToFetch = numbersToCheck.filter((number) => {
        const cached = getJerseyAvailability(organizationId, number)
        return cached === undefined
      })

      // Solo hacer peticiones para números que no están en cache
      if (numbersToFetch.length > 0) {
        const availabilityPromises = numbersToFetch.map(async (number) => {
          const { checkJerseyNumberAvailabilityAction } = await import(
            '@/lib/actions/player.action'
          )
          const result = await checkJerseyNumberAvailabilityAction(
            number,
            organizationId,
            playerId
          )

          // Guardar en cache
          setJerseyAvailability(organizationId, number, result.isAvailable)

          return { number, isAvailable: result.isAvailable }
        })

        const results = await Promise.all(availabilityPromises)

        // Construir mapa de disponibilidad
        const availability: Record<number, boolean> = {}

        // Inicializar todos como disponibles
        for (let i = 1; i <= 99; i++) {
          availability[i] = true
        }

        // Actualizar con datos del cache y nuevos resultados
        numbersToCheck.forEach((number) => {
          const cached = getJerseyAvailability(organizationId, number)
          if (cached !== undefined) {
            availability[number] = cached
          }
        })

        // Actualizar con nuevos resultados
        results.forEach(({ number, isAvailable }) => {
          availability[number] = isAvailable
        })

        setAvailabilityMap(availability)
      } else {
        // Si todos están en cache, construir mapa desde cache
        const availability: Record<number, boolean> = {}
        for (let i = 1; i <= 99; i++) {
          availability[i] = true
        }

        numbersToCheck.forEach((number) => {
          const cached = getJerseyAvailability(organizationId, number)
          if (cached !== undefined) {
            availability[number] = cached
          }
        })

        setAvailabilityMap(availability)
      }
    } catch (error) {
      console.error('Error loading jersey number availability:', error)
      // En caso de error, mostrar todos como disponibles
      const allAvailable: Record<number, boolean> = {}
      for (let i = 1; i <= 99; i++) {
        allAvailable[i] = true
      }
      setAvailabilityMap(allAvailable)
    } finally {
      setIsLoading(false)
    }
  }, [organizationId, playerId, getJerseyAvailability, setJerseyAvailability])

  React.useEffect(() => {
    if (isOpen && !hasLoaded) {
      // Agregar un pequeño delay para evitar múltiples llamadas
      const timeoutId = setTimeout(() => {
        loadAvailability()
        setHasLoaded(true)
      }, 100)

      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [isOpen, loadAvailability, hasLoaded])

  const handleNumberSelect = (number: number) => {
    if (availabilityMap[number]) {
      onChange(number.toString())
      setIsOpen(false)
      setHasLoaded(false)
    }
  }

  const renderNumberGrid = () => {
    const numbers = []
    for (let i = 1; i <= 99; i++) {
      const isAvailable = availabilityMap[i]
      const isSelected = value === i.toString()

      numbers.push(
        <Button
          key={i}
          type='button'
          variant={isSelected ? 'default' : 'outline'}
          size='sm'
          className={`w-12 h-12 m-1 ${
            isAvailable
              ? 'hover:bg-blue-100 hover:border-blue-300'
              : 'opacity-50 cursor-not-allowed bg-gray-100'
          } ${isSelected ? 'bg-blue-600 text-white' : ''}`}
          onClick={() => handleNumberSelect(i)}
          disabled={!isAvailable || disabled}
        >
          {i}
        </Button>
      )
    }
    return numbers
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) {
          setHasLoaded(false)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type='button'
          variant='outline'
          className='w-full justify-start text-left font-normal'
          disabled={disabled}
        >
          {value ? `Jersey #${value}` : 'Select Jersey Number'}
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Select Jersey Number</DialogTitle>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <CheckCircle className='w-4 h-4 text-green-600' />
            <span>Available</span>
            <XCircle className='w-4 h-4 text-red-600' />
            <span>Taken</span>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className='flex justify-center items-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            <span className='ml-2'>Loading availability...</span>
          </div>
        ) : (
          <div className='grid grid-cols-10 gap-1 p-4'>
            {renderNumberGrid()}
          </div>
        )}

        {!organizationId && (
          <p className='text-sm text-gray-500 mt-2'>
            Note: All numbers are available since no team is selected.
            Availability will be checked when a team is assigned.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
