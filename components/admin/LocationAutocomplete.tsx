'use client'
import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, Search } from 'lucide-react'
import { searchPlacesAction } from '@/lib/actions/places.action'
import { useDebounceCallback } from '@/hooks/useDebounceCallback'

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

interface PlaceResult {
  place_id: string
  description: string
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Search for a location...',
  className = '',
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Cerrar sugerencias cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    try {
      // Usar server action para buscar lugares
      const result = await searchPlacesAction(query)

      if (result.success && result.predictions) {
        setSuggestions(result.predictions)
        setShowSuggestions(true)
      } else {
        console.warn('Google Places API error:', result.error)
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Error fetching places:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Crear función debounced para la búsqueda
  const debouncedSearch = useDebounceCallback((query: unknown) => {
    searchPlaces(query as string)
  }, 300)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Usar la función debounced
    debouncedSearch(newValue)
  }

  const handleSuggestionClick = (suggestion: PlaceResult) => {
    onChange(suggestion.description)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleSearchClick = () => {
    if (value.trim()) {
      searchPlaces(value)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className='relative'>
        <Input
          ref={inputRef}
          type='text'
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className='pr-10'
        />
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='absolute right-0 top-0 h-full px-3'
          onClick={handleSearchClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className='w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin' />
          ) : (
            <Search className='w-4 h-4' />
          )}
        </Button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className='absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto'
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type='button'
              className='w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2'
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <MapPin className='w-4 h-4 text-gray-400' />
              <span className='text-sm'>{suggestion.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
