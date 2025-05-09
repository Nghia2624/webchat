import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.cjs',
  },
  server: {
    port: 5174,
    open: true,
    host: '0.0.0.0',
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      }
    }
  },
  // Cấu hình HMR để giảm lỗi
  hmr: {
    overlay: false,
  },
  // Cấu hình Tailwind
  optimizeDeps: {
    include: ['tailwindcss'],
    esbuildOptions: {
      plugins: [
        {
          name: 'fix-tailwind-config-path',
          setup(build) {
            // Sửa các tham chiếu đến tailwind.config.js
            build.onResolve({ filter: /tailwind\.config\.js$/ }, args => {
              return { path: path.resolve('./tailwind.config.cjs') }
            })
          }
        }
      ]
    }
  },
  // Tối ưu hóa build
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
          'tailwind': ['tailwindcss'],
        }
      }
    },
    // Tăng giới hạn chunk size
    chunkSizeWarningLimit: 1600,
  },
}) 