import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    dts({ tsconfigPath: './tsconfig.app.json' }),
    cssInjectedByJsPlugin({
      relativeCSSInjection: true
    })
  ],
  build: {
    cssCodeSplit: true,
    cssMinify: true,
    minify: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'elmethis',
      fileName: 'elmethis',
      formats: ['es']
    },
    rollupOptions: {
      external: [
        'vue',
        '@iconify/vue',
        '@heroicons/vue',
        '@vueuse/core',
        'katex',
        'lodash-es',
        'nanoid',
        'polished',
        'shiki'
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].mjs'
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
