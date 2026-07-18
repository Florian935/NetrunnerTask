import { defineConfig } from 'vitest/config'

// Config dédiée aux tests unitaires. On ne charge pas les plugins de build
// (React, Tailwind, PWA) : la couche `game/` est du TypeScript pur, testée en
// environnement Node. Voir décision #014.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
