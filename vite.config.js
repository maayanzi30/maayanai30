import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    cssTarget: 'chrome100',
    rollupOptions: {
      output: {
        // Keep the heavy WebGL runtime out of the critical path.
        manualChunks: {
          three: ['three'],
          motion: ['gsap', 'lenis'],
        },
      },
    },
  },
})
