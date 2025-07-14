export type PlayerType = {
  id: string
  name: string
  lastName: string
  age: number
  avatar?: string | null
  userId: string
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  // Stats acumulativos
  totalGoals?: number
  totalAssists?: number
  totalPassesCompleted?: number
  totalDuelsWon?: number
  totalDuelsLost?: number
}
