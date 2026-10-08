import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite is the dev server / bundler (a faster replacement for Create React App).
// The two extra options below let us write JSX inside normal ".js" files.
export default defineConfig({
  plugins: [react({ include: /\.(js|jsx)$/ })],
  esbuild: { loader: 'jsx', include: /src\/.*\.jsx?$/, exclude: [] },
  optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' } } },
  server: { port: 3000, strictPort: true },
  preview: { port: 3000 },
});
