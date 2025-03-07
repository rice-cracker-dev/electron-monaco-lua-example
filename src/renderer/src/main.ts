import { mount } from 'svelte'
import App from './App.svelte'
import './assets/main.css'

// importing installed services
import getLanguagesServiceOverride from '@codingame/monaco-vscode-languages-service-override'
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override'
import getTextMateServiceOverride from '@codingame/monaco-vscode-textmate-service-override'

// monaco-languageclient
import { initServices } from 'monaco-languageclient/vscode/services'

// highlighting
import '@codingame/monaco-vscode-lua-default-extension'
import '@codingame/monaco-vscode-theme-defaults-default-extension'

export type WorkerLoader = () => Worker

const workerLoaders: Partial<Record<string, WorkerLoader>> = {
  TextEditorWorker: () =>
    new Worker(
      new URL(
        '@codingame/monaco-vscode-editor-api/esm/vs/editor/editor.worker.js',
        import.meta.url
      ),
      {
        type: 'module'
      }
    ),
  TextMateWorker: () =>
    new Worker(
      new URL('@codingame/monaco-vscode-textmate-service-override/worker', import.meta.url),
      { type: 'module' }
    )
}

window.MonacoEnvironment = {
  getWorker: (_workerId: unknown, label: string): Worker => {
    const workerFactory = workerLoaders[label]
    if (workerFactory != null) {
      return workerFactory()
    }
    throw new Error(`Worker ${label} not found`)
  }
}

await initServices({
  serviceOverrides: {
    ...getTextMateServiceOverride(),
    ...getThemeServiceOverride(),
    ...getLanguagesServiceOverride()
  },

  userConfiguration: {
    json: JSON.stringify({
      'workbench.colorTheme': 'Default Dark Modern',
      'editor.guides.bracketPairsHorizontal': 'active',
      'editor.wordBasedSuggestions': 'off',
      'editor.experimental.asyncTokenization': true
    })
  }
})

const app = mount(App, {
  target: document.getElementById('app')!
})

export default app
