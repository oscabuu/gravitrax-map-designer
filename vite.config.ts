import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// base = Name des Repositorys, weil die App als GitHub-Pages-Projektseite läuft:
// https://oscabuu.github.io/gravitrax-map-designer/
export default defineConfig({
  plugins: [react()],
  base: '/gravitrax-map-designer/',
  test: {
    include: ['src/**/*.test.ts'],
  },
})
