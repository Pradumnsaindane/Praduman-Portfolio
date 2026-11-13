import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: { '/api': 'http://localhost:3000' },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/@dimforge/rapier3d-compat/')) return 'rapier-physics'
          if (id.includes('/node_modules/@react-three/drei/')) return 'three-drei'
          if (id.includes('/node_modules/@react-three/fiber/')) return 'three-fiber'
          if (id.includes('/node_modules/@react-three/rapier/')) return 'three-rapier'
          if (id.includes('/node_modules/three/')) return 'three-core'
          if (id.includes('/node_modules/motion/')) return 'motion'
        },
      },
    },
  },
})
