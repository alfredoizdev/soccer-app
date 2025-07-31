// Script temporal para depurar el problema del calendario
import { getAllMatchesWithTeams } from './lib/actions/matches.action.js'

async function debugCalendar() {
  try {
    console.log('🔍 Depurando datos del calendario...')

    const matches = await getAllMatchesWithTeams()
    console.log(`📊 Total de partidos encontrados: ${matches.length}`)

    // Buscar partidos con fecha 8/4/2025
    const targetDate = new Date('2025-04-08')
    const matchesOnDate = matches.filter((match) => {
      const matchDate = new Date(match.date)
      return (
        matchDate.getFullYear() === 2025 &&
        matchDate.getMonth() === 3 && // Abril es mes 3 (0-indexed)
        matchDate.getDate() === 8
      )
    })

    console.log(
      `🎯 Partidos encontrados para 8/4/2025: ${matchesOnDate.length}`
    )

    matchesOnDate.forEach((match, index) => {
      console.log(`\n📅 Partido ${index + 1}:`)
      console.log(`   ID: ${match.id}`)
      console.log(`   Fecha: ${match.date}`)
      console.log(`   Status: ${match.status}`)
      console.log(`   Equipos: ${match.team1} vs ${match.team2}`)
      console.log(`   Ubicación: ${match.location || 'No especificada'}`)
    })

    // Verificar todos los partidos activos
    const activeMatches = matches.filter((match) => match.status === 'active')
    console.log(`\n✅ Partidos activos: ${activeMatches.length}`)

    activeMatches.forEach((match, index) => {
      console.log(
        `   ${index + 1}. ${match.team1} vs ${match.team2} - ${new Date(
          match.date
        ).toLocaleDateString()} (${match.status})`
      )
    })
  } catch (error) {
    console.error('❌ Error al depurar:', error)
  }
}

debugCalendar()
