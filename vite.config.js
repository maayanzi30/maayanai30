import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// אתר תדמית מרובה עמודים (SPA עם React Router)
export default defineConfig({
  plugins: [react()],
})
