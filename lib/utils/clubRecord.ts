import type { OrganizationType } from '@/types/UserType'
import type { MatchWithTeams } from '@/lib/actions/matches.action'

/**
 * Calculates the record of a club (wins, losses, draws) from its matches.
 * @param club Club organization (OrganizationType)
 * @param clubMatches Array of club matches (MatchWithTeams[])
 * @returns Object with wins, losses, and draws
 */
export function getClubRecord(
  club: OrganizationType | null,
  clubMatches: MatchWithTeams[]
): { wins: number; losses: number; draws: number } {
  let wins = 0
  let losses = 0
  let draws = 0
  if (club) {
    for (const match of clubMatches) {
      if (match.team1Goals == null || match.team2Goals == null) continue
      if (match.team1Goals === match.team2Goals) {
        draws++
      } else if (
        (club.id === match.team1Id && match.team1Goals > match.team2Goals) ||
        (club.id === match.team2Id && match.team2Goals > match.team1Goals)
      ) {
        wins++
      } else {
        losses++
      }
    }
  }
  return { wins, losses, draws }
}
