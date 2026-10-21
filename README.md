# Wordtoon

Mobile-first web app for learning high-frequency TOEFL words. Every word gets a memorable
cartoon image (e.g. *genius* → a caricatured Einstein sticking his tongue out), and flashcards
reinforce it.

## Features

- **Search first:** live results as you type (English word, Turkish meaning or definition), match highlighting,
  keyboard navigation, "did you mean" suggestions for typos, recently viewed words, word of the day, A–Z grid
- **A page per word** (`#/word/<id>`, shareable): the illustration grows out of the search result into a
  tilting hero on a background matching its part-of-speech colour, letter-by-letter title, pronunciation,
  Turkish meaning, definition, example sentence with the word marked, a tap-to-reveal memory hook,
  a fill-in-the-blank mini quiz, known / review toggle, related words, swipe for previous / next
- **Practice:** swipe flashcards (`#/cards`) and a 10-question quiz (`#/quiz`)
- Light and dark themes, animations via `motion`, respects reduced-motion settings

## Stack

- Vite + React + TypeScript, `motion` for animations, no router or state library
- Installable PWA (`public/manifest.webmanifest`, `public/sw.js`) with offline cache
- Progress and stats are stored in `localStorage` (`wordtoon.progress.v1`, `wordtoon.stats.v1`)
- `base: './'` in `vite.config.ts`, so the same build runs on GitHub Pages and inside a
  Capacitor WebView for the later Android app (`npx cap init` → `npx cap add android`, `webDir: dist`)

## Develop

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
npm run preview
```

## Content

- Words: `src/data/words.ts` (word, part of speech, definition, example, Turkish, image prompt)
- Images: `public/images/<id>.webp` (or `.png` / `.jpg`). Until one exists, the card shows the
  image prompt as a placeholder.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages.
In the repository settings, set **Pages → Source** to **GitHub Actions** once.
