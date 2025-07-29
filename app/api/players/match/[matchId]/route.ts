import { NextRequest, NextResponse } from 'next/server'
import { dbPromise } from '@/database/drizzle'
import { matchesTable, playersTable } from '@/database/schema'
import { eq, inArray } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params
    const db = await dbPromise

    // Obtener el partido
    const matchData = await db
      .select({
        team1Id: matchesTable.team1Id,
        team2Id: matchesTable.team2Id,
      })
      .from(matchesTable)
      .where(eq(matchesTable.id, matchId))
      .limit(1)

    if (!matchData.length) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    const match = matchData[0]

    // Obtener jugadores de ambos equipos
    const players = await db
      .select({
        id: playersTable.id,
        name: playersTable.name,
        lastName: playersTable.lastName,
        avatar: playersTable.avatar,
        jerseyNumber: playersTable.jerseyNumber,
        position: playersTable.position,
        organizationId: playersTable.organizationId,
      })
      .from(playersTable)
      .where(
        inArray(playersTable.organizationId, [match.team1Id, match.team2Id])
      )

    return NextResponse.json({ players })
  } catch (error) {
    console.error('Error fetching match players:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
