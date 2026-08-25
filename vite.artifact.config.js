import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * One-file build. Used only by `npm run build:embed`, which inlines the result
 * into a single portable HTML page — so no code splitting and no CSS split.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-embed',
    target: 'es2020',
    cssCodeSplit: false,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
})
