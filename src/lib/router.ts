import { useEffect, useState } from 'react'

export type Route =
  | { name: 'search' }
  | { name: 'word'; id: string }
  | { name: 'cards' }
  | { name: 'quiz' }

function parse(hash: string): Route {
  const [first, second] = hash.replace(/^#\/?/, '').split('/')
  if (first === 'word' && second) return { name: 'word', id: decodeURIComponent(second) }
  if (first === 'cards') return { name: 'cards' }
  if (first === 'quiz') return { name: 'quiz' }
  return { name: 'search' }
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parse(location.hash))
    window.addEventListener('hashchange', onChange)
    window.addEventListener('popstate', onChange)
    return () => {
      window.removeEventListener('hashchange', onChange)
      window.removeEventListener('popstate', onChange)
    }
  }, [])
  return route
}

// True once the user has moved inside the app, so "back" can use browser history
// instead of jumping out of the app when a word link was opened directly.
let navigated = false

export function go(path: string, { replace = false } = {}) {
  navigated = true
  const hash = `#${path}`
  if (replace) history.replaceState(null, '', hash)
  else history.pushState(null, '', hash)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

export function back() {
  if (navigated) history.back()
  else go('/', { replace: true })
}
