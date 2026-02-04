import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
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
      port: env.VITE_SERVER_PORT,
      allowedHosts: [env.VITE_TRUSTED_DOMAIN]
    },
  }
})
