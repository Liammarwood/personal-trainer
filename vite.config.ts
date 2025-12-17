import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    port: 3000,
    host: true, // Allow external access for mobile testing
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false // Allow proxying to HTTP backend
      }
    }
  },
  build: {
    // Optimize for mobile
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          'mui': ['@mui/material', '@mui/icons-material'],
          'react-vendor': ['react', 'react-dom'],
          'mediapipe': ['@mediapipe/pose', '@mediapipe/camera_utils', '@mediapipe/drawing_utils']
        }
      }
    }
  },
  // Ensure PWA assets are copied to build
  publicDir: 'public'
})
