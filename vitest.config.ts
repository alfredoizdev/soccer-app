import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  // Usar jsdom para simular el DOM en tests de React
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
