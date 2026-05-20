import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    globals: false,
    restoreMocks: true
  },
  resolve: {
    alias: {
      '@oss-atlas/core': resolve(__dirname, 'packages/core/src/index.ts')
    }
  }
});
