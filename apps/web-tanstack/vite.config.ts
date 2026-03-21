import path from 'node:path'
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import type { PluginOption } from 'vite'

const config = defineConfig({
  // @ts-expect-error - nitro extends Vite config with custom options
  nitro: {
    runtimeConfig: {
      AUTH_BACKEND: process.env.AUTH_BACKEND || 'laravel',
      LARAVEL_API_URL: process.env.LARAVEL_API_URL || 'http://localhost:8002',
      SYMFONY_API_URL: process.env.SYMFONY_API_URL || 'http://localhost:8001',
      NODE_API_URL: process.env.NODE_API_URL || 'http://localhost:3333',
    },
  },
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    mdx({ remarkPlugins: [remarkGfm] }), // MDX with GFM tables support
    nitro({
      devErrorHandler: () => {},
    }),
  ] as Array<PluginOption>,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.mdx', '.mjs'],
  },
  server: {
    port: 3301,
    strictPort: false,
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:3001',
    //     changeOrigin: true,
    //   },
    // },
  },
})

export default config
