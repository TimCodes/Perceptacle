import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@github-manager/core": path.resolve(__dirname, "../core/src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: {
      port: 3000
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})