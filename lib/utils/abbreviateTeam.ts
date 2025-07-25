export function abbreviateTeam(name: string): string {
  if (!name) return ''
  const words = name.trim().split(/\s+/)
  const first = words[0]
  if (first.length >= 3) {
    return first.slice(0, 3).toUpperCase()
  }
  // Si la primera palabra es corta, combina con la siguiente
  if (words.length > 1) {
    return (first + words[1][0] + (words[1][1] || '')).slice(0, 3).toUpperCase()
  }
  return first.toUpperCase()
}
