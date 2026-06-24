import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Tetris Web',
        short_name: 'Tetris',
        description: '经典网页版俄罗斯方块',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: 'index.html',
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],

  // 静态部署时使用相对路径（Vercel / GitHub Pages / Netlify 通用）
  base: './',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsInlineLimit: 4096,
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // 使用函数形式以确保 react/react-dom 被正确分割
        // （对象形式在入口直接导入该包时可能失效，导致 react-vendor 为空）
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/scheduler/')
          ) {
            return 'react-vendor';
          }
          if (id.includes('/node_modules/framer-motion/')) {
            return 'animation';
          }
          if (id.includes('/node_modules/@radix-ui/')) {
            return 'radix';
          }
          if (id.includes('/node_modules/zustand/')) {
            return 'state';
          }
        },
      },
    },
  },

  server: {
    port: 5175,
    open: true,
    host: true,
  },

  preview: {
    port: 4175,
    host: '127.0.0.1',
  },
});
