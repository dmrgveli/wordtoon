import { useCallback, useEffect, useState } from 'react'

export type Status = 'known' | 'learning'

export interface WordProgress {
  status: Status
  seen: number
  lastSeen: number
}

export type Progress = Record<string, WordProgress>

const KEY = 'wordtoon.progress.v1'

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Progress) : {}
  } catch {
    return {}
  }
}

function save(progress: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress))
  } catch {
    // Private mode or full storage: progress just lives for this session.
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(load)

  useEffect(() => save(progress), [progress])

  const mark = useCallback((id: string, status: Status) => {
    setProgress((prev) => ({
      ...prev,
      [id]: { status, seen: (prev[id]?.seen ?? 0) + 1, lastSeen: Date.now() },
    }))
  }, [])

  const reset = useCallback(() => setProgress({}), [])

  return { progress, mark, reset }
}
