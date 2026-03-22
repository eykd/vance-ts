import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/domain/**/*.spec.ts', 'src/application/**/*.spec.ts'],
    environment: 'node',
  },
});
