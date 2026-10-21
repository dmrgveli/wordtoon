import type { Word } from '../data/words'

export const norm = (s: string) => s.toLocaleLowerCase('tr').trim()

export interface Hit {
  word: Word
  field: 'word' | 'turkish' | 'definition'
  rank: number
}

// Ranks prefix matches on the English word first, then substring matches,
// then Turkish meanings, then definitions.
export function searchWords(words: Word[], query: string): Hit[] {
  const q = norm(query)
  if (!q) return []
  const hits: Hit[] = []
  for (const word of words) {
    const w = norm(word.word)
    if (w.startsWith(q)) hits.push({ word, field: 'word', rank: 0 })
    else if (w.includes(q)) hits.push({ word, field: 'word', rank: 1 })
    else if (norm(word.turkish).includes(q)) hits.push({ word, field: 'turkish', rank: 2 })
    else if (q.length > 2 && norm(word.definition).includes(q)) hits.push({ word, field: 'definition', rank: 3 })
  }
  return hits.sort((a, b) => a.rank - b.rank || a.word.word.localeCompare(b.word.word))
}

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return row[b.length]
}

// "Did you mean" suggestions for typos, compared against the start of each word.
export function suggest(words: Word[], query: string, limit = 3): Word[] {
  const q = norm(query)
  if (q.length < 3) return []
  return words
    .map((w) => ({ w, d: distance(q, norm(w.word).slice(0, Math.max(q.length, 4))) }))
    .filter((x) => x.d <= Math.max(1, Math.floor(q.length / 3)))
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map((x) => x.w)
}

// Matches the word and its inflections in a sentence ("analyze" → "analyzed").
export function wordPattern(word: string): RegExp {
  const stem = word.length > 4 && word.endsWith('e') ? word.slice(0, -1) : word
  return new RegExp(`\\b${stem}\\w*`, 'i')
}
