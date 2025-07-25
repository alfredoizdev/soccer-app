'use server'

export async function searchPlacesAction(input: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!input.trim()) {
    return { success: false, error: 'Input is required' }
  }

  if (!apiKey) {
    return { success: false, error: 'Google Maps API key not configured' }
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&types=establishment|geocode&key=${apiKey}&language=es`
    )

    if (!response.ok) {
      throw new Error(
        `Google Places API responded with status: ${response.status}`
      )
    }

    const data = await response.json()

    if (data.status === 'OK') {
      return { success: true, predictions: data.predictions }
    } else {
      return { success: false, error: `Google API error: ${data.status}` }
    }
  } catch (error) {
    console.error('Error fetching places:', error)
    return { success: false, error: 'Failed to fetch places from Google API' }
  }
}
