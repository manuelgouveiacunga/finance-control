import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync } from 'fs'

function copyRedirects() {
  return {
    name: 'copy-redirects',
    closeBundle() {
      try {
        copyFileSync('public/_redirects', 'dist/_redirects')
        console.log('✅ _redirects copiado para dist/')
      } catch (e) {
        console.warn('⚠️ Falha ao copiar _redirects:', e.message)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), copyRedirects()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    historyApiFallback: {
      index: '/index.html'
    }
  },
  preview: {
    historyApiFallback: {
      index: '/index.html'
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', 'clsx', 'tailwind-merge']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    },
    copyPublicDir: true
  },
  publicDir: 'public'
})
