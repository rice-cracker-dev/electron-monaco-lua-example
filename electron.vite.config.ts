import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    plugins: [svelte()],
    optimizeDeps: {
      esbuildOptions: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        plugins: [importMetaUrlPlugin]
      },
      include: ['vscode-textmate', 'vscode-oniguruma']
    },
    worker: {
      format: 'es'
    }
  }
})
