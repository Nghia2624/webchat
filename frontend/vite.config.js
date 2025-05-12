import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'
import { VitePWA } from 'vite-plugin-pwa'
import svgr from 'vite-plugin-svgr'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react({
        babel: {
          plugins: [
            mode === 'production' && '@babel/plugin-transform-react-constant-elements',
            mode === 'production' && '@babel/plugin-transform-react-inline-elements',
            mode === 'production' && 'babel-plugin-transform-react-remove-prop-types',
          ].filter(Boolean),
        },
      }),
      compression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
        deleteOriginFile: false,
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'Web Chat',
          short_name: 'Chat',
          description: 'A real-time web chat application',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: '/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
      svgr(),
      mode === 'analyze' && visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    
    // Cấu hình CSS
    css: {
      postcss: './postcss.config.js',
      devSourcemap: true,
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: '[name]__[local]___[hash:base64:5]',
      },
    },
    
    // Cấu hình máy chủ phát triển
    server: {
      port: 5174,
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        '/ws': {
          target: env.VITE_WS_URL || 'ws://localhost:8081',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
      watch: {
        usePolling: true,
        interval: 1000,
      },
      hmr: {
        path: '/_hmr',
        protocol: 'ws',
        host: 'localhost',
        port: 5174,
        clientPort: 5174,
        timeout: 30000,
        overlay: true
      }
    },
    
    // Cấu hình tối ưu
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@reduxjs/toolkit',
        'react-redux',
        'axios',
        'date-fns',
        '@headlessui/react',
        '@heroicons/react',
        'react-icons',
        'react-toastify',
      ],
    },
    
    // Tối ưu hóa build
    build: {
      sourcemap: false,
      minify: 'terser',
      target: 'esnext',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              'react',
              'react-dom',
              'react-router-dom',
              'axios',
              'date-fns',
            ],
            redux: [
              '@reduxjs/toolkit',
              'react-redux',
            ],
            ui: [
              '@headlessui/react',
              '@heroicons/react',
              'react-icons',
              'react-toastify',
            ],
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
      // Tăng giới hạn kích thước chunk
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
      cssMinify: true,
      reportCompressedSize: true,
      emptyOutDir: true,
    },
    
    // Cấu hình đường dẫn tuyệt đối
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@services': path.resolve(__dirname, './src/services'),
        '@store': path.resolve(__dirname, './src/store'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@contexts': path.resolve(__dirname, './src/contexts')
      },
    },
    esbuild: {
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      target: 'esnext',
      minify: true,
      treeShaking: true,
    },
  }
})
