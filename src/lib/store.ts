import { useCallback, useEffect, useState } from 'react'

export type Status = 'known' | 'learning'

export interface WordProgress {
  status: Status
  seen: number
  lastSeen: number
}

export type Progress = Record<string, WordProgress>

export interface Stats {
  xp: number
  streak: number
  lastActive: string | null
  todayDate: string
  todayCount: number
  dailyGoal: number
  bestQuiz: number
}

const PROGRESS_KEY = 'wordtoon.progress.v1'
const STATS_KEY = 'wordtoon.stats.v1'

export const todayKey = (d = new Date()) => d.toLocaleDateString('sv')

function yesterdayKey() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return todayKey(d)
}

const defaultStats = (): Stats => ({
  xp: 0,
  streak: 0,
  lastActive: null,
  todayDate: todayKey(),
  todayCount: 0,
  dailyGoal: 10,
  bestQuiz: 0,
})

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private mode or full storage: state just lives for this session.
  }
}

// Bumps today's count, XP and the day streak for one answered card or question.
function withActivity(stats: Stats, xp: number): Stats {
  const today = todayKey()
  const fresh = stats.todayDate === today ? stats : { ...stats, todayDate: today, todayCount: 0 }
  let streak = fresh.streak
  if (fresh.lastActive !== today) streak = fresh.lastActive === yesterdayKey() ? streak + 1 : 1
  return { ...fresh, streak, lastActive: today, todayCount: fresh.todayCount + 1, xp: fresh.xp + xp }
}

export function useStore() {
  const [progress, setProgress] = useState<Progress>(() => read(PROGRESS_KEY, {}))
  const [stats, setStats] = useState<Stats>(() => read(STATS_KEY, defaultStats()))

  useEffect(() => write(PROGRESS_KEY, progress), [progress])
  useEffect(() => write(STATS_KEY, stats), [stats])

  const mark = useCallback((id: string, status: Status, xp = status === 'known' ? 10 : 2) => {
    setProgress((prev) => ({
      ...prev,
      [id]: { status, seen: (prev[id]?.seen ?? 0) + 1, lastSeen: Date.now() },
    }))
    setStats((s) => withActivity(s, xp))
  }, [])

  const recordQuiz = useCallback((score: number) => {
    setStats((s) => ({ ...s, bestQuiz: Math.max(s.bestQuiz, score) }))
  }, [])

  const reset = useCallback(() => {
    setProgress({})
    setStats(defaultStats())
  }, [])

  // A streak only counts while it was kept up yesterday or today.
  const today = todayKey()
  const liveStreak = stats.lastActive === today || stats.lastActive === yesterdayKey() ? stats.streak : 0
  const todayCount = stats.todayDate === today ? stats.todayCount : 0

  return { progress, stats: { ...stats, streak: liveStreak, todayCount }, mark, recordQuiz, reset }
}

export type Store = ReturnType<typeof useStore>
