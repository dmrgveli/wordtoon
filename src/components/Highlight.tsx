import { norm } from '../lib/search'

export function Highlight({ text, query }: { text: string; query: string }) {
  const q = norm(query)
  const i = q ? norm(text).indexOf(q) : -1
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  )
}
