'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

interface TestResult {
  matchId: string
  playersCount: number
  testDuration: number
  eventsCount?: number
  finalScore?: string
}

export default function AutoMatchTestPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [progress, setProgress] = useState(0)

  const handleRunTest = async () => {
    setIsRunning(true)
    setLogs([])
    setResults(null)
    setProgress(0)

    // Simulate real-time progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 500)

    try {
      const response = await fetch('/api/test-auto-match', {
        method: 'POST',
      })
      const result = await response.json()

      clearInterval(progressInterval)
      setProgress(100)

      if (result.success) {
        setResults({
          matchId: result.matchId,
          playersCount: result.playersCount,
          testDuration: 600, // 10 minutes
          eventsCount: result.eventsCount,
          finalScore: result.finalScore,
        })

        // Add success logs
        setLogs((prev) => [
          ...prev,
          '✅ Test completed successfully',
          `📊 Match ID: ${result.matchId}`,
          `👥 Players: ${result.playersCount}`,
          '🎉 You can view the results now!',
        ])
      } else {
        throw new Error(result.error || 'Test error')
      }
    } catch (error) {
      clearInterval(progressInterval)
      setProgress(0)
      console.error('Test error:', error)
      setLogs((prev) => [
        ...prev,
        `❌ Error: ${error}`,
        '🔄 Try running the test again',
      ])
    } finally {
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    setResults(null)
    setLogs([])
    setProgress(0)
  }

  return (
    <div className='w-full mx-auto p-4 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-6'>🧪 Automatic Match Test</h1>

      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-gray-600 mb-4'>
            This random automatic test uses an existing match and simulates a
            complete 10-minute game with random events:
          </p>
          <ul className='list-disc list-inside space-y-2 text-sm'>
            <li>
              <strong>Requirement</strong> - You must create an active match
              (without final scores) at /admin/matches/new
            </li>
            <li>
              <strong>First Half (1-5 min)</strong> - Random goals, assists, and
              passes
            </li>
            <li>
              <strong>Half Time (5 min)</strong> - Match pause
            </li>
            <li>
              <strong>Second Half (6-10 min)</strong> - More random events
            </li>
            <li>
              <strong>Random Events</strong> - Goals (30%), Passes (20%),
              Assists (20%), Saves (15%), Goals Allowed (15%)
            </li>
            <li>
              <strong>Half Time</strong> - Simulated and saved to timeline for
              complete match simulation
            </li>
            <li>
              <strong>Duration</strong> - 10 minutes total
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Progress bar */}
      {isRunning && (
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>🔄 Running Test...</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className='mb-4' />
            <p className='text-sm text-gray-600'>
              Progress: {progress}% -{' '}
              {progress < 50
                ? 'Creating match...'
                : progress < 80
                ? 'Simulating actions...'
                : 'Finalizing...'}
            </p>
          </CardContent>
        </Card>
      )}

      <div className='flex gap-4 mb-6'>
        <Button
          onClick={handleRunTest}
          disabled={isRunning}
          className='bg-green-600 hover:bg-green-700 disabled:bg-gray-400'
        >
          {isRunning ? '🔄 Running...' : '🚀 Run Automatic Test'}
        </Button>

        {results && (
          <>
            <Link href={`/admin/matches/history/${results.matchId}`}>
              <Button variant='outline'>📊 View Results</Button>
            </Link>

            <Button
              onClick={handleReset}
              variant='outline'
              className='text-orange-600 border-orange-600 hover:bg-orange-50'
            >
              🔄 New Test
            </Button>
          </>
        )}
      </div>

      {/* Real-time logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📝 Execution Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto'>
              {logs.map((log, index) => (
                <div key={index} className='mb-1'>
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && (
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>📊 Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>
                  {results.matchId}
                </div>
                <div className='text-sm text-gray-600'>Match ID</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {results.playersCount}
                </div>
                <div className='text-sm text-gray-600'>Players</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-orange-600'>
                  {results.testDuration}s
                </div>
                <div className='text-sm text-gray-600'>Duration</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-purple-600'>
                  {results.eventsCount || 0}
                </div>
                <div className='text-sm text-gray-600'>Events</div>
              </div>
            </div>

            {results.finalScore && (
              <div className='mt-4 text-center'>
                <div className='text-3xl font-bold text-red-600'>
                  {results.finalScore}
                </div>
                <div className='text-sm text-gray-600'>Final Score</div>
              </div>
            )}

            <div className='mt-4 p-4 bg-green-50 border border-green-200 rounded-lg'>
              <p className='text-green-800 text-sm'>
                ✅ Test completed successfully. Click &quot;View Results&quot;
                to see the match with all events and statistics.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execution status */}
      {isRunning && (
        <Card className='mt-6 border-blue-200 bg-blue-50'>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
              <p className='text-blue-800'>
                Running automatic test... Please wait.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
