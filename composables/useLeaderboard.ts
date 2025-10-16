export interface LeaderboardEntry {
  id: string
  gameId: string
  playerName: string
  score: number
  date: string
  metadata?: Record<string, any>
}

export const useLeaderboard = () => {
  const STORAGE_KEY = 'ux-dojo-leaderboard'

  const getLeaderboard = (gameId?: string): LeaderboardEntry[] => {
    if (!process.client) return []

    const stored = localStorage.getItem(STORAGE_KEY)
    const entries = stored ? JSON.parse(stored) : []

    if (gameId) {
      return entries.filter((e: LeaderboardEntry) => e.gameId === gameId)
        .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score)
    }

    return entries.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score)
  }

  const addScore = (entry: Omit<LeaderboardEntry, 'id' | 'date'>): LeaderboardEntry => {
    if (!process.client) throw new Error('localStorage not available')

    const newEntry: LeaderboardEntry = {
      ...entry,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    }

    const entries = getLeaderboard()
    entries.push(newEntry)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))

    return newEntry
  }

  const getTopScores = (gameId: string, limit = 10): LeaderboardEntry[] => {
    return getLeaderboard(gameId).slice(0, limit)
  }

  const getPersonalBest = (gameId: string, playerName: string): LeaderboardEntry | null => {
    const scores = getLeaderboard(gameId)
      .filter(e => e.playerName === playerName)
      .sort((a, b) => b.score - a.score)

    return scores[0] || null
  }

  const clearLeaderboard = (gameId?: string) => {
    if (!process.client) return

    if (gameId) {
      const entries = getLeaderboard().filter(e => e.gameId !== gameId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return {
    getLeaderboard,
    addScore,
    getTopScores,
    getPersonalBest,
    clearLeaderboard,
  }
}