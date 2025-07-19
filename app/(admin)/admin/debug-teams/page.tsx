import { getOrganizationsAction } from '@/lib/actions/organization.action'
import { getPlayersAction } from '@/lib/actions/player.action'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DebugTeamsPage() {
  const [teamsRes, playersRes] = await Promise.all([
    getOrganizationsAction(),
    getPlayersAction(),
  ])

  if (!teamsRes.data || !playersRes.data) {
    return (
      <div className='p-4'>
        <h1 className='text-2xl font-bold mb-4'>Debug Teams</h1>
        <div className='text-red-500'>Error: Failed to fetch data</div>
        <div className='mt-4'>
          <p>Teams: {teamsRes.data ? 'OK' : 'NULL'}</p>
          <p>Players: {playersRes.data ? 'OK' : 'NULL'}</p>
        </div>
      </div>
    )
  }

  // Find teams that have players
  const teamsWithPlayers = teamsRes.data.filter((team) =>
    playersRes.data!.some((player) => player.organizationId === team.id)
  )

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>Debug Teams & Players</h1>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <Card>
          <CardHeader>
            <CardTitle>Total Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-blue-600'>
              {teamsRes.data.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-green-600'>
              {playersRes.data.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teams with Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-purple-600'>
              {teamsWithPlayers.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {teamsRes.data.map((team) => {
                const playerCount = playersRes.data!.filter(
                  (p) => p.organizationId === team.id
                ).length
                return (
                  <div
                    key={team.id}
                    className='flex justify-between items-center p-2 border rounded'
                  >
                    <div>
                      <div className='font-medium'>{team.name}</div>
                      <div className='text-sm text-gray-500'>ID: {team.id}</div>
                    </div>
                    <div
                      className={`text-sm font-bold ${
                        playerCount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {playerCount} players
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 max-h-96 overflow-y-auto'>
              {playersRes.data.map((player) => (
                <div
                  key={player.id}
                  className='flex justify-between items-center p-2 border rounded'
                >
                  <div>
                    <div className='font-medium'>
                      {player.name} {player.lastName}
                    </div>
                    <div className='text-sm text-gray-500'>ID: {player.id}</div>
                  </div>
                  <div
                    className={`text-sm ${
                      player.organizationId ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {player.organizationId ? 'Has team' : 'No team'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {teamsWithPlayers.length < 2 && (
        <div className='mt-6 p-4 bg-yellow-100 border border-yellow-400 rounded'>
          <h2 className='text-lg font-bold text-yellow-800'>⚠️ Test Issue</h2>
          <p className='text-yellow-700'>
            You need at least 2 teams with players to run the automatic test.
            Currently you have {teamsWithPlayers.length} teams with players.
          </p>
        </div>
      )}
    </div>
  )
}
