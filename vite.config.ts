import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build works on GitHub Pages under any repo path,
// and inside a Capacitor WebView later.
export default defineConfig({
  base: './',
  plugins: [react()],
})
