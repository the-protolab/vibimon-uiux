import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const ROOT_DIR = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: '/vibimon-uiux/',
  server: {
    host: true
  },
  build: {
    rollupOptions: {
      input: {
        ui1: resolve(ROOT_DIR, 'ui1.html'),
        ui2: resolve(ROOT_DIR, 'ui2.html')
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
});
