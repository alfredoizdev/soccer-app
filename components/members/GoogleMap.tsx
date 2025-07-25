/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface GoogleMapProps {
  location: string
  className?: string
  height?: string
}

// Variable global para evitar cargar múltiples veces
let googleMapsLoaded = false
let googleMapsLoading = false
let googleMapsCallbacks: (() => void)[] = []

const loadGoogleMaps = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (googleMapsLoaded) {
      resolve()
      return
    }

    if (googleMapsLoading) {
      googleMapsCallbacks.push(resolve)
      return
    }

    googleMapsLoading = true

    // Verificar si ya existe el script
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    )
    if (existingScript) {
      // Si ya existe, esperar a que cargue
      const checkGoogle = () => {
        if ((window as any).google?.maps) {
          googleMapsLoaded = true
          googleMapsLoading = false
          resolve()
          googleMapsCallbacks.forEach((cb) => cb())
          googleMapsCallbacks = []
        } else {
          setTimeout(checkGoogle, 100)
        }
      }
      checkGoogle()
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY
    }&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => {
      googleMapsLoaded = true
      googleMapsLoading = false
      resolve()
      googleMapsCallbacks.forEach((cb) => cb())
      googleMapsCallbacks = []
    }

    script.onerror = () => {
      googleMapsLoading = false
      reject(new Error('Failed to load Google Maps'))
    }

    document.head.appendChild(script)
  })
}

export default function GoogleMap({
  location,
  className = '',
  height = '300px',
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!location || !mapRef.current) return

    const initializeMap = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Cargar Google Maps
        await loadGoogleMaps()

        const google = (window as any).google
        if (!google?.maps) {
          throw new Error('Google Maps not available')
        }

        // Crear el mapa
        const map = new google.maps.Map(mapRef.current, {
          zoom: 15,
          center: { lat: 0, lng: 0 },
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        })

        mapInstanceRef.current = map

        // Buscar la ubicación usando Geocoding
        const geocoder = new google.maps.Geocoder()
        geocoder.geocode({ address: location }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            const place = results[0]
            map.setCenter(place.geometry.location)

            // Add marker
            new google.maps.Marker({
              map,
              position: place.geometry.location,
              title: location,
              animation: google.maps.Animation.DROP,
            })

            // Add info window
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 8px;">
                  <strong>${location}</strong>
                </div>
              `,
            })

            // Show info window after a brief delay
            setTimeout(() => {
              const marker = new google.maps.Marker({
                map,
                position: place.geometry.location,
                title: location,
              })
              infoWindow.open(map, marker)
            }, 1000)
          } else {
            setError('Could not find the location on the map')
          }
          setIsLoading(false)
        })
      } catch (error) {
        console.error('Error loading Google Maps:', error)
        setError('Error loading the map')
        setIsLoading(false)
      }
    }

    initializeMap()

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        // Cleanup map if needed
        mapInstanceRef.current = null
      }
    }
  }, [location])

  if (!location) {
    return (
      <div
        className={`bg-gray-100 rounded-md p-4 text-center text-gray-500 ${className}`}
      >
        No location available
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-md p-4 text-center text-red-600 ${className}`}
      >
        <div className='text-sm'>{error}</div>
        <div className='text-xs mt-1'>{location}</div>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className='text-sm font-medium text-gray-700 flex items-center gap-2'>
        <div className='w-4 h-4 bg-red-500 rounded-full'></div>
        Match Location
      </div>

      {isLoading && (
        <div className='flex items-center justify-center p-4 bg-gray-50 rounded-md'>
          <Loader2 className='w-6 h-6 animate-spin text-gray-400' />
          <span className='ml-2 text-sm text-gray-500'>Loading map...</span>
        </div>
      )}

      <div
        ref={mapRef}
        className='w-full rounded-md border border-gray-200 overflow-hidden'
        style={{ height }}
      />

      <div className='text-xs text-gray-500 bg-gray-50 p-2 rounded'>
        {location}
      </div>
    </div>
  )
}
