import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const clerkKey = process.env.CLERK_PUBLISHABLE_KEY || env.CLERK_PUBLISHABLE_KEY || '';

  return {
    plugins: [react(), tailwind()],
    envPrefix: ['VITE_', 'CLERK_'],
    define: {
      'import.meta.env.CLERK_PUBLISHABLE_KEY': JSON.stringify(clerkKey),
    },
  };
})

