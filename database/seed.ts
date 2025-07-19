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

  // 1. Crear Houstonias FC (equipo especial)
  const houstoniasFC = await db
    .insert(organizationsTable)
    .values({
      name: 'Houstonias FC',
      description: 'Houstonias FC official team',
      avatar:
        'https://res.cloudinary.com/dpln6yofx/image/upload/v1752518305/soccer-app/teams/houstonia-fc/huvrdlvcimx8dqjt0ota.png',
    })
    .returning()
  const houstoniasFCId = houstoniasFC[0].id

  // 2. Crear 2 organizaciones adicionales (como antes)
  const orgs = Array.from({ length: 2 }).map(() => ({
    name: faker.company.name(),
    description: faker.company.catchPhrase(),
    avatar: null,
  }))
  const insertedOrgs = await db
    .insert(organizationsTable)
    .values(orgs)
    .returning()
  const allOrgs = [houstoniasFC[0], ...insertedOrgs]

  // 3. Crear usuario Alfredo Izquierdo
  const alfredoUser = await db
    .insert(usersTable)
    .values({
      name: 'Alfredo',
      lastName: 'Izquierdo',
      email: 'alfredo@example.com',
      avatar:
        'https://res.cloudinary.com/dpln6yofx/image/upload/v1752518196/soccer-app/users/alfredo/dn6so7z817em4jxqoiei.jpg',
      organizationId: houstoniasFCId,
      password: 'Fredo92125',
      status: 'active',
      role: 'user',
    })
    .returning()
  const alfredoUserId = alfredoUser[0].id

  // 4. Crear 4 usuarios adicionales (como antes)
  const users = Array.from({ length: 4 }).map(() => ({
    name: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    avatar: null,
    organizationId: faker.helpers.arrayElement(allOrgs).id,
    password: faker.internet.password(),
    status: 'active' as const,
    role: 'user' as const,
  }))
  const insertedUsers = await db.insert(usersTable).values(users).returning()
  const allUsers = [alfredoUser[0], ...insertedUsers]

  // 5. Crear Faviola Izquierdo (player destacado)
  const faviolaPlayer = await db
    .insert(playersTable)
    .values({
      name: 'Faviola',
      lastName: 'Izquierdo',
      age: 16,
      avatar:
        'https://res.cloudinary.com/dpln6yofx/image/upload/v1752524728/soccer-app/players/faviola/y23u9vypgp2oycwugvi2.webp',
      userId: alfredoUserId,
      organizationId: houstoniasFCId,
      jerseyNumber: 9,
      position: 'attack',
      totalGoals: 18,
      totalAssists: 4,
      totalPassesCompleted: 60,
    })
    .returning()
  // 6. Crear Yallie Izquierdo (player destacado)
  const yalliePlayer = await db
    .insert(playersTable)
    .values({
      name: 'Yallie',
      lastName: 'Izquierdo',
      age: 14,
      avatar:
        'https://res.cloudinary.com/dpln6yofx/image/upload/v1752528596/soccer-app/players/ayellie/t61uqhnmd6yvu80r68zs.webp',
      userId: alfredoUserId,
      organizationId: houstoniasFCId,
      jerseyNumber: 10,
      position: 'midfield',
      totalGoals: 2,
      totalAssists: 6,
      totalPassesCompleted: 150,
    })
    .returning()

  // 7. Crear 18 jugadores adicionales (como antes)
  const players = Array.from({ length: 18 }).map((_, i) => {
    const position = faker.helpers.arrayElement([
      'attack',
      'midfield',
      'defence',
      'goalkeeper',
    ])
    let stats
    if (position === 'goalkeeper') {
      stats = {
        totalGoals: 0,
        totalAssists: 0,
        totalPassesCompleted: faker.number.int({ min: 10, max: 200 }),
        goalsAllowed: faker.number.int({ min: 0, max: 20 }),
        goalsSaved: faker.number.int({ min: 0, max: 40 }),
      }
    } else {
      stats = {
        totalGoals: faker.number.int({ min: 0, max: 20 }),
        totalAssists: faker.number.int({ min: 0, max: 10 }),
        totalPassesCompleted: faker.number.int({ min: 10, max: 200 }),
        goalsAllowed: 0,
        goalsSaved: 0,
      }
    }
    return {
      name: faker.person.firstName(),
      lastName: faker.person.lastName(),
      age: faker.number.int({ min: 10, max: 40 }),
      avatar: null,
      userId: faker.helpers.arrayElement(allUsers).id,
      organizationId: faker.helpers.arrayElement(allOrgs).id,
      jerseyNumber: i + 11,
      position,
      ...stats,
    }
  })
  const insertedPlayers = await db
    .insert(playersTable)
    .values(players)
    .returning()
  const allPlayers = [faviolaPlayer[0], yalliePlayer[0], ...insertedPlayers]

  // 4. Crear 10 partidos (matches) entre equipos
  const matches = Array.from({ length: 10 }).map(() => {
    // Elegir dos equipos distintos
    const [team1, team2] = faker.helpers.shuffle(allOrgs).slice(0, 2)
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
    const matchPlayers = faker.helpers.arrayElements(allPlayers, n)
    for (const player of matchPlayers) {
      playerStats.push({
        playerId: player.id,
        matchId: match.id,
        minutesPlayed: faker.number.int({ min: 10, max: 90 }),
        goals: faker.number.int({ min: 0, max: 3 }),
        assists: faker.number.int({ min: 0, max: 2 }),
        passesCompleted: faker.number.int({ min: 0, max: 50 }),
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
