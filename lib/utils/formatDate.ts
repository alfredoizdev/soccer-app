export function formatDate(date: string | Date | null | undefined) {
  if (!date) return 'N/A'

  const d = typeof date === 'string' ? new Date(date) : date

  // Si es una fecha inválida, retornar N/A
  if (isNaN(d.getTime())) return 'N/A'

  // Usar UTC para evitar problemas de zona horaria
  const utcDate = new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes()
    )
  )

  return utcDate.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  })
}

export function formatTime(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return 'N/A'
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatShortDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return 'N/A'
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
