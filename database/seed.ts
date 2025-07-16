import 'dotenv/config'
import { faker } from '@faker-js/faker'
import { dbPromise } from './drizzle'
import {
  usersTable,
  organizationsTable,
  playersTable,
  matchesTable,
  playerStatsTable,
} from './schema'

async function main() {
  const db = await dbPromise

  // 1. Crear 3 organizaciones (equipos)
  const orgs = Array.from({ length: 3 }).map(() => ({
    name: faker.company.name(),
    description: faker.company.catchPhrase(),
    avatar: null,
  }))
  const insertedOrgs = await db
    .insert(organizationsTable)
    .values(orgs)
    .returning()

  // 2. Crear 5 usuarios
  const users = Array.from({ length: 5 }).map(() => ({
    name: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    avatar: null,
    organizationId: faker.helpers.arrayElement(insertedOrgs).id,
    password: faker.internet.password(),
    status: 'active' as const,
    role: 'user' as const,
  }))
  const insertedUsers = await db.insert(usersTable).values(users).returning()

  // 3. Crear 20 jugadores (sin avatar, stats variados)
  const players = Array.from({ length: 20 }).map((_, i) => {
    const stats = {
      totalGoals: faker.number.int({ min: 0, max: 20 }),
      totalAssists: faker.number.int({ min: 0, max: 10 }),
      totalPassesCompleted: faker.number.int({ min: 10, max: 200 }),
      totalDuelsWon: faker.number.int({ min: 0, max: 30 }),
      totalDuelsLost: faker.number.int({ min: 0, max: 30 }),
    }
    return {
      name: faker.person.firstName(),
      lastName: faker.person.lastName(),
      age: faker.number.int({ min: 10, max: 40 }),
      avatar: null,
      userId: faker.helpers.arrayElement(insertedUsers).id,
      organizationId: faker.helpers.arrayElement(insertedOrgs).id,
      jerseyNumber: i + 1,
      ...stats,
    }
  })
  const insertedPlayers = await db
    .insert(playersTable)
    .values(players)
    .returning()

  // 4. Crear 10 partidos (matches) entre equipos
  const matches = Array.from({ length: 10 }).map(() => {
    // Elegir dos equipos distintos
    const [team1, team2] = faker.helpers.shuffle(insertedOrgs).slice(0, 2)
    return {
      date: faker.date.recent({ days: 60 }),
      team1Id: team1.id,
      team2Id: team2.id,
      team1Goals: faker.number.int({ min: 0, max: 5 }),
      team2Goals: faker.number.int({ min: 0, max: 5 }),
    }
  })
  const insertedMatches = await db
    .insert(matchesTable)
    .values(matches)
    .returning()

  // 5. Crear stats de jugadores en partidos (cada partido, 2-4 jugadores random)
  const playerStats = []
  for (const match of insertedMatches) {
    // Elegir entre 2 y 4 jugadores random para este partido
    const n = faker.number.int({ min: 2, max: 4 })
    const matchPlayers = faker.helpers.arrayElements(insertedPlayers, n)
    for (const player of matchPlayers) {
      playerStats.push({
        playerId: player.id,
        matchId: match.id,
        minutesPlayed: faker.number.int({ min: 10, max: 90 }),
        goals: faker.number.int({ min: 0, max: 3 }),
        assists: faker.number.int({ min: 0, max: 2 }),
        passesCompleted: faker.number.int({ min: 0, max: 50 }),
        duelsWon: faker.number.int({ min: 0, max: 10 }),
        duelsLost: faker.number.int({ min: 0, max: 10 }),
      })
    }
  }
  await db.insert(playerStatsTable).values(playerStats)

  console.log('Seed completed!')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
