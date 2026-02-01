import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-dark.svg', 'icon-light.svg'],
      manifest: {
        name: process.env.VITE_APP_NAME || 'Fona',
        short_name: process.env.VITE_APP_NAME || 'Fona',
        description: 'AI-Powered Transcription',
        theme_color: '#8936FF',
        background_color: '#2EC6FE',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        id: 'fona-transcription',
        icons: [
          {
            src: 'icon-dark.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          },
          {
            src: 'icon-light.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      }
    })
  ],
  clearScreen: false, // Disable clear screen to preserve logs
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-tooltip'],
          'markdown-vendor': ['react-markdown', 'remark-math', 'rehype-katex', 'rehype-raw', 'rehype-highlight'],
          'table-vendor': ['@tanstack/react-table'],
          'lucide-vendor': ['lucide-react'],
        },
      },
    },
    // Improve performance by optimizing chunk sizes
    chunkSizeWarningLimit: 1000,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/swagger': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/install.sh': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/install-cli.sh': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  },
  base: "/",
})
