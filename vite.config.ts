import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), dts(), cssInjectedByJsPlugin()],
  base: '/elmethis',
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'elmethis',
      fileName: 'elmethis'
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  },
  esbuild: {
    jsx: 'preserve'
  },
  css: {
    modules: {
      scopeBehaviour: 'local'
    },
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    },
    postcss: './postcss.config.js'
  }
})
