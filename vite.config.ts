import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Order matters: place specific aliases before the generic '@' to avoid
    // resolving '@/lib/*' to 'src/lib/*' (which does not exist).
    alias: [
      { find: '@/lib', replacement: path.resolve(__dirname, './lib') },
      { find: '@lib', replacement: path.resolve(__dirname, './lib') },
      { find: '@/components', replacement: path.resolve(__dirname, './components') },
      { find: '@components', replacement: path.resolve(__dirname, './components') },
      { find: '@app', replacement: path.resolve(__dirname, './app') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
  server: {
    port: 5173,
  },
})
