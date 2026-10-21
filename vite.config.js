import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // `@/` points to `src/`, e.g. `import Toggle from '@/components/ui/Toggle.jsx'`
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
