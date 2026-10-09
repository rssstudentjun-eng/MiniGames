import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/MiniGames/',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts', // Tests, not application logic.
        'src/**/*.d.ts', // Type declarations without executable code.
      ],
    },
  },
});
