import { createMatchWithPlayers } from '@/lib/actions/matches.action'
import { useLiveMatchStore } from '@/lib/stores/liveMatchStore'

interface AutoMatchTestConfig {
  team1Id: string
  team2Id: string
  testDuration: number // segundos
}

export async function runAutoMatchTest(config: AutoMatchTestConfig) {
  console.log('🚀 Iniciando prueba automática de partido...')

  // 1. Crear partido
  console.log('📝 Creando partido...')
  const { match, players } = await createMatchWithPlayers({
    date: new Date(),
    team1Id: config.team1Id,
    team2Id: config.team2Id,
  })

  console.log(`✅ Partido creado: ${match.id}`)
  console.log(`👥 Jugadores registrados: ${players.length}`)

  // 2. Inicializar store
  const store = useLiveMatchStore.getState()

  // Crear stats iniciales para todos los jugadores
  const initialPlayerStats = players.reduce(
    (acc, player) => {
      acc[player.id] = {
        id: player.id,
        isPlaying: true,
        timePlayed: 0,
        goals: 0,
        assists: 0,
        goalsSaved: 0,
        goalsAllowed: 0,
        passesCompleted: 0,
      }
      return acc
    },
    {} as Record<
      string,
      {
        id: string
        isPlaying: boolean
        timePlayed: number
        goals: number
        assists: number
        goalsSaved: number
        goalsAllowed: number
        passesCompleted: number
      }
    >
  )

  // Separar jugadores por equipo
  const playersTeam1 = players.filter(
    (p) => p.organizationId === config.team1Id
  )
  const playersTeam2 = players.filter(
    (p) => p.organizationId === config.team2Id
  )

  // Inicializar partido
  store.initializeMatch(
    match.id,
    initialPlayerStats,
    playersTeam1,
    playersTeam2,
    config.team1Id,
    config.team2Id
  )

  console.log('✅ Store inicializado')

  // 3. Iniciar partido
  console.log('⚽ Iniciando partido...')
  store.startMatch()

  // 4. Simular acciones en tiempos específicos
  const actions = [
    {
      time: 30,
      action: () => {
        console.log('🥅 Min 0:30 - Gol jugador equipo 1')
        const player1 = playersTeam1[0]
        if (player1) {
          store.addGoal(
            player1.id,
            'team1',
            config.team1Id,
            `${player1.name} ${player1.lastName}`
          )
        }
      },
    },
    {
      time: 75,
      action: () => {
        console.log('🎯 Min 1:15 - Asistencia jugador equipo 2')
        const player2 = playersTeam2[0]
        if (player2) {
          store.addAssist(
            player2.id,
            'team2',
            config.team2Id,
            `${player2.name} ${player2.lastName}`
          )
        }
      },
    },
    {
      time: 120,
      action: () => {
        console.log('⏸️ Min 2:00 - Half Time')
        store.pauseMatch()
      },
    },
    {
      time: 130,
      action: () => {
        console.log('▶️ Min 2:10 - Resume Match')
        store.resumeMatch()
      },
    },
    {
      time: 210,
      action: () => {
        console.log('🥅 Min 3:30 - Gol equipo 2 (automático goal_allowed)')
        store.addTeamGoal('team2', config.team2Id, 'Team 2')
      },
    },
    {
      time: 285,
      action: () => {
        console.log('⚽ Min 4:45 - Pase jugador equipo 1')
        const player1 = playersTeam1[1]
        if (player1) {
          store.addPass(
            player1.id,
            'team1',
            config.team1Id,
            `${player1.name} ${player1.lastName}`
          )
        }
      },
    },
    {
      time: 300,
      action: () => {
        console.log('🏁 Min 5:00 - End Match')
        store.endMatch()
      },
    },
  ]

  // 5. Ejecutar acciones en tiempo real
  let currentTime = 0
  const timer = setInterval(() => {
    currentTime++

    // Ejecutar acciones programadas
    actions.forEach(({ time, action }) => {
      if (currentTime === time) {
        action()
      }
    })

    // Actualizar timer del store
    store.updateTimer()

    // Verificar si terminó la prueba
    if (currentTime >= config.testDuration) {
      clearInterval(timer)
      console.log('✅ Prueba completada')

      // Mostrar resultados finales
      const finalState = useLiveMatchStore.getState()
      console.log('📊 Resultados finales:')
      console.log(
        `⏱️ Tiempo total: ${Math.floor(finalState.timer / 60)}:${(
          finalState.timer % 60
        )
          .toString()
          .padStart(2, '0')}`
      )
      console.log(
        `🥅 Marcador: ${finalState.team1Goals}-${finalState.team2Goals}`
      )
      console.log(`📝 Eventos creados: ${finalState.events.length}`)
      console.log(
        `👥 Jugadores con stats: ${Object.keys(finalState.playerStats).length}`
      )

      // Guardar en base de datos (sin await)
      console.log('💾 Guardando en base de datos...')
      store
        .saveToDatabase()
        .then(() => {
          console.log('✅ Prueba guardada exitosamente')
        })
        .catch((error) => {
          console.error('❌ Error guardando en BD:', error)
        })
    }
  }, 1000)

  return {
    matchId: match.id,
    playersCount: players.length,
    testDuration: config.testDuration,
  }
}

// Función para obtener equipos disponibles
export async function getAvailableTeams() {
  const { getAllMatchesWithTeams } = await import(
    '@/lib/actions/matches.action'
  )
  const matches = await getAllMatchesWithTeams()

  // Extraer IDs únicos de equipos
  const teamIds = new Set<string>()
  matches.forEach((match) => {
    teamIds.add(match.team1Id)
    teamIds.add(match.team2Id)
  })

  return Array.from(teamIds)
}

// Función para ejecutar la prueba
export async function executeAutoMatchTest() {
  // Obtener equipos disponibles
  const availableTeams = await getAvailableTeams()

  if (availableTeams.length < 2) {
    throw new Error('Se necesitan al menos 2 equipos para ejecutar la prueba')
  }

  const config: AutoMatchTestConfig = {
    team1Id: availableTeams[0],
    team2Id: availableTeams[1],
    testDuration: 300, // 5 minutos
  }

  try {
    const result = await runAutoMatchTest(config)
    console.log('🎉 Prueba automática completada:', result)
    return result
  } catch (error) {
    console.error('❌ Error en prueba automática:', error)
    throw error
  }
}
