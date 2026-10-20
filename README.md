# Wordtoon

Mobile-first web app for learning high-frequency TOEFL words. Every word gets a memorable
cartoon image (e.g. *genius* → a caricatured Einstein sticking his tongue out), and flashcards
reinforce it.

## Features

- **Home:** daily goal ring, day streak, XP, word of the day, progress per part of speech
- **Cards:** swipe right for "know", left for "again" (or use the buttons), tap to flip, pronunciation
- **Quiz:** 10 multiple-choice questions (definition → word, word → Turkish), combo counter, results
- **Words:** search, status filters, bottom-sheet detail with pronunciation and manual marking
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
