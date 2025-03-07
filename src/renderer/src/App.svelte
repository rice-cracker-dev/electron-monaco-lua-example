<script lang="ts">
  import { initWebSocketAndStartClient } from './languageClient'

  let monacoElement: HTMLElement = $state<HTMLElement | null>(null)

  const initializeEditor = async (): Promise<void> => {
    let monaco = await import('@codingame/monaco-vscode-editor-api')

    monaco.editor.create(monacoElement, {
      value: 'print("Hello World!")',
      language: 'lua',
      automaticLayout: true
    })

    initWebSocketAndStartClient('ws://localhost:3060')
  }

  $effect(() => {
    if (monacoElement) {
      initializeEditor()
    }
  })
</script>

<div bind:this={monacoElement} id="editor"></div>
