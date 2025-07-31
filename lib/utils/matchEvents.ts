export type MatchEvent = {
  id: string
  minute: number
  timestamp?: number
  eventType:
    | 'goal'
    | 'assist'
    | 'yellow_card'
    | 'red_card'
    | 'substitution'
    | 'injury'
    | 'pass'
    | 'goal_saved'
    | 'goal_allowed'
    | 'player_in'
    | 'player_out'
    | 'half_time'
    | 'resume_match'
    | 'corner'
  playerId?: string
  playerName?: string
  playerAvatar?: string
  teamName: string
  teamAvatar?: string
  description?: string
  teamId?: string
  comment?: string
  commentAuthor?: string
  highFives?: number
}

export const getEventIconData = (eventType: MatchEvent['eventType']) => {
  switch (eventType) {
    case 'goal':
      return { color: 'bg-red-500', text: 'G' }
    case 'assist':
      return { color: 'bg-blue-500', text: 'A' }
    case 'yellow_card':
      return { color: 'bg-yellow-500', text: 'Y' }
    case 'red_card':
      return { color: 'bg-red-600', text: 'R' }
    case 'substitution':
      return { color: 'bg-purple-500', text: 'S' }
    case 'injury':
      return { color: 'bg-orange-500', text: 'I' }
    case 'pass':
      return { color: 'bg-green-500', text: 'P' }
    case 'goal_saved':
      return { color: 'bg-green-600', text: 'S' }
    case 'goal_allowed':
      return { color: 'bg-red-600', text: 'A' }
    case 'player_in':
      return { color: 'bg-green-500', text: '+' }
    case 'player_out':
      return { color: 'bg-red-500', text: '-' }
    case 'half_time':
      return { color: 'bg-orange-500', text: 'H' }
    case 'resume_match':
      return { color: 'bg-green-500', text: 'R' }
    case 'corner':
      return { color: 'bg-blue-500', text: 'C' }
    default:
      return { color: 'bg-gray-500', text: 'E' }
  }
}

export const getEventLabel = (eventType: MatchEvent['eventType']) => {
  switch (eventType) {
    case 'goal':
      return 'Goal'
    case 'assist':
      return 'Assist'
    case 'yellow_card':
      return 'Yellow Card'
    case 'red_card':
      return 'Red Card'
    case 'substitution':
      return 'Substitution'
    case 'injury':
      return 'Injury'
    case 'pass':
      return 'Pass'
    case 'goal_saved':
      return 'Goal Saved'
    case 'goal_allowed':
      return 'Goal Allowed'
    case 'player_in':
      return 'Player In'
    case 'player_out':
      return 'Player Out'
    case 'half_time':
      return 'Half Time'
    case 'resume_match':
      return 'Match Resumed'
    case 'corner':
      return 'Corner'
    default:
      return 'Event'
  }
}

export const getEventColor = (eventType: MatchEvent['eventType']) => {
  switch (eventType) {
    case 'goal':
      return 'bg-red-500'
    case 'assist':
      return 'bg-blue-500'
    case 'yellow_card':
      return 'bg-yellow-500'
    case 'red_card':
      return 'bg-red-600'
    case 'substitution':
      return 'bg-purple-500'
    case 'injury':
      return 'bg-orange-500'
    case 'pass':
      return 'bg-green-500'
    case 'goal_saved':
      return 'bg-green-600'
    case 'goal_allowed':
      return 'bg-red-600'
    case 'player_in':
      return 'bg-green-500'
    case 'player_out':
      return 'bg-red-500'
    case 'half_time':
      return 'bg-orange-500'
    case 'resume_match':
      return 'bg-green-500'
    case 'corner':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}

export const getEventBorderColor = (eventType: MatchEvent['eventType']) => {
  switch (eventType) {
    case 'goal':
      return 'border-l-4 border-l-red-500'
    case 'assist':
      return 'border-l-4 border-l-blue-500'
    case 'yellow_card':
      return 'border-l-4 border-l-yellow-500'
    case 'red_card':
      return 'border-l-4 border-l-red-600'
    case 'substitution':
      return 'border-l-4 border-l-purple-500'
    case 'injury':
      return 'border-l-4 border-l-orange-500'
    case 'pass':
      return 'border-l-4 border-l-green-500'
    case 'goal_saved':
      return 'border-l-4 border-l-green-600'
    case 'goal_allowed':
      return 'border-l-4 border-l-red-600'
    case 'player_in':
      return 'border-l-4 border-l-green-500'
    case 'player_out':
      return 'border-l-4 border-l-red-500'
    case 'half_time':
      return 'border-l-4 border-l-orange-500'
    case 'resume_match':
      return 'border-l-4 border-l-green-500'
    case 'corner':
      return 'border-l-4 border-l-blue-500'
    default:
      return 'border-l-4 border-l-gray-500'
  }
}

export const formatEventTime = (minute: number) => {
  return `${minute}'`
}

export const getPlayerAvatar = (
  playerId?: string,
  playerAvatar?: string,
  playersTeam1: Array<{
    id: string
    name: string
    lastName: string
    avatar?: string | null
  }> = [],
  playersTeam2: Array<{
    id: string
    name: string
    lastName: string
    avatar?: string | null
  }> = []
) => {
  if (playerAvatar) return playerAvatar
  if (playerId) {
    const allPlayers = [...playersTeam1, ...playersTeam2]
    const player = allPlayers.find((p) => p.id === playerId)
    if (player && player.avatar) {
      return player.avatar
    }
    return '/no-profile.webp'
  }
  return '/no-profile.webp'
}

export const sortEvents = (events: MatchEvent[]) => {
  return [...events].sort((a, b) => {
    if (a.minute !== b.minute) {
      return b.minute - a.minute
    }
    const timestampA = a.timestamp || 0
    const timestampB = b.timestamp || 0
    return timestampB - timestampA
  })
}
