import { useCallback, useState } from 'react'

const KEY = 'wordtoon.recent.v1'
const MAX = 10

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function useRecent() {
  const [recent, setRecent] = useState<string[]>(load)

  const add = useCallback((id: string) => {
    setRecent((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX)
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        // Storage unavailable: keep the list for this session only.
      }
      return next
    })
  }, [])

  return { recent, add }
}
